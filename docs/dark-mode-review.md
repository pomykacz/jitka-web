# Dark mode review

Request **github-jitka_web-3-round-1**, round **1**, GitHub issue **#3**.
Worker: jasper. Verification date: 2026-09-29.
Integration target: `integration/jw-gh-e12138a696afcc92`.

The shared Astro layout now restores a saved light/dark choice synchronously in
its head. Without a saved choice it follows system preference, including live
changes. The native **Tmavý režim** button exposes its state through
`aria-pressed`, works with Enter/Space, and saves manual choices in localStorage.
Storage errors preserve page-local switching. Without JavaScript, CSS follows
system preference and the inactive button stays hidden.

Semantic CSS colors cover text, links, focus, borders, controls, content surfaces,
and code. The light palette, typography, and content spacing remain intact;
dark mode uses a charcoal background and readable blue links. Markdown code has
light/dark high-contrast Shiki palettes. No runtime framework or dependency was
added. Content, routes, static output, deployment permissions, and the
**Validate site** check remain unchanged.

## Actual verification

Node **22.23.3** was used for every repository check. Final results:

| Command | Result |
| --- | --- |
| `npm ci` | Passed; 279 packages installed, zero reported vulnerabilities |
| `npm run check` | Passed; 19 files, zero errors/warnings/hints |
| `npm test` | Passed; post/page discovery, local images, draft exclusion, QA base, schema rejection, dual syntax palettes, built theme-script regression cases |
| `node scripts/site.mjs build --base=/candidate/` | Passed; artifact smoke: 5 pages, 1 image |
| `npm run build` | Passed; restored production-base output, artifact smoke: 5 pages, 1 image |
| `npm run smoke` | Passed at `/jitka-web/` |

Headless Chromium **148.0.7778.96**, driven by a temporary Playwright Core harness,
passed 16 scenarios at each of `/jitka-web/` and `/candidate/`: 1280px/360px
viewports × light/dark OS × absent/light/dark/invalid saved choice. Assertions
covered the theme when the body appeared and its first animation frame,
Tab/Space/Enter, accessible name/pressed state, visible keyboard focus, reload,
all five routes including `404.html`, local image loading, and absence of viewport
overflow. Additional checks passed for live system changes, cross-tab preference
updates/removal, throwing localStorage, and JavaScript-disabled system fallback.
Desktop/mobile article screenshots in both themes were visually inspected.

Measured text contrast against the page background: body **15.91:1 / 13.79:1**,
muted **7.46:1 / 8.71:1**, links **8.71:1 / 9.51:1** (light/dark).
Sample JavaScript syntax tokens, including comments, measured at least
**4.61:1 / 6.83:1** against the code surface.

The committed regression tests also verify synchronous head-script ordering,
invalid/blocked storage, manual overrides, OS changes, and storage clearing.
Initial validation exposed missing light syntax variables and an assertion that
assumed linked CSS; both were corrected before the passing final run.

Temporary HTTP servers were owned by this ticket and closed in the harness's
`finally` block, along with Chromium: initial PID 924823/port 39279, final
production PID 928268/port 38607, candidate PID 931040/port 33533. No preview
server remains running. Browser tooling was temporary and is not a project
dependency.

## Human review on the managed candidate

1. Connect through Tailscale and open the immutable candidate URL supplied by the
   Mayor. With `jitka-web-theme` absent from that origin's localStorage, check both
   OS preferences and change the OS preference while the page is open.
2. Tab to **Tmavý režim**. Check the focus outline, press Space and Enter, and
   confirm the label's visible state and the screen reader's pressed state.
3. Choose the opposite of the OS theme, reload, follow Blog → Ukázkový článek,
   open Ukázková stránka, and directly load `404.html`. Confirm persistence,
   readable text/links, the article image, and no obvious wrong-theme flash.
4. Repeat at a narrow mobile width. Review both palettes and the wrapped header;
   verify navigation and the toggle remain comfortable to use.
5. Give feedback or approve the exact managed candidate through [WORKFLOW.md](../WORKFLOW.md).
   Use that candidate's ID for rework.

Browser evidence is limited to Chromium; no real screen-reader session,
Firefox/WebKit, or physical mobile device was tested. First-body/frame checks
and screenshots support the no-flash result but are not a video capture.
Managed QA publication and human acceptance remain pending. Main merge,
successful deployment Actions, and production live verification must follow the
existing workflow; this report makes no deployment claim.
