import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'jellehoogeveen@hotmail.com';
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Makkelijklekker <onboarding@resend.dev>';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const MAX = {
  name: 80,
  email: 120,
  message: 4000,
} as const;

const MIN_FILL_MS = 3000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

/** Simple per-instance rate limit (good enough for low traffic). */
const hits = new Map<string, number[]>();

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.socket?.remoteAddress || 'unknown';
}

function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return false;
  const body = new URLSearchParams({
    secret: TURNSTILE_SECRET,
    response: token,
    remoteip: ip,
  });
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Alleen POST is toegestaan.' });
    return;
  }

  if (!RESEND_API_KEY || !TURNSTILE_SECRET) {
    res.status(503).json({
      ok: false,
      error: 'Contactformulier is nog niet geconfigureerd. Probeer later opnieuw.',
    });
    return;
  }

  const ip = clientIp(req);
  if (tooManyRequests(ip)) {
    res.status(429).json({ ok: false, error: 'Te veel berichten. Probeer later opnieuw.' });
    return;
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const message = String(payload.message || '').trim();
  const website = String(payload.website || '').trim(); // honeypot
  const startedAt = Number(payload.startedAt || 0);
  const turnstileToken = String(payload.turnstileToken || '').trim();

  // Honeypot: bots fill hidden "website"
  if (website) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!name || !email || !message) {
    res.status(400).json({ ok: false, error: 'Vul alle velden in.' });
    return;
  }

  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    res.status(400).json({ ok: false, error: 'Een van de velden is te lang.' });
    return;
  }

  if (!isEmail(email)) {
    res.status(400).json({ ok: false, error: 'Vul een geldig e-mailadres in.' });
    return;
  }

  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    res.status(400).json({ ok: false, error: 'Even geduld — stuur het formulier opnieuw.' });
    return;
  }

  if (!turnstileToken || !(await verifyTurnstile(turnstileToken, ip))) {
    res.status(400).json({ ok: false, error: 'Spamcheck mislukt. Vernieuw de pagina en probeer opnieuw.' });
    return;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br>');

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `Contactformulier: bericht van ${name}`,
      html: `
        <p><strong>Naam:</strong> ${safeName}</p>
        <p><strong>E-mail:</strong> ${safeEmail}</p>
        <p><strong>Bericht:</strong></p>
        <p>${safeMessage}</p>
      `,
      text: `Naam: ${name}\nE-mail: ${email}\n\n${message}`,
    });

    if (error) {
      console.error('Resend error', error);
      res.status(502).json({ ok: false, error: 'Versturen mislukt. Probeer het later opnieuw.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact API error', err);
    res.status(500).json({ ok: false, error: 'Er ging iets mis. Probeer het later opnieuw.' });
  }
}
