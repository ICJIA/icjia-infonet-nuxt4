#!/usr/bin/env node
// scripts/fetch-dap-splash.mjs
//
// Fetches `splash` base64 data URLs from researchhub.icjia-api.cloud for every
// `source: "hub"` entry in src/data/dataAndPublications.json, resamples each
// image into responsive WebP thumbnails via Sharp, and writes:
//
//   public/_cms-img/dap/<id>-{400,800}.webp     — emitted files
//   src/data/dap-splash-manifest.json           — { id → { src, srcset, width, height } }
//
// The DAP page template reads the manifest at build time and renders the
// resamped thumb on each card. Mirrors the pattern legacy createHubImages.mjs
// used but pipes through Sharp instead of fs.writeFile of raw base64 (saves
// ~70-80% bytes vs the original JPEGs).
//
// Runs once at build time before the second `astro build`; safe to re-run.

import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DAP_JSON_PATH      = join(root, 'src/data/dataAndPublications.json');
const MANIFEST_PATH      = join(root, 'src/data/dap-splash-manifest.json');
const OUT_DIR_PUBLIC     = join(root, 'public/_cms-img/dap');
const OUT_DIR_DIST       = join(root, 'dist/_cms-img/dap');
const GRAPHQL_ENDPOINT   = 'https://researchhub.icjia-api.cloud/graphql';
const THUMB_WIDTHS       = [400, 800];

const articles = JSON.parse(await readFile(DAP_JSON_PATH, 'utf8'));
const hubSlugs = articles.filter(a => a.source === 'hub').map(a => a.slug);
console.log(`DAP splash: ${hubSlugs.length} hub articles to fetch`);

const fetchedAt = new Date().toISOString();

// Reset output dirs (deterministic builds).
for (const d of [OUT_DIR_PUBLIC, OUT_DIR_DIST]) {
  if (existsSync(d)) await rm(d, { recursive: true, force: true });
}
await mkdir(OUT_DIR_PUBLIC, { recursive: true });

// researchhub's Strapi-v3 GraphQL paginates poorly; fetch all 261 and filter
// by slug locally (legacy createHubImages.mjs did the same).
const query = `query { articles(limit: 999, sort: "date:desc", where: { status: "published" }) { _id slug splash } }`;
const res = await fetch(GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});
if (!res.ok) {
  console.error(`researchhub GraphQL ${res.status} — skipping splash fetch`);
  await writeFile(MANIFEST_PATH, JSON.stringify({ generatedAt: fetchedAt, items: {} }, null, 2));
  process.exit(0);
}
const payload = await res.json();
const all = payload?.data?.articles ?? [];
const bySlug = new Map(all.map(a => [a.slug, a]));

const manifest = { generatedAt: fetchedAt, items: {} };
let written = 0;
let skipped = 0;

for (const article of articles) {
  if (article.source !== 'hub') { skipped++; continue; }
  const hit = bySlug.get(article.slug);
  if (!hit || !hit.splash || !hit.splash.startsWith('data:image/')) {
    skipped++; continue;
  }
  const id = String(article._id);

  // Decode data URL → Buffer
  const [, ext, b64] = hit.splash.match(/^data:image\/(\w+);base64,(.+)$/) ?? [];
  if (!b64) { skipped++; continue; }
  const buf = Buffer.from(b64, 'base64');

  // Generate WebP at each target width + collect manifest entry.
  const variants = [];
  for (const w of THUMB_WIDTHS) {
    const filename = `${id}-${w}.webp`;
    const outPath = join(OUT_DIR_PUBLIC, filename);
    const result = await sharp(buf)
      .resize({ width: w, withoutEnlargement: true, fit: 'cover' })
      .webp({ quality: 78, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(outPath, result.data);
    variants.push({ w, h: result.info.height, file: filename });
  }

  // Default src = smallest; srcset enumerates all widths.
  const smallest = variants[0];
  manifest.items[id] = {
    src: `/_cms-img/dap/${smallest.file}`,
    srcset: variants.map(v => `/_cms-img/dap/${v.file} ${v.w}w`).join(', '),
    width: smallest.w,
    height: smallest.h,
  };
  written++;
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

// Dual-write to dist/ if it exists (parallels build-og-image.mjs).
if (existsSync(join(root, 'dist'))) {
  await mkdir(OUT_DIR_DIST, { recursive: true });
  for (const id of Object.keys(manifest.items)) {
    for (const w of THUMB_WIDTHS) {
      const filename = `${id}-${w}.webp`;
      const src = join(OUT_DIR_PUBLIC, filename);
      const dst = join(OUT_DIR_DIST, filename);
      const data = await readFile(src);
      await writeFile(dst, data);
    }
  }
}

console.log(`DAP splash: ${written} written, ${skipped} skipped`);
