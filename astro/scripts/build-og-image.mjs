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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0d4270"/>
  <text x="600" y="280" text-anchor="middle" font-family="sans-serif" font-size="120" font-weight="900" fill="#ffffff">INFONET</text>
  <text x="600" y="360" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="400" fill="#ffffff">Data Collection &amp; Reporting System</text>
  <text x="600" y="420" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="400" fill="#ffffff" opacity="0.85">Illinois&apos; victim service data resource for over 25 years</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();

// Write to public/ so next dev build picks it up
await fs.mkdir('public', { recursive: true });
await fs.writeFile('public/og-image.png', png);
console.log(`✓ public/og-image.png (${png.length} bytes)`);

// Also write to dist/ if it exists (current build)
if (existsSync('dist')) {
  await fs.writeFile('dist/og-image.png', png);
  console.log(`✓ dist/og-image.png (${png.length} bytes)`);
}
