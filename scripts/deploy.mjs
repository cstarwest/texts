// Publishes OUTDIR to the Cloudflare Pages project named in site.config.mjs.
// Exists so the project name lives in exactly one place — a deploy pointed at
// the wrong project overwrites somebody else's site, and the failure is loud
// only after it has happened.

import { spawnSync } from "node:child_process";
import { OUTDIR, PROJECT, HOST } from "../site.config.mjs";

console.log(`Deploying ${OUTDIR}/ to Pages project "${PROJECT}" (${HOST})\n`);

const r = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["wrangler", "pages", "deploy", OUTDIR, `--project-name=${PROJECT}`, "--branch=main"],
  { stdio: "inherit" }
);

process.exit(r.status ?? 1);
