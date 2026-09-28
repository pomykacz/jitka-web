import { getCollection } from 'astro:content';

// Drafts can only appear in the local dev server, never in a static build.
const visible = ({ data }: { data: { draft: boolean } }) =>
  !data.draft || import.meta.env.DEV;

export async function posts() {
  return (await getCollection('posts', visible)).sort((a, b) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id),
  );
}

export async function pages() {
  return (await getCollection('pages', visible)).sort((a, b) => a.id.localeCompare(b.id));
}
