# ICJIA InfoNet

<p align="center">
  <a href="https://infonet.icjia.illinois.gov">
    <img src="./public/og-image.png" alt="InfoNet — statewide victim-services data collection &amp; reporting system" width="800">
  </a>
</p>

<p align="center">
  <a href="https://app.netlify.com/sites/icjia-infonet/deploys"><img alt="Netlify status" src="https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status"></a>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-6-FF5D01?logo=astro&logoColor=white">
  <img alt="Alpine.js" src="https://img.shields.io/badge/Alpine.js-3-77C1D2?logo=alpine.js&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white">
  <img alt="Pagefind" src="https://img.shields.io/badge/Pagefind-1.5-7C3AED">
  <img alt="Node" src="https://img.shields.io/badge/Node-22%20LTS-339933?logo=node.js&logoColor=white">
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green">
</p>

Production source for [infonet.icjia.illinois.gov](https://infonet.icjia.illinois.gov).

**Stack:** Astro 6 · Alpine.js 3 · Tailwind 4 · Pagefind · Sharp · Strapi v4 GraphQL

The hero artwork above is generated from [`public/og-image.svg`](./public/og-image.svg) — edit the SVG and run `pnpm og:image` to regenerate the 1200×630 PNG used for Open Graph / Twitter cards.

InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois to facilitate standardized statewide data collection. This repo is the public website, migrated to Astro from Nuxt 4 + Vuetify in v3.0.0 (2026-05-26).

## Quick start

```bash
pnpm install          # one-time install
pnpm dev              # localhost:4321 — fast iteration (no fetch, no pagefind)
pnpm build            # full production build (2-pass + pagefind + og-image)
pnpm preview          # serve dist/ locally on :4322
pnpm check            # astro check (type + diagnostics)
```

### Build chain

`pnpm build` runs four sequential phases:

1. **First Astro build** — seeds `.cache/strapi/<sha256>.json` with GraphQL responses
2. **`fetch-cms-images`** — Sharp resamples Strapi attachments → `public/_cms-img/<hash>/<width>.<ext>` + `src/lib/cms-image-manifest.json`
3. **Second Astro build** — emits final HTML using the manifest for `<img srcset>` (zero Thumbor at runtime)
4. **`pagefind --site dist`** — generates search index under `dist/pagefind/`
5. **`og:image`** — Sharp SVG → 1200×630 PNG, dual-write `public/og-image.png` + `dist/og-image.png`

For dev iteration, `pnpm build:fast` skips the image fetch / pagefind / og steps.

## Project layout

```
/
├── src/
│   ├── components/       # AppNav, AppSidebar, AppFooter, Breadcrumb, HomeBoxes,
│   │                     # HomeBarGraph, Toc, ReadProgress, CmsImage, cards, etc.
│   ├── layouts/          # BaseLayout.astro (skip-link, SEO, URL normalizer, Plausible)
│   ├── lib/              # strapi.ts, queries.ts, schemas.ts, markdown.ts, dates.ts,
│   │                     # siteConfig.ts, menu.ts, cms-image-manifest.json
│   ├── pages/            # Static + dynamic routes (14 logical → 45 emitted)
│   ├── scripts/          # alpine-entry.ts (bundled Alpine + focus plugin)
│   └── styles/           # global.css (@theme, fonts, github-markdown.css)
├── scripts/              # build-og-image.mjs, csp-hashes.mjs, fetch-cms-images.mjs,
│                         # smoke-strapi.mjs, smoke-no-legacy.mjs
├── public/               # favicon, robots.txt, og-image.png, _cms-img/<hash>/...
├── docs/                 # Migration spec + per-phase plans + audit logs
└── netlify.toml          # Build config + CSP headers
```

## Hard rules (from migration spec)

- **pnpm 10 only.** No yarn, no npm.
- **No `@astrojs/vue`.** Every component is `.astro` + Alpine for interactivity.
- **No Thumbor at runtime.** All images self-hosted via Sharp pipeline.
- **Pixel-perfect mandate.** This is a tech swap, not a redesign — managers approved the legacy look. Visual or functional drift vs `infonet.icjia.illinois.gov` is a defect.
- **Per-phase audit gates (still in effect for any future change):** mobile Lighthouse Perf ≥ 98, A11y = 100, BP = 100, SEO = 100, axe-core AA = 0.
- **`trailingSlash: 'always'`** in `astro.config.ts`.
- **`prefers-reduced-motion: reduce`** honored on every animation.

## Migration history

The Vue 3 / Nuxt 4 / Vuetify 3 lineage shipped through v2.3.9 (2026-05-06). The Astro / Alpine / Tailwind cutover (v3.0.0, this commit) delivered:

| Mobile metric | v2.3.9 (legacy) | v3.0.0 (Astro) | Δ |
|---|---:|---:|---:|
| Perf | 55 – 61 | 98 – 100 | +37 to +43 |
| A11y | 100 | 100 | 0 |
| SEO | 92 – 100 | 100 | +8 on listing/detail/contact |
| axe-core AA | 0 | 0 | 0 |
| CLS (home) | 0.13 | 0.00 | -0.13 |

Full migration plan + per-phase audit logs are preserved under [`docs/`](./docs/) for institutional knowledge:

- [`docs/superpowers/specs/2026-05-26-astro-migration-design.md`](./docs/superpowers/specs/2026-05-26-astro-migration-design.md) — design spec
- [`docs/superpowers/plans/2026-05-26-astro-migration-phase{1..7}.md`](./docs/superpowers/plans/) — phase plans
- [`docs/perf/phase{0..7}-<sha>.md`](./docs/perf/) — phase audit logs
- [`docs/astro-conversion-checklist-v6.2.md`](./docs/astro-conversion-checklist-v6.2.md) — canonical ICJIA migration playbook. **v6.2 (2026-05-27) increment** adds Infonet post-cutover lessons (Tailwind utility grids for flex/grid layouts, `inlineStylesheets` text-LCP vs image-LCP trade-off, YouTube facade, MDC sentinel placeholders, Strapi v3 base64 splash pipeline) plus a full **Flagship (icjia.illinois.gov) scale-specific guidance** section for the upcoming 2000+-page Vue 2 + Strapi v3 migration.
- [`docs/icjia-strapi-cheatsheet.md`](./docs/icjia-strapi-cheatsheet.md) — Strapi reference (Infonet findings appended)
- [`docs/llm-migration-prompt.md`](./docs/llm-migration-prompt.md) — bootstrap prompt for the next ICJIA migration. **Updated 2026-05-27** with Hard Rule #0 (Tailwind utility classes for all flex/grid layouts) and a flagship-specific concerns section (build budget at scale, Strapi v3 vs v4 response shape, listings pagination, PDF URL stability, RUM via Plausible).

Rollback point: git tag `v1-final` preserves the final pre-cutover legacy state.

## License

See [LICENSE.md](./LICENSE.md).
