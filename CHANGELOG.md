# Changelog

All notable changes to the ICJIA InfoNet website are documented in this file.

## [2.1.1] - 2026-03-23

### UI fix

- Fix vertical alignment of top navigation menu items — "News & Updates" text baseline now matches "About" and "Resources" by enforcing consistent `min-height: 30px` on `.v-btn__content` inside nav items

## [2.1.0] - 2026-03-23

### Accessibility - Deep audit and runtime fixes

- Fix TOC "Navigation" title: changed from `<div role="button">` to proper `<h3>` heading element to resolve axe DevTools heading-markup finding
- Add visually-hidden data table fallback for HomeBarGraph so screen readers can access all chart data (2018-2024 victim counts)
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
