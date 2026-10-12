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

## Run the website locally

When Jitka asks to run/start/open the website locally, start it and verify it responds; do not stop at providing commands. The local checkout is `/Users/jitka/workspace/jitka-web`.

Use Node 22.23.3 or Node 24. The system Node may be an unsupported version. In Codex, locate the bundled Node runtime with `load_workspace_dependencies` and prepend its `node/bin` directory to `PATH` for npm commands. The runtime used successfully for this checkout was Node 24 at `/Users/jitka/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin`; re-check its version before reuse.

1. Check whether `http://127.0.0.1:4321/jitka-web/` already serves this site. Reuse a running server rather than starting a duplicate.
2. If dependencies are missing or the lockfile has changed since installation, run `npm ci` with the supported Node runtime. Obtain network and repository write access if the sandbox requires it. If the default npm cache is blocked, pass `--cache` pointing to a writable scratch directory.
3. From the repository root, start:

   ```sh
   ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --host 127.0.0.1
   ```

   Set the supported Node runtime in `PATH` for this command. Disabling telemetry avoids a sandbox error when Astro tries to create `~/Library/Preferences/astro`. Astro 7 may start a background server and let this command exit successfully; confirm using the reported URL and process status.
4. Verify an HTTP 200 response from `http://127.0.0.1:4321/jitka-web/`, then open that URL with `open_in_codex` and provide a clickable link. If Astro reports a different port, verify and open that port instead.

Keep the server running for the user. With the same Node runtime selected, use `npm exec -- astro dev status`, `npm exec -- astro dev logs`, or `npm exec -- astro dev stop` to manage the background server. Do not run `npm test` concurrently with the dev server. Local development includes draft content.
