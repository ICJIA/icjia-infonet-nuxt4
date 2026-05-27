# Phase 0 — Legacy Baseline Audit

**Site:** Infonet
**Legacy URL:** https://infonet.icjia.illinois.gov
**Source stack:** Nuxt 4 + Vue 3 + Vuetify + Strapi + Fuse.js
**Branch / SHA:** `main` @ `d725000`
**Date:** 2026-05-26
**Auditor:** Claude Opus 4.7 via lightcap (Lighthouse) + axecap (axe-core)
**Purpose:** Establish target gap before `feat/astro-migration` scaffold (Phase 1).

---

## Lighthouse — Mobile

| Route | Perf | A11y | BP | SEO | LCP | FCP | CLS | SI |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | **55** | 100 | 100 | 100 | 7.9s | 6.7s | 0.13 | 6.7s |
| `/news/` | **61** | 100 | 100 | 92 | 7.0s | 6.3s | — | 6.3s |
| `/news/<slug>/` | **60** | 100 | 100 | 92 | 7.2s | 6.5s | — | 6.5s |
| `/faqs/` | **60** | 100 | 100 | 92 | 7.4s | 6.5s | — | 6.5s |
| `/contact/` | **61** | 100 | 100 | 92 | 6.8s | 6.2s | — | 6.2s |

**Slug audited for detail page:** `info-net-system-s-survivor-centered-approaches-to-data-collection-are-highlighted-at-the-2025-net-virtual-tech-summit`

## axe-core AA — Mobile

| Route | Violations |
|---|---:|
| `/` | **0** ✅ |
| `/news/` | **0** ✅ |
| `/news/<slug>/` | **0** ✅ |
| `/faqs/` | **0** ✅ |
| `/contact/` | **0** ✅ |

Legacy site is **AA-clean** already. The accessibility work in v2.3.8 (AAA fixes) and v2.3.9 (TOC scroll-spy) compounded to clean state. Migration must preserve this.

---

## Recurring Performance Issues (across all 5 routes)

| Issue | Est. savings | Root cause | How Astro stack eliminates |
|---|---|---|---|
| `render-blocking-insight` | **3.7s – 4.1s** | Google Fonts `<link rel="stylesheet">`, Vuetify CSS, MDI font CSS, FontAwesome CSS all blocking render | `@fontsource/*` self-hosted with `font-display: swap`; Tailwind 4 utility-only; inline SVG icons; no Vuetify |
| `unused-css-rules` | **~95 KiB** | Vuetify ships unused component styles | Tailwind 4 JIT — only used classes shipped |
| `unused-javascript` | **118 – 172 KiB** | Vue runtime + Vuetify components + AOS + Fuse.js bundled even when not needed | Astro `output: 'static'` ships **0 JS** by default; Alpine.js 3 bundled only where used; Pagefind lazy-loaded |
| `font-display-insight` | 50 – 270 ms | Google Fonts not using `display=swap` (or swap arriving via slow stylesheet) | `@fontsource` with explicit `font-display: swap` |
| `bf-cache` | 1 failure | typically Vuetify SPA navigation interfering | Static HTML — bf-cache works |
| LCP 6.8 – 7.9s | — | Render-blocking chain delays paint; LCP element is below the fold of font-blocked render | Eliminate render-blocking → LCP drops to network-bound minimum (target < 2.5s) |

## Recurring SEO Issues

| Issue | Affected routes | Astro fix |
|---|---|---|
| `canonical` missing | All but `/` | `astro-seo` `<canonicalURL>` per page in `BaseLayout.astro` (per v6 §8) |

## Recurring BP Issues

| Issue | Note |
|---|---|
| `valid-source-maps` | Dev-only artifact; doesn't affect users. Astro static build does not ship source maps by default. |

## Home-Specific Issue

`layout-shifts: div#appTop > div.v-application__wrap > div.v-main > main#main…` — CLS 0.13. This is Vuetify's app-shell rendering shifting on mount. Astro static will render layout immediately with no JS hydration → CLS should be 0.00.

---

## Gap to Target

| Metric | Legacy worst | Legacy best | Target | Gap |
|---|---:|---:|---:|---:|
| Mobile Perf | 55 | 61 | **≥ 98** | **+37 to +43** |
| Mobile A11y | 100 | 100 | **= 100** | 0 ✅ |
| Mobile BP | 100 | 100 | **= 100** | 0 (modulo source maps) |
| Mobile SEO | 92 | 100 | **= 100** | +8 on listing/detail/contact |
| axe-core AA | 0 | 0 | **0** | 0 ✅ |

**Predicted post-migration Perf:** 98 – 100 on every route. The combined elimination of Vue runtime + Vuetify CSS + render-blocking external fonts gives back ~4s of TTI per route. The math: 4s of TTI savings on a 7s baseline maps to roughly +40 Perf points on the mobile rubric (FCP/LCP/SI/TBT all improve in lockstep).

**Risk areas:**
- Home page LCP. The legacy home likely uses a hero image / slider. Phase 5b's `HomeSlider` Alpine port must avoid `<img>` for the hero (use CSS `background-image` per IFVCC's v6 lesson — matches Vuetify v-img behavior and avoids LCP regression).
- News listing page bucketing (v6 §5b lesson on "Listing-page bucketing"). 14 routes is small; should not strain Pagefind.

---

## What This Justifies

1. The migration is genuinely needed for performance — the legacy site cannot reach 98 mobile Perf within its current stack.
2. The migration target (Perf ≥ 98) is realistic — every reference migration (i2i, sfs, dvfr, r3, ifvcc) hit it.
3. The a11y baseline is already at the target — migration must not regress from 100/0 violations.
4. SEO needs a small canonical-URL fix on listing/detail templates — folds into Phase 1 BaseLayout.

---

## Next Step

Proceed to Phase 1 (Scaffold) on `feat/astro-migration` branch in `astro/` subfolder.
