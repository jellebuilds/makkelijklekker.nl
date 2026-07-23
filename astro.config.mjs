// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://makkelijklekker.nl',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
