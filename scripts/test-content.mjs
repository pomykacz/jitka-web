import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root } from './options.mjs';

// Temporary Markdown/assets exercise the authoring contract without application changes.
const id = `smoke-${process.pid}`;
const postDir = join(root, 'src/content/posts', id);
const pageDir = join(root, 'src/content/pages', id);
const marker = `DRAFT-PRIVATE-${id}`;
const image = join(root, 'src/content/posts/example/sample.png');

function run(command, args = [], success = true) {
  const result = spawnSync(process.execPath, ['scripts/site.mjs', command, ...args], {
    cwd: root, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (result.error) throw result.error;
  if (success && result.status !== 0) throw new Error(result.stdout + result.stderr);
  if (!success) assert.notEqual(result.status, 0, 'Invalid frontmatter must fail check');
  if (success) process.stdout.write(result.stdout);
}

async function allOutput(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    files.push(...entry.isDirectory() ? await allOutput(path) : [path]);
  }
  return files;
}

try {
  await mkdir(postDir);
  await mkdir(pageDir);
  await cp(image, join(postDir, 'local.png'));
  await writeFile(join(postDir, 'index.md'), `---\ntitle: Second post smoke\ndescription: Added with Markdown only\npubDate: 2026-09-28\ntags: [test]\n---\n\nSECOND-POST-${id}\n\n![Local test image](./local.png)\n`);
  await writeFile(join(pageDir, 'index.md'), '---\ntitle: Another page\ndescription: Added with Markdown only\n---\n\nStandalone test page.\n');
  run('build');
  const article = await readFile(join(root, `dist/blog/${id}/index.html`), 'utf8');
  assert(article.includes(`SECOND-POST-${id}`));
  assert.match(article, /src="\/jitka-web\/_astro\/[^" ]+\.webp"/);
  assert((await readFile(join(root, 'dist/blog/index.html'), 'utf8')).includes(`/blog/${id}/`));
  assert((await readFile(join(root, 'dist/index.html'), 'utf8')).includes(`/pages/${id}/`));

  // Publishing then drafting catches stale routes left by previous builds.
  for (const dir of [postDir, pageDir]) {
    const path = join(dir, 'index.md');
    const content = await readFile(path, 'utf8');
    await writeFile(path, content.replace('---\n', `---\ndraft: true\n`).replace(/title: .+/, `title: ${marker}`) + `\n${marker}\n`);
  }
  run('build', ['--base=/qa-content-smoke/']);
  const output = await allOutput(join(root, 'dist'));
  assert(!output.some((file) => file.includes(`/${id}/`)), 'Draft route leaked');
  for (const file of output) {
    assert(!(await readFile(file)).includes(Buffer.from(marker)), `Draft text leaked into ${file}`);
  }

  await writeFile(join(postDir, 'invalid.md'), '---\ntitle: Invalid post\n---\nMissing required description and date.\n');
  run('check', [], false);
  console.log('Content smoke passed: second post/page, processed local image, draft routes/text, invalid schema.');
} finally {
  await rm(postDir, { recursive: true, force: true });
  await rm(pageDir, { recursive: true, force: true });
  // Remove fixture output and restore the production artifact after the test.
  run('build');
}
