# Phase 6 audit — 40816cc

**Date:** 2026-05-26
**Branch:** `feat/astro-migration`
**HEAD SHA:** `40816cc`
**Audit method:** Local `astro preview` on `http://localhost:4322/`

## Lighthouse — Mobile (375 px)

| Route | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|
| `/search/` (Pagefind UI live) | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |

## axe-core AA — Mobile

| Route | Violations |
|---|---:|
| `/search/` | **0** ✅ |

## Pagefind index

```
ls dist/pagefind/
fragment  index  pagefind-component-ui.css  pagefind-component-ui.js
pagefind-entry.json  pagefind-highlight.js  pagefind-modular-ui.css
pagefind-modular-ui.js  pagefind-ui.css  pagefind-ui.js  pagefind-worker.js
pagefind.en_3fa240f040.pf_meta  pagefind.js  wasm.en.pagefind  wasm.unknown.pagefind
```

- **Indexed:** 45 pages, 2,766 words
- **Build chain:** `astro build && fetch-cms-images && astro build && pnpm pagefind`

## no-legacy guard

`pnpm smoke:no-legacy` → `✓ no legacy stack refs in astro/src/`

Patterns checked: `GatedPage`, `vuex-persistedstate`, `vue-gtag`, `fuse.js`, `thumbor`, `@nuxt`, `@vue/`, `vuetify`, `image.icjia.cloud`. Zero non-comment matches in `astro/src/` or `astro/scripts/`.

## Build verification

- `pnpm exec astro check`: 0 errors, 0 warnings, 0 hints
- `pnpm build` (full 2-pass + pagefind): succeeds
- `dist/` total size: 4.8 MB

## `?q=` deep-link

Implementation: page-load handler reads `?q=` URL param, finds the Pagefind UI text input, sets `.value`, dispatches an `input` event with `bubbles: true` after a 100ms delay (lets the IIFE-loaded Pagefind UI bind its listeners first).

CRITICAL anti-pattern avoided (v6): used `<script is:inline src="/pagefind/pagefind-ui.js">` rather than dynamic `import()` — Pagefind UI registers `window.PagefindUI` as a side-effect of the IIFE bundle.

## Components shipped this phase (4)

| SHA | Subject |
|---|---|
| `59ef1c8` | docs(plan): Phase 6 plan |
| `ab6a64e` | install Pagefind + data-pagefind-body on `<main>` |
| `94e39c8` | build chain appends Pagefind index step |
| `0c72304` | /search/ — Pagefind UI with ?q= deep-link |
| `40816cc` | smoke:no-legacy guard — Phase 6 cleanup audit |

## Predicted vs actual

| Metric | Predicted | Actual | Discrepancy |
|---|---:|---:|---|
| Mobile Perf `/search/` | ≥ 98 | **100** | exceeded ✅ |
| Mobile A11y `/search/` | 100 | **100** | as predicted ✅ |
| axe-core AA `/search/` | 0 | **0** | as predicted ✅ |
| Pagefind indexed pages | ~45 | **45** | exact ✅ |
| Legacy refs in astro/src/ | 0 | **0** | ✅ |

## Exit checklist

- [x] Pagefind installed + `pnpm pagefind` runs as last build step
- [x] `data-pagefind-body` on `<main>`
- [x] `/search/` shows Pagefind UI, returns real Strapi-content results
- [x] `?q=` deep-link works (input event dispatched after IIFE loads)
- [x] `smoke:no-legacy` passes (no legacy stack refs)
- [x] Mobile Perf ≥ 98, A11y 100, BP/SEO 100 on `/search/`
- [x] axe AA 0 on `/search/`
- [x] `docs/perf/phase6-<sha>.md` committed

## Next: Phase 7 — audit + cutover

Phase 7 is the FINAL phase. Includes:
- `csp-hashes.mjs` real implementation (sweep `dist/**/*.html` for inline scripts, hash sha256, paste-ready netlify.toml CSP snippet)
- `build-og-image.mjs` (Sharp 1200×630 PNG with `font-family="sans-serif"` only)
- Final CSS subsetting / inlining for absolute Perf push (may not be needed — already at 98-100)
- `@astrojs/sitemap` exact-suffix regex filter verification
- **Full viewcap pixel-perfect sweep** — every route, every breakpoint, every interactive state
- Phase 7 polish items collected so far:
  - Chart Y-axis `beginAtZero: true`
  - Home 2-column desktop layout (body + chart side-by-side)
  - "List of Partners »" CSS `text-transform: uppercase`
  - Legacy responsive nav breakpoint analysis at 960-1280px (carried from Phase 2)
- **PAUSE for explicit user authorization before the cutover commit** (design spec §10 hard rule)
- Then atomic cutover: tag `v1-final` → delete root legacy → `mv astro/* .` → flip netlify.toml → tag `v3.0.0`
- **PAUSE for explicit user authorization before merging to `main`** (design spec §10)

## Migration summary at end of Phase 6 (pre-cutover)

| | Phase 0 (legacy) | After Phase 6 (Astro) |
|---|---:|---:|
| Mobile Perf | 55–61 | **98–100** (gain +37–45) |
| Mobile A11y | 100 | 100 |
| Mobile BP | 100 | 100 |
| Mobile SEO | 92–100 | 100 (canonical present everywhere) |
| axe-core AA | 0 | 0 |
| Routes | n/a | 45 emitted (home + 14 logical + dynamic) |
| Legacy stack refs | n/a | 0 in astro/src/ |
| Strapi cache | n/a | 4 entities cached |
| Image self-hosting | Thumbor + legacy | Sharp pipeline, 3 manifested images |
| Search | Fuse.js | Pagefind (2,766 words indexed) |
| CSS bundle | n/a | 85 KB |

The migration's value proposition (Phase 0 baseline gap closed) is fully validated.
