// The single source of truth for everything the build and the deploy need.
// Every generated file — the routing table, the cache headers, the landing
// page — is derived from this, so there is no second copy to drift.

/** The hostname the site is served on. */
export const HOST = "apps.signalaegis.com";

/** The Cloudflare Pages project that owns HOST. See docs/DEPLOY.md. */
export const PROJECT = "texts-site";

/** Build output directory. Uploaded to Pages verbatim. */
export const OUTDIR = "site";

/**
 * One entry per app. `slug` is the subpath: /<slug>/. `dir` holds the
 * app's files and is copied wholesale, so an app can grow assets without
 * the build needing to know about them.
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
