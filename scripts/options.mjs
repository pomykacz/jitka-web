import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));

export function baseOption(args) {
  let base = config.base;
  if (args.length === 1 && args[0].startsWith('--base=')) base = args[0].slice(7);
  else if (args.length === 2 && args[0] === '--base') base = args[1];
  else if (args.length) throw new Error('Only --base=/path/ is supported.');
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
    throw new Error('Base must be / or an absolute path with a trailing slash, e.g. /jitka-web/.');
  }
  return base;
}
