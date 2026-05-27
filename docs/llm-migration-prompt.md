# LLM Migration Prompt — Vue 2/3 → Astro 6 / Alpine 3 / Tailwind 4

> **Purpose:** A copy-paste prompt for kicking off any future ICJIA Vue → Astro migration with an LLM (Claude, GPT, etc.). Captures the canonical workflow, hard rules, reference migrations, and required reading.
>
> **Provenance:** Distilled from the IFVCC migration (2026-05-25 → 2026-05-26) which produced the v5 checklist, then revised to v6 after IFVCC's post-cutover lessons landed (SEO/OG-image canonical pipeline, listing-page bucketing, legacy-source deletion). **Updated 2026-05-27 with v6.2 increment from the Infonet migration** (Tailwind utility classes for all flex/grid layouts, `inlineStylesheets` text-LCP vs image-LCP trade-off, eager+fetchpriority on first card image, YouTube facade pattern, `label-content-name-mismatch` removal of redundant aria-labels, MDC placeholder sentinel pattern, Strapi v3 base64 splash pipeline) **plus a flagship-scale pre-flight section** for the icjia.illinois.gov migration. Includes patterns validated across i2i, sfs, dvfr, r3, adultredeploy, ifvcc, infonet.

---

## Copy-paste prompt (start of new migration)

Paste the following into your LLM session to bootstrap a new migration. Adjust the **`{{SITE_NAME}}` / `{{LEGACY_URL}}` / `{{REPO_URL}}` / `{{STRAPI_HOST}}`** placeholders before sending.

````markdown
You are helping migrate the ICJIA `{{SITE_NAME}}` site from Vue 2/3 + Vuetify/Nuxt UI to Astro 6 + Alpine.js 3 + Tailwind 4. Production site: `{{LEGACY_URL}}`. Repo: `{{REPO_URL}}`. Strapi GraphQL endpoint: `https://{{STRAPI_HOST}}/graphql`.

## Required reading — before you touch anything

Read these in order. Each is the source of truth for its domain.

1. **`docs/astro-conversion-checklist-v6.md`** — the canonical migration playbook. Contains:
   - Hard rules (pnpm only, no Thumbor, no @astrojs/vue, pixel-perfect mandate)
   - Per-phase audit gates (mobile Lighthouse Perf ≥ 98, A11y 100, axe-core 0 violations, contrastcap 0 failures)
   - 100+ abstracted lessons from prior migrations grouped by topic
   - The "What changed v1 → v2 → v3 → v4 → v5 → v6" history (read the v5→v6 deltas first if you want the latest active conventions)

2. **`docs/icjia-strapi-cheatsheet.md`** — Strapi-specific reference:
   - Entity-name conventions (`posts` for news, `pages` for catch-all, `home` singleton, `events`, `councils`, `counties`, `tags`)
   - Field renames at load time (FAQ name/identifier/details/ranking → title/slug/body/ranking; news `dateOverride` → `created_at`)
   - Strapi v3 vs v4 response-shape detection (v3 returns `{<entity>: [...]}` directly; v4 nests under `data.attributes`)
   - Attachment shapes (`size` field is in KB despite the name)
   - GraphQL query patterns ported from legacy `src/graphql/*.js`

3. **Per-phase implementation plans** in `docs/superpowers/plans/<date>-astro-migration-phase{1..7}.md`. Use these as templates for the new migration. Each phase has:
   - 1-15 bite-sized tasks with verbatim code
   - Exit-gate criteria
   - Subagent-driven-development dispatch order (see "How to execute" below)

4. **Audit logs** in `docs/perf/phase<N>-<sha>.md` — Lighthouse + axe-core + contrastcap results per phase. Read the most recent one to know the current baseline before you start.

## Reference migrations — concrete code to copy from

When you need to see "how was X done before," go to these repos. Each is a complete migrated site you can read end-to-end.

| Site | Repo | Source stack | Tier | Notes |
|---|---|---|---|---|
| i2i | github.com/ICJIA/icjia-i2i-2024 | Nuxt 3 + Vuetify | v2 source | First migration; mobile Perf 100/100/100/100 on launch |
| SFS | github.com/ICJIA/icjia-sfs-2024 | Nuxt 3 + Vuetify | v3 source | Established CSP hash-all-inline-scripts rule |
| R3 | github.com/ICJIA/icjia-r3-2024 | Nuxt 3 + Vuetify | v3 follow-on | Reuse of v3 patterns |
| DVFR | github.com/ICJIA/icjia-dvfr-nuxt4 | Nuxt 4 + Nuxt UI 4 | v4 source | First Nuxt UI port; nested-landmark a11y patterns |
| Adultredeploy | github.com/ICJIA/adult-redeploy-client-next | Vue 2 SPA + Vuetify | v1 / Vue 2 lineage start | First Vue 2 → Astro; Alpine $store pattern |
| **IFVCC** | github.com/ICJIA/icjia-ifvcc-2021 | Vue 2 SPA + Vuetify | v6 source | Pagefind, manifest-driven CmsImage, 7 phases shipped, post-cutover SEO/OG-image canonical pipeline |
| **Infonet** (this repo) | github.com/ICJIA/icjia-infonet-nuxt4 | Nuxt 4 + Vuetify 3 + Strapi v4 + Strapi v3 (researchhub) | **v6.2 source — most recent + most complete** | Tailwind utility grids, YouTube facade, Chart.js lazy-load, Sharp+base64 Strapi v3 splash pipeline, label-content-name-mismatch sweep, inlineStylesheets trade-off doc |

**For a new Nuxt SSG migration, Infonet is the closest reference.** Copy patterns from `astro/src/` directly when in doubt.

**For a new Vue 2 SPA migration, IFVCC is the closest reference.** Copy patterns from `astro/src/` directly when in doubt.

**For the flagship migration (Vue 2 + Strapi v3 + 2000+ pages), read the "Flagship-specific concerns" section below + the "Flagship guidance" section of `astro-conversion-checklist-v6.md`.**

**For a new Nuxt SSG migration, DVFR is closest.**

## Hard rules (non-negotiable)

These rules cannot be relaxed. They come from accumulated audit findings, not opinion.

0. **Tailwind utility classes for EVERY responsive layout, especially flex/grid.** Vuetify `<v-row><v-col>`, `<v-container>`, and `d-flex`/`d-grid` patterns port to Tailwind utilities — NOT to scoped CSS grids with handwritten media queries. Reasons: (a) responsivity is the #1 cutover gate (375/768/960/1280/1920 px must all match legacy), (b) `min-[960px]:` arbitrary breakpoint is the ONLY way to match Vuetify md=960 px (Tailwind default md=768 px would switch 192 px early — pixel-perfect break), (c) breakpoint declarations belong in markup where they're auditable via grep, not buried in `<style>` blocks. Build a `<LayoutGrid cols mdCols lgCols gap>` Astro helper for the top 3-5 patterns at flagship scale. See v6 §"Infonet (2026-05-27)" for the canonical patterns.

1. **No Vue runtime.** Do NOT use `@astrojs/vue` integration. Port every component to native `.astro` + Alpine.js islands. The runtime budget difference is ~50 KB JS and a permanent CSP `'unsafe-eval'` requirement.

2. **No Thumbor at runtime.** Zero `image.icjia.cloud/<sig>/...` URLs in deployed HTML/CSS/JS. Use Astro's Sharp pipeline via `scripts/fetch-cms-images.mjs` for CMS-hosted images, `astro:assets <Image>` for local Tier 1 assets. Strapi assets that 404 (orphan from a Thumbor-cached URL) get one-time-downloaded via Thumbor URL, then self-hosted in `public/` (no runtime Thumbor dependency). Verify before every commit: `grep -rn -E "thumbor|image\.icjia\.cloud|getImageURL" astro/src/` — expect only comments.

3. **pnpm only.** No yarn, no npm. Pin via `packageManager: "pnpm@10.x"` + `engines.pnpm: ">=10.0.0"` + `PNPM_VERSION` in `netlify.toml`. Single committed `pnpm-lock.yaml` per project.

4. **Pixel-perfect mandate.** The managers approved a specific look. Your job is to change the underlying tech (Vue → Astro) without changing **anything** the user sees or does. Every page, every interaction, every form field, every hover state must match legacy. Visual diff via viewcap against the legacy production URL is the gate; document any drift in the phase audit log.

5. **Per-phase audit gates** (hard gates, no exceptions):
   - Mobile Lighthouse Perf ≥ 98 on every public route
   - Lighthouse A11y = 100 on every route
   - Lighthouse BP = 100, SEO = 100
   - axe-core AA: 0 violations on 4 representative templates
   - contrastcap AA: 0 failures
   - SiteImprove-clean: no 301 trailing-slash redirects (netlify.toml status=200 rewrites per v6 §10a)

6. **`base: '/<path>'` for path-mounted sites.** ICJIA's flagship + adult-redeploy + IFVCC live at `icjia.illinois.gov/<sitepath>/`. Set `base` in `astro.config.ts`; reference everywhere via `${siteConfig.publicPath}/...`. No hardcoded paths.

7. **CSP `script-src 'self'` for bundled, sha256 hashes for inline.** Phase 7's `scripts/csp-hashes.mjs` sweeps `dist/**/*.html`, hashes every inline `<script>` (skipping `src=`, `application/ld+json`, `application/json`), prints paste-ready snippet for `netlify.toml`.

8. **`trailingSlash: 'always'` + Netlify status=200 rewrites for non-slash variants.** SiteImprove flags 301s; rewrites avoid them.

9. **`prefers-reduced-motion: reduce` honored on every animation.** HomeSlider auto-rotation, x-transition.opacity, CSS transitions — all must respect the user's OS preference.

10. **Production master untouched until cutover.** All migration work on `feat/astro-migration` branch. `master` keeps building the legacy Vue 2 / Nuxt source. Single atomic cutover commit at the end (per v6 §13).

## Stack target (current as of 2026-05)

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Astro static | 6.3+ | Use `output: 'static'`. Don't pin to older minor. |
| Styling | Tailwind 4 (vite plugin) | 4.3+ | `@theme` tokens calibrated to legacy Vuetify defaults |
| Typography | `@fontsource/<family>` | latest | Self-host fonts (huge perf lever — +8 mobile Perf points avg) |
| Icons | Inline SVG paths from MDI library | n/a | NEVER load `@mdi/font` — 200 KB CSS for 3 used icons (Phase 2 lesson) |
| Interactivity | Alpine.js 3 + `@alpinejs/focus` | 3.15+ | Bundled entry via BaseLayout, NOT `is:inline` |
| Search | Pagefind | 1.5+ | `pagefind --site dist` final build step; replaces Fuse.js |
| Images | Sharp + custom `fetch-cms-images.mjs` | 0.34+ | Tier 1 via `astro:assets <Image>`; Tier 2 via manifest pipeline |
| Markdown | `markdown-it` + `xss` + `rehype-external-links` | 14+ / 1.0+ / 3.0+ | Post-process for lazy/decoding + manifest image rewrite + heading ids |
| SEO | `astro-seo` | 1.1+ | `canonicalOverride` prop pattern for duplicate-content mirrors + `build-og-image.mjs` SVG→PNG pipeline (per v6 §8) |
| Sitemap | `@astrojs/sitemap` | 3.7+ | Filter with EXACT-suffix regex (not `.includes()`) to avoid over-aggressive exclusion |
| Build tool | pnpm | 10.33+ | See rule #3 |
| Runtime | Node | 22.22+ LTS | Pin in `netlify.toml [build.environment]` |
| Hosting | Netlify | n/a | 2-pass build chain for image manifest: `pnpm build && pnpm fetch:cms-images && pnpm build && pnpm pagefind` |

## Phase structure

Default 7-phase plan (adjust per site complexity):

1. **Phase 1 — Scaffold.** `pnpm create astro`, pnpm 10 config, `@theme` tokens calibrated to legacy palette via grep of `src/assets/app.css`, BaseLayout shell (skip-link + URL normalizer + Plausible), `_redirects` rewrite for path-mount, `netlify.toml`, robots.txt, favicon, prebuild + ensure-manifest hook.

2. **Phase 2 — Chrome ports.** AppNav (`<details>` desktop dropdowns + Alpine drawer toggle), AppSidebar (Alpine focus-trap), AppFooter, Breadcrumb, Banner with default-slot content. `viewcap` diff vs legacy chrome.

3. **Phase 3 — Content layer.** Strapi loaders + Zod schemas (permissive `.nullable().optional()` everywhere), `.cache/strapi/` build-time caching, `markdown.ts` (markdown-it + xss + post-process for lazy/decoding + manifest lookup + heading id injection + external `_blank`).

4. **Phase 4 — Static pages + dynamic routes.** Every legacy route resolves. `getStaticPaths` for `<slug>/`, `news/<slug>/`, etc. CMS catch-all with RESERVED_SLUGS filter. `/<route>/` canonical mirror via `canonicalOverride` BaseLayout prop. SimpleCard placeholder for listings.

5a. **Phase 5a — Image pipeline + card primitives.** `fetch-cms-images.mjs` (Sharp, manifest at `src/lib/cms-image-manifest.json` keyed by sha256), `CmsImage.astro` (responsive `<img srcset sizes>` with raw-URL fallback), PostedMeta, LastUpdated, SplashNews, InfoCard, EventCard. Replace SimpleCard everywhere. Wire markdown.ts image rewrite.

5b. **Phase 5b — Home interactive components.** HomeSlider (Alpine carousel — use CSS `background-image` not `<img>`, matches Vuetify v-img), HomeBoxes (drop if legacy comments out `<HomeBoxes>`), HomeFeatureBoxes (cycling colors via `colors[i % length]`), HomeEvents, HomePosts, EventCalendar (Alpine month-grid only, drop legacy week/day/4day), ReadProgress, Toc. Wire into home + detail pages.

6. **Phase 6 — Pagefind search + cleanup.** `pnpm pagefind`, `data-pagefind-body` on `<main>`, per-page `data-pagefind-meta`, `/search/` route with Pagefind UI dynamic-script-load (IIFE bundle, NOT ESM), `?q=` deep-link via input event dispatch. Audit zero legacy refs (`grep -rn "GatedPage|vuex-persistedstate|vue-gtag|fuse\.js|thumbor"` in astro/src/).

7. **Phase 7 — Audit-and-trim + cutover.** `csp-hashes.mjs` real implementation, `build-og-image.mjs` (Sharp 1200×630), CSS subsetting / inlining for Perf, sitemap verification, **page-by-page viewcap diff vs legacy (pixel-perfect gate)**, cutover commit per spec §13 (delete `src/`, flip `netlify.toml [build]`, tag `v1-final`).

Each phase ends with a commit + `docs/perf/phase<N>-<sha>.md` audit log.

## How to execute

Use **superpowers:subagent-driven-development** (or similar dispatch tooling) — fresh subagent per wave, two-stage review (spec compliance + code quality) per wave, controller-driven audit at the end of each phase. Wave size: 3-5 logical groupings (don't dispatch every task as its own subagent — group same-subdirectory creates / same-shape data ports).

The IFVCC migration ran ~25 implementer subagent dispatches + ~25 reviewer dispatches + 7 controller audit waves to ship all 7 phases. That's the validated scale for a medium Vue 2 SPA.

## What to do first

1. Read `docs/astro-conversion-checklist-v6.md` end-to-end.
2. Read `docs/icjia-strapi-cheatsheet.md`.
3. Skim IFVCC's `astro/src/` to see real, production code (~30 files).
4. Read the IFVCC Phase 1 plan + Phase 1 audit log to see how a phase starts.
5. Check the legacy site's rendered DOM with Chrome DevTools `evaluate_script` — the SPA shell from `curl` is empty. **Inspect what's RENDERED, not what's WRITTEN in source.** (Phase 7 lesson — legacy Home.vue had `<HomeBoxes>` commented out in markup; only DOM inspection revealed this.)
6. Establish the per-phase audit baseline (mobile Lighthouse + axe-core + contrastcap on the legacy site itself, so you know what you're matching).
7. Set up `feat/astro-migration` branch + `astro/` subfolder + scaffold per Phase 1.
8. Ship one phase, audit, repeat.

## Anti-patterns to avoid

- **Porting `.vue` files as-is via `@astrojs/vue`.** See Hard Rule #1.
- **Reading legacy source code WITHOUT visiting the rendered DOM.** `<HomeBoxes>` commented-out trap.
- **Skipping the per-phase audit.** It catches real issues no plan predicts (HomeBoxes #9274F7 contrast failure, EventCalendar role=grid violation, .markdown-body a underline missing — all caught by axe in Phase 5b/7).
- **Assuming legacy Strapi URLs work.** Many 404 directly; only Thumbor cache works. Self-host orphan assets to `public/`.
- **Trusting "the spec says X" without verifying current state.** Specs were written before the actual data shape was known.
- **Promising Perf wins from image optimization when LCP is CSS-blocked.** Verify LCP element shape FIRST before predicting Perf delta.
- **Skipping `prebuild` hook for the manifest file.** Vite/Rollup resolves dynamic imports statically; missing JSON file = build crash.
- **Setting `role="grid"` on visual CSS grids.** axe-core's `aria-required-children` will flag.
- **Forgetting `data-pagefind-body` on `<main>`.** Pagefind otherwise indexes chrome + every page's nav links pollute the index.
- **Setting Pagefind UI via dynamic `import()`.** Pagefind UI is IIFE, registers `window.PagefindUI` via side-effect. Use `<script src>` + onload.
- **Promising the home page is pixel-perfect from component source alone.** Iterate against actual viewcap diffs against legacy — typically 4-6 commits to converge.

## Ask me anything

If anything in `v6.md` or the references is unclear, ask before guessing. Migrations fail when an LLM invents a pattern instead of looking at how it was done before.

Begin with: "I've read v6 and the Strapi cheatsheet. Ready to scaffold Phase 1 for {{SITE_NAME}}. Should I [a] proceed with the default 7-phase plan, [b] adapt scope for a smaller site, or [c] start with a scope-discovery spike?"
````

---

## What the LLM should produce

After paste-and-run, the LLM should:

1. **Confirm it has read** all the referenced docs (don't accept silent assumptions).
2. **Surface the open scope decisions** before writing code (default plan vs scope-spike).
3. **Write per-phase plans** matching the IFVCC plan structure (`docs/superpowers/plans/<date>-astro-migration-phase<N>.md`).
4. **Dispatch implementer + reviewer subagents** per wave (don't accept "let me write everything in one shot").
5. **Run per-phase audits** before claiming a phase done.
6. **Write audit logs** capturing PREDICTED vs ACTUAL Lighthouse / axe-core / contrastcap results — discrepancies are where lessons live.
7. **Update the v6 checklist** with any new abstractable lesson learned (per v6's "no checklist update = phase not done" rule).
8. **Pause before cutover** for explicit human authorization.

If the LLM tries to skip any of these, push back. Each one was a lesson paid for in a prior migration.

---

## Flagship-specific concerns (icjia.illinois.gov, 2000+ pages)

> **Read the full "Flagship (`icjia.illinois.gov`) — scale-specific guidance" section in `astro-conversion-checklist-v6.md`.** Below is the short list to surface in the kickoff LLM session.

The flagship is **categorically different** from every prior migration:

| Dimension | Prior (Infonet, IFVCC, DVFR) | Flagship |
|---|---|---|
| Page count | 30–60 | **2000+** |
| CMS | Strapi v4 (or none) | **Strapi v3 (flat response shape)** |
| Stack source | Nuxt 3/4 + Vuetify 3 OR Vue 2 + Vuetify 2 | **Vue 2 + Vuetify 2 (Vuex stores)** |
| Build time | 30 s – 3 min | **20–40 min cold** (likely exceeds Netlify free tier 15 min cap) |
| Listings | No pagination needed | **Astro `paginate()` mandatory** for news/publications/events |
| i18n | English only | **Likely Spanish translations** |
| Third-party scripts | 1 (Plausible) | **Likely 4–8** (GA/GTM/Translate/Maps/etc.) |
| PDF assets | A few dozen | **Hundreds**; URL stability is a permanent SEO obligation |
| Compliance pages | Standard ADA boilerplate | **State-required verbatim copy** + stable anchor IDs |

### Mandatory spike pre-work (4–8 hours BEFORE Phase 1)

1. **Route inventory.** Dump every `vue-router` path from legacy. Categorize: static / dynamic / catch-all CMS / hash-routed / authenticated. Ship a routes spreadsheet.
2. **Vuex audit.** For each store namespace, decide: build-time content, Alpine `$store`, Alpine `x-data`, or drop entirely.
3. **Build-time benchmark.** Scaffold 2000 dummy pages in a minimal Astro repo. Time `pnpm build`. Decide Netlify tier upgrade vs `.cache/strapi/` warming strategy.
4. **Strapi v3 schema dump.** GraphQL introspection on the production endpoint. Document every entity + every field. Identify which fields are inline base64 (Sharp pipeline) vs URLs (mirror script) vs free text.
5. **PDF inventory.** `find legacy/public -name "*.pdf"` + scrape Strapi for any `*.pdf` references in markdown bodies. Decide mirror script vs in-place keep.
6. **Third-party script CSP audit.** Every `<script src=...>` in legacy HTML. Decide drop, self-host, or whitelist.
7. **Content audit.** Cross-reference legacy URLs against Plausible page-views last 90 days. Identify the 25–40% of pages that are candidates for `/archive/` with noindex.
8. **i18n decision.** If Spanish content exists, decide Astro i18n config from Phase 1 (`prefixDefaultLocale: false`, locale routing strategy).

### Tailwind utility grids — flagship-scale playbook

The "Hard Rule #0" + v6.2 increment apply with **higher** stakes at 2000+ pages. A single wrong breakpoint = 2000 broken pages. Recommendations:

1. **Pre-Phase-1 layout audit.** `grep -rohE 'v-(row|col|container)\s*[^>]*' legacy/src/**/*.vue | sort | uniq -c | sort -rn` — top 50 layout patterns become a canonical translation table in `docs/layout-patterns.md`.
2. **`<LayoutGrid>` Astro helper component.** Encapsulates the common v-row → grid translation. Props: `cols mdCols lgCols gap`. Avoids 2000 pages each open-coding the same Tailwind class string.
3. **viewcap diff at 5 viewport widths** (375 / 768 / 1024 / 1280 / 1920) for at least 3 representative templates per route type **before** opening Phase 4. Pixel-perfect drift caught now prevents 2000-page propagation.
4. **Use `min-[960px]:` for every Vuetify md breakpoint.** Tailwind default `md:` (768 px) does NOT match Vuetify md (960 px). One project-wide grep before cutover: `grep -rn 'md:' src/ | grep -v 'min-\[' | grep -v 'mdCols' | grep grid-cols` should return empty.

### Two-pass build for the manifest pipeline (already in Infonet; SCALES at flagship)

The `astro build && fetch-cms-images && fetch-pdfs && astro build && pagefind && og:image` chain — exhibited in Infonet — is even more important at 2000+ pages because (a) Sharp processing time scales linearly, (b) the manifest stub committed in repo prevents first-build failures, (c) the final `pagefind` step indexes the fully-built dist/. Plan the chain in Phase 1, not Phase 5.

### Cutover at scale — DNS rollback, SiteImprove crawl, 301 diff

Single-commit cutover (v6 §13) is the canonical approach, but at 2000+ pages add three pre-cutover layers:

1. **48–72 hour preview window.** Deploy preview must be live + audited for at least 2 days before flipping `netlify.toml [build]`.
2. **Full SiteImprove crawl of preview URL.** SiteImprove finds dead links + a11y issues across all 2000 pages — a single Lighthouse audit can't.
3. **Sitemap diff.** `comm -23 <(legacy sitemap URLs) <(new sitemap URLs)` produces a list of URLs that need 301 redirects. Every line must have a `_redirects` entry or `netlify.toml` rule before cutover.

### Plausible custom events for Real User Monitoring (NEW for flagship)

Lighthouse is synthetic. The flagship's traffic profile (government users, rural Illinois connections, mixed device mix) needs Real User Monitoring. Ship from Phase 5 onward:

```js
// alpine-entry.ts
import { onCLS, onINP, onLCP } from 'web-vitals';
function send(metric) {
  if (typeof window.plausible !== 'function') return;
  window.plausible('Web Vitals', {
    props: { name: metric.name, value: Math.round(metric.value), rating: metric.rating },
  });
}
onCLS(send); onINP(send); onLCP(send);
```

Plausible's "Custom Events" tab then exposes CLS / INP / LCP percentiles by page — what users actually feel.

---

## Companion docs (read in order, end-to-end)

1. [`docs/astro-conversion-checklist-v6.md`](./astro-conversion-checklist-v6.md) — the playbook
2. [`docs/icjia-strapi-cheatsheet.md`](./icjia-strapi-cheatsheet.md) — Strapi specifics
3. [`docs/superpowers/specs/2026-05-25-astro-migration-design.md`](./superpowers/specs/2026-05-25-astro-migration-design.md) — IFVCC design spec (template)
4. [`docs/superpowers/plans/2026-05-25-astro-migration-phase1.md`](./superpowers/plans/2026-05-25-astro-migration-phase1.md) through `phase7.md` — IFVCC plans (templates)
5. [`docs/perf/phase1-<sha>.md`](./perf/) through `phase7-<sha>.md` — IFVCC audit logs (what good looks like)

## Migration tracker

Update this section as new migrations ship. Each row links to its repo + audit log.

| Migration | Status | Stack source | Phases done | Reference quality |
|---|---|---|---|---|
| adultredeploy | ✅ shipped 2025 | Vue 2 SPA + Vuetify | All 7 | v1 source |
| i2i | ✅ shipped | Nuxt 3 + Vuetify | All 7 | v2 source |
| SFS | ✅ shipped | Nuxt 3 + Vuetify | All 7 | v3 source |
| R3 | ✅ shipped | Nuxt 3 + Vuetify | All 7 | v3 follow-on |
| DVFR | ✅ shipped | Nuxt 4 + Nuxt UI 4 | All 7 | v4 source |
| **IFVCC** | ✅ shipped 2026-05 | Vue 2 SPA + Vuetify | All 7 + cutover + post-cutover SEO/bucketing pass | v6 source |
| **Infonet** | ✅ shipped 2026-05-27 | Nuxt 4 + Vuetify 3 + Strapi v4 (+ Strapi v3 researchhub) | All 7 + cutover + 3.2.x post-cutover Lighthouse polish | **v6.2 source — most current** |
| icjia.illinois.gov (flagship) | ⏳ next | Vue 2 SPA + Vuetify 2 + Strapi v3, 2000+ pages | — | **Spike first** (4–8 hr); harvest IFVCC + Infonet + adultredeploy lessons; see flagship-specific section below |
