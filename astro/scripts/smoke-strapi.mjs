#!/usr/bin/env node
// Smoke test for Phase 3 content layer.
// Run via: pnpm smoke:strapi
//
// Exercises every entity loader, validates Zod schemas, prints counts.
// Also runs a markdown round-trip assertion.
//
// Uses tsx loader so TS source files can be imported directly — the script
// itself is .mjs so Node won't complain about the shebang, but tsx handles
// the TS imports transparently.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

// Re-exec under tsx if we're running plain node (no tsx loader active).
// tsx sets NODE_OPTIONS or tsx-specific env vars. A simpler check: if
// import.meta.resolve resolves .ts, tsx is active; otherwise re-exec.
const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Import TS modules (tsx loader must be active — see package.json script)
// ---------------------------------------------------------------------------

const { strapiFetch } = await import('../src/lib/strapi.ts');
const {
  QUERY_PAGE_LIST,
  QUERY_POST_LIST,
  QUERY_FAQ_LIST,
  QUERY_TAB_LIST,
} = await import('../src/lib/queries.ts');
const {
  PageListResponseSchema,
  PostListResponseSchema,
  FaqListResponseSchema,
  TabListResponseSchema,
} = await import('../src/lib/schemas.ts');
const { renderMarkdown } = await import('../src/lib/markdown.ts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function section(name) {
  console.log(`\n--- ${name} ---`);
}

// ---------------------------------------------------------------------------
// Entity fetches
// ---------------------------------------------------------------------------

section('pages');
const pagesData = await strapiFetch(QUERY_PAGE_LIST);
const pagesResult = PageListResponseSchema.safeParse(pagesData);
assert(pagesResult.success, `pages Zod parse: ${pagesResult.error?.message ?? ''}`);
const pageCount = pagesResult.success ? pagesResult.data.pages.data.length : 0;
const pagesTotal = pagesResult.success ? (pagesResult.data.pages.meta?.pagination?.total ?? '?') : '?';
console.log(`pages: ${pageCount} entries returned, ${pagesTotal} total in Strapi`);
assert(pageCount > 0, 'pages: at least 1 entry');

section('posts');
const postsData = await strapiFetch(QUERY_POST_LIST);
const postsResult = PostListResponseSchema.safeParse(postsData);
assert(postsResult.success, `posts Zod parse: ${postsResult.error?.message ?? ''}`);
const postCount = postsResult.success ? postsResult.data.posts.data.length : 0;
const postsTotal = postsResult.success ? (postsResult.data.posts.meta?.pagination?.total ?? '?') : '?';
console.log(`posts: ${postCount} entries returned, ${postsTotal} total in Strapi`);
assert(postCount > 0, 'posts: at least 1 entry');

section('faqs');
const faqsData = await strapiFetch(QUERY_FAQ_LIST);
const faqsResult = FaqListResponseSchema.safeParse(faqsData);
assert(faqsResult.success, `faqs Zod parse: ${faqsResult.error?.message ?? ''}`);
const faqCount = faqsResult.success ? faqsResult.data.faqs.data.length : 0;
const faqsTotal = faqsResult.success ? (faqsResult.data.faqs.meta?.pagination?.total ?? '?') : '?';
console.log(`faqs: ${faqCount} entries returned, ${faqsTotal} total in Strapi`);
assert(faqCount > 0, 'faqs: at least 1 entry');

section('tabs');
const tabsData = await strapiFetch(QUERY_TAB_LIST);
const tabsResult = TabListResponseSchema.safeParse(tabsData);
assert(tabsResult.success, `tabs Zod parse: ${tabsResult.error?.message ?? ''}`);
const tabCount = tabsResult.success ? tabsResult.data.tabs.data.length : 0;
const tabsTotal = tabsResult.success ? (tabsResult.data.tabs.meta?.pagination?.total ?? '?') : '?';
console.log(`tabs: ${tabCount} entries returned, ${tabsTotal} total in Strapi`);

// ---------------------------------------------------------------------------
// Cache directory check
// ---------------------------------------------------------------------------

section('.cache/strapi');
const cacheDir = resolve(__dirname, '../.cache/strapi');
const cacheExists = existsSync(cacheDir);
assert(cacheExists, '.cache/strapi directory exists');
if (cacheExists) {
  const files = await readdir(cacheDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  console.log(`.cache/strapi: ${jsonFiles.length} cached JSON files`);
  assert(jsonFiles.length > 0, '.cache/strapi has at least 1 cached file');
}

// ---------------------------------------------------------------------------
// Markdown round-trip
// ---------------------------------------------------------------------------

section('markdown round-trip');
const { html, headings } = renderMarkdown(
  '# Hello\n\n**bold** [link](https://example.com)\n\n![alt](https://infonet.icjia-api.cloud/uploads/test.jpg)',
);
assert(html.includes('<strong>bold</strong>'), 'bold rendered');
assert(html.includes('target="_blank"'), 'external link gets target=_blank');
assert(html.includes('loading="lazy"'), 'img gets loading=lazy');
assert(html.includes('decoding="async"'), 'img gets decoding=async');
assert(headings.length === 1, `headings extracted (got ${headings.length})`);
assert(headings[0]?.id === 'hello', `heading id correct (got "${headings[0]?.id}")`);
assert(headings[0]?.level === 1, `heading level correct (got ${headings[0]?.level})`);

// Internal links should NOT get target=_blank.
const { html: internalHtml } = renderMarkdown('[internal](https://infonet.icjia.illinois.gov/page)');
assert(!internalHtml.includes('target="_blank"'), 'internal link: no target=_blank');

// Null/empty input.
const nullResult = renderMarkdown(null);
assert(nullResult.html === '' && nullResult.headings.length === 0, 'null input returns empty');

console.log('markdown round-trip: PASS');

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n============================');
console.log(`Smoke test: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All assertions passed.');
}
