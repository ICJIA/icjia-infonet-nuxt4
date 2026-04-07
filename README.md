[![Netlify Status](https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status)](https://app.netlify.com/sites/icjia-infonet/deploys) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# InfoNet

> **Version 2.2.0** | Nuxt 4.1.0 | WCAG 2.1 Level AA Compliant

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

This project has been audited for WCAG 2.1 Level AA compliance using axe-core with Playwright across all 177 site routes.

### Current Status

**177 / 177 pages pass with zero axe-core violations.**

- **Testing tools:** axe-core 4.10 + Playwright 1.56
- **Standard:** WCAG 2.1 Level AA + Section 508 + best practices
- **Last full audit:** March 23, 2026

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
