# Project guidance

This is Jitka's personal static website and blog. Jitka owns design/content direction and acceptance. Keep changes scoped to the active issue. Do not invent personal information, branding, or substantial editorial content.

Use Astro components, TypeScript, CSS, and validated Markdown content collections. No UI framework, backend, database, CMS, or SSR without a concrete requirement. Keep content in `src/content/{posts,pages}`, schemas in `src/content.config.ts`, routing in `src/pages`, reusable presentation in `src/layouts` and `src/components`, and CSS in `src/styles`. Preserve Markdown-only authoring and separate content from design. Article images live next to Markdown under `src/` and use relative paths and appropriate alt text.

Use Node 22.23.3 (`.nvmrc`, matching QA) or supported Node 24 and npm. Commit `package-lock.json` when dependencies change. Required verification:

```sh
npm ci
npm run check
npm test
npm run build
npm run smoke
```

`npm test` creates and cleans temporary content, verifies new post/page discovery, local image processing, draft exclusion, QA base support, and schema rejection; do not run concurrently with dev/build. `npm run dev` includes drafts locally. Static builds must exclude drafts from all public routes/listings and future feeds/sitemaps. Keep draft/private material out of `public/`.

GitHub Pages requires fully static `dist/`, directory-style nested routes, and a functional `404.html`. Respect `astro.config.mjs` site/base and `import.meta.env.BASE_URL`; use `src/lib/urls.ts` for internal template links. Preserve `node scripts/site.mjs check|build`, the `--base=/candidate/` override, and the public `dist/` contract for private QA. Install may access the network; check/build must work offline. Build always runs artifact smoke validation for the selected base. Do not edit external QA service settings from this repo.

[WORKFLOW.md](WORKFLOW.md) is the source of truth for issue intake, automation, private QA, rework, and human approval. Follow it without creating a second approval model. Provide the request/round, architecture/change summary, actual command results, concrete human review steps, and any remaining operational steps. Never claim deployment without a successful Actions run and live verification. Do not approve your own work, merge directly into main, or use issue-closing keywords before acceptance. Worker submissions go through the assigned integration branch; main-only deployment follows the existing approved merge flow. Keep the required GitHub check name **Validate site** and minimum deployment permissions.

See [README.md](README.md) for authoring, URL conventions, language, commands, and future custom-domain setup.
