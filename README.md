# texts

Static reading tools, served at **https://apps.signalaegis.com/texts/**.

| App | Path | Source |
| --- | --- | --- |
| Sacred Texts Across Five Faiths — Timeline | `/texts/` | [`src/texts/index.html`](src/texts/index.html) |

A single self-contained HTML document: no bundler, no dependencies, no runtime.
The build copies it into place and generates the routing and cache rules
Cloudflare Pages reads out of the uploaded directory.

## Working on it

```bash
npm ci
npm run verify   # build + guards
```

The document opens fine straight off disk — `src/texts/index.html` in a
browser — but that is also why the guards exist: every failure they catch
passes locally and only appears once the page is served from `/texts/` rather
than a root.

| Command | Does |
| --- | --- |
| `npm run build` | assemble `site/` from `site.config.mjs` |
| `npm run check` | run the guards against `site/` |
| `npm run verify` | both |
| `npm run deploy` | optional standalone `*.pages.dev` preview |

## Deploying

`apps.signalaegis.com` belongs to a different Pages project, which composes
this repo in at build time — pushing to `main` here is what publishes.
[`docs/DEPLOY.md`](docs/DEPLOY.md) explains why it is arranged that way and how
to verify it; [`docs/DEPLOY-PLAYBOOK.md`](docs/DEPLOY-PLAYBOOK.md) is the
repo-agnostic version for standing up something similar from scratch.
