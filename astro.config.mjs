import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pomykacz.github.io',
  base: '/jitka-web/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
