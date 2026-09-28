import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { baseOption, root } from './options.mjs';
import { smoke } from './smoke.mjs';

const command = process.argv[2];
if (!['check', 'build'].includes(command)) {
  throw new Error('Usage: node scripts/site.mjs check|build [--base=/path/]');
}
const base = baseOption(process.argv.slice(3));
const cli = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const result = spawnSync(process.execPath, [cli, command, '--base', base], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

if (command === 'build') {
  await writeFile(new URL('../dist/.nojekyll', import.meta.url), '');
  await writeFile(new URL('../dist/build-info.json', import.meta.url),
    JSON.stringify({ head: process.env.GITHUB_SHA ?? null }, null, 2) + '\n');
  await smoke(base);
}
