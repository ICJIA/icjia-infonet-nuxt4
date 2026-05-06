[![Netlify Status](https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status)](https://app.netlify.com/sites/icjia-infonet/deploys) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# InfoNet

> **Version 2.3.8** | Nuxt 4.1.0 | WCAG 2.1 Level AA Compliant

InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois. The system is nationally recognized for facilitating standardized data collection and reporting at the statewide level. Initial development of InfoNet began in the mid-90s as a collaborative effort between the Illinois Criminal Justice Information Authority, the Illinois Coalition Against Sexual Assault, and the Illinois Coalition Against Domestic Violence. Since then, InfoNet has grown to include partnerships with the Illinois Department of Human Services and the Children's Advocacy Centers of Illinois.

The primary purposes of InfoNet are to:

- Standardize data collection and reporting, thereby improving the ability to analyze information statewide and locally.

- Provide a central repository for statewide victim service data.

- Ease reporting for victim service providers that receive grants from multiple funding agencies, which often require different types of information. Facilitate continuous strategic planning for improving services and system response to victims.

## Site

https://infonet.icjia.illinois.gov

## Tech Stack

- **Framework:** Nuxt 4.1.0 (Vue 3)
- **UI Library:** Vuetify 3
- **CMS:** Strapi 3 (headless)
- **Search:** Fuse.js (client-side fuzzy search)
- **Charts:** Chart.js / vue-chartjs
- **Deployment:** Netlify (static site generation)
- **Analytics:** Plausible
- **Node.js:** 20.x (see `.nvmrc`)

## Install

```bash
git clone https://github.com/ICJIA/icjia-infonet-nuxt3.git
cd icjia-infonet-nuxt3
cp .env.sample .env
yarn install
nvm use
```

> Note: If you don't have `nvm` installed, you can install it with `brew install nvm` or `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`

## Start development server

Start the development server on http://localhost:8000

```bash
yarn dev
```

## Preview

```bash
yarn preview
```

## Manually generate static site and serve locally (port 3000):

```bash
yarn generate:serve
```

> Note: Vercel's 'Serve' must be installed globally: `npm install -g serve`

## Manually run build scripts for a remote API (i.e., a headless CMS such as Strapi)

```bash
yarn scripts
```

## Manually run build scripts for a local API (i.e., no backend -- all local data)

```bash
yarn scripts:local
```

## Production

Build the application for production:

```bash
yarn generate
```

_Netlify will automatically deploy the live site when changes are pushed to the master branch._

## Accessibility

This project has been audited for WCAG 2.1 Level AA compliance using axe-core with Playwright across all 177 unique sitemap URLs.

### Current Status

**177 / 177 unique sitemap URLs pass with zero axe-core violations** (axecap MCP audit, 2026-05-05; re-verified for 2.3.7).

- **Testing tools:** axe-core 4.11 (axecap MCP) + Playwright
- **Standard:** WCAG 2.1 Level AA + Section 508 + best practices
- **Last full audit:** May 5, 2026

In addition, `scripts/find-hidden-focusable.js` emulates Siteimprove's stricter "Hidden element has focusable content" rule (catches `[hidden]`/`display:none`/`visibility:hidden` containing focusable descendants without `inert`). Run with `yarn audit:hidden-focusable`.

### SiteImprove findings outside the AA conformance target

The legal target for ADA Title II (28 CFR § 35.200(b)(3)) and Illinois IITAA 2.1
is **WCAG 2.1 Level AA**. SiteImprove's overall accessibility score is a weighted
rollup that mixes Level A, AA, **AAA**, WAI-ARIA authoring practices, and
SiteImprove's own editorial best-practice rules into a single number. A site can
score 100/100 on every Level A and AA rule and still see a sub-100 SiteImprove
rollup driven entirely by AAA / best-practice items that the law does not
require.

**Per-rule SiteImprove result for InfoNet (audit 2026-05-06):**

| Conformance category | # rules | # at 100/100 | # below 100 | In scope for AA / IITAA 2.1? |
|---|---|---|---|---|
| WCAG 2.1 **Level A** | 38 | 38 | 0 | **Yes** |
| WCAG 2.1 **Level AA** | 11 | 11 | 0 | **Yes** |
| WCAG 2.1 **Level AAA** | 8 | 8 (after fixes) | 0 | No |
| WAI-ARIA authoring practices | 6 | 6 | 0 | No |
| Accessibility best practices | 14 | 14 | 0 | No |

**Sub-100 rollup at audit time** (all AAA — outside AA / IITAA 2.1 scope):

| SiteImprove issue | WCAG SC | Why it doesn't apply | Fixed anyway? |
|---|---|---|---|
| Color contrast does not meet **enhanced** requirement | **1.4.6 (AAA)** — requires 7:1 / 4.5:1. The AA twin (SC 1.4.3, 4.5:1 / 3:1) was already 100/100. | AA only requires SC 1.4.3, not 1.4.6. | Yes — bumped breadcrumb, home boxes, markdown links, tab UI, and form labels to ≥7:1. |
| Font size is fixed | **1.4.8 (AAA)** Visual Presentation — requires user-overridable absolute font sizing. The AA resize twin (SC 1.4.4 "Page zoom is restricted") was 100/100. | AA only requires SC 1.4.4 (zoom to 200%), which the site supports. | Yes — root font size changed from `18px` to `112.5%` so it scales with browser font-size preferences. |
| Interactive element does not meet **enhanced** size | **2.5.5 (AAA)** — requires ≥44×44 CSS px target size. | The AA twin in WCAG **2.2** (SC 2.5.8 "minimum size") doesn't apply because ADA Title II / IITAA 2.1 cite WCAG 2.1; in 2.1 only 2.5.5 AAA is the target-size criterion. | Documented as out-of-scope. Fixing universally would require a major redesign of inline links, breadcrumbs, sidebar navigation, and table-of-contents items. |

**Other SiteImprove rule categories that are outside AA / IITAA 2.1 scope** (all currently at 100/100, but listed for completeness so future sub-100 hits in these buckets can be triaged correctly):

- **WCAG AAA rules** SiteImprove tests beyond the three above: SC 1.4.6 enhanced contrast, SC 1.4.8 (line height below minimum, line height fixed, uneven spacing, font size fixed), SC 2.4.9 links on the same page with the same text, SC 2.2.4 page refreshes/redirects without warning. *All AAA — none required for AA conformance.*
- **WAI-ARIA authoring practices**: text not in an ARIA landmark, page region missing an accessible name, ARIA attribute unsupported / does not exist, page sections with the same name not serving the same purpose, invalid state or property. *W3C ARIA recommendations, not WCAG normative requirements.*
- **SiteImprove "Accessibility best practices"** (editorial, not WCAG): font size is too small, overuse of italics, text in all caps, page does not start with a level 1 heading, page missing headings, skip-to-main-content link is missing, headings are not structured, presentational element exposed to AT, content missing after heading, grouped form controls missing accessible name, improper use of preformatted text, deprecated HTML element. *Best practice — strongly encouraged but not required for AA conformance.*

**Bottom line:** SiteImprove's per-rule data shows 100/100 on every Level A and Level AA rule. The site is fully WCAG 2.1 Level AA conformant per SiteImprove's own data, and triangulated by axe-core 4.11 (0 AA violations across all 177 sitemap URLs). Where AAA fixes were cheap and didn't compromise the design (contrast bumps, relative font sizing), they were applied; where AAA would require redesigning the navigation system (target size enhanced), they were documented and left out of scope.

### Run Accessibility Audit

```bash
# Make sure dev server is running first
yarn dev

# In another terminal, run the full audit (all 177 pages)
node scripts/full-axe-audit.js
```

Results are saved to `scripts/axe-audit-results.json`.

### Accessibility Features

- Skip links with high-contrast mode and reduced-motion support
- Focus management on SPA route changes
- Full keyboard navigation on all interactive elements
- Proper ARIA tab patterns (custom accessible components replacing Vuetify tabs)
- Focus trap and Escape key handling on all modals
- `aria-live` regions for dynamic content (search results, filter counts, form success)
- `autocomplete` attributes on contact form fields
- `prefers-reduced-motion` respected (AOS animations disabled)
- Visually-hidden data table fallback for chart data
- `rel="noopener noreferrer"` on all external links
- Proper heading hierarchy across all pages
- Descriptive alt text on all images
- `scope="col"` on data table headers

### Accessible Tab Components

Vuetify's `<v-tabs>` caused text clipping at 200% zoom (WCAG 1.4.4 / 1.4.10 violation). Two custom accessible components replace them:

- `app/components/content/TabsUserInfoAccessible.vue` — for `/resources` page
- `app/components/content/TabsScreenshotsAccessible.vue` — for `/screenshots` page

These use vanilla HTML + WAI-ARIA tab pattern with full keyboard navigation (Arrow keys, Home, End), proper `tabindex` management, and zero Vuetify dependencies.

## Testing

The project includes a full Vitest test suite with 100 tests across 8 test files.

```bash
# Run tests
yarn test

# Watch mode
yarn test:watch

# With coverage
yarn test:coverage
```

### Test Coverage

| Test File | Tests | Scope |
|---|---|---|
| `server-api.test.js` | 6 | API endpoints (routes, tabs, search) |
| `meta-tags.test.js` | 17 | SEO meta, OG tags, JSON-LD, llms.txt, robots.txt |
| `content.test.js` | 12 | Content files, frontmatter, sitemap |
| `app-config.test.js` | 13 | Nav menus, enums, feature flags |
| `routes-data.test.js` | 7 | Route validity, deduplication, content file consistency |
| `nuxt-config.test.js` | 14 | Head config, CSS, modules, prerender, scripts |
| `composables.test.js` | 5 | State composables (counter, color, nav, translate) |
| `static-assets.test.js` | 8 | Required public files and data files |

## Lighthouse Scores (Dev Server)

| Category | Score |
|---|---|
| Accessibility | 100 (all pages) |
| SEO | 100 (all pages) |
| Best Practices | 96-100 |
| Performance | 76-98 (higher in production builds) |

## SEO and AI Readiness

- Open Graph and Twitter Card meta tags on all pages (per-page overrides via `useSeoMeta`)
- JSON-LD structured data: `WebSite` (global), `Article` (news), `WebPage` (content pages)
- `article:published_time` and `article:modified_time` on news pages
- Canonical URLs on all pages
- `<meta name="author">` on all pages
- `robots.txt` with sitemap reference
- `sitemap.xml` with all routes
- `/llms.txt` for AI system discoverability ([llmstxt.org](https://llmstxt.org) spec)

## Nuxt 4 Migration

This project was migrated from Nuxt 3.13.2 to Nuxt 4.1.0 in October 2025.

### Key Changes

- Application code in `/app` directory (components, pages, plugins, assets, etc.)
- Path aliases: `@/` or `~/` point to `/app`, `@@/` or `~~/` point to project root
- API routes prerendered as static JSON files for SSG compatibility
- Async data handling with optional chaining to prevent undefined errors during navigation
- Node.js 20.x requirement

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed version history.
