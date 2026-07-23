import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    minutes: z.number(),
    servings: z.number(),
    categories: z.array(z.string()),
    image: z.string(),
  }),
});

export const collections = { recipes };
