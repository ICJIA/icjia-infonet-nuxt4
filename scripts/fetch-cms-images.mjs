#!/usr/bin/env node
// astro/scripts/fetch-cms-images.mjs
//
// Phase 5a image pipeline — Tier 2 (Strapi-hosted images).
// Walks .cache/strapi/*.json, extracts every /uploads/<file>.{jpg,jpeg,png,gif,webp}
// URL string, downloads each once (cached in .cache/cms-img/<sha256-of-url>.<ext>),
// resamples to [320, 640, 960, 1280] widths via Sharp, emits variants at
// public/_cms-img/<hash>/<width>.<ext>, and writes a manifest at
// src/lib/cms-image-manifest.json.
//
// Idempotent: re-runs skip source files already cached and skip variants
// already on disk.
//
// **Constants drift warning:** STRAPI_BASE below MUST stay in sync with
// siteConfig.api.base (src/lib/siteConfig.ts). If either changes, update
// this file and re-run `pnpm fetch:cms-images` so the manifest URLs match.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const STRAPI_BASE = 'https://infonet.icjia-api.cloud'; // siteConfig.api.base
const STRAPI_CACHE_DIR = path.resolve('.cache/strapi');
const IMG_CACHE_DIR = path.resolve('.cache/cms-img');
const OUT_DIR = path.resolve('public/_cms-img');
const MANIFEST_PATH = path.resolve('src/lib/cms-image-manifest.json');

const WIDTHS = [320, 640, 960, 1280];
const QUALITY = 82;
const FETCH_TIMEOUT_MS = 30_000;

// Match /uploads/<path>.<ext> anywhere in the cached JSON — JSON-string-quoted
// fields AND markdown link/image syntax embedded inside body strings.
// Case-insensitive — content has both .jpg and .PNG extensions in the wild.
const UPLOAD_RX = /\/uploads\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|gif|webp)/gi;

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

async function exists(p) {
  try { await fs.access(p); return true; }
  catch { return false; }
}

function extractUrlsFromText(text) {
  const urls = new Set();
  const matches = text.match(UPLOAD_RX) ?? [];
  for (const m of matches) urls.add(m);
  return urls;
}

async function collectAllUrls() {
  const urls = new Set();
  let entries;
  try {
    entries = await fs.readdir(STRAPI_CACHE_DIR);
  } catch {
    console.warn(`[fetch-cms-images] .cache/strapi/ not found — nothing to process`);
    return [];
  }
  for (const f of entries) {
    if (!f.endsWith('.json')) continue;
    const text = await fs.readFile(path.join(STRAPI_CACHE_DIR, f), 'utf8');
    for (const u of extractUrlsFromText(text)) urls.add(u);
  }
  return [...urls].sort();
}

/** Derive the canonical absolute URL from a relative /uploads/... path. */
function canonicalize(relPath) {
  return relPath.startsWith('http') ? relPath : `${STRAPI_BASE}${relPath}`;
}

/** Extract file extension (without dot) from a path, normalised to lowercase. */
function extOf(relPath) {
  const m = relPath.match(/\.([a-z0-9]+)$/i);
  if (!m) return 'jpg';
  const e = m[1].toLowerCase();
  return e === 'jpeg' ? 'jpeg' : e;
}

async function downloadOnce(relPath, hash) {
  const ext = extOf(relPath);
  const cachePath = path.join(IMG_CACHE_DIR, `${hash}.${ext}`);
  if (await exists(cachePath)) return { cachePath, ext };
  const absUrl = canonicalize(relPath);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(absUrl, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${absUrl}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await ensureDir(IMG_CACHE_DIR);
    await fs.writeFile(cachePath, buf);
    return { cachePath, ext };
  } finally {
    clearTimeout(timer);
  }
}

async function processOne(relPath) {
  const hash = sha256(relPath);
  const { cachePath, ext } = await downloadOnce(relPath, hash);

  const meta = await sharp(cachePath).metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceHeight = meta.height ?? 0;

  if (!sourceWidth) {
    throw new Error(`source has no width metadata (corrupt or unsupported): ${relPath}`);
  }

  // Only emit variants that are <= original width; always emit at least one.
  const widths = WIDTHS.filter((w) => w <= sourceWidth);
  if (widths.length === 0) widths.push(sourceWidth);

  const outDir = path.join(OUT_DIR, hash);
  await ensureDir(outDir);

  const sources = [];
  for (const w of widths) {
    const outFile = path.join(outDir, `${w}.${ext}`);
    const outSrc = `/_cms-img/${hash}/${w}.${ext}`;
    if (!(await exists(outFile))) {
      await sharp(cachePath)
        .resize({ width: w, withoutEnlargement: true })
        .toFormat(ext === 'jpeg' || ext === 'jpg' ? 'jpeg' : ext, { quality: QUALITY })
        .toFile(outFile);
    }
    sources.push({ width: w, src: outSrc });
  }

  return {
    originalUrl: canonicalize(relPath),
    originalWidth: sourceWidth,
    originalHeight: sourceHeight,
    sources,
    ext,
  };
}

async function main() {
  console.log('[fetch-cms-images] scanning .cache/strapi/ for upload URLs...');
  const relPaths = await collectAllUrls();
  console.log(`[fetch-cms-images] found ${relPaths.length} unique image URL(s)`);

  if (relPaths.length === 0) {
    // Write empty manifest so the build doesn't break.
    await ensureDir(path.dirname(MANIFEST_PATH));
    await fs.writeFile(MANIFEST_PATH, '{}\n', 'utf8');
    console.log('[fetch-cms-images] no images found — empty manifest written');
    return;
  }

  await ensureDir(OUT_DIR);
  await ensureDir(IMG_CACHE_DIR);
  await ensureDir(path.dirname(MANIFEST_PATH));

  const manifest = {};
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const relPath of relPaths) {
    const hash = sha256(relPath);
    try {
      const entry = await processOne(relPath);
      manifest[hash] = entry;
      processed += 1;
      if (processed % 5 === 0 || processed === relPaths.length) {
        console.log(`[fetch-cms-images] processed ${processed}/${relPaths.length}`);
      }
    } catch (err) {
      errors += 1;
      console.warn(`[fetch-cms-images] SKIP ${relPath}: ${err.message}`);
      skipped += 1;
    }
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(
    `[fetch-cms-images] done: processed ${processed} images, skipped ${skipped}, errors ${errors}`,
  );
  console.log(`[fetch-cms-images] manifest → ${MANIFEST_PATH}`);
  if (errors > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error('[fetch-cms-images] fatal:', e);
  process.exit(1);
});
