# Jitka web

Jitka's personal website and blog. Jitka directs the design and content and accepts the work through issues. The current pages are deliberately neutral examples, not her biography or final design.

Production address: <https://pomykacz.github.io/jitka-web/>. This migration is prepared for review; deployment and live verification follow human approval and merge, as described in [WORKFLOW.md](WORKFLOW.md).

## Stack and source

Astro **7.3.5**, TypeScript **6.0.3**, ordinary Astro components and CSS, and Markdown content collections. Output is static HTML/CSS and local images; no application server, UI framework, database, or CMS is required. npm is the package manager; `package-lock.json` pins the dependency tree.

Versions were checked against the npm registry on 2026-09-28. Astro's [installation requirements](https://docs.astro.build/en/install-and-setup/#prerequisites) require Node 22.12 or later and exclude odd-numbered Node releases. Use **Node 22.23.3** (`.nvmrc`, also the private QA runtime), or supported Node 24 LTS. TypeScript 6 is used because `@astrojs/check` 0.9.10 supports TypeScript 5/6, not 7. See [Node release support](https://nodejs.org/en/about/previous-releases).

```text
src/content.config.ts       Validated posts/pages schemas and file-based IDs
src/content/posts/          Markdown articles with colocated images
src/content/pages/          Markdown standalone pages
src/pages/                  Home, blog, article/page routes, 404
src/layouts/                Shared HTML document, metadata, navigation
src/components/             Reusable presentation (e.g. publication date)
src/styles/                 Site CSS
src/lib/                    Shared content visibility and base-aware URLs
scripts/                    Legacy command wrappers and lightweight smoke checks
astro.config.mjs            Production site/base and static output
.github/workflows/pages.yml Validation and main-only Pages deployment
dist/                       Generated public files only; ignored by git
```

The old `site/` scaffold has been replaced, not kept as a second application.

## Work locally

With the supported Node version and its bundled npm (10 or later):

```sh
npm ci
npm run dev
# Open http://localhost:4321/jitka-web/; Ctrl-C stops the server.

npm run check
npm run build
npm run smoke
npm test

npm run preview
# Open http://localhost:4321/jitka-web/; Ctrl-C stops the production preview.
```

`check` runs Astro's type and content checks. `build` runs the actual Astro build, then checks output metadata, nested links, base paths, CSS/image URLs, image dimensions/alt attributes, and public-file boundaries. `npm test` temporarily adds a second post, image, and standalone page, verifies discovery without code edits, changes them to drafts and verifies exclusion, tests invalid frontmatter rejection, and removes the fixtures in `finally`. It rebuilds production output when finished. Run it without a concurrent dev/build process.

Clean-checkout verification is `npm ci && npm run check && npm test && npm run build && npm run smoke`. No test framework is needed. Install requires registry access; check/build/test use installed dependencies and local assets and can run offline.

The external tooling entry points and `dist/` contract are preserved:

```sh
node scripts/site.mjs check
node scripts/site.mjs build
node scripts/site.mjs build --base=/qa-example/
node scripts/smoke.mjs --base=/qa-example/
npm run preview -- --base=/qa-example/
```

Both `--base=/path/` and `--base /path/` are accepted; use a leading and trailing slash. `/` is also supported. The build itself always runs smoke validation for its selected base. Rebuild without an override to restore production output. The wrapper preserves `.nojekyll` and `build-info.json` (only the `GITHUB_SHA` value, if supplied).

Private QA uses its managed preview, not a long-running worker server. The external service installs with `npm ci`, runs `node scripts/site.mjs check`, and builds with `node scripts/site.mjs build --base={candidate_base}`; the service expands that token to `/qa-.../`. Only its install step needs network. External service configuration is owned by the Mayor, outside this repository. Required checks remain `html/build` and GitHub **Validate site**.

## Add or edit content

For a first real article, create `src/content/posts/my-first-post/index.md` and put any images next to it. Copy the structure below, replace the text with Jitka's content, and initially keep `draft: true`:

```markdown
---
title: Název článku
description: Krátké shrnutí článku.
pubDate: 2026-09-28
tags: [poznámky]
draft: true
---

Text článku.

![Popis toho, co je na obrázku.](./photo.jpg)
```

Required nonempty fields: `title`, `description`, and (posts only) `pubDate`, a valid date; use `YYYY-MM-DD`. Optional `tags` is a list of nonempty strings (default `[]`); `draft` is a boolean (default `false`). Dates are displayed in Czech in UTC to avoid day shifts. Title/description feed the HTML metadata. Start Markdown headings at `##`: the layout supplies the page's `h1` from its title.

Create standalone pages under `src/content/pages/`, with the same frontmatter except no publication date is required. `src/content/pages/example.md` demonstrates this. Pages appear automatically on the home page; posts appear automatically on the blog, newest first. Editing text, adding articles/pages, or adding images requires no application-code changes.

URLs are determined by the relative filename, not the title or date:

| Source | URL below the configured base |
| --- | --- |
| `posts/my-first-post/index.md` | `blog/my-first-post/` |
| `posts/notes/spring.md` | `blog/notes/spring/` |
| `pages/example.md` | `pages/example/` |

Use lowercase ASCII words, digits, and hyphens in file/folder names. Keep published paths stable; renaming moves the URL. A trailing `/index.md` is omitted from the ID. Do not create both `example.md` and `example/index.md` in a collection: they address the same URL. There is no frontmatter slug override; rename the path deliberately to change it.

Use relative Markdown image paths to local files under `src/`, as in the example article. Astro processes these at build time and emits optimized files with dimensions under `_astro/`. Provide useful alt text (empty only for a purely decorative image). The sample PNG is an original geometric fixture, not a personal photo. Avoid external images/fonts so offline QA builds remain reproducible. `public/`, if added later, is copied as-is; never store drafts or private files there. See [Astro image handling](https://docs.astro.build/en/guides/images/#images-in-markdown-files).

`draft: true` content is visible with a clear concept label during `npm run dev`, including in local listings. `npm run build` and `npm run preview` exclude it from routes and listings regardless of environment flags. No feed or sitemap is currently generated. Draft filtering is not confidentiality for the source repository: Markdown remains in git. Publish by changing to `draft: false` after the appropriate content review.

In `.astro` templates use `src/lib/urls.ts` for internal links; never hardcode `/blog/` or `/jitka-web/`. In Markdown, use relative **page URL** links (not `.md` file links), e.g. `../../pages/example/` from a top-level article. Build smoke checks catch broken local links. Images use relative **source file** paths instead. The document language is `cs` in `BaseLayout.astro`; update it and the date locale in `PostDate.astro` if the site's language changes.

## CI, approval, and hosting

Pull requests and pushes to worker/integration branches run **Validate site**: `npm ci`, Astro/type/content checks, authoring/draft/base tests, and a production build with artifact smoke validation. They cannot upload a Pages artifact or deploy. Only successful non-PR builds of `main` upload `dist/` and deploy through the `github-pages` environment. Validation has `contents: read`; only the deployment job gets `pages: write` and `id-token: write`.

The repository's Pages source must be **GitHub Actions** (Settings → Pages → Build and deployment). Keep any existing environment/protection requirements and the human approval policy. After approval and the service's merge, review the **Validate and deploy website** Actions run, open production, directly load an article and a standalone page, and check an image and an unknown URL/404. Record the workflow run and live URL in the QA report. A local build does not prove a deployment; this delivery does not claim live deployment verification.

For a future custom domain chosen by Jitka: configure that domain and its DNS in GitHub Pages following the [GitHub custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), change `site` in `astro.config.mjs` to its HTTPS origin and `base` to `/`, and re-run all checks. Add `public/CNAME` with the approved domain if using a CNAME file, check HTTPS in Pages settings, and verify nested pages/assets after the approved deployment. No domain is configured now.

## Request and review changes

Use the plain-language change/bug issue templates in this repository and the [jitka-web Project](https://github.com/orgs/pomykacz/projects/1). Include the desired result and how you will recognize it. [WORKFLOW.md](WORKFLOW.md) is the source of truth for Ready → Mayor → integration PR → private QA → human approval → merge/deploy. Agents must not approve their own work, merge directly, or use closing keywords before acceptance.

For request `github-jitka_web-1-round-1` (round 1), review the managed candidate URL from the Mayor's QA report:

1. Open the home page, follow Blog, and read **Ukázkový článek**; check its date and local image.
2. Reload the article directly, use **Zpět na blog**, and verify all navigation stays inside the candidate URL.
3. Open **Ukázková stránka** from home and confirm its Markdown content renders.
4. Check narrow/mobile layout, keyboard focus, and the skip-to-content link; open `404.html` and return home.
5. Review the content instructions and automated evidence for second-post discovery and draft exclusion. Give design/content feedback in the issue; these examples do not settle the final design.

Use the candidate ID for rework/approval exactly as specified in WORKFLOW. Public deployment and its live verification remain pending until human acceptance.
