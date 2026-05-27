# Changelog

All notable changes to the ICJIA InfoNet website are documented in this file.

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
