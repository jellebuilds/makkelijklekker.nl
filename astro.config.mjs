// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const recipesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/content/recipes');
/** @type {Map<string, Date>} */
const recipeLastmods = new Map();

for (const file of fs.readdirSync(recipesDir)) {
  if (!file.endsWith('.md')) continue;
  const slug = file.replace(/\.md$/, '');
  const text = fs.readFileSync(path.join(recipesDir, file), 'utf8');
  const match = text.match(/^pubDate:\s*(.+)$/m);
  if (!match) continue;
  const date = new Date(match[1].trim());
  if (!Number.isNaN(date.valueOf())) {
    recipeLastmods.set(`https://makkelijklekker.nl/recepten/${slug}/`, date);
  }
}

export default defineConfig({
  site: 'https://makkelijklekker.nl',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = recipeLastmods.get(item.url);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
