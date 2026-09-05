// The single source of truth for everything the build and the deploy need.
// Every generated file — the routing table, the cache headers, the landing
// page — is derived from this, so there is no second copy to drift.

/**
 * Where the apps are served in production.
 *
 * This host belongs to the `signal-site` Cloudflare Pages project, which is
 * deployed from a different repo. That project composes this one in: its CI
 * checks this repo out, runs `npm run build && npm run check` here, and copies
 * site/texts/ into its own output. So the URL below is real, but nothing in
 * this repo publishes to it directly — see docs/DEPLOY.md.
 */
export const HOST = "apps.signalaegis.com";

/**
 * Optional standalone Pages project, used only by the preview deploy workflow
 * to check a build on a real *.pages.dev URL before it is composed into
 * production. Not the production target. Deploying to the project that owns
 * HOST from here would replace that project's entire site.
 */
export const PREVIEW_PROJECT = "texts-preview";

/** Build output directory. Uploaded to Pages verbatim. */
export const OUTDIR = "site";

/**
 * One entry per app. `slug` is the subpath: /<slug>/. `dir` holds the app's
 * files and is copied wholesale, so an app can grow assets without the build
 * needing to know about them.
 */
export const APPS = [
  {
    slug: "texts",
    dir: "src/texts",
    name: "Sacred Texts Across Five Faiths",
    blurb:
      "A timeline of the scriptures of Hinduism, Taoism, Judaism, Christianity and Buddhism — when each was composed, and what was being written alongside it.",
  },
];
