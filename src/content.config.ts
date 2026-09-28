import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// File paths are stable URLs. Titles and dates never change an entry's URL.
function contentLoader(base: string) {
  return glob({
    base,
    pattern: '**/*.md',
    generateId: ({ entry }) => {
      const id = entry.replace(/\.md$/, '').replace(/\/index$/, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(id)) {
        throw new Error(`Use lowercase ASCII words and hyphens for content paths: ${entry}`);
      }
      return id;
    },
  });
}

const common = {
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  draft: z.boolean().default(false),
};

const posts = defineCollection({
  loader: contentLoader('./src/content/posts'),
  schema: z.object({ ...common, pubDate: z.coerce.date() }),
});

const pages = defineCollection({
  loader: contentLoader('./src/content/pages'),
  schema: z.object(common),
});

export const collections = { posts, pages };
