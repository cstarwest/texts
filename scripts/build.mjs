// Assembles OUTDIR from the app sources listed in site.config.mjs.
//
// Every app is a directory copied wholesale to /<slug>/, plus the two files
// Cloudflare Pages reads out of the uploaded directory: _redirects and
// _headers. Both are generated from the app list so the routing table cannot
// fall out of step with what actually shipped.

import { cp, mkdir, rm, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { APPS, OUTDIR, HOST } from "../site.config.mjs";

const exists = (p) => access(p).then(() => true, () => false);

async function main() {
  await rm(OUTDIR, { recursive: true, force: true });
  await mkdir(OUTDIR, { recursive: true });

  for (const app of APPS) {
    const entry = join(app.dir, "index.html");
    if (!(await exists(entry))) {
      throw new Error(`${app.slug}: no index.html at ${entry}`);
    }
    await cp(app.dir, join(OUTDIR, app.slug), { recursive: true });
    console.log(`  ${app.dir}/ -> /${app.slug}/`);
  }

  await writeFile(join(OUTDIR, "_redirects"), redirects(), "utf8");
  await writeFile(join(OUTDIR, "_headers"), headers(), "utf8");
  await writeFile(join(OUTDIR, "index.html"), landing(), "utf8");

  console.log(`\nBuilt ${APPS.length} app(s) into ${OUTDIR}/ for https://${HOST}`);
}

// The trailing-slash 301 is the rule that matters. Without it a request for
// /<slug> resolves the page's relative URLs one level too high.
function redirects() {
  return (
    APPS.map((a) => `/${a.slug}    /${a.slug}/    301`).join("\n") + "\n"
  );
}

// These documents are single files with no hashed asset names, so nothing
// here may be cached immutably — a stale HTML file is the whole app.
function headers() {
  return (
    APPS.map(
      (a) =>
        `/${a.slug}/*\n  Cache-Control: public, max-age=0, must-revalidate\n` +
        `  X-Content-Type-Options: nosniff\n` +
        `  Referrer-Policy: strict-origin-when-cross-origin`
    ).join("\n\n") + "\n"
  );
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function landing() {
  const cards = APPS.map(
    (a) => `      <a class="card" href="/${esc(a.slug)}/">
        <span class="name">${esc(a.name)}</span>
        <span class="blurb">${esc(a.blurb)}</span>
        <span class="path">/${esc(a.slug)}</span>
      </a>`
  ).join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Texts</title>
    <meta name="description" content="Reading tools for old books." />
    <meta name="theme-color" content="#101319" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100dvh; padding: 14vh 22px 60px;
        background: #101319; color: #ece5d6;
        font-family: "Karla", "Segoe UI", system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .wrap { max-width: 620px; margin: 0 auto; }
      h1 {
        font-family: "Fraunces", Georgia, "Times New Roman", serif;
        font-weight: 400; font-size: 34px; margin: 0 0 6px; letter-spacing: .02em;
      }
      .tagline { color: #8f8a99; font-size: 14px; margin: 0 0 40px; }
      .card {
        display: grid; gap: 5px; padding: 18px 20px; margin-bottom: 12px;
        border: 1px solid #2a3040; border-radius: 14px;
        background: rgba(255,255,255,.035); text-decoration: none; color: inherit;
        transition: border-color .18s, background .18s;
      }
      .card:hover { border-color: #ff8b3d; background: rgba(255,139,61,.07); }
      .name { font-size: 18px; }
      .blurb { font-size: 13px; color: #8f8a99; line-height: 1.55; }
      .path {
        font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
        color: #ff8b3d; margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Texts</h1>
      <p class="tagline">Reading tools for old books.</p>
${cards}
    </div>
  </body>
</html>
`;
}

main().catch((err) => {
  console.error(`x ${err.message}`);
  process.exit(1);
});
