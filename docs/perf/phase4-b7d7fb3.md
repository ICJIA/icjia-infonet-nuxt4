# Phase 4 audit — b7d7fb3

**Date:** 2026-05-26
**Branch:** `feat/astro-migration`
**HEAD SHA:** `b7d7fb3`
**Audit method:** Local `astro preview` on `http://localhost:4322/`

## Lighthouse — Mobile (375 px) — ALL ROUTES

| Route | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|
| `/` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |
| `/news/` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |
| `/news/sf-25-info-net-domestic-violence-data-highlights/` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |
| `/contact/` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |
| `/faqs/` | **100** ✅ | **100** ✅ | **100** ✅ | **100** ✅ |

**Headline:** 5/5 audited routes hit a perfect mobile **100/100/100/100**.

## axe-core AA — Mobile

| Route | Violations |
|---|---:|
| `/` | **0** ✅ |
| `/news/` | **0** ✅ |
| `/news/<slug>/` | **0** ✅ |
| `/contact/` | **0** ✅ |
| `/faqs/` | **0** ✅ |

## Build verification

- `pnpm exec astro check`: 0 errors, 0 warnings, 0 hints
- `pnpm build`: **45 pages** in ~880 ms (vs 2 pages at Phase 1, 2 pages at Phase 3 — Phase 4 expanded to the full route surface)

### Route breakdown (45 pages)

| Source | Count |
|---|---:|
| Static (404, home, contact, debug, search, translate, meetings, data-and-publications, faqs, news listing) | 10 |
| `news/[slug]` Strapi posts | 22 |
| `tabs/[...slug]` Strapi tabs | 6 |
| `[...slug]` Strapi pages (after `reservedSlugs` filter including new `'index'`) | 7 |

Total ≈ 45 (rounded down by 1 for collisions / filtered slugs).

## Four audit-driven fixes shipped this phase (commit `b7d7fb3`)

### 1. `siteConfig.reservedSlugs` — added `'index'`

Strapi `pages` collection contains a slug `index` (used as the home-page body content storage). Without the filter, the `[...slug]` catch-all generated `/index/index.html` — redundant since `pages/index.astro` is the real home. Adding `'index'` to `reservedSlugs` drops that redundant route (45 pages from 46).

### 2. Removed `@mdi/font/css/materialdesignicons.css` from `global.css`

The MDI font CSS shipped **88 KiB of unused CSS** because every icon in `AppNav` / `AppSidebar` / `AppFooter` / `SimpleCard` uses inline SVG, not `.mdi-*` font-class hooks.

**Before:** render-blocking 1,650 ms, mobile Perf 92.
**After:** render-blocking 300 ms, mobile Perf 100.

The import is left as a commented `@import` so a future phase can re-introduce it (only if/when font-class hooks are actually needed). This matches the v6 checklist's preference for inline SVG over CDN icon fonts.

### 3. `SimpleCard.astro` — `<h3>` → `<h2>`

Listings render `<h1>page title</h1>` plus a list of cards. Cards need `<h2>` not `<h3>` to keep heading order sequential.

**Before:** `/news/` Lighthouse A11y 98, `heading-order` violation on `div > a > article > h3`.
**After:** A11y 100, no violations.

### 4. `BaseLayout.astro` — `<main>` `min-height: 70vh`

Short pages had a visible AppFooter above the fold. When below-fold markdown images loaded, the document grew and the footer slid down — a Cumulative Layout Shift of 0.17 on news detail.

**Fix:** reserve `min-height: 70vh` on `<main>` so the page is always at least viewport-height tall. AppFooter sits below the fold initially; image loads don't shift it.

**Before:** `/news/<slug>/` Perf 85, CLS 0.17.
**After:** Perf 100, CLS 0.00.

## viewcap pixel-perfect-vs-legacy

**Status:** captured for home (mobile + desktop) in Phase 2 audit. Phase 4 adds real content to home + news/<slug>/ but does not yet add interactive widgets (HomeSlider, chart, FeatureBoxes). Phase 5b ships those, at which point a comprehensive viewcap pass on home + listings + details is the right inflection point.

**Known viewcap differences vs legacy** (carried from Phase 2 + new):
1. Legacy responsive nav at 1072 px viewport collapses About/Resources into ⋮; Astro shows them inline (need responsive breakpoint adjustment in Phase 5b or 7).
2. Home page in legacy includes a Vuetify chart "Domestic and Sexual Violence Victims Who Received Services in Illinois, 2018-2024" — Phase 5b ports the chart.
3. News listing in legacy shows `SplashNews` for the latest post + `InfoCard` for the rest; Astro shows uniform `SimpleCard` placeholders (Phase 5a replaces).

## Predicted vs actual

| Metric | Predicted | Actual | Discrepancy |
|---|---:|---:|---|
| Mobile Perf | ≥ 98 | **100 on all 5** | exceeded ✅ |
| Mobile A11y | 100 | **100 on all 5** | as predicted ✅ |
| Mobile BP | 100 | **100 on all 5** | as predicted ✅ |
| Mobile SEO | 100 | **100 on all 5** | as predicted (canonical present closed the 92 gap from Phase 0) ✅ |
| axe-core AA | 0 | **0 on all 5** | as predicted ✅ |
| Total routes | 14 (or near) | **45** (catch-alls expanded to 22 news + 6 tabs + 7 pages + 10 statics) | scope as planned ✅ |
| Audit-driven fixes | 0–2 expected | **4** | Phase 4 surfaced more issues than Phase 1 or 2 — typical for a phase that lands actual content |

## Commits shipped this phase (11 implementation + 1 plan-doc)

| SHA | Subject |
|---|---|
| `9897fc2` | docs(plan): Phase 4 plan |
| `b90da77` | SimpleCard.astro placeholder |
| `a443538` | static page ports — translate, contact, debug, search shell |
| `9931b04` | /faqs/ listing (135 entries) |
| `0c1122d` | /news/ listing (22 posts) |
| `e35b86c` | /data-and-publications/ listing |
| `63e1b10` | /meetings/ placeholder |
| `06730b3` | news/[slug] — 22 dynamic detail routes |
| `d595ad4` | [...slug] — Strapi pages catch-all |
| `19d6fd6` | tabs/[...slug] catch-all |
| `bb58164` | home — real content (badge, INFONET, body, partners link) |
| `b7d7fb3` | **fix: 4 audit-driven fixes (reservedSlugs+, mdi-font-out, SimpleCard h2, main min-height)** |

## Exit checklist

- [x] All 14 logical routes available (45 emitted pages after catch-all expansion)
- [x] Mobile Lighthouse 100/100/100/100 on 5 representative routes
- [x] axe-core AA = 0 on 5 representative routes
- [x] Phase 1/2/3 not regressed
- [x] `pnpm build` succeeds; 0 type errors; 0 unused CSS warnings
- [x] `docs/perf/phase4-<sha>.md` committed
- [ ] viewcap pixel-perfect-vs-legacy pass deferred to Phase 5b/7 (when interactive widgets and real images land)

## Lessons appended to v6 checklist (to be added)

1. **`@mdi/font` CSS is render-blocking dead weight when icons are inline SVG.** Drop it from global.css unless `.mdi-*` font-class hooks are actually used. ~88 KiB CSS savings + ~1.3 s render-blocking reduction.

2. **Listings need `<h2>` for cards under the page `<h1>`.** Lighthouse `heading-order` audits sequence; jumping from h1 to h3 is a defect.

3. **Short pages cause footer CLS unless `<main>` reserves min-height.** `min-height: 70vh` on `<main>` (or equivalent) ensures the footer sits below the fold during initial paint, preventing visible shifts when below-fold images load asynchronously.

4. **Strapi `pages` may include an `index` slug.** Filter via `reservedSlugs` to avoid redundant `/index/` route generation alongside the real home.

## Next: Phase 5a — Image pipeline + card primitives

Phase 5a replaces SimpleCard with real cards (`PostedMeta`, `LastUpdated`, `SplashNews`, `InfoCard`, `EventCard`) + wires `fetch-cms-images.mjs` Sharp pipeline + `CmsImage.astro` responsive `<img srcset sizes>`. Once Phase 5a ships, Strapi images render through Sharp (NO Thumbor at runtime — Hard Rule #2) and the news listing uses proper card components.
