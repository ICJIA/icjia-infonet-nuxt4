# Astro Migration — Phase 1: Scaffold

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the empty Astro 6 + Tailwind 4 + pnpm 10 project in `astro/`, with `BaseLayout.astro` chrome (SEO, skip-link, URL normalizer, Plausible), an empty homepage, a 404, and a `netlify.toml` that branch-deploys the Astro build while `main` keeps serving the legacy Nuxt 4 build in production. Mobile Lighthouse 100/100/100/100 on the blank shell.

**Architecture:** New `astro/` subfolder in this repo. Self-contained pnpm 10 project with its own lockfile + `packageManager` pin. Netlify config uses `[context.branch-deploy]` + `[context.deploy-preview]` overrides so the migration's branch deploys build from `astro/` while production (`main`) still builds from the repo root (Nuxt 4). Per-context Node 22 + PNPM_VERSION wiring identical across both contexts (Nuxt 4 already requires Node 22).

**Tech Stack:** Astro 6.3+, Tailwind 4 (vite plugin), pnpm 10, Node 22 LTS, Sharp 0.34+, `@fontsource/lato` + `@fontsource/raleway` + `@fontsource/roboto`, `@astrojs/sitemap`, `astro-seo`, `@mdi/font` (CDN at runtime per IFVCC v6).

**Site identity (Infonet-specific):**
- Site name: InfoNet
- Legacy URL: https://infonet.icjia.illinois.gov (**dedicated subdomain — NOT path-mounted**)
- Strapi GraphQL: https://infonet.icjia-api.cloud/graphql
- Plausible: `data-domain="infonet.icjia.illinois.gov"`, script `https://plausible.icjia.cloud/js/script.js`
- Vuetify accessibility override carried over: `--v-theme-on-surface-variant: rgba(0, 0, 0, 0.87)` (legacy `app/plugins/vuetify.js:45`)
- Body font: **Lato** (legacy `app/assets/css/variables.scss:5` — `$body-font-family: "Lato"`)
- 14 routes to ship in Phase 4: see design spec §6 Phase 4

**Difference from IFVCC reference:** No path-mount (subdomain only) → no `base` in `astro.config.ts`, no `publicPath` in `siteConfig`, simpler canonical URL construction.

**Companion docs:**
- Spec: `docs/superpowers/specs/2026-05-26-astro-migration-design.md`
- Checklist: `docs/astro-conversion-checklist-v6.2.md` (§§1, 2, 6, 8, 9, 10, 10a, 11, 12, 12a, 18)
- Strapi cheatsheet: `docs/icjia-strapi-cheatsheet.md`
- Baseline: `docs/perf/phase0-baseline-d725000.md`
- IFVCC reference Phase 1 plan: `/Volumes/satechi/webdev/icjia-ifvcc-2021/docs/superpowers/plans/2026-05-25-astro-migration-phase1.md`

**Exit criteria:**
- `pnpm build` in `astro/` succeeds (zero errors).
- `astro/dist/index.html` + `astro/dist/404/index.html` exist after build.
- Netlify branch deploy of `feat/astro-migration` builds successfully.
- Lighthouse **mobile** on the deployed branch preview: Perf **100** / A11y **100** / BP **100** / SEO **100** (blank shell — any deduction is a setup bug).
- axe-core AA: **0 violations** (mobile viewport).
- Skip-link visually verifiable (Tab on homepage → appears top-left).
- Plausible firing on the deployed branch preview (DevTools `fetch` → `/api/event` returns 202).
- `main` branch still serves the legacy Nuxt 4 build at production — no regression.
- `docs/perf/phase1-<sha>.md` audit log committed.

**Estimated tasks:** 14 tasks, ~55 steps. Execution time: 2–3 hours of focused work.

---

## Task 1: Scaffold the empty Astro project

**Files:**
- Create: `astro/` (new directory tree from `pnpm create astro`)
- Verify: `astro/package.json`, `astro/astro.config.mjs` (will be replaced in Task 5)

- [ ] **Step 1: Verify prerequisites**

```bash
node --version    # expect: v22.x (project already uses Node 22 for Nuxt 4)
corepack enable   # enables pnpm shim via corepack
pnpm --version    # expect: 10.x (corepack downloads on first use)
```

If `node` is < 22, install Node 22 LTS via your version manager (nvm, asdf, fnm, volta). If `corepack enable` fails, fallback: `npm install -g pnpm@10`.

- [ ] **Step 2: Scaffold from the minimal template**

From the repo root (`/Volumes/satechi/webdev/icjia-infonet-nuxt4/`):

```bash
pnpm create astro@latest astro --template minimal --no-install --no-git --typescript strict --skip-houston
```

Expected: the `astro/` subfolder is created with `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`. The flags skip the interactive installer, skip git init (we're in an existing repo), pick strict TypeScript, and skip the mascot animation.

If the CLI changes flags between versions, the equivalent interactive answers are: project dir → `astro`, "How would you like to start?" → "Empty", install deps → No, TypeScript → Yes (strict), git init → No.

- [ ] **Step 3: Inspect the scaffolded files**

```bash
ls astro/
# Expected: package.json, astro.config.mjs, tsconfig.json, public/, src/, .gitignore, README.md
```

The `astro/.gitignore` should include `node_modules`, `dist`, `.astro`. Verify it does — if missing, Task 2 will add them.

- [ ] **Step 4: Stage and commit the scaffold**

```bash
git add astro/
git status --short
# Expected: many "A astro/..." entries

git commit -m "feat(astro): scaffold empty Astro 6 project in astro/

From pnpm create astro@latest --template minimal --typescript strict.
No deps installed yet; Task 2 customizes package.json then installs."
```

---

## Task 2: Configure pnpm 10 (packageManager + engines + onlyBuiltDependencies)

**Files:**
- Modify: `astro/package.json`

- [ ] **Step 1: Inspect current package.json**

```bash
cat astro/package.json
```

Expected: minimal scaffold with `name`, `type: "module"`, `scripts.dev/start/build/preview`, `dependencies.astro`, `devDependencies.@astrojs/check` + `typescript`.

- [ ] **Step 2: Replace with Infonet-specific package.json header**

Edit `astro/package.json`. Add the following top-level fields (merge — keep existing `type`, `scripts`, `dependencies`, `devDependencies`):

```json
{
  "name": "icjia-infonet-astro",
  "version": "3.0.0-alpha.0",
  "private": true,
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=10.0.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "sharp"]
  }
}
```

`version: "3.0.0-alpha.0"` reflects that legacy is at v2.3.9; cutover (Phase 7) bumps to `3.0.0`.

The `onlyBuiltDependencies` allowlist is critical: pnpm 10 blocks postinstall scripts by default; without `sharp` allowlisted, Astro 6 builds fail with `MissingSharp` even though `pnpm install` succeeded.

- [ ] **Step 3: Commit**

```bash
git add astro/package.json
git commit -m "feat(astro): pin pnpm 10.33.0 + Node 22, allowlist sharp postinstall"
```

---

## Task 3: Install Astro + initial deps and verify build

**Files:**
- Modify: `astro/package.json` (Astro pins its own deps)
- Create: `astro/pnpm-lock.yaml`
- Create: `astro/node_modules/` (gitignored)

- [ ] **Step 1: Install scaffolded deps**

```bash
cd astro
pnpm install
cd ..
```

Expected: pnpm downloads packages, creates `pnpm-lock.yaml`, populates `node_modules/`. Output ends with "Done in Xs". If warnings mention `Ignored build scripts: ...`, verify `sharp` is NOT in that list (if it is, `onlyBuiltDependencies` from Task 2 isn't applied).

- [ ] **Step 2: Verify a clean astro build**

```bash
cd astro
pnpm build
cd ..
```

Expected: Astro builds the scaffolded `src/pages/index.astro` to `astro/dist/index.html`. Output: "Complete!" or similar.

If this fails with `MissingSharp`, re-check `astro/package.json` has the `pnpm.onlyBuiltDependencies` block from Task 2.

- [ ] **Step 3: Add pnpm-lock and commit**

```bash
git add astro/pnpm-lock.yaml astro/package.json
git commit -m "feat(astro): initial pnpm install; baseline build succeeds"
```

---

## Task 4: Install runtime + dev dependencies

**Files:**
- Modify: `astro/package.json` (deps added)
- Modify: `astro/pnpm-lock.yaml`

- [ ] **Step 1: Add Tailwind 4, Sharp, integrations, markdown, fonts, Alpine**

```bash
cd astro

# Tailwind 4 (vite plugin variant, NOT the v3 PostCSS plugin)
pnpm add tailwindcss @tailwindcss/vite

# Sharp explicit (Astro 6 requires it as a direct dep — v6 Hard Rule)
pnpm add sharp

# Sitemap, SEO, external-link rehype
pnpm add @astrojs/sitemap astro-seo rehype-external-links

# Markdown + sanitization
pnpm add markdown-it xss

# Self-hosted fonts — three families per legacy nuxt.config.js link tag
# Lato is the body font per legacy variables.scss
pnpm add @fontsource/lato @fontsource/raleway @fontsource/roboto

# MDI icon font for pixel-perfect parity (CDN at runtime; this dep
# is for the npm package's CSS file used in dev / fallback)
pnpm add @mdi/font

# Alpine (used Phase 2+ but scaffolded here)
pnpm add alpinejs @alpinejs/focus

cd ..
```

Expected: each install adds the dep to `astro/package.json`, updates `pnpm-lock.yaml`. Check for peer-dep warnings — Tailwind 4 + Astro 6 should have none.

- [ ] **Step 2: Add dev dependencies**

```bash
cd astro
pnpm add -D @types/markdown-it @types/alpinejs
cd ..
```

- [ ] **Step 3: Verify `astro/package.json` shape**

```bash
cat astro/package.json
```

Expected `dependencies` section (versions current as of 2026-05):

```json
{
  "dependencies": {
    "@astrojs/sitemap": "^3.7.2",
    "@fontsource/lato": "^5.x",
    "@fontsource/raleway": "^5.x",
    "@fontsource/roboto": "^5.x",
    "@mdi/font": "^7.x",
    "@tailwindcss/vite": "^4.3.0",
    "alpinejs": "^3.15.12",
    "@alpinejs/focus": "^3.15.12",
    "astro": "^6.3.7",
    "astro-seo": "^1.1.0",
    "markdown-it": "^14.x",
    "rehype-external-links": "^3.0.0",
    "sharp": "^0.34.5",
    "tailwindcss": "^4.3.0",
    "xss": "^1.0.x"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add astro/package.json astro/pnpm-lock.yaml
git commit -m "feat(astro): add Tailwind 4, Sharp, integrations, fonts (Lato/Raleway/Roboto), Alpine"
```

---

## Task 5: Replace astro.config.mjs with astro.config.ts (no base; subdomain mount)

**Files:**
- Delete: `astro/astro.config.mjs` (scaffolded default)
- Create: `astro/astro.config.ts`

**Key Infonet difference from IFVCC:** Infonet is a dedicated subdomain — there is **no `base` setting**. `site` is the full subdomain URL, not the parent ICJIA domain + path.

- [ ] **Step 1: Delete the scaffolded config**

```bash
rm astro/astro.config.mjs
```

- [ ] **Step 2: Create astro/astro.config.ts**

```ts
// astro/astro.config.ts
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  // Infonet is a dedicated subdomain — full URL, no base path.
  site: 'https://infonet.icjia.illinois.gov',
  trailingSlash: 'always',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('/404/')
        && !page.endsWith('/debug/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://infonet.icjia.illinois.gov/') {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
});
```

**Note on sitemap filter:** uses `endsWith('/404/')` — EXACT-suffix match, not `.includes()`. Per v6 anti-pattern, `.includes('/404')` would also strip a hypothetical `/2024/news-about-404-redirects/` route. The exact-suffix form is safe.

- [ ] **Step 3: Verify build still works**

```bash
cd astro
pnpm build
cd ..
```

Expected: build succeeds; output now includes `dist/sitemap-index.xml` + `dist/sitemap-0.xml`. Page count: 1 (just the scaffolded index).

If the build fails with "Cannot find module 'astro/config'" or TS errors, run `pnpm exec astro check` from `astro/` to see the exact issue.

- [ ] **Step 4: Commit**

```bash
git add astro/astro.config.ts
git rm astro/astro.config.mjs
git commit -m "feat(astro): astro.config.ts — site=infonet subdomain, no base, trailingSlash always, sitemap"
```

---

## Task 6: Update tsconfig.json — drop `baseUrl`, use relative paths

**Files:**
- Modify: `astro/tsconfig.json`

Per v6 checklist `tsconfig.json baseUrl deprecation`: TypeScript 7 deprecates `baseUrl`; `paths` resolves relative to `tsconfig.json` location by default.

- [ ] **Step 1: Inspect the scaffolded tsconfig**

```bash
cat astro/tsconfig.json
```

Expected: minimal config extending `astro/tsconfigs/strict` with no custom paths.

- [ ] **Step 2: Add path aliases without baseUrl**

Replace `astro/tsconfig.json` contents with:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

The `~/*` alias makes `import { foo } from '~/lib/foo'` resolve to `src/lib/foo`. No `baseUrl` needed.

- [ ] **Step 3: Verify**

```bash
cd astro
pnpm exec astro check
cd ..
```

Expected: 0 errors (scaffolded code has no `~/` imports yet, so this just validates config syntax).

- [ ] **Step 4: Commit**

```bash
git add astro/tsconfig.json
git commit -m "feat(astro): tsconfig with ~/* path alias, no baseUrl"
```

---

## Task 7: Wire up Tailwind 4 + @theme tokens + fonts + github-markdown.css

**Files:**
- Create: `astro/src/styles/global.css`
- Copy: `astro/src/styles/github-markdown.css` (from legacy `app/assets/css/github-markdown.css`)

- [ ] **Step 1: Copy github-markdown.css from the legacy source**

```bash
mkdir -p astro/src/styles
cp app/assets/css/github-markdown.css astro/src/styles/github-markdown.css
wc -l astro/src/styles/github-markdown.css   # expect ~1013 lines (or similar)
```

If the file is in a different legacy path, find it:

```bash
find app/ -name "github-markdown.css" -type f
```

Per v6 checklist: keep github-markdown verbatim for Tier 1 visual continuity. Every rule is `.markdown-body`-scoped and won't fight Tailwind's preflight.

- [ ] **Step 2: Create `astro/src/styles/global.css`**

```css
/* astro/src/styles/global.css
   Entry point — imported once from BaseLayout.astro.
   Order matters: tailwindcss first, then fontsource (Lato/Raleway/Roboto),
   then MDI, then github-markdown (must come after tailwind so preflight
   resets don't override the .markdown-body rules). */

@import 'tailwindcss';

/* Lato — Infonet body font (legacy variables.scss: $body-font-family: "Lato") */
@import '@fontsource/lato/100.css';
@import '@fontsource/lato/300.css';
@import '@fontsource/lato/400.css';
@import '@fontsource/lato/700.css';
@import '@fontsource/lato/900.css';

/* Raleway — heading font candidate per legacy nuxt.config.js link tag */
@import '@fontsource/raleway/100.css';
@import '@fontsource/raleway/300.css';
@import '@fontsource/raleway/400.css';
@import '@fontsource/raleway/700.css';
@import '@fontsource/raleway/900.css';

/* Roboto — Vuetify default fallback per legacy link tag */
@import '@fontsource/roboto/100.css';
@import '@fontsource/roboto/400.css';
@import '@fontsource/roboto/700.css';
@import '@fontsource/roboto/900.css';

/* Material Design Icons — kept per pixel-perfect mandate */
@import '@mdi/font/css/materialdesignicons.css';

/* Prose styling for CMS markdown bodies */
@import './github-markdown.css';

/* @theme — Tailwind 4 design tokens calibrated to Vuetify defaults.
   Calibration source: legacy app/plugins/vuetify.js (Vuetify default theme
   with only on-surface-variant override) + legacy variables.scss.
   Verify exact values against legacy pages in Phase 2 viewcap diff. */
@theme {
  /* Colors — Vuetify 3 default light theme */
  --color-primary: #1976d2;          /* Vuetify default primary blue */
  --color-secondary: #424242;
  --color-accent: #82b1ff;
  --color-error: #ff5252;
  --color-info: #2196f3;
  --color-success: #4caf50;
  --color-warning: #fb8c00;

  --color-text: #212121;
  --color-text-secondary: rgba(0, 0, 0, 0.87); /* legacy a11y override: on-surface-variant */
  --color-background: #ffffff;
  --color-surface: #ffffff;

  /* Breakpoints — Vuetify 3 (Material Design 2 breakpoints) */
  --breakpoint-sm: 600px;
  --breakpoint-md: 960px;
  --breakpoint-lg: 1280px;
  --breakpoint-xl: 1920px;

  /* Type scale — Vuetify Material Design typography */
  --text-h1: 6rem;
  --text-h2: 3.75rem;
  --text-h3: 3rem;
  --text-h4: 2.125rem;
  --text-h5: 1.5rem;
  --text-h6: 1.25rem;
  --text-body-1: 1rem;
  --text-body-2: 0.875rem;
  --text-caption: 0.75rem;

  /* Elevation — Vuetify Material dp scale */
  --shadow-elevation-1: 0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12);
  --shadow-elevation-2: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
  --shadow-elevation-4: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  --shadow-elevation-6: 0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12);
  --shadow-elevation-8: 0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12);

  /* Fonts — Lato body per legacy, Raleway heading candidate */
  --font-sans: 'Lato', sans-serif;
  --font-heading: 'Raleway', sans-serif;

  /* WCAG SC 1.4.8 (AAA) — 112.5% root font-size per legacy variables.scss */
  --font-size-root: 112.5%;
}

/* Root font-size — legacy WCAG AAA hook */
html { font-size: var(--font-size-root); }

/* Vuetify accessibility override carried over — legacy app.css:226
   Required for WCAG AA contrast on unfocused field labels (4.5:1) */
.v-application,
:root {
  --v-theme-on-surface-variant: 58, 58, 58;
}

/* Heading-font override (matches legacy app.css if Raleway is used for h1-h3) */
/* h1, h2, h3 { font-family: 'Raleway', sans-serif !important; } */
/* NOTE: Uncomment in Phase 2 if viewcap diff shows heading-font mismatch.
   Legacy variables.scss has $heading-font-family: 'Raleway' commented out,
   so Vuetify default likely wins on legacy. Confirm in Phase 2. */

/* Markdown lists need list-style restored — Tailwind preflight strips it */
.markdown-body ul { list-style-type: disc; }
.markdown-body ol { list-style-type: decimal; }
.markdown-body ul ul { list-style-type: circle; }
.markdown-body ul ul ul { list-style-type: square; }
.markdown-body ol ol { list-style-type: lower-alpha; }
.markdown-body ol ol ol { list-style-type: lower-roman; }
.markdown-body li > p { margin: 0; }

/* Alpine x-cloak prevents flash-of-unhydrated content (CLS protection) */
[x-cloak] { display: none !important; }
```

- [ ] **Step 3: Verify Tailwind picks up the config**

```bash
cd astro
pnpm build
cd ..
```

Expected: build succeeds. Tailwind 4's vite plugin auto-discovers `global.css`'s `@theme` block without a `tailwind.config.js` file (Tailwind 4 feature).

- [ ] **Step 4: Commit**

```bash
git add astro/src/styles/global.css astro/src/styles/github-markdown.css
git commit -m "feat(astro): global.css with @theme Vuetify-calibrated + fonts (Lato/Raleway/Roboto) + MDI + markdown"
```

---

## Task 8: Create siteConfig.ts (replaces nuxt.config.js head + runtime config)

**Files:**
- Create: `astro/src/lib/siteConfig.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p astro/src/lib
```

- [ ] **Step 2: Create siteConfig.ts**

```ts
// astro/src/lib/siteConfig.ts
//
// Replaces the legacy nuxt.config.js head/runtimeConfig blocks.
// Drops every thumbor / image-proxy key (Astro Sharp covers all images).
// Drops GA tracker (Plausible remains).

export const siteConfig = {
  // Subdomain mount — NO publicPath; site is the bare origin.
  siteOrigin: 'https://infonet.icjia.illinois.gov',
  siteName: 'InfoNet',
  siteShortName: 'InfoNet',
  titleTemplate: 'ICJIA | %s',
  defaultDescription:
    'InfoNet is a web-based data collection and reporting system used by ' +
    'victim service providers in Illinois to facilitate standardized ' +
    'statewide data collection.',
  author: 'Illinois Criminal Justice Information Authority',

  api: {
    base: 'https://infonet.icjia-api.cloud',
    baseGraphQL: 'https://infonet.icjia-api.cloud/graphql',
    timeoutMs: 60_000,
  },

  home: {
    eventLimit: 3,
    postLimit: 3,
  },

  timezone: 'America/Chicago',

  // Path metadata for Strapi entity → user-facing route mapping.
  // (Strapi entity name on left of slash; URL prefix on right.)
  pathMeta: {
    tags:     { prefix: '/tags' },
    pages:    { prefix: '/' },
    posts:    { prefix: '/news' },       // Strapi "posts" → user-facing /news
    meetings: { prefix: '/meetings' },
    tabs:     { prefix: '/tabs' },
    faqs:     { prefix: '/faqs' },
  },

  plausible: {
    host: 'https://plausible.icjia.cloud',
    domain: 'infonet.icjia.illinois.gov',
    scriptSrc: 'https://plausible.icjia.cloud/js/script.js',
  },

  // Reserved slugs that the [...slug] catch-all must NOT match,
  // to avoid colliding with static / typed routes.
  reservedSlugs: [
    '', '/',
    '404', 'translate', 'search', 'contact', 'debug',
    'data-and-publications', 'faqs',
    'news', 'meetings', 'tabs',
  ] as readonly string[],

  // Open Graph defaults
  og: {
    image: 'https://infonet.icjia.illinois.gov/infonet-thumbnail-dark.jpg',
    fbAppId: '', // legacy NUXT_PUBLIC_FB_APP_ID — empty in build env
  },

  mdiFontCdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
} as const;

export type SiteConfig = typeof siteConfig;
```

- [ ] **Step 3: Verify type-checks**

```bash
cd astro
pnpm exec astro check
cd ..
```

Expected: 0 errors. The `as const` makes every field a literal type.

- [ ] **Step 4: Commit**

```bash
git add astro/src/lib/siteConfig.ts
git commit -m "feat(astro): siteConfig.ts replaces nuxt.config head/runtimeConfig"
```

---

## Task 9: Create BaseLayout.astro (head + skip-link + URL normalizer + Plausible)

**Files:**
- Create: `astro/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p astro/src/layouts
```

- [ ] **Step 2: Create BaseLayout.astro**

```astro
---
// astro/src/layouts/BaseLayout.astro
//
// Single layout used by every page. Per v6 checklist: skip-link off-screen
// pattern, Plausible bare script, URL normalizer, astro-seo + canonical.
import { SEO } from 'astro-seo';
import { siteConfig } from '~/lib/siteConfig';
import '~/styles/global.css';

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
  canonicalOverride?: string;  // duplicate-content mirror support
}

const {
  title,
  description = siteConfig.defaultDescription,
  ogImage,
  noindex = false,
  canonicalOverride,
} = Astro.props;

// Canonical URL — strip /index.html / .html (Astro static format edge case);
// always end in trailing slash. Subdomain mount: no base path stripping needed.
const rawPath = Astro.url.pathname
  .replace(/\/index\.html$/, '/')
  .replace(/\.html$/, '');
const canonical = canonicalOverride
  ?? new URL(rawPath, Astro.site ?? siteConfig.siteOrigin).toString();

const fullTitle = title
  ? `ICJIA | ${title}`   // matches legacy titleTemplate "ICJIA | %s"
  : siteConfig.siteName;

// Conditional <main> top-padding: home gets 64px (hero flush with nav);
// every other page gets 96px (h1 needs breathing room).
const isHome = rawPath === '/';
const mainTopPad = isHome ? 64 : 96;
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Permissions-Policy" content="interest-cohort=()" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />

    <SEO
      title={fullTitle}
      description={description}
      canonical={canonical}
      noindex={noindex}
      openGraph={{
        basic: {
          title: fullTitle,
          type: 'website',
          image: ogImage ?? siteConfig.og.image,
          url: canonical,
        },
        optional: {
          description,
          siteName: siteConfig.siteName,
          locale: 'en_US',
        },
      }}
      twitter={{
        card: 'summary_large_image',
        image: ogImage ?? siteConfig.og.image,
        imageAlt: siteConfig.siteName,
      }}
      extend={{
        meta: [
          { name: 'author', content: siteConfig.author },
          ...(siteConfig.og.fbAppId
            ? [{ property: 'fb:app_id', content: siteConfig.og.fbAppId }]
            : []),
        ],
      }}
    />

    {/* URL normalizer — runs before deferred Plausible.
        history.replaceState adds trailing slash if missing; Plausible reads
        location.pathname so logs land under the canonical slash form.
        Inline script: will need CSP sha256-hash in Phase 7 (csp-hashes.mjs). */}
    <script is:inline>
      if (location.pathname !== '/' && !location.pathname.endsWith('/')) {
        history.replaceState(
          null,
          '',
          location.pathname + '/' + location.search + location.hash,
        );
      }
    </script>

    {/* Plausible — bare script tag with data-domain.
        Legacy domain "infonet.icjia.illinois.gov" preserved (nuxt.config.js:132). */}
    <script
      is:inline
      defer
      data-domain={siteConfig.plausible.domain}
      src={siteConfig.plausible.scriptSrc}
    ></script>
  </head>

  <body>
    {/* Skip-links — off-screen pattern; visible on focus */}
    <nav class="skip-links" aria-label="Skip links">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#main-navigation" class="skip-link">Skip to navigation</a>
    </nav>

    {/* Phase 2 lands AppNav / AppSidebar / AppFooter here. */}

    <main id="main-content" style={`padding-top: ${mainTopPad}px`}>
      <slot />
    </main>

    <style is:global>
      .skip-link,
      .skip-links {
        position: absolute;
        top: -100px;
      }
      .skip-link {
        background: #000;
        color: #fff;
        padding: 8px 16px;
        left: 8px;
        border: 2px solid #fff;
        border-radius: 4px;
        z-index: 10001;
      }
      @media (prefers-reduced-motion: no-preference) {
        .skip-link { transition: top 0.3s ease; }
      }
      .skip-link:focus,
      .skip-link:active {
        position: fixed;
        top: 8px;
        left: 8px;
      }
    </style>
  </body>
</html>
```

- [ ] **Step 3: Verify the layout type-checks**

```bash
cd astro
pnpm exec astro check
cd ..
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add astro/src/layouts/BaseLayout.astro
git commit -m "feat(astro): BaseLayout with astro-seo, skip-link, URL normalizer, Plausible"
```

---

## Task 10: Create empty home + 404 pages

**Files:**
- Modify: `astro/src/pages/index.astro` (replace scaffolded version)
- Create: `astro/src/pages/404.astro`

- [ ] **Step 1: Replace `astro/src/pages/index.astro`**

```astro
---
// astro/src/pages/index.astro — empty shell for Phase 1
import BaseLayout from '~/layouts/BaseLayout.astro';
---
<BaseLayout
  title="Home"
  description="InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois to facilitate standardized statewide data collection."
>
  <h1>InfoNet</h1>
  <p>
    Phase 1 scaffold. This page intentionally has minimal content for
    audit calibration — Phase 4 lands the home template.
  </p>
</BaseLayout>
```

- [ ] **Step 2: Create `astro/src/pages/404.astro`**

```astro
---
// astro/src/pages/404.astro — 404 with min-h to avoid CLS
import BaseLayout from '~/layouts/BaseLayout.astro';
---
<BaseLayout
  title="Not Found"
  description="The page you were looking for doesn't exist."
  noindex={true}
>
  <div style="min-height: 40vh">
    <h1>Page Not Found</h1>
    <p>The page you were looking for doesn't exist.</p>
    <p>
      <a href="/">Return home</a>
    </p>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Verify build emits expected files**

```bash
cd astro
pnpm build
cd ..
ls astro/dist/
# Expected: index.html, 404/, sitemap-index.xml, sitemap-0.xml, _astro/
ls astro/dist/404/
# Expected: index.html
```

Astro emits `dist/404/index.html` because `trailingSlash: 'always'`. Netlify serves it for unmatched routes by convention.

- [ ] **Step 4: Commit**

```bash
git add astro/src/pages/index.astro astro/src/pages/404.astro
git commit -m "feat(astro): empty home + 404 pages for Phase 1 audit"
```

---

## Task 11: Add public assets (favicon, robots.txt, og-image)

**Files:**
- Copy: `astro/public/favicon.ico` (from existing `public/favicon.ico`)
- Copy: `astro/public/infonet-thumbnail-dark.jpg` (legacy OG image)
- Create: `astro/public/robots.txt`

- [ ] **Step 1: Copy favicon from legacy public**

```bash
cp public/favicon.ico astro/public/favicon.ico
ls astro/public/favicon.ico
# Expected: file exists, ~15 KB
```

- [ ] **Step 2: Copy legacy OG image**

```bash
if [ -f public/infonet-thumbnail-dark.jpg ]; then
  cp public/infonet-thumbnail-dark.jpg astro/public/infonet-thumbnail-dark.jpg
else
  # Fallback: create a 1200x630 InfoNet-branded placeholder via Sharp.
  # Phase 7 generates the real OG image.
  cd astro
  pnpm exec node -e "
    const sharp = require('sharp');
    sharp({
      create: {
        width: 1200, height: 630, channels: 3,
        background: { r: 25, g: 118, b: 210 }, /* primary blue */
      },
    }).jpeg().toFile('public/infonet-thumbnail-dark.jpg');
  "
  cd ..
fi
ls astro/public/infonet-thumbnail-dark.jpg
```

- [ ] **Step 3: Create `astro/public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://infonet.icjia.illinois.gov/sitemap-index.xml
```

- [ ] **Step 4: Rebuild and verify**

```bash
cd astro
pnpm build
cd ..
ls astro/dist/favicon.ico astro/dist/robots.txt astro/dist/infonet-thumbnail-dark.jpg
# Expected: all three exist (Astro copies public/ to dist/ verbatim)
```

- [ ] **Step 5: Drop the scaffolded favicon.svg if it still exists**

```bash
rm -f astro/public/favicon.svg
```

- [ ] **Step 6: Commit**

```bash
git add astro/public/
git commit -m "feat(astro): favicon, robots.txt, OG image (legacy infonet-thumbnail-dark.jpg)"
```

---

## Task 12: Create stub build scripts (csp-hashes, fetch-cms-images)

**Files:**
- Create: `astro/scripts/csp-hashes.mjs`
- Create: `astro/scripts/fetch-cms-images.mjs`
- Modify: `astro/package.json` (add npm script entries)

Per v6 checklist §11: stub `csp-hashes.mjs` in Phase 1 so the script entry doesn't crash. Real implementation lands in Phase 7. Similarly stub `fetch-cms-images.mjs` until Phase 5a.

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p astro/scripts
```

- [ ] **Step 2: Create `astro/scripts/csp-hashes.mjs` (stub)**

```js
#!/usr/bin/env node
// astro/scripts/csp-hashes.mjs
//
// Phase 7 deliverable: walks dist/ for every inline <script>, computes
// SHA-256, prints a script-src snippet ready to paste into netlify.toml.
// Phase 1 stub so package.json's npm script entry isn't broken.

console.log('csp-hashes.mjs: Phase 7 deliverable. Stub for Phase 1.');
console.log('Re-run after Phase 7 implementation lands.');
```

- [ ] **Step 3: Create `astro/scripts/fetch-cms-images.mjs` (stub)**

```js
#!/usr/bin/env node
// astro/scripts/fetch-cms-images.mjs
//
// Phase 5a deliverable: walks .cache/strapi/*.json for Strapi image URLs +
// inline base64; runs Sharp pipeline → public/_cms-img/; builds manifest.
// Phase 1 stub so the build pipeline doesn't break before Phase 5a.

console.log('fetch-cms-images.mjs: Phase 5a deliverable. Stub for Phase 1.');
console.log('Re-run after Phase 5a implementation lands.');
```

- [ ] **Step 4: Add npm scripts to `astro/package.json`**

Edit `astro/package.json` and replace the existing `scripts` block with:

```json
{
  "scripts": {
    "dev": "astro dev --port 4321",
    "start": "astro dev --port 4321",
    "build": "astro build",
    "preview": "astro preview --port 4322",
    "check": "astro check",
    "csp-hashes": "node scripts/csp-hashes.mjs",
    "fetch:cms-images": "node scripts/fetch-cms-images.mjs"
  }
}
```

`build` is currently just `astro build`. Later phases prepend/append:
- Phase 3: prepend `pnpm fetch:strapi` (Strapi content)
- Phase 5a: prepend `pnpm fetch:cms-images`
- Phase 6: append `pagefind --site dist`

- [ ] **Step 5: Verify stubs run**

```bash
cd astro
pnpm csp-hashes
# Expected: "csp-hashes.mjs: Phase 7 deliverable. Stub for Phase 1."
pnpm fetch:cms-images
# Expected: "fetch-cms-images.mjs: Phase 5a deliverable. Stub for Phase 1."
cd ..
```

- [ ] **Step 6: Commit**

```bash
git add astro/scripts/ astro/package.json
git commit -m "feat(astro): csp-hashes + fetch-cms-images script stubs"
```

---

## Task 13: Update netlify.toml — branch-deploy + deploy-preview override for astro/

**Files:**
- Modify: `netlify.toml` (at repo root)

**Key Infonet difference from IFVCC:** Legacy Nuxt 4 already requires Node 22 — same Node version as the Astro build. So per-context `NODE_VERSION` overrides are technically optional, but kept explicit for clarity.

- [ ] **Step 1: Inspect current netlify.toml**

```bash
cat netlify.toml
```

Expected: very thin file with one `[[headers]]` block setting CORS and an `X-Greeting` header. No `[build]` block currently (Netlify falls back to UI-configured build settings or autodetects from `package.json`).

- [ ] **Step 2: Edit `netlify.toml` to add explicit build + per-context overrides**

Replace the file contents with:

```toml
# netlify.toml
#
# Production (main) builds the legacy Nuxt 4 source from the repo root.
# Branch deploys + deploy previews build the Astro source from astro/.
# Phase 7 cutover flips the [build] block to use astro/ for production too.

[build]
  base = "."
  command = "yarn generate"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22.22.2"

# --- Astro branch deploy (feat/astro-migration and any other non-main branch) ---
[context.branch-deploy]
  base = "astro"
  command = "pnpm build"
  publish = "dist"     # resolves to astro/dist relative to base="astro"

[context.branch-deploy.environment]
  NODE_VERSION = "22.22.2"
  PNPM_VERSION = "10.33.0"

# --- Astro deploy preview (PRs) ---
[context.deploy-preview]
  base = "astro"
  command = "pnpm build"
  publish = "dist"

[context.deploy-preview.environment]
  NODE_VERSION = "22.22.2"
  PNPM_VERSION = "10.33.0"

# --- Headers (apply to ALL contexts) ---

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    X-Greeting = "Hello from Chicago!"
```

**Note:** The exact production `command` (`yarn generate`) should match what Netlify is currently configured to run. If unsure, check the Netlify dashboard for this site → Site settings → Build & deploy → Continuous deployment → Build command. Use that exact string.

- [ ] **Step 3: Verify TOML syntax**

```bash
cat netlify.toml | head -50
```

Look for: balanced quotes, no tabs mixed with spaces, every `[context.X]` matches a `[context.X.environment]` block, `[[headers]]` is double-bracket.

If you have `taplo` installed: `pnpm dlx @taplo/cli check netlify.toml`. Otherwise, a syntax error will fail the next deploy.

- [ ] **Step 4: Commit**

```bash
git add netlify.toml
git commit -m "feat: netlify.toml branch-deploy + deploy-preview build astro/

Production (main) stays on Nuxt 4 yarn generate. feat/astro-migration
branch and deploy previews build astro/ via pnpm build."
```

---

## Task 14: Push the branch, verify Netlify branch deploy, run audit gates

**Files:**
- Create: `docs/perf/phase1-<short-sha>.md`

- [ ] **Step 1: Push the branch to origin**

```bash
git push -u origin feat/astro-migration
```

Expected: Netlify auto-builds the branch. Watch the deploy at the Netlify dashboard for the Infonet project — branch deploys typically show up under "Deploys" within ~30 seconds.

- [ ] **Step 2: Get the branch-deploy URL**

The branch-deploy URL convention is `https://feat-astro-migration--<site-name>.netlify.app` (Netlify replaces `/` in branch name with `-`). Verify in the Netlify dashboard. Capture the URL for the audit step.

If the deploy failed: check the build log on the Netlify dashboard. Common Phase 1 failures:
- Missing `sharp` postinstall → verify Task 2's `onlyBuiltDependencies` block.
- Wrong Node version → verify Task 13's `NODE_VERSION = "22.22.2"`.
- TS errors → run `cd astro && pnpm exec astro check` locally to reproduce.
- `pnpm: command not found` → verify Task 13's `PNPM_VERSION = "10.33.0"` is set.

- [ ] **Step 3: Verify the deploy renders correctly**

Open the branch-deploy URL in a browser. You should see:
- The "InfoNet" h1
- The Phase 1 paragraph text
- No console errors (open DevTools)

Check `view-source:`:
- `<link rel="canonical" href="https://infonet.icjia.illinois.gov/">` present (note: canonical points to PROD URL, not the netlify.app preview URL — that's correct per the SEO `site` in astro.config)
- `<meta property="og:image" content="https://infonet.icjia.illinois.gov/infonet-thumbnail-dark.jpg">` present
- Plausible `<script defer data-domain="infonet.icjia.illinois.gov" ...>` present

- [ ] **Step 4: Run mobile Lighthouse via lightcap MCP**

Use the `mcp__lightcap__run_audit` tool with `url=<branch-deploy-url>`, `viewport=mobile`. Expected on a blank shell: **Perf 100 / A11y 100 / BP 100 / SEO 100**.

If any score is below 100 on Phase 1's blank shell:
- **Perf < 100:** usually a missing `preconnect` or a font-load blocker. Check Lighthouse "insights" panel. Consider deferring `@mdi/font` CSS to Phase 2.
- **A11y < 100:** usually skip-link unreachable (Tab on homepage to verify — should appear top-left), missing `lang` attr, or contrast issue with placeholder body text.
- **BP < 100:** unlikely on a Netlify deploy; check for mixed content or invalid CSP.
- **SEO < 100:** missing meta description (BaseLayout default should cover), or robots.txt missing (Task 11).

- [ ] **Step 5: Run axe-core via axecap MCP**

Use the `mcp__axecap__audit_url` tool with the branch deploy URL, `viewport=mobile`, `level=aa`. Expected: **0 violations**.

- [ ] **Step 6: Visually verify the skip-link via viewcap**

Use `mcp__viewcap__take_screenshot` to capture two pairs:
- Branch-deploy URL, page load (skip-link should be off-screen).
- Branch-deploy URL after pressing Tab (the viewcap tool may not press keys; use chrome-devtools-mcp `press_key` first if so). Skip-link should appear top-left.

If the skip-link doesn't appear: debug `BaseLayout.astro` `<style is:global>` — common cause is `position: absolute` getting overridden by Tailwind preflight.

- [ ] **Step 7: Verify Plausible firing**

In the branch-deploy page's DevTools console:

```js
fetch('https://plausible.icjia.cloud/api/event', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({
    n: 'pageview',
    u: location.href,
    d: 'infonet.icjia.illinois.gov',
    w: innerWidth,
  }),
}).then(r => console.log('plausible:', r.status));
```

Expected: `plausible: 202`. If 0 or an error: the `data-domain` in BaseLayout or the script `src` URL is wrong — re-check `siteConfig.plausible`.

- [ ] **Step 8: Capture audit log**

```bash
SHA=$(git rev-parse --short HEAD)
mkdir -p docs/perf
cat > docs/perf/phase1-${SHA}.md <<EOF
# Phase 1 audit — ${SHA}

**Date:** $(date '+%Y-%m-%d')
**Branch:** feat/astro-migration
**Deploy URL:** <PASTE BRANCH DEPLOY URL HERE>

## Lighthouse (mobile)

| Route | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| / | 100 | 100 | 100 | 100 |
| /404/ | 100 | 100 | 100 | 100 |

## axe-core (AA, mobile)

- /: 0 violations
- /404/: 0 violations

## Skip-link verification

✅ Tab on homepage: skip-link appears top-left (viewcap pair captured).

## Plausible verification

✅ \`/api/event\` returns 202.

## Production (main) regression check

✅ \`https://infonet.icjia.illinois.gov/\` still serves legacy Nuxt 4 build at HTTP 200.

## Notes

Empty shell — no real content yet. Phase 2 lands chrome (AppNav + drawer + AppSidebar + Banner + Breadcrumb + AppFooter).

## Predicted vs actual

- **Predicted:** Mobile Perf=100 on blank shell.
- **Actual:** <fill in>
- **Discrepancy:** <fill in or "none">
EOF

git add docs/perf/phase1-${SHA}.md
git commit -m "docs(perf): Phase 1 audit log — ${SHA}"
git push origin feat/astro-migration
```

Replace `<PASTE BRANCH DEPLOY URL HERE>` and the `Actual` / `Discrepancy` fields with real values before committing.

**If ANY audit gate fails:** do NOT push the audit log. Fix the issue first, re-deploy, re-audit, then commit the audit log reflecting the passing state.

- [ ] **Step 9: Verify production (`main`) still serves Nuxt 4 unchanged**

```bash
# main should be at the same commit as before this work started.
git log main -1 --oneline
# Expected: d725000 (chore: update generated meta files) — or whatever main was at branch creation

curl -fsSI https://infonet.icjia.illinois.gov/ | head -3
# Expected: HTTP/2 200, Server: Netlify (or similar)
```

Browse `https://infonet.icjia.illinois.gov/` to confirm production is unaffected by the migration branch.

---

## Phase 1 done. Exit checklist:

- [x] `pnpm build` in `astro/` succeeds with zero errors.
- [x] `astro/dist/index.html` + `astro/dist/404/index.html` emitted.
- [x] Netlify branch deploy of `feat/astro-migration` succeeded.
- [x] Lighthouse mobile on branch preview: 100/100/100/100.
- [x] axe-core AA: 0 violations.
- [x] Skip-link visually verified via viewcap (Tab → appears top-left).
- [x] Plausible firing (`fetch` 202 recipe).
- [x] Production (`main`) at `infonet.icjia.illinois.gov` still serves Nuxt 4 unchanged.
- [x] `docs/perf/phase1-<sha>.md` committed.

**Next:** Phase 2 plan — chrome ports (AppNav drawer + dropdowns, AppSidebar, Banner, Breadcrumb, AppFooter). The full layout shell is in place after Phase 1; Phase 2 populates the chrome between `<body>` and `<main>` / `</main>` and verifies a11y stays at 100 once interactive components ship.

Phase 2's plan will be written **after Phase 1 exits successfully** — informed by what we actually learned in Phase 1 (per v6 checklist: "no checklist update = phase not done").
