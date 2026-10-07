#!/usr/bin/env node
// scripts/fetch-dap-data.mjs
//
// Regenerates src/data/dataAndPublications.json — the card list behind
// /data-and-publications/ — from the two live sources the legacy site's build
// used (creators/createHubArticles.mjs, createPublistPublications.mjs and
// mergeHubAndPublistPublications.mjs; `git show e1ede55:creators/<file>`):
//
//   1. Research Hub articles (researchhub.icjia-api.cloud): published and
//      tagged with ANY tag in src/data/dap-tags.json. Strapi v3 ORs the
//      `tags_contains` array, each entry a case-insensitive substring match
//      (verified against the live API, 2026-10-07).
//   2. Publist publications (agency.icjia-api.cloud): tagged "infonet", minus
//      any with an articleURL — those are Research Hub articles already, so
//      they'd render twice.
//
// Merged newest-first. Runs at the start of every full build, so any rebuild —
// including the 72-hour scheduled one (netlify/functions/scheduled-rebuild.mjs)
// — picks up newly tagged articles without a commit. The committed file is the
// last snapshot; `pnpm dev` and `build:fast` read it as-is.
//
// Fetch and validate BEFORE writing: any HTTP, GraphQL, or shape error fails
// the build and leaves the existing file untouched — same policy as
// fetch-dap-splash.mjs. A failed build keeps the previous deploy live, whereas
// writing a partial or empty list would publish it.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DAP_JSON_PATH    = join(root, 'src/data/dataAndPublications.json');
const DAP_TAGS_PATH    = join(root, 'src/data/dap-tags.json');
const HUB_ENDPOINT     = 'https://researchhub.icjia-api.cloud/graphql';
const PUBLIST_ENDPOINT = 'https://agency.icjia-api.cloud/graphql';
const LIMIT            = 999;

function fail(message) {
  console.error(`DAP data: ${message} — failing build; existing dataAndPublications.json left untouched`);
  process.exit(1);
}

async function fetchList(endpoint, field, query) {
  let payload;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) fail(`${endpoint} returned HTTP ${res.status}`);
    payload = await res.json();
  } catch (err) {
    fail(`${endpoint} request failed (${err.message})`);
  }
  if (payload?.errors?.length) fail(`${endpoint} GraphQL errors: ${JSON.stringify(payload.errors)}`);
  const rows = payload?.data?.[field];
  if (!Array.isArray(rows)) fail(`${endpoint} returned an unexpected shape (data.${field} is not an array)`);
  if (rows.length >= LIMIT) {
    console.warn(`DAP data: ${endpoint} returned the query limit (${LIMIT}) — results may be truncated; raise LIMIT`);
  }
  return rows;
}

const tags = JSON.parse(await readFile(DAP_TAGS_PATH, 'utf8')).map((t) => t.tag);

const hub = await fetchList(HUB_ENDPOINT, 'articles', `query {
  articles(limit: ${LIMIT}, sort: "date:desc", where: { status: "published", tags_contains: ${JSON.stringify(tags)} }) {
    _id title date tags abstract slug
  }
}`);
// Zero matches is an outage or a broken query, never a real state of the Hub.
if (hub.length === 0) fail(`${HUB_ENDPOINT} matched no articles`);

const publist = await fetchList(PUBLIST_ENDPOINT, 'publications', `query {
  publications(limit: ${LIMIT}, sort: "publicationDate:desc", where: { tags_contains: ["infonet"] }) {
    _id: id title pubType date: publicationDate tags abstract: summary slug fileURL articleURL
  }
}`);

const lower = (tagList) => (tagList ?? []).map((t) => t.toLowerCase());

// A publist fileURL becomes the card's href verbatim, and this data now ships
// unreviewed on every rebuild — so accept only absolute http(s) URLs, never
// javascript:/data: or relative junk.
function isWebUrl(value) {
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

// One shape for both sources: the fields the DAP page reads (fetch-dap-splash
// also keys on source/slug/_id). Tags are lowercased so the page's filter
// chips can match them exactly.
const hubItems = hub.map((a) => ({
  _id: a._id,
  title: a.title,
  date: a.date,
  tags: lower(a.tags),
  abstract: a.abstract,
  slug: a.slug,
  pubType: 'article',
  source: 'hub',
  fileURL: null,
  ext: 'html',
}));

const publistItems = [];
for (const p of publist) {
  if (p.articleURL) continue;
  if (!isWebUrl(p.fileURL)) {
    console.warn(`DAP data: skipping publist "${p.title}" — no http(s) fileURL to link to`);
    continue;
  }
  publistItems.push({
    _id: p._id,
    title: p.title,
    date: p.date,
    tags: lower(p.tags),
    abstract: p.abstract,
    slug: p.slug,
    pubType: p.pubType,
    source: 'publist',
    fileURL: p.fileURL,
    ext: p.fileURL.split(/[#?]/)[0].split('.').pop().trim(),
  });
}

// Newest first, same comparator as the page (which re-sorts anyway — this
// just keeps the committed file's diffs readable).
const items = [...publistItems, ...hubItems].sort((a, b) => {
  const da = a.date ?? '';
  const db = b.date ?? '';
  return da > db ? -1 : da < db ? 1 : 0;
});

// Log what changed since the last snapshot so scheduled rebuilds are
// auditable from the Netlify deploy log.
let previous = [];
try {
  previous = JSON.parse(await readFile(DAP_JSON_PATH, 'utf8'));
} catch {
  // no previous snapshot — everything counts as added
}
const key = (a) => `${a.source}:${a._id}`;
const before = new Set(previous.map(key));
const after = new Set(items.map(key));
const added = items.filter((a) => !before.has(key(a)));
const removed = previous.filter((a) => !after.has(key(a)));

await writeFile(DAP_JSON_PATH, JSON.stringify(items, null, 2) + '\n');

console.log(
  `DAP data: ${hubItems.length} hub + ${publistItems.length} publist = ${items.length} items ` +
  `(+${added.length} / -${removed.length} vs previous snapshot)`,
);
for (const a of added) console.log(`  + ${a.title}`);
for (const a of removed) console.log(`  - ${a.title}`);
