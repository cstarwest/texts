// Publishes OUTDIR to the standalone PREVIEW Pages project, so a build can be
// checked on a real *.pages.dev URL before production picks it up.
//
// This is not the production deploy. Production is apps.signalaegis.com, which
// belongs to the signal-site Pages project; that project composes this repo in
// at its own build time. See docs/DEPLOY.md.
//
// The project name lives in site.config.mjs and nowhere else: a Pages direct
// upload replaces the target project's entire file set, so a deploy pointed at
// the wrong project takes that project's site down with it.

import { spawnSync } from "node:child_process";
import { OUTDIR, PREVIEW_PROJECT } from "../site.config.mjs";

console.log(`Preview deploy: ${OUTDIR}/ -> Pages project "${PREVIEW_PROJECT}"\n`);

const r = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "wrangler",
    "pages",
    "deploy",
    OUTDIR,
    `--project-name=${PREVIEW_PROJECT}`,
    "--branch=main",
  ],
  { stdio: "inherit" }
);

process.exit(r.status ?? 1);
