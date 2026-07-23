# Makkelijklekker.nl

Moderne, statische receptensite gebouwd met [Astro](https://astro.build). De recepten komen uit de originele Makkelijk Lekker-site (2015–2018), aangevuld met nieuwe recepten.

## Lokaal draaien

```bash
npm install
npm run dev
```

Open daarna [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

De output staat in `dist/`.

## Deployen (GitHub + Vercel)

1. Maak op GitHub een nieuwe repo (bijv. `makkelijklekker.nl`), leeg, zonder README.
2. Push deze code:

```bash
git remote add origin git@github.com:JOUW-USER/makkelijklekker.nl.git
git push -u origin main
```

3. Ga naar [vercel.com/new](https://vercel.com/new), importeer de GitHub-repo.
4. Framework: **Astro** (of laat Vercel het detecteren). Build: `npm run build`, output: `dist`.
5. Deploy.

### Domein koppelen (Mijn Domein → Vercel)

In Vercel: **Project → Settings → Domains** → voeg toe:
- `makkelijklekker.nl`
- `www.makkelijklekker.nl`

In **Mijn Domein** (DNS-beheer van `makkelijklekker.nl`), zet:

| Type  | Naam | Waarde                 |
|-------|------|------------------------|
| A     | `@`  | `76.76.21.21`          |
| CNAME | `www`| `cname.vercel-dns.com` |

Verwijder oude A/CNAME-records die naar een andere host wijzen. DNS kan 5 minuten tot een paar uur duren.

Vercel toont exact de records die je nodig hebt — volg die als ze afwijken.

## Content toevoegen

Nieuwe recepten: Markdown in `src/content/recipes/` + foto in `public/images/recipes/`.
