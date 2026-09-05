# How this repo reaches apps.signalaegis.com/texts

The generic version of all of this is [DEPLOY-PLAYBOOK.md](DEPLOY-PLAYBOOK.md).
This file is the concrete instantiation: the placeholder values, the one
constraint that shapes the whole arrangement, and the commands to verify it.

| Placeholder | This repo |
| --- | --- |
| `<slug>` | `texts` — served at `/texts/` |
| `<host>` | `apps.signalaegis.com` |
| `<outdir>` | `site` |
| `<project>` | `signal-site` — **owned by a different repo**, see below |

---

## The constraint

`apps.signalaegis.com` is a `CNAME` to `signal-site-417.pages.dev`. That
hostname belongs to the **`signal-site`** Cloudflare Pages project, which is
deployed from a different repository and also serves `/bell/` and the landing
page at `/`.

Two facts decide the design:

- **A Cloudflare custom domain attaches to exactly one Pages project.** There is
  no second project that can answer for `apps.signalaegis.com`, and no
  path-level routing — `_redirects` does `301`/`302` to other origins, not
  transparent proxying.
- **A Pages direct upload replaces the target project's entire file set.** A
  deploy of this repo's `site/` into `signal-site` would publish a site
  containing `/texts/` and nothing else, removing `/bell/` and the landing page.

Serving `/texts` from a hostname that stays on Google nameservers (Workspace
mail lives on the zone, so the nameservers are not moving — playbook §0) leaves
one arrangement that keeps the URL and keeps this repo as the source of truth:

> **signal-site composes this repo in at build time.**

Its CI checks this repo out, runs this repo's own build and guards, and copies
`site/texts/` into its output. The document is authored, versioned and verified
here; it is *served* by the project that owns the hostname.

```
apps.signalaegis.com            signal-site Pages project
  /                             <- signal-site: landing page
  /bell/                        <- signal-site: apps/bell
  /texts/                       <- THIS REPO, built and copied in by its CI
```

---

## What each side does

**Here.** `npm run build` assembles `site/` from
[`site.config.mjs`](../site.config.mjs) — the app files into `site/texts/`,
plus the generated `_redirects` and `_headers`. `npm run check` runs the guards.
Both are exactly what signal-site runs, so what it publishes is what CI proved.

**There.** `site.config.json` lists `texts` with `"external"` set, so the
landing page, routing table and cache headers cover it, while the build skips
looking for `apps/texts` locally. The deploy workflow checks this repo out,
builds it, and copies the result in.

### Workflows here

| Workflow | Trigger | Does |
| --- | --- | --- |
| `ci.yml` | push, PR | build + guards |
| `publish.yml` | push to `main` | build + guards, then asks signal-site to redeploy |
| `deploy-preview.yml` | manual | optional standalone `*.pages.dev` preview |

`publish.yml` needs `SIGNAL_SITE_DISPATCH_TOKEN` (a fine-grained PAT for the
signal-site repo, Contents + Metadata read) to fire automatically. Without it
the job passes and prints the manual step, rather than turning every push red
over an optional secret.

### Two secrets, in two different repos

Easy to conflate, so:

| Secret | Lives in | Lets |
| --- | --- | --- |
| `SIGNAL_SITE_DISPATCH_TOKEN` | **this** repo | this repo ask signal-site to redeploy |
| `EXTERNAL_REPO_TOKEN` | **signal-site** | signal-site clone this repo |

`EXTERNAL_REPO_TOKEN` is the one that is not optional. This repo is private,
and a workflow's `GITHUB_TOKEN` is scoped to the repo it runs in, so
signal-site's runner cannot clone this one without a PAT — `Contents: read`
here is enough. It is the single step that works on a developer's machine
(where git uses their own credentials) and fails on the runner, so it is worth
doing before the first deploy rather than after the first red run. Making this
repo public removes the requirement entirely.

---

## Publishing by hand

Nothing here is required for the site to update — this is what `publish.yml`
automates.

1. Push to `main` here. CI proves the build.
2. In the signal-site repo, run its **Deploy to Cloudflare Pages** workflow. It
   rebuilds this repo from `main` as part of the deploy.

---

## Verify

After a deploy, against the real hostname:

```bash
H=https://apps.signalaegis.com

for p in "/" "/bell/" "/texts" "/texts/"; do
  printf "%-12s " "$p"
  curl -s -o /dev/null -w "http=%{http_code} loc=%{redirect_url} ctype=%{content_type}\n" "$H$p"
done

curl -sI "$H/texts/" | grep -i cache-control
```

Expected: `/` and `/bell/` still `200` — this arrangement must not disturb
them — `/texts` `301`s to `/texts/`, `/texts/` is `200 text/html`, and the
cache header is `must-revalidate`. The document is a single unhashed file, so
caching it immutably would pin every visitor to a stale build; the guard in
`scripts/check-site.mjs` fails the build if `_headers` ever says otherwise.

Confirm nothing on the shared zone moved:

```bash
nslookup -type=MX signalaegis.com 8.8.8.8
nslookup -type=NS signalaegis.com 8.8.8.8
```

`MX` must still be `smtp.google.com` and the nameservers still
`ns-cloud-e{1..4}.googledomains.com`. No DNS change is needed for `/texts` at
all — the hostname already resolves — which is the main thing this arrangement
buys.

---

## Adding another document

1. Drop it at `src/<slug>/index.html`.
2. Add a `{ slug, dir, name, blurb }` entry to `APPS` in `site.config.mjs`.
3. Add the same slug to signal-site's `site.config.json` with `"external"` set.

The routing, headers, landing page and guards all follow from those entries.
Keep URLs relative — the guards reject root-relative ones, because an app at
`/<slug>/` asking for `/style.css` gets the root of the host, which belongs to
somebody else.
