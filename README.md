# Jitka web

Minimal static website, published at https://pomykacz.github.io/jitka-web/ by GitHub Actions.

Source files live in `site/`. No dependencies or package installation are required.

```sh
node scripts/site.mjs check
node scripts/site.mjs build
```

The build writes only public website files to `dist/`. GitHub Actions checks pull requests and deploys pushes to `main` to GitHub Pages.

Development is managed through the [jitka-web Project](https://github.com/orgs/pomykacz/projects/1). See [WORKFLOW.md](WORKFLOW.md) for Ready, QA and approval instructions.
