# Changelog

All notable changes to the ICJIA InfoNet website are documented in this file.

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
