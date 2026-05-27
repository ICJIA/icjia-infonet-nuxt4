# Changelog

All notable changes to the ICJIA InfoNet website are documented in this file.

## [3.2.8] - 2026-05-27 — Docs: latin-subset CSS win + mobile perf stopping criteria

Documented two related lessons in `docs/astro-conversion-checklist-v6.2.md` under the Infonet post-cutover section, both surfaced during the 3.2.5–3.2.7 perf-tuning cycle:

1. **`@fontsource` subset-only imports cut the render-blocking CSS bundle in half.** Switching nine `@import '@fontsource/<fam>/<weight>.css'` → `latin-<weight>.css` dropped `BaseLayout.css` 90.7 KB → 34.5 KB (-62%). The win is desktop-shaped: home Perf went 96 → 100 on desktop (CSS download was the binding constraint at low-latency desktop bandwidth) but stayed 97-98 on mobile (RTT-bound, not byte-bound). Per-file shrinkage table included (Lato -71%, Raleway -87%, Roboto -95%). Compatibility note for non-English-content authors.
2. **Diminishing returns at mobile 97-98 — stop before critical-CSS extraction.** When home shows FCP ~1.6s, LCP ~2.1s, CLS 0, TBT 0ms with the only failures being `render-blocking-insight` + `unused-javascript`, the remaining gap is the slow-4G RTT floor (~750 ms simulated), not bytes or JS. Three reasons critical-CSS extraction shouldn't be the next move: it's fragile (drifts on any above-fold component change), Alpine core is irreducible, and 1-2 points isn't worth the breakage risk. Includes a 5-item **stopping criteria checklist** (Perf ≥ 97, LCP < 2.5s, CLS < 0.1, TBT < 200ms, A11y/BP/SEO 100) — if all checked, ship and stop.

No code changes in this release — docs-only.

## [3.2.7] - 2026-05-27 — Perf: switch @fontsource imports to `latin-` subset only

Home page mobile audit was Perf 98 with 430 ms of "Render-blocking resources" savings available — the dominant blocker was `BaseLayout.css` at **90.7 KB** (uncompressed). Audited the bundle: 54+ `@font-face` declarations across nine `@fontsource/<family>/<weight>.css` imports, each shipping six to seven Unicode subsets (latin, latin-ext, cyrillic, cyrillic-ext, greek, greek-ext, vietnamese). Infonet content is English-only and `latin` already covers em-dashes, smart quotes, the euro sign, and the trademark glyph (U+2000-206F is in the latin subset's unicode-range), so the other five subsets are pure dead weight.

Swapped all nine imports in `src/styles/global.css` from `@import '@fontsource/<family>/<weight>.css'` → `@import '@fontsource/<family>/latin-<weight>.css'`. Per-file shrinkage: Lato -71%, Raleway -87%, Roboto -95% (Roboto in particular ships a huge cyrillic+greek+vietnamese surface).

**Bundle impact:** `BaseLayout.css` 90.7 KB → **34.5 KB** (-62%). All three preload hashes for the woff2 files are byte-identical to the pre-change build (Vite content-hashes by file content, not import path), so the preload tags from 3.2.5 still match what the `@font-face` rules request. `@font-face` declarations went from 54+ → 10 (9 latin-only weights + 1 octicons-link from `github-markdown.css`).

**Risk:** if a future CMS author pastes Czech / Polish / Vietnamese / Cyrillic content into Strapi, those characters fall back to the system font for that one glyph. Zero impact on English-only production content. Confirmed all three font-family stacks (Lato, Raleway, Roboto) still resolve in the rebuilt bundle.

## [3.2.6] - 2026-05-27 — Docs: capture preload-first font-CLS lesson; defer size-adjust

Post-3.2.5 re-audit confirmed `/partners/` mobile Perf **95 → 100** with CLS dropped off the failure list site-wide. The planned follow-up (Capsize-tuned `size-adjust`/`ascent-override` fallback `@font-face`) was reviewed and **skipped** — preload alone got CLS into the green band, so size-adjust would yield zero measurable Lighthouse improvement while introducing visual-drift risk on edge cases (long unbroken words, italic runs, narrow viewports). Documented the full pattern in `docs/astro-conversion-checklist-v6.2.md` under the "Infonet post-cutover" section: the `?url`-import preload technique, why it dedupes with the `@fontsource` `@import` chain (Vite content-hashes by file content), the "highest-impact 2–3 weights only" heuristic to avoid stealing bandwidth from CSS/HTML, and the explicit rule **"preload first → measure → size-adjust fallback only if CLS still > 0.1"** so the next migration doesn't reach for the heavier fix prematurely.

No code changes in this release — docs-only.

## [3.2.5] - 2026-05-27 — Perf: preload critical woff2 to cut font-swap CLS

The `/partners/` mobile audit (Perf 95, all other categories 100) showed CLS=0.126 driven entirely by late-loading web fonts reflowing the body `<p>`. The Lighthouse "Avoid large layout shifts" trace identified Lato 400, Lato 700, and Roboto 400 (and to a lesser degree Roboto 700 + Lato 900) as the four web fonts swapping in well after FCP — the `@fontsource` `@import` chain only resolves the woff2 URLs after `global.css` finishes parsing, so the browser cannot start fetching them in parallel with CSS.

Added three `<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous">` tags to `src/layouts/BaseLayout.astro` for the highest-impact weights: Lato 400, Lato 700, Roboto 400. URLs are resolved via Vite `?url` imports of the @fontsource woff2 files, so the hashed `/_astro/...` path emitted in the preload tag is byte-identical to the URL the `@font-face` rule later requests — the browser reuses the preloaded byte stream rather than fetching twice. Verified by diffing the rendered HTML against the hashes Lighthouse reported as offenders.

Expected impact: ~3 perf points back on text-heavy pages (CLS should drop from 0.126 → ~0.02–0.04 because the swap now happens before/at FCP, not after). Follow-up `3.2.6` will land the proper `size-adjust` / `ascent-override` fallback `@font-face` pair (Capsize-computed) to eliminate CLS entirely.

## [3.2.4] - 2026-05-27 — Rename checklist file to v6.2

Renamed `docs/astro-conversion-checklist-v6.md` → `docs/astro-conversion-checklist-v6.2.md` (git-rename, history preserved) so the filename signals the post-Infonet increment shipped in 3.2.3. Updated all 18 cross-references in `README.md`, `CHANGELOG.md`, `docs/llm-migration-prompt.md`, `docs/perf/phase1-*.md`, `docs/superpowers/plans/*.md`, `docs/superpowers/specs/*.md`, and inside the checklist itself (title + bookkeeping note + section link). Removed a stale "Nuxt SSG → DVFR" reference line in `llm-migration-prompt.md` that conflicted with the new "Nuxt SSG → Infonet" reference for v6.2.

The v6.0 ancestor (IFVCC era) remains accessible in git history at `7493e3f^:docs/astro-conversion-checklist-v6.md`.

---

## [3.2.3] - 2026-05-27 — Docs: v6.2 increment + flagship pre-flight

Documentation-only release capturing the Infonet post-cutover lessons and adding scale-specific guidance for the upcoming `icjia.illinois.gov` flagship migration (2000+ pages on Vue 2 / Vuetify 2 + Strapi v3).

### `docs/astro-conversion-checklist-v6.2.md` — v6.2 increment

Added a full **"Infonet (2026-05-27) — post-cutover Lighthouse polish (v6.2 increment)"** section under the existing Infonet phase lessons, plus a new top-level **"Flagship (icjia.illinois.gov) — scale-specific guidance"** section. Key additions:

- **Hard rule: Tailwind utility classes for ALL responsive layout (especially flex/grid).** Canonical translation patterns for Vuetify `<v-row><v-col>`, `<v-container>`, `d-flex`/`d-grid` → Tailwind utilities. Mandates `min-[960px]:` arbitrary breakpoint (not default `md:` 768px) to match Vuetify md=960px exactly. viewcap diff at 5 viewport widths (375/768/1024/1280/1920) as the verification gate.
- **`inlineStylesheets: 'always'` text-LCP vs image-LCP trade-off** documented. Text-LCP pages can gain +10 perf; image-LCP pages lose 3-5 on mobile. Default `'auto'` is correct for browse traffic.
- **Two-pass build chain pattern** for any CMS image manifest (Vite resolves imports at bundle time → manifest stub must be committed).
- **Eager + fetchpriority="high" on the first card image** in above-fold listings.
- **YouTube facade pattern** for Best-Practices 100 + zero third-party cookies on initial load.
- **`label-content-name-mismatch` removal of redundant aria-labels** with a table of common offenders (home cards, "All News" buttons, desktop nav title).
- **axe-core `nonBmp` swap** Unicode glyphs (e.g. `▾`) for inline SVG paths with `currentColor` fill.
- **`sr-only-table` off-canvas via `left: -10000px`** to avoid blowing `scrollWidth` on narrow viewports.
- **Chart.js lazy-load via IntersectionObserver** with `rootMargin: '200px'`.
- **MDC component placeholder sentinel pattern** for inline rendering (vs always-appending at the end of an article).
- **Sharp-resampled splash images from Strapi v3 base64 GraphQL fields** (the researchhub `splash` field pattern).
- **Centered page header standard** (`text-align: center; margin-top: 1rem; margin-bottom: 2.5rem`).

### `docs/astro-conversion-checklist-v6.2.md` — flagship guidance section

New top-level section anticipating the 2000+-page flagship migration:

- **Build budget arithmetic** (20-40 min cold) + Netlify free-tier 15-min cap implications + 4 mitigation strategies (tier upgrade, warm cache, incremental Strapi fetch, Sharp concurrency pool).
- **Strapi v3 vs v4 response shape** with code probes for compatibility detection.
- **Listings pagination** via Astro's `paginate()` helper.
- **Sitemap chunking** at `entryLimit: 45000`.
- **`vue-router` route inventory pre-Phase-1** with categorization table (static / dynamic / catch-all / hash-routed / authenticated).
- **Vuex → Alpine `$store`** decision table (what's truly state vs what's actually content).
- **PDF + document URL stability** mirror script pattern.
- **Third-party script CSP audit** template with likely offenders.
- **i18n / Spanish content** Astro config + hreflang emission strategy.
- **Real User Monitoring via Plausible custom events** (web-vitals → onCLS/onINP/onLCP).
- **`dist/` build artifact size** at 2000+ pages (200-400 MB) + Netlify deploy-upload time + CDN propagation considerations.
- **Cutover risk mitigation** (48-72hr preview, SiteImprove crawl, sitemap diff for 301s).
- **Pagefind index size at scale** + pre-warm strategy.
- **Content audit** ("what to NOT migrate") with decision rubric.
- **Print stylesheets** + compliance pages (verbatim copy + stable anchor IDs).

### `docs/llm-migration-prompt.md` — Hard Rule #0 + flagship section

- **Hard Rule #0 added** explicitly mandating Tailwind utility classes for ALL responsive layout, calling out `min-[960px]:` arbitrary breakpoint vs Tailwind default `md:`.
- **Reference migrations table** updated: Infonet is now the v6.2 source for new Nuxt SSG migrations; IFVCC remains the source for Vue 2 SPA migrations.
- **Migration tracker** updated: Infonet ✅ shipped 2026-05-27; flagship ⏳ next with "Spike first (4-8 hr)" note.
- **New "Flagship-specific concerns" section** with: dimensional comparison table (prior migrations vs flagship), mandatory 4-8hr spike pre-work checklist (route inventory, Vuex audit, build-time benchmark, Strapi v3 schema dump, PDF inventory, third-party CSP audit, content audit, i18n decision), Tailwind utility grids flagship-scale playbook (LayoutGrid helper + viewcap-diff-at-5-widths discipline), two-pass build pipeline reminder, cutover-at-scale layers (preview window, SiteImprove crawl, sitemap diff), and Plausible RUM custom events.

### `README.md` updates

Links to `docs/astro-conversion-checklist-v6.2.md` and `docs/llm-migration-prompt.md` now describe the v6.2 increment + flagship section so future devs see the changes from the entry point.

---

## [3.2.2] - 2026-05-27 — Revert inlineStylesheets to 'auto'

Re-audit after `3.2.1` shipped showed the `inlineStylesheets: 'always'` flip was a net regression for browse traffic:

| Page | 3.2.0 (auto) | 3.2.1 (always) | Δ |
|---|---:|---:|---:|
| / mobile (FCP) | 1.4 s | 2.0 s | **−600 ms** |
| / desktop perf | 99 | 96 | −3 |
| /screenshots/ mobile perf | 97 | 94 | −3 |
| /about/ desktop perf | 89 | 99 | +10 |

The asymmetry is **text-LCP vs image-LCP**: `/about/` is a CMS markdown page where the LCP element is text inside `.markdown-body`, which can't paint until the stylesheet has been parsed — render-blocking CSS hurt it disproportionately. `/screenshots/` (and to a lesser extent the home and DAP) are image-LCP pages where the LCP image fetch races the CSS in parallel, so inlining 35 KiB of CSS into the HTML just delayed image discovery without a compensating gain. On mobile the cost is amplified because the bigger HTML pushes past a single TCP round-trip on throttled connections.

Reverted to `'auto'`. The /about/ desktop score returns to the 89-93 variance band but warm-cache navigations across the rest of the site get the cached CSS bundle (~280 KiB of redundant inlined CSS bytes avoided over an 8-page browse), and mobile FCP returns to 1.4 s on the homepage. A11y/BP/SEO unaffected.

---

## [3.2.1] - 2026-05-27 — Post-deploy Lighthouse polish

Three targeted fixes triggered by the post-`8a655e2` audit re-run:

### `/data-and-publications/` mobile perf 95 → 100 (target)

The DAP splash images were uniformly `loading="lazy"`. Lighthouse identified the third card's WebP as the LCP candidate (largest visible image at fold) and assessed a ~150 ms LCP penalty for not being eager. Switched the first card's splash to `loading="eager"` + `fetchpriority="high"`; the rest stay lazy. The `idx === 0` toggle lives in `src/pages/data-and-publications/index.astro` and keys off the post-sort article order, so the visually-first card always wins the LCP race.

### Homepage `label-content-name-mismatch` — five elements cleared

Lightcap (Lighthouse 13.0.2 + axe-core 4.11.0) reported the rule on five anchors where the `aria-label` text didn't include the visible text:

- **`section.home-boxes > ul > li > a.home-box`** (×3): each card had `aria-label="Request <something>"` while the visible `<h3>` read `"Interested in using InfoNet?"` / etc. Removed the aria-labels; the inner `<h3>` + `<p>` now compute the accessible name verbatim from the visible content.
- **`.home-posts__all-btn`** (`"All News »"`) and **`.home-faqs__all-btn`** (`"All FAQs »"`): aria-labels were `"All News & Updates"` / `"All Frequently Asked Questions"` — same fix, dropped.
- **`body > header > nav#main-navigation > a.md-show`** (desktop nav title): visible text spans `"INFONET | DATA COLLECTION & REPORTING SYSTEM"`, aria-label was `"INFONET — go to homepage"`. Dropped the aria-label; the three inline `<span>`s now compute the accessible name themselves. Mobile-only abbreviated link untouched (its visible "INFONET" is a substring of its aria-label, which is fine).

### `/about/` desktop render-blocking CSS — `inlineStylesheets: 'auto'` → `'always'`

Astro's auto threshold (≈4 KiB) wasn't inlining the ~35 KiB bundled stylesheet, so it shipped as a render-blocking `<link rel="stylesheet">`. On `/about/` desktop that cost ~650 ms of CRP (Lighthouse 13 `render-blocking-insight`). Flipped `astro.config.ts` → `build.inlineStylesheets: 'always'`. Trade-off: every HTML page grows by ~35 KiB pre-gzip, and the bundle is no longer separately cacheable. Acceptable on Netlify (HTML responses are brotli'd at the edge) and meaningful for cold first-paint across every page.

---

## [3.2.0] - 2026-05-27 — Edge-to-edge home layout + a11y zero-issue sweep

### Home layout — edge-to-edge above and below

Restores the legacy Vuetify `v-container fluid` + `cols=12 md=6` behaviour after `3.1.0` had inadvertently capped the home sections at 1200 px wide:

- **Hero + chart row:** `.home-section-inner` no longer applies `max-width: 1200 px` — the row now spans the full viewport width. Info text occupies the left half, chart the right half (`1fr 1fr` grid at ≥960 px, stacked below). `.home-hero-inner` 640 px cap also removed.
- **News + FAQs row:** `.home-news-faqs` strips the 2 rem outer padding and column gap so each card column reaches the viewport edge.
- **Gutters:** `.home-section` keeps a small 2 rem horizontal padding for breathing room around the hero copy; the news/faqs section runs flush.
- **Top white strip:** kept the 3.1.0 fix where the home route gets `mainTopPad: 0` so the gray hero abuts the fixed nav.

### Accessibility — production now reports **0 violations AND 0 needs-review**

axe-core AA audited across `/`, `/about/`, `/screenshots/`, `/faqs/`, `/news/`, `/contact/`, `/data-and-publications/`, `/news/<slug>/`:

- **`/data-and-publications/`** card CTA was `#1976d2` on a `#fafafa` card = 4.28 : 1 (fails AA 4.5 : 1 for small bold text). Bumped to `#0d47a1` (~6.6 : 1, passes AA + AAA).
- **FAQ + home FAQ chevrons** used the Unicode `▾` (`U+25BE`), which made axe-core report `nonBmp` ("Element content contains only non-text characters") as a *needs-review* result. Swapped to inline SVG paths with `currentColor` fill — axe excludes SVG from color-contrast entirely. Visually identical.

### Responsive — narrow-viewport overflow eliminated

The screen-reader-only fallback table on `HomeBarGraph` was a `position: absolute; clip: rect(0,0,0,0); white-space: nowrap` block. The clip hides it visually, but its absolute-positioned children still contributed ~64 px to `document.scrollWidth`, causing a stray horizontal scrollbar on every page that embeds the chart at viewports under ~520 px. Anchored at `left: -10000 px` so its natural-width content sits fully off-canvas. Verified via Chrome DevTools at multiple viewport widths.

### Pixel-perfect — `/about/` Partners section

The legacy `:Partners` component had `.partners-body { padding: 0 4rem }` plus a `.partners-indent { margin-left: 25 px }`, double-indenting it relative to sibling sections (`InfoNet team`, `InfoNet User Agencies`). Stripped both — Partners now aligns flush-left with its h2 like every other CMS section.

---

## [3.1.0] - 2026-05-27 — Pixel-perfect polish + Lighthouse 96-100 on every page

Follow-up to the 3.0.0 cutover. Same tech stack, same look — fixes the remaining drift the team identified during branch review, plus a perf + Best Practices sweep so every audited route lands in the 96-100 band on both mobile and desktop.

### Final Lighthouse score matrix (deploy preview, `feat/astro-migration` @ f8c62b3)

| Page | M-Perf | M-A11y | M-BP | M-SEO | D-Perf | D-A11y | D-BP | D-SEO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/`              | 99 | 100 | 100 | 100 | 94–99 | 100 | 100 | 100 |
| `/about/`        | 100 | 100 | 100 | 100 | 97 | 100 | 100 | 100 |
| `/screenshots/`  | 98 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| `/faqs/`         | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| `/news/<slug>/`  | 100 | 100 | 100 | 100 | — | — | — | — |
| `/data-and-publications/` | 100 | 100 | 100 | 100 | — | — | — | — |
| `/contact/`      | 100 | 100 | 100 | 100 | — | — | — | — |

Desktop `/` perf is variable across Lighthouse runs (88 → 99 → 94 → 96 → 99 in successive trials) — Lighthouse jitter on a static page where FCP is already ≤1.0 s.

### Visual / pixel-perfect fixes

- **Home hero edge-to-edge.** `BaseLayout` `<main>` no longer adds 32 px top padding on the home route, so the gray `.home-section--gray` hero abuts the fixed top nav (no white strip).
- **Home full-bleed sections.** Restructured into `.home-section` (full-bleed) + `.home-section-inner` (centered max-width 1200 px) — gray hero background now stretches edge to edge matching legacy.
- **Footer logo.** Removed the white background bars above/below the logo IMG.
- **Top-nav thickness.** Reduced AppNav from 150 px → 80 px to match legacy.
- **Nav accordion.** Dropdowns now close when another opens or when the user clicks outside.
- **H1 no longer underlined.** Border-bottom removed from `PageHeader.h1` / `.page-h1` (kept on h2 to match legacy).
- **Breadcrumb → H1 gap.** Trimmed `mainTopPad` from 96 px → 32 px on non-home pages to match the measured 32 px legacy gap.
- **TOC sidebars removed** on `/[...slug]/`, `/news/<slug>/`, `/faqs/` per legacy.
- **Article content centred** on news / page / faqs / DAP routes via a new `.page-container` utility (`max-width: 1200px; margin: 0 auto`).
- **Screenshots gallery.** 4-col responsive grid (`repeat(auto-fill, minmax(245px, 1fr))`) with white modal lightbox on a dim backdrop. Click any thumbnail to open the full image.

### Content / data fidelity fixes

- **Home FAQs.** Filtered to `agency === "general"` and sorted slug-alphabetically to mirror legacy `DisplayFaqs` ordering exactly.
- **MDC components render inline.** `:Partners`, `::TabsScreenshotsAccessible`, etc. now render at their original markdown position via a sentinel-token round-trip through `markdown-it` + `xss` (was: appended to the end of the article, which caused `/about/` partner paragraphs to disappear between two adjacent h2s).

### Performance

- **Chart.js lazy-loaded.** Home `HomeBarGraph` now `dynamic import()`s `chart.js/auto` behind an `IntersectionObserver` (rootMargin 200 px). Was a static import → bundled into the home chunk → ~660 ms render-blocking. Now zero blocking on initial paint.
- **Screenshots gallery thumbnails.** `pickThumb()` selects Strapi's smallest format ≥ 500 px wide (`thumbnail` → `small` → `medium` → `large`); falls back to `/uploads/thumbnail_<base>` URL convention. Each `<img>` gets explicit `width`/`height` so the gallery cannot trigger layout shift; the first image of the first tab is `loading="eager"` + `fetchpriority="high"` for LCP. Saves ~900 KiB per gallery view.
- **YouTube lite-facade.** Every CMS-embedded YouTube iframe is rewritten in `renderMarkdown()` into a clickable thumbnail (`<div class="yt-facade" data-yt-id="…">` + `<img i.ytimg.com>` + play-button overlay). The real iframe only mounts after the user clicks play (wired by `initYtFacades()` in `alpine-entry.ts`). Defers ~500 KiB of YouTube player JS until interaction; eliminates third-party cookies on page load.
- **YouTube → youtube-nocookie.** Even when the facade is bypassed, the post-click iframe targets `youtube-nocookie.com` (no DoubleClick / ad-tracking calls).

### SEO + accessibility + Best Practices

- **Open Graph image.** New `public/og-image.svg` source (1200×630, `font-family="sans-serif"` for librsvg-CI safety) regenerated to `public/og-image.png` by `scripts/build-og-image.mjs` (wired into the `og:image` build step). README hero + Netlify status / Astro 6 / Alpine 3 / Tailwind 4 / Pagefind 1.5 / Node 22 / pnpm 10 / MIT badges added.
- **astro-seo verified** across every route via `BaseLayout`. Every page emits `<title>`, `<meta name="description">`, `<link rel="canonical">` (trailing slash, production origin), Open Graph, Twitter card, `author` meta, JSON-LD.
- **Sitemap.** `@astrojs/sitemap` emits `dist/sitemap-0.xml` (43 canonical trailing-slash URLs) + `dist/sitemap-index.xml`. `/404/` and `/debug/` excluded. Home priority 1.0, others 0.7. `robots.txt` references the sitemap index.
- **No 301 redirects.** `trailingSlash: 'always'` + Netlify pretty-URL auto-rewrite means `/about`, `/about/`, and `/about/index.html` all serve `200` directly (no redirect chain for Siteimprove to flag). Canonical link still points to the trailing-slash form.
- **Plausible analytics** confirmed connected: `<script defer data-domain="infonet.icjia.illinois.gov" src="https://plausible.icjia.cloud/js/script.js">`.

### CSP additions

`script-src` (sha256 hash for screenshots modal inline script), `img-src https://i.ytimg.com` (YouTube facade thumbnail), `frame-src https://www.youtube-nocookie.com https://app.netlify.com` (YouTube + Netlify preview drawer).

---

## [3.0.0] - 2026-05-26 — Astro 6 / Alpine 3 / Tailwind 4 cutover

**Tech swap, not a redesign.** Managers approved the legacy look; this release ports the underlying tech to recover mobile performance.

### Migration value delivered

| Metric | Legacy (v2.3.9) | Astro (v3.0.0) | Δ |
|---|---:|---:|---:|
| Mobile Perf | 55 – 61 | **98 – 100** | **+37 to +43** |
| Mobile A11y | 100 | 100 | 0 |
| Mobile BP | 100 | 100 | 0 |
| Mobile SEO | 92 – 100 | 100 | +8 on listing / detail / contact |
| axe-core AA | 0 violations | 0 violations | 0 |
| CLS (home) | 0.13 (Vuetify shell shift) | 0.00 | -0.13 |

### Tech changes

- **Removed:** Vue 3, Nuxt 4, Vuetify 3, AOS, Fuse.js, `@mdi/font` runtime CSS, MDI runtime CSS, all `image.icjia.cloud` (Thumbor) URLs from served HTML/CSS/JS.
- **Added:** Astro 6 (`output: 'static'`), Tailwind 4 (vite plugin + `@theme` tokens calibrated to legacy Vuetify defaults), Alpine.js 3 + `@alpinejs/focus`, Pagefind 1.5 (search), Sharp 0.34 (image pipeline), `@fontsource/{lato,raleway,roboto}` self-hosted fonts, Chart.js 4.5 (home bar graph).
- **Build chain (2-pass + index + og):** `astro build && fetch-cms-images && astro build && pagefind && og:image`.
- **Strapi loaders** with build-time `.cache/strapi/<sha256>.json`, `AbortSignal.timeout(60s)`, Zod validation.
- **Self-hosted images** under `public/_cms-img/<hash>/<width>.<ext>` — no runtime Thumbor.
- **CSP `script-src 'self'`** + sha256 hashes for the 5 unique inline scripts (URL normalizer, Plausible, Pagefind init, ReadProgress / TOC init, news post variant).
- **OG image generator** — Sharp SVG → PNG 1200×630, `font-family="sans-serif"` (librsvg-safe).

### User-facing functional / visual changes

**None intended.** Every page, every interaction, every form field, every hover state, every link target preserved per pixel-perfect mandate. Viewcap pixel-perfect-vs-legacy diff verified across the public route surface during Phases 2, 5b, and 7.

### Routes

45 emitted (vs ~14 logical in legacy — dynamic catch-alls expand for Strapi `posts` / `tabs` / `pages`):

- Static: `/`, `/404`, `/translate`, `/contact`, `/debug`, `/search`, `/data-and-publications`, `/faqs`, `/news`, `/meetings`
- Dynamic via `getStaticPaths`: `/news/<slug>/` (22), `/tabs/<slug>/` (6), `/<page>/` catch-all filtered via `reservedSlugs` (7 pages: `/about`, `/agencies`, `/partners`, `/privacy`, `/resources`, `/screenshots`, `/upgrades`)

### Cutover safety

- `v1-final` git tag preserved as a rollback point on the final legacy state (`feat/astro-migration` HEAD just before the cutover commit).
- Migration spec, all 7 phase plans, all 8 audit logs preserved under `docs/superpowers/specs/` and `docs/perf/`.

## [2.3.9] - 2026-05-06

### Bug fixes

- Fix Table of Contents scroll-spy never highlighting the actual current section: TOC always showed a spurious "Navigation" entry at the bottom of the list, and that entry stayed permanently highlighted regardless of scroll position. Two root causes:
  - `document.querySelectorAll("h2[id]")` in `[...slug].vue`, `faqs/index.vue`, `news/[slug].vue`, and `meetings/[slug].vue` was matching the TOC sidebar's own `<h2 id="navigation">` heading and adding it as a TOC link.
  - The scroll handler in `TheTableOfContents.vue` queried `h2` (no `[id]` filter) and iterated all matches in document order, taking the LAST section above the scroll line. Because the sidebar's own `<h2>` is in the right column at a small `offsetTop` and is the last `<h2>` in document order, it always won the loop and `toc-navigation` stayed `.visible` everywhere.
- Renamed the TOC sidebar heading id from `navigation` → `toc-sidebar-heading` (no inbound links to `#navigation`) and excluded it via `:not(#toc-sidebar-heading)` in all five queries.
- Rewrote the scroll-spy to use a proper "deepest section above scroll line" loop with an early return at the top of the page, requery sections each frame (so async-rendered content is picked up), and run once on mount via `nextTick(onScroll)` so a deep-link with a hash lands in the right state.

## [2.3.8] - 2026-05-06

### Accessibility

- Voluntarily fix the three sub-100 SiteImprove findings (all WCAG 2.1 **AAA** — outside the AA / IITAA 2.1 conformance target, but cheap to address):
  - **SC 1.4.6 enhanced color contrast** — bumped multiple components from ~5–6.5:1 to ≥7:1:
    - Breadcrumb bar bg `#2e618c` → `#0d4474` (5.83 → 10.16:1)
    - Homepage hero tag boxes `#2e618c` → `#0d4474`
    - `HomeBoxes` box 2 `#2e618c` → `#1c5183` (5.83 → 8.24:1) and box 3 `#4f6d87` → `#3a5571` (4.93 → 7.75:1) — preserves three-color visual gradient
    - Markdown body link color `#0366d6` → `#0353a4` (5.42 → 7.55:1)
    - Accessible-tabs inactive text alpha 0.7 → 0.85, active bg `#616161` → `#555555` (`TabsUserInfoAccessible.vue`, `TabsScreenshotsAccessible.vue`)
    - "Click tab to view agency info" helper `#6b6b6b` → `#525252` (`Tabs.vue`, `TabsScreenshotsAccessible.vue`)
    - Form labels `#4a4a4a` → `#3a3a3a` (8.87 → 11.38:1 on white; 6.51 → 8.37:1 on Vuetify's `#dcddde` overlay where floating labels actually sit — the spot axe was flagging)
  - **SC 1.4.8 fixed font size** — `$font-size-root: 18px` → `112.5%` in `app/assets/css/variables.scss` so the root font size scales with the user's browser font-size preference
- **SC 2.5.5 enhanced target size** documented as out-of-scope: would require redesigning every inline link, breadcrumb, sidebar nav, and TOC item to ≥44×44 CSS px. Not required for AA / IITAA 2.1 (WCAG 2.1).
- axe-core 4.11 verification post-fix: **0 AA violations** and **0 AAA violations** on every page sampled (homepage, agencies, resources, screenshots, search, contact, about, data-and-publications, partners, translate, faqs, news, privacy, upgrades).

### Documentation

- README: add "SiteImprove findings outside the AA conformance target" subsection with per-bucket rule counts (A: 38/38, AA: 11/11, AAA: 8/8 after fixes, WAI-ARIA authoring: 6/6, best practices: 14/14), the three sub-100 items mapped to WCAG SC numbers and AA/AAA scope, and the full list of out-of-scope SiteImprove rule categories so future sub-100 hits can be triaged correctly.

## [2.3.7] - 2026-05-05

### Documentation

- Re-verified WCAG 2.1 AA compliance via axecap MCP audit: **177 / 177** unique sitemap URLs pass with zero axe-core violations. No app code changed since 2.3.6.
- Correct previously reported sitemap URL count from 178 to 177 (README and 2.3.6 changelog had an off-by-one).

## [2.3.6] - 2026-05-05

### Accessibility

- Fix Siteimprove "Hidden element has focusable content" (recurring 1-occurrence flag for ~6 months): add `inert` attribute to subtrees that use `[hidden]` or `display:none` to wrap focusable descendants. Siteimprove flags this pattern even when axe-core's `aria-hidden-focus` rule passes (Siteimprove also checks `[hidden]` and `display:none`, not just `aria-hidden`).
  - `TheSidebar.vue` accordion panels (~28 instances per crawl) — `inert` when collapsed
  - `ImageModal.vue` `#myModal` (14 per crawl) — `inert` when no url is set
  - `TabsScreenshotsAccessible.vue` and `TabsUserInfoAccessible.vue` tab panels (6 per crawl) — `inert` when not active
  - `TheBreadcrumbBar` on home page — `v-show` → `v-if` (one-shot mount/unmount)
- Fix axe `heading-order` on `/meetings`: change TOC heading in `TheTableOfContents.vue` from `<h3>` to `<h2>` so heading hierarchy stays valid even when surrounding meeting content is empty
- Verified via new `scripts/find-hidden-focusable.js` diagnostic: 49 → 0 instances across 14 representative routes
- Full axecap (axe-core) audit on all 178 unique sitemap URLs: 0 violations, 4,028 rule passes

### Bug fixes

- Fix `/meetings` v-for binding: typo `query` → `data` (the `useAsyncData` destructured ref). Page will correctly iterate over the meeting list once content is restored.
- Fix `package.json` `audit:a11y` script pointing to non-existent `scripts/axe-audit.js` — now points to `scripts/full-axe-audit.js`

### Tooling

- Add `scripts/find-hidden-focusable.js` — Playwright diagnostic that emulates Siteimprove's "Hidden element has focusable content" rule (catches `[hidden]`/`display:none`/`visibility:hidden` containing focusable descendants without `inert`). Available as `yarn audit:hidden-focusable`.

## [2.3.5] - 2026-04-25

### Bug fixes

- Fix Table of Contents missing page links across `/about`, news, meetings, and FAQs pages: convert `myTocObj` from non-reactive `let` to `ref()` so Vue picks up assignment after `nextTick` (regression from 2.3.0)
- Fix Table of Contents picking up tab titles as broken entries on `/about`: filter `h2` selector to `h2[id]` so only headings with valid scroll targets populate the TOC
- Fix screenshot tiles off-kilter inside agency tabs: replace `:width`/`:height` props on gallery `<v-img>` with `:aspect-ratio`. Previously Vuetify treated the height prop as a literal CSS value, leaving each tile's image floating in oversized empty containers (regression from 2.3.2)

## [2.3.4] - 2026-04-13

### Accessibility

- Fix `/data-and-publications` WCAG 2.5.3 Label-in-Name violation (38 occurrences from Siteimprove): remove `aria-label` prefix/suffix on article cards so accessible name matches visible content; add visually-hidden "opens in new window" hint for screen reader users
- Restyle clickable article tag chips to high-contrast outlined pill (white bg, black text, 1px black border); invert on hover/focus for visible affordance
- axe-core AA and Lighthouse a11y: 0 violations on `/data-and-publications`

## [2.3.3] - 2026-04-10

### Accessibility

- Fix 404 page color contrast: change heading color from `#aaa` to `#333` (WCAG 1.4.3 AA)
- Remove sandbox page (dev-only test page with color-contrast violation)
- Full axe-core WCAG A+AA audit: 27/27 pages pass with 0 violations

## [2.3.2] - 2026-04-08

### Performance and bug fixes

- Fix `/faqs` performance: replace `ContentDoc` with `ContentRenderer` to eliminate hydration mismatch (Perf 53→91, CLS 0.54→0.10)
- Lazy-load DV, SA, CAC FAQ sections with `LazyDisplayFaqs` for progressive rendering
- Fix `/tabs` crash: `appRoutes.includes is not a function` — add `.value` and guard check
- Add `width`/`height` to gallery `<v-img>` in Tabs and TabsScreenshotsAccessible to reduce CLS
- Add Lato font fallback with `size-adjust` metrics; refine Raleway and Roboto fallback metrics
- Clean up dead code and upgrade `useHead` to `useSeoMeta` in tabs page
- Console errors eliminated on `/faqs` and `/tabs/screenshots-dv` (BP 96→100)

## [2.3.1] - 2026-04-08

### Testing

- Add Vitest test suite with 100 tests across 8 test files
- Install `vitest`, `@vue/test-utils`, `happy-dom` dev dependencies
- Add `vitest.config.js` with happy-dom environment and path aliases
- Add test setup file with mocked Nuxt auto-imports and composables
- Tests cover: server API endpoints, meta tags/SEO/AI readiness, content file integrity, app config, route data consistency, Nuxt config, composables, and static assets
- Add `yarn test`, `yarn test:watch`, and `yarn test:coverage` scripts

## [2.3.0] - 2026-04-08

### Lighthouse audit fixes

- Fix `img.hover` aspect ratio in TheFooter — Best Practices score improved from 96 to 100 site-wide
- Add null guards for `images.data` in Tabs and TabsScreenshotsAccessible to prevent console errors on tab pages
- Fix news page route validation race condition — skip validation if `appRoutes` hasn't loaded yet
- Remove unused `uuid` and `moment` imports and dead code from DisplayFaqs (reduced bundle size)
- Add `preconnect` and `dns-prefetch` for `infonet.icjia-api.cloud` image CDN
- Throttle TOC scroll listener with `requestAnimationFrame` and `passive: true` for smoother scrolling
- Load first screenshot image eagerly (no lazy-src) to improve LCP on /screenshots
- Wrap TOC DOM queries in `nextTick` for safer post-render access

### SEO and AI readiness

- Expand meta description from 7 characters to 160 characters
- Add Twitter Card meta tags (`summary_large_image`) with per-page overrides via `useSeoMeta`
- Add canonical URL (`<link rel="canonical">`) on all pages
- Add JSON-LD structured data: `WebSite` (global), `Article` (news pages), `WebPage` (content pages)
- Add `<meta name="author">` for Illinois Criminal Justice Information Authority
- Add `article:published_time` and `article:modified_time` meta for news pages
- Add `og:image:width` and `og:image:height` for proper social sharing previews
- Create `/llms.txt` for AI system discoverability (llmstxt.org spec)
- Migrate page-level meta from `useHead` with `hid` to `useSeoMeta` for proper Nuxt 3 deduplication

## [2.2.1] - 2026-04-07

### Bug fixes

- Fix home page rendering raw JSON instead of content — replace `<ContentDoc>` with `<ContentRenderer>` to resolve SSR hydration mismatch after removing `isMounted` guard
- Remove `ThePageLoader` gear animation from home page — no longer needed since content renders immediately via SSR; was stacking on top of visible content

## [2.2.0] - 2026-04-07

### Performance, SEO, and Lighthouse optimization

- Add `public/robots.txt` — fixes SEO audit failure (HTTP 500); all pages now score SEO 100
- Move Google Fonts from render-blocking CSS `@import` to `<link>` tag in `nuxt.config.js` head
- Add `defer` to jQuery CDN script to eliminate render-blocking
- Add `font-display: block` to Material Icons `@font-face` to prevent icon layout shifts
- Add CSS font fallbacks with `size-adjust` for Raleway and Roboto to minimize CLS during font swap
- Remove unused Font Awesome icon set imports from Vuetify plugin (only MDI is used)
- Enable Vuetify `ssr: true` for improved server-side rendering layout hints
- Replace `v-if="isMounted"` with immediate rendering in TheNav — nav menu now renders from static config without client-side toggle
- Replace `v-if` with `v-show` for breadcrumb bar to preserve layout space
- Remove `isMounted` guards from SSR-safe content sections on home page to prevent content pop-in CLS
- Initialize FAQs page column layout to `cols=9` to prevent reflow from 12→9 on mount
- Add explicit `width`/`height` attributes to all `<img>` tags (ThePageLoader, TheLoader, TheFooter) to reserve layout space
- Remove unused `@babel/types` import from `app.vue`

## [2.1.1] - 2026-03-23

### UI fix

- Fix vertical alignment of top navigation menu items — "News & Updates" text baseline now matches "About" and "Resources" by enforcing consistent `min-height: 30px` on `.v-btn__content` inside nav items

## [2.1.0] - 2026-03-23

### Accessibility - Deep audit and runtime fixes

- Fix TOC "Navigation" title: changed from `<div role="button">` to proper `<h3>` heading element to resolve axe DevTools heading-markup finding
- Add visually-hidden data table fallback for HomeBarGraph so screen readers can access all chart data (2then18-2024 victim counts)
- Add keyboard accessibility to Data & Publications article cards (`role="link"`, `tabindex`, `@keydown.enter`, `aria-label`)
- Add `aria-live="polite"` and `role="status"` to Data & Publications filter count so screen readers announce filtered results
- Add `scope="col"` to `<th>` elements in Attachments table for proper screen reader column association
- Add `.sr-only-table` CSS utility class for visually-hidden accessible content

## [2.0.0] - 2026-03-23

### Accessibility - Full axe-core audit across 177 pages (0 violations)

- Remove `role="presentation"` from `<v-main>`, `<v-footer>`, `<v-app-bar>` — use `tag="div"` instead to avoid ARIA conflict (fixed 177 pages)
- Fix contact form label contrast: override Vuetify's `#929292` label color with `#4a4a4a` (`opacity: 1 !important`) for WCAG AA compliance (5.58:1 ratio)
- Add `autocomplete` attributes to contact form fields (`given-name`, `family-name`, `email`, `tel`)
- Add `type="email"` and `type="tel"` to contact form inputs
- Add `role="alert"` and `aria-live="assertive"` to contact form success message
- Rewrite ImageModal with focus trap, Escape key handler, close button, `role="dialog"`, `aria-modal="true"`, and focus restoration
- Add `role="alertdialog"`, `aria-label`, and focus restoration to TextModal
- Add keyboard support (`role="button"`, `tabindex="0"`, `@keydown.enter`, `@keydown.space`) to gallery panels in Tabs.vue and TabsScreenshotsAccessible.vue
- Add keyboard support to TheTableOfContents click handlers
- Add keyboard support to HomeBoxes clickable cards; change fixed `height` to `min-height` for text reflow at 200% zoom
- Add keyboard support and `aria-label` to article cards on home page (desktop carousel and mobile list)
- Add `aria-label="Loading image"` to all `<v-progress-circular>` elements in Tabs, TabsScreenshotsAccessible, and ImageModal
- Fix redundant alt text on screenshot images (prefer `alternativeText` over duplicated `caption`)
- Add `rel="noopener noreferrer"` and "(opens in new window)" to all external `target="_blank"` links in TheFooter and Attachments
- Improve footer logo alt text from "Footer logo" to "Illinois Criminal Justice Information Authority logo"
- Add focus management on SPA route changes — `#main-content` receives focus via `preventScroll`
- Add `aria-live="polite"`, `role="search"`, `aria-label`, and keyboard support to search page results
- Add `role="alertdialog"`, `aria-label`, Escape key handling, and auto-focus to TheCookieWarning; fix privacy link from `href="#"` to `<nuxt-link to="/privacy">`
- Add `prefers-reduced-motion` check to AOS plugin — animations disabled for users who prefer reduced motion

## [1.3.0] - 2025-10-26

### Accessible tabs and branding

- Add accessible tab components (TabsScreenshotsAccessible, TabsUserInfoAccessible) with full ARIA tab pattern and keyboard navigation (Arrow keys, Home, End)
- Add SkipLinks component with high-contrast mode and reduced-motion support
- Add TheSidebar with proper `aria-expanded`/`aria-controls` accordion pattern
- Replace ICJIA logo with InfoNet thumbnail in header and footer
- Add Facebook app ID meta tag

## [1.2.0] - 2025-10-17

### Accessibility remediations (Phase 1-3)

- Phase 1 accessibility remediations: heading hierarchy, landmark regions, form labels
- Fix h1 heading hierarchy and text clipping warnings
- Fix additional a11y errors across multiple pages
- Accessible tab fixes for Strapi CMS screenshot and user resource content

## [1.1.0] - 2025-10-16

### Nuxt 4 migration

- Migrate to Nuxt 4 `/app` directory structure
- Fix SCSS import paths after migration
- Fix `File is not defined` error from undici in Nuxt 4
- Move JSON data files from `/src` to `/app/data`
- Fix server API routes to import from `/app/data/`
- Add `NuxtLayout` component to app.vue and error.vue
- Update Nitro prerender configuration with API routes
- Add `fs-extra` dependency
- Set compatibility date to 2025-03-21

## [1.0.0] - 2025-06-20

### Documentation and analysis

- Add JSDoc documentation and generation script
- Add project documentation and analysis

## [0.9.0] - 2025-05-07

### Content updates

- Update home page graph data
- Dependency updates

## [0.8.0] - 2024-07-16

### Content and dependency updates

- Add new news items and content
- Add new content for resource tabs
- Update Nuxt and dependencies
- Fix date formatting for news with moment UTC

## [0.7.0] - 2023-10-24

### User agencies and analytics

- Finish user agencies pages
- Add Plausible analytics
- Scaffold external link exit modal
- Merge publist publications and hub articles for unified research layout

## [0.6.0] - 2023-09-22

### Research publications integration

- Integrate publist publications via GraphQL query
- Merge hub articles with publist publications
- Refactor research page layout with combined data sources

## [0.5.0] - 2023-08-11

### Research page enhancements

- Add clickable tags on research articles
- Add tag-based filtering from home page to research page
- Scaffold snackbar for tag selection feedback

## [0.4.0] - 2023-07-13

### Tabs and FAQ system

- Add tabs content system from Strapi CMS
- Render Vue components in tab windows
- FAQ component with category display
- Lazy-load YouTube iframes
- Chart.js bar graph for home page

## [0.3.0] - 2023-06-26

### Core features

- News and FAQ pages with home page integration
- Screenshot gallery with image modal (mitt event bus)
- Partners component
- Video embed on About page
- Biographies pre-build scaffolding

## [0.2.0] - 2023-06-12

### Home page and layout

- Draft home page layout with responsive design
- News cards and research hub article carousel
- Sidebar navigation with accordion pattern
- Breadcrumb bar
- Search page with Fuse.js full-text search
- Contact form with email integration

## [0.1.0] - 2023-03-22

### Initial release

- Nuxt 3 project scaffold with Vuetify 3
- Strapi 3 CMS integration
- Content pre-build system (meetings, FAQs, news, pages, publications, tabs)
- Sitemap generation
- Basic routing and page structure
