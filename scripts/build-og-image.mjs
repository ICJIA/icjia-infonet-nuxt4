#!/usr/bin/env node
// astro/scripts/build-og-image.mjs
// Generate 1200×630 PNG for OG / Twitter card. SVG → PNG via Sharp.
//
// CRITICAL: font-family="sans-serif" ONLY. NEVER named fonts —
// librsvg silently fails to render them on Linux CI (v6 Hard Rule #5).
// Dual-write: public/og-image.png (for next dev build) AND
// dist/og-image.png (for current production build).

import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';

// Read SVG source from public/og-image.svg so designers can edit the artwork
// without touching this script. (Previously inlined here.)
const svg = await fs.readFile('public/og-image.svg', 'utf8');

const png = await sharp(Buffer.from(svg), { density: 96 })
  .resize(1200, 630, { fit: 'cover' })
  .png({ compressionLevel: 9 })
  .toBuffer();

// Write to public/ so next dev build picks it up
await fs.mkdir('public', { recursive: true });
await fs.writeFile('public/og-image.png', png);
console.log(`✓ public/og-image.png (${png.length} bytes)`);

// Also write to dist/ if it exists (current build)
if (existsSync('dist')) {
  await fs.writeFile('dist/og-image.png', png);
  console.log(`✓ dist/og-image.png (${png.length} bytes)`);
}
