#!/usr/bin/env node
/**
 * Static AAA-rule census against dist/ — the fast half of the SiteImprove-100 gate.
 *
 * Approximates three SiteImprove checks that are decidable (or flaggable) without
 * layout, straight from the built output:
 *
 *   1. "Text in all caps" (editorial)   — literal all-caps tokens in DOM text.
 *      CSS text-transform is the sanctioned remedy; only DOM-literal caps count.
 *   2. "Font size is fixed" (SIA-R74)   — census of absolute-unit font-size
 *      declarations in built CSS; selectors that can reach <p> are the real
 *      failures, the rest are listed as context.
 *   3. "Line height below minimum" (SIA-R73) — census of sub-1.5 line-height
 *      declarations. Only <p>/role=paragraph computed values fail the real rule;
 *      the browser sweep is authoritative. This list is the fix-here map.
 *
 * Exit code 1 if any paragraph-reaching absolute font-size remains, so the
 * check can gate CI. All-caps findings are reported but do not fail the run
 * (remaining instances are Strapi content, fixed in the CMS, not in code).
 *
 * Usage: node scripts/a11y-aaa-check.mjs [distDir=dist]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const ALLCAPS_ALLOW = new Set(['INFONET']); // brand wordmark — deliberate

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const htmlFiles = [];
const cssFiles = [];
for (const f of walk(dist)) {
  if (f.endsWith('.html')) htmlFiles.push(f);
  else if (f.endsWith('.css')) cssFiles.push(f);
}

/* ── 1. All-caps DOM text ─────────────────────────────────────────────── */
const capsByPage = new Map();
const CAPS_TOKEN = /[A-Z][A-Z0-9&.'’\/@-]{3,}/g;
for (const f of htmlFiles) {
  if (f.includes(`${join(dist, 'pagefind')}`)) continue; // library UI fragments
  let html = readFileSync(f, 'utf8');
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  const hits = [];
  for (const m of html.matchAll(CAPS_TOKEN)) {
    const tok = m[0];
    const letters = (tok.match(/[A-Z]/g) ?? []).length;
    if (letters < 4) continue;            // OK / FAQ / IL etc. read as initialisms
    if (ALLCAPS_ALLOW.has(tok)) continue;
    hits.push(tok);
  }
  if (hits.length) capsByPage.set(relative(dist, f), hits);
}

/* ── 2+3. Declaration census in built CSS ─────────────────────────────── */
// Minified-CSS tolerant: find declarations, then walk back for the selector
// chunk (text between the previous '}' or '{' and this rule's '{').
function findDeclarations(css, prop, valueRe) {
  const out = [];
  const re = new RegExp(`${prop}\\s*:\\s*(${valueRe})`, 'g');
  for (const m of css.matchAll(re)) {
    const open = css.lastIndexOf('{', m.index);
    const prevClose = Math.max(css.lastIndexOf('}', open), css.lastIndexOf('{', open - 1));
    const selector = css.slice(prevClose + 1, open).trim().slice(0, 120);
    out.push({ selector, value: m[1] });
  }
  return out;
}
// A selector that can put a cascaded value on a <p>: mentions p as element
// (p, .x p, p.y, li>p …) or is a bare universal. Class-only selectors can
// still match <p class=…> — flagged as "maybe" for manual triage.
const P_RE = /(^|[\s>+~,(])p(?![\w-])/;
const results = { css: [] };
for (const f of cssFiles) {
  const css = readFileSync(f, 'utf8');
  const fs = findDeclarations(css, 'font-size', '[0-9.]+(?:px|pt|pc|cm|mm|in|q)\\b');
  const lh = findDeclarations(css, 'line-height', '(?:0?\\.[0-9]+|1|1\\.[0-4][0-9]*)(?:e[m|x])?(?=[;}!])');
  results.css.push({ file: relative(dist, f), fontSizeAbs: fs, lineHeightLow: lh });
}

/* ── Report ───────────────────────────────────────────────────────────── */
let pReaching = 0, fsTotal = 0, lhTotal = 0;
console.log('── Absolute font-size declarations in built CSS (SIA-R74 candidates)');
for (const { file, fontSizeAbs } of results.css) {
  for (const d of fontSizeAbs) {
    fsTotal++;
    const hitsP = P_RE.test(d.selector) || d.selector === '*';
    if (hitsP) pReaching++;
    console.log(`  ${hitsP ? 'P!' : '  '} ${d.value.padEnd(8)} ${d.selector}  [${file}]`);
  }
}
console.log(`  = ${fsTotal} absolute declarations, ${pReaching} with p-matching selectors\n`);

console.log('── line-height < 1.5 declarations in built CSS (SIA-R73 fix map)');
for (const { file, lineHeightLow } of results.css) {
  for (const d of lineHeightLow) {
    lhTotal++;
    console.log(`     ${d.value.padEnd(6)} ${d.selector}  [${file}]`);
  }
}
console.log(`  = ${lhTotal} declarations\n`);

console.log('── Literal all-caps tokens in DOM text (SiteImprove editorial)');
let capsTotal = 0;
for (const [page, hits] of [...capsByPage.entries()].sort()) {
  capsTotal += hits.length;
  const uniq = [...new Set(hits)];
  console.log(`     ${page}: ${hits.length} (${uniq.slice(0, 6).join(', ')}${uniq.length > 6 ? ', …' : ''})`);
}
console.log(`  = ${capsTotal} tokens across ${capsByPage.size} pages`);

process.exitCode = pReaching > 0 ? 1 : 0;
