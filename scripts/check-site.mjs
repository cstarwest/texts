// The guards. These encode the invariants that decide whether an app works
// once it is served from a subpath rather than a root, and every one of them
// passes when you open the file straight off disk — which is exactly why they
// have to run in CI instead of being left to review.
//
// Run after `npm run build`. Costs about a second.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { APPS, OUTDIR } from "../site.config.mjs";

const problems = [];
const fail = (msg) => problems.push(msg);

// 1. Every configured app actually shipped, and shipped something.
for (const app of APPS) {
  const entry = join(OUTDIR, app.slug, "index.html");
  if (!existsSync(entry)) {
    fail(`${app.slug}: missing ${entry}`);
    continue;
  }
  if (readFileSync(entry, "utf8").trim().length < 200) {
    fail(`${app.slug}: ${entry} is suspiciously small`);
  }
}

// 2. Nothing under /<slug>/ may reference the host root. An app served at
//    /texts/ that asks for /style.css gets the root of the domain, which
//    belongs to a different app — a 404 in production, and no error at all
//    when the same file is opened locally.
const ROOT_REL = /(?:src|href|action|poster)\s*=\s*["']\/(?!\/)/;
const ROOT_REL_CSS = /url\(\s*["']?\/(?!\/)/;

for (const app of APPS) {
  for (const file of walk(join(OUTDIR, app.slug))) {
    if (!/\.(html|css|js)$/i.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const re of [ROOT_REL, ROOT_REL_CSS]) {
      const hit = re.exec(text);
      if (hit) {
        fail(
          `${app.slug}: ${file} has a root-relative URL ` +
            `(${JSON.stringify(hit[0])}) — it will not resolve under /${app.slug}/`
        );
      }
    }
  }
}

// 3. The trailing-slash redirect. Without it, /<slug> resolves the page's
//    relative requests one level too high.
//
//    Parsed as columns rather than pattern-matched: a regex assembled by
//    string concatenation is one escaping mistake away from matching nothing
//    at all and passing silently, which is the worst shape a guard can take.
const redirects = readIfPresent(join(OUTDIR, "_redirects"));
if (redirects === null) {
  fail(`missing ${OUTDIR}/_redirects`);
} else {
  const rules = redirects
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/));

  for (const app of APPS) {
    const ok = rules.some(
      (r) => r[0] === `/${app.slug}` && r[1] === `/${app.slug}/` && r[2] === "301"
    );
    if (!ok) fail(`_redirects: no "/${app.slug} -> /${app.slug}/ 301" rule`);
  }
}

// 4. Single-file documents carry no content hash, so caching one immutably
//    pins every visitor to whichever build was live when they first loaded it.
const headers = readIfPresent(join(OUTDIR, "_headers"));
if (headers === null) {
  fail(`missing ${OUTDIR}/_headers`);
} else if (/immutable/.test(headers)) {
  fail(
    `_headers: marks unhashed content immutable — visitors would pin to a stale build`
  );
}

// 5. The landing page reaches every app. A shipped app nothing links to is an
//    app nobody finds.
const landing = readIfPresent(join(OUTDIR, "index.html"));
if (landing === null) {
  fail(`missing ${OUTDIR}/index.html`);
} else {
  for (const app of APPS) {
    if (!landing.includes(`href="/${app.slug}/"`)) {
      fail(`landing page does not link to /${app.slug}/`);
    }
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );
}

function readIfPresent(p) {
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

if (problems.length) {
  for (const p of problems) console.error(`x ${p}`);
  process.exit(1);
}

console.log(
  `ok ${APPS.length} app(s) built, no root-relative URLs, ` +
    `trailing-slash redirects present, nothing cached immutably`
);
