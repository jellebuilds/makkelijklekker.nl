const FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
};

const AMOUNT_RE =
  /(\d+(?:[.,]\d+)?|\d+\s*[½¼¾⅓⅔]|[½¼¾⅓⅔])(?:\s*([-–—])\s*(\d+(?:[.,]\d+)?|\d+\s*[½¼¾⅓⅔]|[½¼¾⅓⅔]))?/g;

const NON_SCALABLE_ONLY =
  /^(peper(\s+en\s+zout)?|zout|olijfolie|boter om te bakken|snuf(je)?\s+\w+|handje\s+.+|naar smaak.*)$/i;

function parseAmount(raw: string): number | null {
  const s = raw.trim().replace(',', '.');
  const mixed = s.match(/^(\d+)\s*([½¼¾⅓⅔])$/);
  if (mixed) return Number(mixed[1]) + FRACTIONS[mixed[2]];
  if (s in FRACTIONS) return FRACTIONS[s];
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  return null;
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return String(value);

  // grams/ml-scale amounts read better as whole numbers
  if (value >= 10) return String(Math.round(value));

  const whole = Math.floor(value + 1e-9);
  const frac = value - whole;
  const snaps: [number, string][] = [
    [0, ''],
    [0.25, '¼'],
    [1 / 3, '⅓'],
    [0.5, '½'],
    [2 / 3, '⅔'],
    [0.75, '¾'],
  ];

  let best = snaps[0];
  let bestDiff = Math.abs(frac - best[0]);
  for (const snap of snaps) {
    const diff = Math.abs(frac - snap[0]);
    if (diff < bestDiff) {
      best = snap;
      bestDiff = diff;
    }
  }

  if (bestDiff < 0.04) {
    if (best[0] === 0) {
      if (whole === 0) return formatDecimal(value);
      return String(whole);
    }
    return whole > 0 ? `${whole}${best[1]}` : best[1];
  }

  if (value >= 5) return formatDecimal(Math.round(value * 2) / 2);
  return formatDecimal(Math.round(value * 4) / 4);
}

function formatDecimal(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

function scaleToken(token: string, factor: number): string {
  const match = token.match(
    /^(\d+(?:[.,]\d+)?|\d+\s*[½¼¾⅓⅔]|[½¼¾⅓⅔])(?:\s*([-–—])\s*(\d+(?:[.,]\d+)?|\d+\s*[½¼¾⅓⅔]|[½¼¾⅓⅔]))?$/
  );
  if (!match) return token;

  const low = parseAmount(match[1]);
  if (low == null) return token;

  if (match[2] && match[3]) {
    const high = parseAmount(match[3]);
    if (high == null) return token;
    return `${formatAmount(low * factor)}${match[2]}${formatAmount(high * factor)}`;
  }

  return formatAmount(low * factor);
}

function tweakDutchPlural(text: string): string {
  return text
    .replace(/\b1 eieren\b/g, '1 ei')
    .replace(/\b([2-9]|\d{2,})\s+ei\b/g, '$1 eieren')
    .replace(/\b1 teentjes\b/g, '1 teentje')
    .replace(/\b([2-9]|\d{2,})\s+teentje\b/g, '$1 teentjes')
    .replace(/\b1 uien\b/g, '1 ui')
    .replace(/\b([2-9]|\d{2,})\s+ui\b/g, '$1 uien')
    .replace(/\b1 blikjes\b/g, '1 blik')
    .replace(/\b([2-9]|\d{2,})\s+blik\b/g, '$1 blikjes')
    .replace(/\b1 personen\b/g, '1 persoon')
    .replace(/\b([2-9]|\d{2,})\s+persoon\b/g, '$1 personen');
}

/** Scale numeric amounts in an ingredient line by factor. */
export function scaleIngredient(text: string, factor: number): string {
  if (!Number.isFinite(factor) || Math.abs(factor - 1) < 1e-9) return text;
  if (NON_SCALABLE_ONLY.test(text.trim())) return text;

  const scaled = text.replace(AMOUNT_RE, (token) => scaleToken(token, factor));
  return tweakDutchPlural(scaled);
}
