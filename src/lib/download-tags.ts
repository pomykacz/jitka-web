import { url } from './urls';

const sharedTags = ['Pracovní list', 'Domácí vzdělávání', 'Individuální vzdělávání', 'Portfolio'];
export const downloadTags = {
  travel: [sharedTags[0], 'Cestování', ...sharedTags.slice(1)],
  explorer: [sharedTags[0], 'Cestování', ...sharedTags.slice(1)],
  reading: [sharedTags[0], 'Čtení', ...sharedTags.slice(1)],
};
export const downloadFilters = [
  { label: 'Pracovní list', slug: 'pracovni-list' },
  { label: 'Čtení', slug: 'cteni' },
  { label: 'Cestování', slug: 'cestovani' },
  { label: 'Domácí vzdělávání', slug: 'domaci-vzdelavani' },
  { label: 'Individuální vzdělávání', slug: 'individualni-vzdelavani' },
  { label: 'Portfolio', slug: 'portfolio' },
];
export function downloadTagUrl(label: string): string {
  const tag = downloadFilters.find((item) => item.label === label);
  if (!tag) throw new Error(`Unknown download tag: ${label}`);
  return url(`ke-stazeni/tagy/${tag.slug}/`);
}
