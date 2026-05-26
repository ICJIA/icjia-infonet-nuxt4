#!/usr/bin/env node
// astro/scripts/csp-hashes.mjs
//
// Walks dist/**/*.html, extracts every inline <script> body (skipping
// `src=...`, `type="application/ld+json"`, `type="application/json"`),
// SHA-256-hashes each unique block, prints a ready-to-paste snippet
// of `'sha256-X' 'sha256-Y' ...` for netlify.toml's CSP script-src.
//
// Workflow:
//   pnpm build && pnpm csp-hashes
//   # paste output into netlify.toml script-src directive
//   git add netlify.toml && git commit && git push
//
// Run after EVERY change to any inline <script> (URL normalizer in
// BaseLayout, search page Pagefind loader, etc.) — the hash changes
// with even a whitespace difference.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DIST_DIR = path.resolve('dist');

// Match <script ...>...</script>. We DON'T match self-closing or src=
// scripts. We capture (attrs, body) so the post-process can decide
// based on attributes whether to skip.
const SCRIPT_RX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function shouldSkip(attrs) {
  // Skip external scripts (src=...)
  if (/\bsrc\s*=/i.test(attrs)) return true;
  // Skip JSON-LD (data blocks, not executable script — modern browsers
  // don't enforce script-src on these).
  if (/type\s*=\s*['"]application\/ld\+json['"]/i.test(attrs)) return true;
  // Skip JSON data blocks (same reason).
  if (/type\s*=\s*['"]application\/json['"]/i.test(attrs)) return true;
  return false;
}

function sha256base64(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('base64');
}

async function walkHtmlFiles(dir) {
  const out = [];
  async function recurse(d) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        // Skip pagefind/ — Pagefind's UI bundle is loaded via <script src>,
        // not inline. Its internal HTML chunks (if any) don't have inline
        // scripts we need to hash for our pages.
        if (e.name === 'pagefind') continue;
        await recurse(full);
      } else if (e.isFile() && full.endsWith('.html')) {
        out.push(full);
      }
    }
  }
  await recurse(dir);
  return out;
}

async function main() {
  console.log('[csp-hashes] scanning dist/**/*.html...');

  let files;
  try {
    files = await walkHtmlFiles(DIST_DIR);
  } catch (err) {
    console.error(
      '[csp-hashes] ERROR: dist/ not found. Run `pnpm build` first.',
    );
    process.exit(1);
  }

  console.log(`[csp-hashes] found ${files.length} HTML files`);

  const seen = new Map(); // hash → { count, sample: first occurrence file }
  let totalScripts = 0;

  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    SCRIPT_RX.lastIndex = 0;
    let m;
    while ((m = SCRIPT_RX.exec(text)) !== null) {
      const [, attrs, body] = m;
      if (shouldSkip(attrs)) continue;
      if (!body.trim()) continue; // skip empty script blocks

      totalScripts += 1;
      const hash = sha256base64(body);
      if (!seen.has(hash)) {
        seen.set(hash, { count: 1, sample: path.relative(DIST_DIR, file) });
      } else {
        seen.get(hash).count += 1;
      }
    }
  }

  const uniqueHashes = [...seen.keys()].sort();

  console.log(
    `\n✓ Found ${totalScripts} inline scripts (${uniqueHashes.length} unique hashes).\n`,
  );
  console.log(
    'Paste this into netlify.toml [[headers]] Content-Security-Policy:\n',
  );

  const hashList = uniqueHashes.map((h) => `'sha256-${h}'`).join(' ');
  console.log(`script-src 'self' ${hashList}`);

  if (uniqueHashes.length > 0) {
    console.log('\n--- Hash details ---');
    for (const [hash, info] of seen.entries()) {
      console.log(
        `  sha256-${hash}  (${info.count}x, first: ${info.sample})`,
      );
    }
  }
}

main().catch((e) => {
  console.error('[csp-hashes] fatal:', e);
  process.exit(1);
});
