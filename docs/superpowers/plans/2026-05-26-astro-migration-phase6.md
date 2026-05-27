# Astro Migration — Phase 6: Pagefind Search + Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** `/search/` works with Pagefind. Build chain appends `pagefind --site dist`. Index Strapi `posts`, `pages`, `faqs`, `tabs`. Zero legacy stack imports remain in `astro/src/`.

**Architecture:**
- Add `pagefind` dev dep
- `<main data-pagefind-body>` so Pagefind indexes the body but not nav/footer
- Per-page `data-pagefind-meta` for title/date filters
- Update build chain: `astro build && fetch-cms-images && astro build && pagefind --site dist`
- `/search/` route loads Pagefind UI via dynamic `<script src>` (IIFE — NOT ESM; v6 anti-pattern)
- `?q=` deep-link reads URL param on mount, dispatches input event into Pagefind UI

**Companion docs:**
- IFVCC reference Phase 6 plan + Pagefind component
- v6 checklist anti-pattern: "Setting Pagefind UI via dynamic `import()`"
- v6 anti-pattern: "Forgetting `data-pagefind-body` on `<main>`"

**Exit criteria:**
- `cd astro && pnpm build` succeeds with Pagefind index emitted under `dist/pagefind/`
- `/search/` renders Pagefind UI; typing returns real results from Strapi content
- `?q=infonet` deep-link auto-fills + auto-searches
- Top-5 search results match legacy Fuse.js results on 3 queries (best-effort verification)
- `grep -rn -E "GatedPage|vuex-persistedstate|vue-gtag|fuse\.js|thumbor|@nuxt|@vue|vuetify" astro/src/` returns ONLY comments
- Mobile Lighthouse on `/search/`: Perf ≥ 98, A11y = 100, axe AA = 0

**Estimated tasks:** 5 tasks single wave. Execution ~45 min.

---

## Required reading

```bash
# IFVCC reference
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/pages/search.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/package.json | grep -E "pagefind|build"

# Current /search/ shell
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/src/pages/search.astro

# Current BaseLayout to find where to add data-pagefind-body
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/src/layouts/BaseLayout.astro

# Build chain
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/package.json | head -20
```

## Tasks

### Task 1: Install Pagefind + add `data-pagefind-body`

```bash
cd astro && pnpm add -D pagefind
```

Edit `astro/src/layouts/BaseLayout.astro`:
- Add `data-pagefind-body` to the `<main id="main-content">` element

Per-page meta (optional but useful for filters): pass title/date through `BaseLayout` props OR add `<head>` meta tags in each page consuming. Skip for Phase 6 if it adds complexity; can layer later.

Commit:
```
feat(astro): install Pagefind + data-pagefind-body on <main>
```

### Task 2: Update build chain

`astro/package.json` scripts:
```json
"build": "astro build && node scripts/fetch-cms-images.mjs && astro build && pnpm pagefind",
"pagefind": "pagefind --site dist",
"build:fast": "astro build"
```

The `pnpm pagefind` step runs AFTER the second astro build, creating `dist/pagefind/` with the search index + UI scripts.

Verify:
```bash
cd astro && pnpm build
ls dist/pagefind/
# Expected: pagefind.js, pagefind-ui.js, pagefind-ui.css, *.pf_*, etc.
```

Commit:
```
feat(astro): build chain appends Pagefind index step
```

### Task 3: Real `/search/` page with Pagefind UI

Replace `astro/src/pages/search.astro` content:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
---
<BaseLayout title="Search" breadcrumbTitle="Search">
  <h1>Search</h1>
  <div id="pagefind-ui"></div>
  <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
  <script is:inline src="/pagefind/pagefind-ui.js"></script>
  <script is:inline>
    window.addEventListener('DOMContentLoaded', () => {
      // Pagefind UI registers window.PagefindUI as a side-effect (IIFE pattern).
      // Do NOT import() it as an ES module — v6 anti-pattern.
      if (typeof window.PagefindUI === 'function') {
        const ui = new window.PagefindUI({
          element: '#pagefind-ui',
          showImages: false,
          showSubResults: true,
          resetStyles: false,
        });
        // ?q= deep-link
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) {
          setTimeout(() => {
            const input = document.querySelector('#pagefind-ui input[type="text"]');
            if (input instanceof HTMLInputElement) {
              input.value = q;
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 100);
        }
      }
    });
  </script>
</BaseLayout>
```

CRITICAL:
- `is:inline` on both scripts (the UI script is IIFE; dynamic import() doesn't work).
- Don't use `<script type="module">` for Pagefind UI.
- `setTimeout 100ms` lets the UI register its event listeners before we dispatch the input event for `?q=`.

Commit:
```
feat(astro): /search/ — Pagefind UI with ?q= deep-link
```

### Task 4: Cleanup audit + remove any legacy refs

Run:
```bash
grep -rn -E "GatedPage|vuex-persistedstate|vue-gtag|fuse\.js|thumbor|@nuxt|@vue/|vuetify|image\.icjia\.cloud" astro/src/ astro/scripts/
```

Expected: zero non-comment matches. If any non-comment matches appear:
- `@nuxt/*` imports anywhere in `astro/src/` = port to Astro-native or remove
- `vuetify` imports = same
- `fuse.js` references = should be replaced by Pagefind UI now
- `image.icjia.cloud` URLs = manifest miss; investigate the source URL

Fix any leftover issues (likely none — the implementer subagents have been disciplined).

Add a smoke test script:
```bash
# astro/scripts/smoke-no-legacy.mjs
#!/usr/bin/env node
import { spawnSync } from 'child_process';
const r = spawnSync('grep', ['-rn', '-E', 'GatedPage|vuex-persistedstate|vue-gtag|fuse\\.js|thumbor|@nuxt|@vue/|vuetify|image\\.icjia\\.cloud', 'src/', 'scripts/'], { encoding: 'utf-8' });
const out = (r.stdout || '').split('\n').filter(l => l && !l.match(/^\s*\/\//) && !l.match(/^\s*\*/) && !l.match(/^\s*<!--/));
if (out.length > 0) {
  console.error('LEGACY REFS FOUND:');
  out.forEach(l => console.error(' ', l));
  process.exit(1);
}
console.log('✓ no legacy stack refs in astro/src/');
```

Wire into `package.json`: `"smoke:no-legacy": "node scripts/smoke-no-legacy.mjs"`.

Commit:
```
feat(astro): smoke:no-legacy guard — Phase 6 cleanup audit
```

### Task 5: Audit gates + log

Run:
```bash
cd astro && pnpm preview
```

- lightcap mobile audit `/search/` (with `?q=infonet`)
- axecap AA on `/search/`
- Manual verification:
  - `/search/` loads, Pagefind UI renders
  - Type "infonet" → results appear
  - `/search/?q=infonet` deep-link → input pre-fills and searches

Write `docs/perf/phase6-<sha>.md`. Commit + push.

---

## Phase 6 exit checklist

- [x] Pagefind installed + `pnpm pagefind` runs as last build step
- [x] `data-pagefind-body` on `<main>`
- [x] `/search/` shows Pagefind UI, returns results on real Strapi content
- [x] `?q=` deep-link works
- [x] `smoke:no-legacy` passes (no legacy stack refs in astro/src/)
- [x] Mobile Perf ≥ 98 + A11y 100 on `/search/`
- [x] axe AA 0 on `/search/`
- [x] `docs/perf/phase6-<sha>.md` committed

## Next: Phase 7 — audit + cutover

Phase 7 is the final polish + cutover commit:
- `csp-hashes.mjs` real implementation
- `build-og-image.mjs` (Sharp 1200×630 PNG)
- CSS subsetting / inlining for final perf push
- Full viewcap sweep
- Tag `v1-final`
- Atomic cutover commit
- Tag `v3.0.0`

**CONTROLLER PAUSE:** Phase 7 cutover requires explicit user authorization per the design spec §10.
