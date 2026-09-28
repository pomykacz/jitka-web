import { readFile, mkdir, cp, rm, writeFile, lstat, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'site');
const output = join(root, 'dist');
const command = process.argv[2];
if (!['check', 'build'].includes(command)) throw new Error('Usage: node scripts/site.mjs check|build');

async function checkTree(directory) {
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not a publishable static asset: ${name}`);
    if (name.startsWith('.')) throw new Error(`Hidden file is not a publishable static asset: ${name}`);
    if (stat.isDirectory()) await checkTree(path);
  }
}

await checkTree(source);
const html = await readFile(join(source, 'index.html'), 'utf8');
for (const [label, pattern] of [
  ['HTML doctype', /<!doctype html>/i],
  ['document language', /<html\b[^>]*\blang=["'][^"']+["']/i],
  ['document title', /<title>\s*[^<\s][^<]*<\/title>/i],
  ['viewport metadata', /<meta\b[^>]*name=["']viewport["']/i],
  ['main content', /<main\b/i],
]) {
  if (!pattern.test(html)) throw new Error(`Missing ${label}`);
}
console.log('Static document metadata and publishable file checks passed.');

if (command === 'build') {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(source, output, { recursive: true });
  await writeFile(join(output, '.nojekyll'), '');
  await writeFile(join(output, 'build-info.json'), JSON.stringify({ head: process.env.GITHUB_SHA ?? null }, null, 2) + '\n');
  console.log('Static website built in dist/.');
}
