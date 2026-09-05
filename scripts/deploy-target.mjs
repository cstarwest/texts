// Prints the deploy target as shell-eval-able assignments, so the workflow
// reads the project name from site.config.mjs instead of repeating it.
//   eval "$(node scripts/deploy-target.mjs)"

import { OUTDIR, PROJECT, HOST } from "../site.config.mjs";

process.stdout.write(
  `PAGES_PROJECT=${PROJECT}\nPAGES_OUTDIR=${OUTDIR}\nPAGES_HOST=${HOST}\n`
);
