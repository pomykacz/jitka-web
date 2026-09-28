import assert from 'node:assert/strict';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { baseOption, root } from './options.mjs';

async function filesIn(directory, prefix = '') {
  const files = [];
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    const stat = await lstat(path);
    assert(!stat.isSymbolicLink(), `Symlink in public output: ${path}`);
    assert(!name.startsWith('.') || name === '.nojekyll', `Hidden output: ${path}`);
    if (stat.isDirectory()) files.push(...await filesIn(path, `${prefix}${name}/`));
    else files.push(`${prefix}${name}`);
  }
  return files;
}

function elements(node) {
  return [node, ...(node.childNodes ?? []).flatMap(elements)].filter((node) => node.tagName);
}
function attr(node, name) { return node.attrs?.find((a) => a.name === name)?.value; }

export async function smoke(base) {
  const output = join(root, 'dist');
  const files = await filesIn(output);
  for (const required of ['index.html', 'blog/index.html', '404.html', '.nojekyll', 'build-info.json']) {
    assert(files.includes(required), `Missing public file: ${required}`);
  }
  for (const file of files) {
    assert(!/\.(md|mdx|astro|ts|map)$/.test(file), `Source file in public output: ${file}`);
    assert(!/(^|\/)(node_modules|src|server)\//.test(file), `Private directory in output: ${file}`);
  }

  function checkUrl(value, from) {
    if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/.test(value)) return;
    const pagePath = from === '404.html' ? '404.html' : from.replace(/index\.html$/, '');
    const resolved = new URL(value, `https://smoke.invalid${base}${pagePath}`);
    assert.equal(resolved.origin, 'https://smoke.invalid', `Unexpected URL: ${value}`);
    assert(resolved.pathname.startsWith(base), `URL escapes ${base} in ${from}: ${value}`);
    const relative = decodeURIComponent(resolved.pathname.slice(base.length));
    const target = relative.endsWith('/') || !relative ? `${relative}index.html` : relative;
    assert(files.includes(target), `Broken URL in ${from}: ${value} (${target})`);
  }

  let imageCount = 0;
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  for (const file of htmlFiles) {
    const html = await readFile(join(output, file), 'utf8');
    const nodes = elements(parse(html));
    const tags = (tag) => nodes.filter((node) => node.tagName === tag);
    assert(/<!doctype html>/i.test(html), `Missing doctype: ${file}`);
    assert(attr(tags('html')[0], 'lang'), `Missing language: ${file}`);
    assert(tags('title')[0]?.childNodes.some((node) => node.value?.trim()), `Missing title: ${file}`);
    assert(tags('meta').some((node) => attr(node, 'name') === 'description' && attr(node, 'content')), `Missing description: ${file}`);
    assert(tags('meta').some((node) => attr(node, 'name') === 'viewport'), `Missing viewport: ${file}`);
    assert.equal(tags('main').length, 1, `Expected one main landmark: ${file}`);
    assert.equal(tags('h1').length, 1, `Expected one h1: ${file}`);
    for (const node of nodes) {
      for (const name of ['href', 'src', 'poster']) checkUrl(attr(node, name), file);
      const srcset = attr(node, 'srcset');
      if (srcset) for (const candidate of srcset.split(',')) checkUrl(candidate.trim().split(/\s+/)[0], file);
      if (node.tagName === 'img') {
        imageCount++;
        assert(attr(node, 'alt') !== undefined, `Missing image alt: ${file}`);
        assert(Number(attr(node, 'width')) > 0 && Number(attr(node, 'height')) > 0, `Missing image dimensions: ${file}`);
      }
    }
  }
  for (const file of files.filter((file) => file.endsWith('.css'))) {
    const css = await readFile(join(output, file), 'utf8');
    for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) checkUrl(match[1], file);
  }
  console.log(`Artifact smoke passed: ${htmlFiles.length} pages, ${imageCount} images, base ${base}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await smoke(baseOption(process.argv.slice(2)));
}
