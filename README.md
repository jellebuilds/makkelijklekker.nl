# Makkelijklekker.nl

Moderne, statische receptensite gebouwd met [Astro](https://astro.build). De recepten komen uit de originele Makkelijk Lekker-site (2015–2018), teruggezet via het Internet Archive.

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

De output staat in `dist/` — klaar om te hosten.

## Deployen

Upload de inhoud van `dist/` naar je hosting, of koppel de repo aan:

- **Cloudflare Pages** — build command `npm run build`, output directory `dist`
- **Netlify** — idem
- **Vercel** — framework preset Astro

Zorg dat DNS voor `makkelijklekker.nl` naar je host wijst.

## Content toevoegen

Nieuwe recepten: voeg een Markdown-bestand toe in `src/content/recipes/` met frontmatter:

```yaml
---
title: "Titel"
description: "Korte intro"
pubDate: 2026-07-22
minutes: 20
servings: 2
categories:
  - Lunch
image: "/images/recipes/jouw-foto.jpg"
---
```

Plaats de foto in `public/images/recipes/`.
