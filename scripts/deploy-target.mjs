// Prints the preview deploy target as shell-eval-able assignments, so the
// workflow reads the project name from site.config.mjs instead of repeating
// it. Appending to $GITHUB_ENV is enough:
//
//   node scripts/deploy-target.mjs >> "$GITHUB_ENV"

import { OUTDIR, PREVIEW_PROJECT, HOST } from "../site.config.mjs";

process.stdout.write(
  [
    `PAGES_PROJECT=${PREVIEW_PROJECT}`,
    `PAGES_OUTDIR=${OUTDIR}`,
    `PROD_HOST=${HOST}`,
    "",
  ].join("\n")
);
