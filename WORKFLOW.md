# Development workflow

Use GitHub issues in the [jitka-web Project](https://github.com/orgs/pomykacz/projects/1).

1. Write requirements and acceptance criteria in an issue and add it to Backlog. Once the poller has observed it (about 60 seconds), move it to Ready. Alternatively, comment `/mayor start` to select it immediately for intake.
2. The Mayor acknowledges the durable request and moves the issue to In progress. Workers accumulate changes on the issue's integration branch and PR.
3. In review means a fixed QA build and manual review instructions are available. The preview is private and requires Tailscale; production GitHub Pages remains on the last merged version.
4. For rework, post `/mayor rework candidate=<id>` on the first line of a new comment, followed by the feedback. Use the candidate ID in the QA report. This keeps the same issue, parent and PR.
5. Move In review to Approved after testing. The service validates the exact candidate and merges its PR. Successful merging produces Done; GitHub Actions then deploys main to public GitHub Pages. Check the Actions run for deployment success.

A direct move from In review to In progress can also request rework when accompanied by a new comment beginning `QA feedback candidate=<id>`, followed by feedback. Either order works. A command without feedback does not start a rework round. Post new commands rather than editing old comments.

Use `/mayor pause` and `/mayor resume` for operational pauses. Moving directly to Done is not approval. Creating or editing an issue alone does not start implementation. Do not use closing keywords in feature PR descriptions before acceptance.

The bridge uses the existing shared GitHub identity. Ready and Approved status observations are workflow authorization conventions; polling does not authenticate who moved the item. Agents must never approve their own work or merge the integration branch directly.

After an approved main merge, public deployment is automatic for this repository. This deployment policy is specific to Jitka web.
