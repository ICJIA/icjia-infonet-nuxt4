# Phase 5a audit — 21e176e

**Date:** 2026-05-26
**Branch:** `feat/astro-migration`
**HEAD SHA:** `21e176e`
**Audit method:** Local `astro preview` on `http://localhost:4322/`

## Lighthouse — Mobile (375 px)

| Route | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|
| `/` | **99** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |
| `/news/` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |
| `/news/sf-25.../` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |

Target: Perf ≥ 98, A11y/BP/SEO = 100. **All gates pass.**

## axe-core AA — Mobile

All 3 routes: **0 violations** ✅

## Sharp pipeline output

- 3 unique Strapi image URLs found in `.cache/strapi/*.json` (only inline body images on news posts; no post has a `splash.data` field populated)
- 3 manifest entries
- 320 + 640 width variants per image (originals are ~750–850 px wide, so 960/1280 variants skipped per Sharp "no enlarge" rule)
- `/public/_cms-img/` populated; manifest at `src/lib/cms-image-manifest.json`
- ZERO `image.icjia.cloud` / `thumbor` URLs in `dist/` ✅ (Hard Rule #2 satisfied)

## CSS bundle shrinking (audit-driven fix)

**Before font trim:** 112 KB CSS bundle, mobile home Perf 97 (one below gate).

**After font trim** (`21e176e`): 85 KB CSS bundle, mobile home Perf 99.

Dropped:
- Lato 100, 300 (thin/light) — unused
- Raleway 100, 300 — unused (AppNav uses 900; h1-h6 use 700/900)
- Roboto 100 — unused (dropdown items use 400/700)

Each fontsource weight ships ~5–10 KB of CSS. Five removed weights = ~27 KB recovered.

## Components shipped this phase

| Component | Purpose | Used by |
|---|---|---|
| `CmsImage.astro` | Responsive `<img srcset sizes>` w/ manifest lookup | `SplashNews`, `InfoCard`, future `EventCard`, markdown body |
| `PostedMeta.astro` | Author + post date display | `news/[slug].astro` |
| `LastUpdated.astro` | "Updated: <date>" footer for articles | `news/[slug].astro` (when `updatedAt > createdAt`) |
| `SplashNews.astro` | Featured/latest post card | `news/index.astro` (first post) |
| `InfoCard.astro` | Secondary news card | `news/index.astro` (posts 2+) |
| `EventCard.astro` | Date-prominent event card | future use (no events data source yet) |

**SimpleCard** is no longer used on `/news/`. It remains imported by other Phase 4 routes (`data-and-publications`, `faqs` if SimpleCard not native-details, `meetings` empty state). Phase 5b or later can phase out SimpleCard fully.

## 2-pass build chain

```json
"build": "astro build && node scripts/fetch-cms-images.mjs && astro build"
```

Verified: full `pnpm build` completes successfully. First pass seeds `.cache/strapi/`; fetch-cms-images populates `/public/_cms-img/` and manifest; second pass picks up manifest for CmsImage lookups and markdown image rewrites.

## Splash images absent (data finding)

All 22 Strapi posts currently have `attributes.splash.data === null`. SplashNews / InfoCard render WITHOUT images (text-only graceful fallback). When editors populate splash images in Strapi, the manifest pipeline + CmsImage pick them up automatically on the next build.

## Notable graceful degradations

1. **EventCard** has no data source — Infonet has no events/meetings entity in Strapi. Shipped for component parity with IFVCC reference; wires up only when meetings/events data lands.
2. **Splash images** — see above; cards render text-only.
3. **Inline body images** — Strapi body markdown references 3 images, all manifest-managed via Sharp. No `image.icjia.cloud` reach at runtime.

## Predicted vs actual

| Metric | Predicted | Actual | Discrepancy |
|---|---:|---:|---|
| Mobile Perf `/` | ≥ 98 | **99** (after font trim) | one-tick margin; 97 before trim → 99 after |
| Mobile Perf `/news/` | ≥ 98 | **100** | exceeded ✅ |
| Mobile Perf `/news/<slug>/` | ≥ 98 | **100** | exceeded ✅ |
| axe-core AA | 0 | **0 × 3 routes** | as predicted ✅ |
| `image.icjia.cloud` in dist/ | 0 | **0** | Hard Rule #2 ✅ |

## Commits shipped this phase (8 implementation + 1 plan)

| SHA | Subject |
|---|---|
| `591c975` | docs(plan): Phase 5a plan |
| `2e6b4ed` | fetch-cms-images.mjs — Sharp pipeline self-hosts Strapi images |
| `ab03e4e` | CmsImage.astro — responsive srcset with manifest lookup + raw fallback |
| `8bf2774` | markdown.ts wires real manifest image rewrite |
| `d35b490` | PostedMeta + LastUpdated components |
| `1108016` | SplashNews + InfoCard — featured + secondary news cards |
| `a5dc7ba` | EventCard + wire SplashNews/InfoCard into /news/ listing |
| `d096ca0` | 2-pass build chain — fetch-cms-images between two astro builds |
| `21e176e` | **fix: trim font weights — drop Lato 100/300, Raleway 100/300, Roboto 100** (audit-driven) |

## Lessons appended to v6 checklist (to be added)

1. **CSS bundle font-weight tax.** Each `@fontsource/<family>/<weight>.css` import ships ~5–10 KB of CSS into the bundle. Default-installing all 5-9 weights of each family is ~30-50 KB of unused CSS for sites that only use 3-4 weights in the actual UI. After Phase 1's @theme calibration is locked, prune unused weights — Lighthouse mobile Perf can rebound 2-4 points per ~20 KB CSS reduction.

2. **Astro bundles all imported CSS into ONE shared route bundle.** Even components imported only by `/news/` contribute their `<style>` to the same `_astro/<hash>.css` linked from `index.html`. To get per-route CSS splitting, use `<link rel="stylesheet">` directly in component frontmatter OR defer non-critical CSS via media-attribute hack.

## Next: Phase 5b — Home interactive components

Phase 5b ships HomeSlider, HomeFeatureBoxes (cycling colors), HomeEvents, HomePosts, EventCalendar, ReadProgress, Toc — all the home-page interactive widgets + detail-page reading-progress / table-of-contents. First phase with formal viewcap pixel-perfect-vs-legacy diff on the FULL home page (currently still Phase 4's static-only version).
