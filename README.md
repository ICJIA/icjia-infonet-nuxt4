[![Netlify Status](https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status)](https://app.netlify.com/sites/icjia-infonet/deploys) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# InfoNet

InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois. The system is nationally recognized for facilitating standardized data collection and reporting at the statewide level. Initial development of InfoNet began in the mid-90s as a collaborative effort between the Illinois Criminal Justice Information Authority, the Illinois Coalition Against Sexual Assault, and the Illinois Coalition Against Domestic Violence. Since then, InfoNet has grown to include partnerships with the Illinois Department of Human Services and the Children’s Advocacy Centers of Illinois.

The primary purposes of InfoNet are to:

- Standardize data collection and reporting, thereby improving the ability to analyze information statewide and locally.

- Provide a central repository for statewide victim service data.

- Ease reporting for victim service providers that receive grants from multiple funding agencies, which often require different types of information. Facilitate continuous strategic planning for improving services and system response to victims.

## Site

https://infonet.icjia.illinois.gov

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

## Developer Documentation Portal

This project includes a comprehensive developer documentation portal that provides centralized access to technical documentation, accessibility reports, and development resources.

### Access the Portal

When running the development server:

```bash
yarn dev
# Navigate to: http://localhost:8000/documentation/
```

The portal includes:

- **Accessibility Reports** - Automated WCAG 2.1 Level AA compliance testing
- **API Documentation** - Coming soon
- **Testing Documentation** - Coming soon
- **Deployment Guide** - Coming soon

### Portal Features

- ✅ Modern, accessible design (WCAG 2.1 Level AA compliant)
- ✅ Responsive layout for all devices
- ✅ Dynamic links to latest accessibility reports
- ✅ Automated report generation and updates
- ✅ Professional presentation for developers and stakeholders

For detailed information about the portal setup, see [DOCUMENTATION_PORTAL_SETUP.md](./DOCUMENTATION_PORTAL_SETUP.md).

## Accessibility Auditing

This project includes comprehensive accessibility testing using axe-core and Playwright.

### Run Accessibility Audit

```bash
# Make sure dev server is running first
yarn dev

# In another terminal, run the audit
npm run audit:a11y
```

### View Audit Reports

**Option 1: Developer Documentation Portal (Recommended)**

```bash
# Navigate to the portal in your browser
http://localhost:8000/documentation/
```

**Option 2: Direct Report Access**

```bash
# Open the latest HTML report directly
npm run audit:a11y:report
```

### Reports Location

All accessibility reports are saved in `public/documentation/accessibility-reports/`:

- `accessibility-report-latest.html` - Interactive HTML report
- `accessibility-report-latest.json` - Machine-readable JSON data
- `accessibility-report-[timestamp].html` - Historical reports

### Accessibility Status

✅ **0 Critical Violations** (100% resolution)
⚠️ **2 Serious Violations** (color contrast, iframe title)
⚠️ **4 Moderate Violations** (heading order)
ℹ️ **175 Minor Violations** (ARIA role usage)

**Total Pages Tested:** 175 routes
**Testing Tools:** axe-core 4.10.3 + Playwright 1.56.1
**Standard:** WCAG 2.1 Level AA

Recent improvements:

- Semantic HTML navigation with WAI-ARIA accordion pattern
- Full keyboard accessibility with proper focus management
- Screen reader compatible with proper ARIA attributes
- Icon-only buttons with accessible names
- All images with descriptive alt text
- Proper landmark regions on all pages
- Correct heading hierarchy

For detailed information about accessibility testing and improvements, see:

- [Developer Documentation Portal](http://infonet.icjia.illinois.gov/documentation/) - View latest reports
- [Documentation Portal Setup](./DOCUMENTATION_PORTAL_SETUP.md) - Portal configuration
- [Complete Accessibility Summary](./ACCESSIBILITY_COMPLETE_SUMMARY.md) - Overview of all fixes
- [Fresh Audit Summary](./FRESH_AUDIT_WITH_SERVER_SUMMARY.md) - Latest audit results
- [Sidebar Refactor Summary](./SIDEBAR_REFACTOR_SUMMARY.md) - Technical details of navigation refactor

## Production

Build the application for production:

```bash
yarn generate
```

_Netlify will automatically deploy the live site when changes are pushed to the master branch._

## Nuxt 4 Migration

✅ **This project has been successfully migrated from Nuxt 3.13.2 to Nuxt 4.1.0**

The migration includes:

- **Nuxt 4.1.0** with Nitro 2.x and Vite 7.x
- **Recommended `/app` directory structure** for better code organization
- **Node.js 20.x** requirement (updated from 18.x)
- **Static site generation (SSG)** with prerendered API routes
- **All routes successfully prerendering** with no console errors

### Key Changes

- Application code moved to `/app` directory (components, pages, plugins, assets, etc.)
- Path aliases: `@/` or `~/` → `/app`, `@@/` or `~~/` → project root
- API routes prerendered as static JSON files for SSG compatibility
- Async data handling with optional chaining to prevent undefined errors during navigation

### For Developers

For detailed information about the migration process, including lessons learned and troubleshooting guides, see [MIGRATION.md](./MIGRATION.md).

This guide is designed to be reusable for any Nuxt 3 to Nuxt 4 migration project and includes:

- Step-by-step migration phases
- Common issues and solutions
- Testing procedures
- Rollback procedures
- Best practices and lessons learned
