# Infonet Astro Migration — Design Spec

**Date:** 2026-05-26
**Site:** Infonet
**Source repo / branch:** `github.com/ICJIA/icjia-infonet-nuxt4` @ `feat/astro-migration` (from `main` @ `d725000`)
**Authoring model:** Claude Opus 4.7 (1M context) via superpowers:brainstorming
**Status:** Awaiting user review → next step is writing-plans (per-phase implementation plans)

---

## 1. Purpose & Non-Goals

### Purpose

Migrate the Infonet site from **Nuxt 4 + Vue 3 + Vuetify + Strapi + Fuse.js** to **Astro 6 + Alpine.js 3 + Tailwind 4 + Pagefind + Sharp**, achieving mobile Lighthouse Perf ≥ 98 (currently 55–61) with **zero visual or functional drift** vs the legacy production site.

### Non-goals

- **Redesign.** Managers approved the current look. This is a tech swap, not a redesign. Any visual or functional drift is a defect.
- **Feature additions.** New features wait until after cutover.
- **Content rewrites.** Existing markdown / Strapi content carries over unchanged.
- **Accessibility regression.** Legacy is already AA-clean (0 axe violations on 5 representative routes). Migration must preserve this and re-validate at every phase.

---

## 2. Inputs

| Field | Value |
|---|---|
| `{{SITE_NAME}}` | Infonet |
| `{{LEGACY_URL}}` | https://infonet.icjia.illinois.gov |
| `{{REPO_URL}}` | github.com/ICJIA/icjia-infonet-nuxt4 |
| `{{STRAPI_HOST}}` | infonet.icjia-api.cloud |
| Strapi GraphQL endpoint | https://infonet.icjia-api.cloud/graphql |
| Mount type | **Dedicated subdomain** (NOT path-mounted — Hard Rule #6 does not apply) |
| Closest reference migrations | IFVCC (`/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/`) for v6 patterns + DVFR (`/Volumes/satechi/webdev/icjia-dvfr-nuxt4/`) for Nuxt 4 source patterns |

---

## 3. Target Stack (versions per v6 checklist, 2026-05)

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Astro static | 6.3+ | `output: 'static'` |
| Styling | Tailwind 4 (vite plugin) | 4.3+ | `@theme` tokens calibrated to legacy Vuetify defaults |
| Typography | `@fontsource/<family>` | latest | Self-host fonts (Lato, Raleway, Roboto from current `fonts.googleapis.com` link) |
| Icons | Inline SVG (from MDI) | n/a | NEVER load `@mdi/font` (200 KB CSS for handful of icons) |
| Interactivity | Alpine.js 3 + `@alpinejs/focus` | 3.15+ | Bundled entry via BaseLayout, NOT `is:inline` |
| Search | Pagefind | 1.5+ | `pagefind --site dist` final build step; replaces Fuse.js |
| Images | Sharp + `fetch-cms-images.mjs` | 0.34+ | Tier 1 via `astro:assets <Image>`; Tier 2 via manifest pipeline |
| Markdown | `markdown-it` + `xss` + `rehype-external-links` | 14+ / 1.0+ / 3.0+ | Post-process for lazy/decoding + manifest image rewrite + heading ids |
| SEO | `astro-seo` | 1.1+ | `canonicalOverride` prop + `build-og-image.mjs` SVG→PNG pipeline (v6 §8) |
| Sitemap | `@astrojs/sitemap` | 3.7+ | Exact-suffix regex filter |
| Build tool | pnpm | 10.33+ | Hard Rule #3 |
| Runtime | Node | 22.22+ LTS | Pin in `netlify.toml [build.environment]` |
| Hosting | Netlify | n/a | 2-pass: `pnpm build && pnpm fetch:cms-images && pnpm build && pnpm pagefind` |

---

## 4. Baseline Audit (Phase 0 — already complete)

See `docs/perf/phase0-baseline-d725000.md`.

| | Legacy (worst → best) | Target | Gap |
|---|---|---|---|
| Mobile Perf | **55 → 61** | ≥ 98 | **+37 to +43** |
| Mobile A11y | 100 | 100 | 0 ✅ |
| Mobile BP | 100 | 100 | 0 |
| Mobile SEO | 92 → 100 | 100 | +8 on most routes (canonical missing) |
| axe-core AA | **0 violations** | 0 | 0 ✅ |

**Routes audited:** `/`, `/news/`, `/news/<slug>/`, `/faqs/`, `/contact/`.

**Headline:** site is already AA-clean; the migration's value is the Perf gap. Render-blocking ~4s + unused JS ~120–170 KiB + unused CSS ~95 KiB. Astro static + Tailwind 4 JIT + self-hosted fonts collapses all three.

**Risk callouts from baseline:**
- Home CLS 0.13 (Vuetify shell hydration shift) — Astro static eliminates this
- Home LCP 7.9s → must use CSS `background-image` for hero (not `<img>`) per IFVCC v6 lesson

---

## 5. Branch & Folder Layout

```
main                            (legacy Nuxt 4 keeps building; untouched until cutover)
  └── feat/astro-migration      (all migration work here)
        repo-root/
        ├── app/                ← legacy Nuxt 4 source (untouched until cutover)
        ├── content/            ← legacy markdown (untouched)
        ├── nuxt.config.js      ← legacy (untouched)
        ├── docs/
        │   ├── perf/           ← phase0-baseline-d725000.md ✅, phase1-<sha>.md, ...
        │   └── superpowers/
        │       ├── specs/2026-05-26-astro-migration-design.md  (this file)
        │       └── plans/2026-05-26-astro-migration-phase{1..7}.md
        └── astro/              ← new Astro 6 site (created Phase 1)
              ├── astro.config.ts
              ├── package.json  (pnpm 10, ESM, "type": "module")
              ├── pnpm-lock.yaml
              ├── netlify.toml
              ├── src/
              ├── scripts/
              └── public/
```

### Cutover commit (end of Phase 7, single atomic operation)

1. **Pause for explicit user authorization** (decision point — see §10)
2. Tag `v1-final` on the legacy state for recoverability
3. Delete root `app/`, `content/`, `creators/`, `server/`, `nuxt.config.js`, `package.json`, `yarn.lock`, `vitest.config.js`, `src/` (legacy Vue assets)
4. `mv astro/* astro/.* .` — Astro source becomes the repo root
5. `rmdir astro`
6. Replace root `netlify.toml [build]` with Astro build chain
7. Update `README.md` + `CHANGELOG.md` cutover entry
8. Bump `package.json` `version` to `3.0.0`
9. Tag `v3.0.0`
10. PR merge `feat/astro-migration` → `main` (pause for explicit user authorization to merge)
11. DNS stays unchanged — Netlify rebuilds `main` from new content; subdomain `infonet.icjia.illinois.gov` resolves to new Astro deploy.

---

## 6. Phase Structure

Each phase ends with a commit, a `docs/perf/phase<N>-<sha>.md` audit log, an updated v6 checklist (if a new lesson emerges), and an explicit user go-ahead before the next phase starts.

### Phase 1 — Scaffold

**Goal:** Empty `astro/` shell builds and deploys to Netlify branch preview with blank `BaseLayout`.

- `pnpm create astro` → `astro/`, `output: 'static'`, `trailingSlash: 'always'`
- pnpm 10 pin: `packageManager`, `engines.pnpm`, `PNPM_VERSION` in `netlify.toml`
- `@theme` tokens calibrated to legacy palette (grep `app/assets/`)
- `BaseLayout.astro`: skip-link + URL normalizer + `astro-seo` + Plausible (bare script tag with `data-domain="infonet.icjia.illinois.gov"`)
- `robots.txt`, `favicon.ico` carried over from `public/`
- `prebuild` + `ensure-manifest` hook (so dynamic imports resolve)
- **Exit gates:** `pnpm build` succeeds; blank `/` mobile Perf=100, A11y=100, BP=100, SEO=100 on Netlify branch preview.
- **Deliverable:** `docs/perf/phase1-<sha>.md`

### Phase 2 — Chrome Ports

**Goal:** Pixel-perfect site chrome (nav + sidebar + footer + breadcrumb + banner) vs legacy.

- `AppNav.astro` — `<details>`/`<summary>` desktop dropdowns + Alpine drawer toggle (replaces Vuetify `v-menu`/`v-app-bar`)
- `AppSidebar.astro` — Alpine focus-trap (`@alpinejs/focus`)
- `AppFooter.astro`, `Breadcrumb.astro`, `Banner.astro` (default slot for content)
- **Exit gates:**
  - viewcap diff vs legacy chrome — desktop + tablet + mobile + interactive states (dropdown open, drawer open, sidebar focus-trap)
  - mobile Perf ≥ 98 on `/`
  - axe-core AA = 0
- **Deliverable:** `docs/perf/phase2-<sha>.md`

### Phase 3 — Content Layer

**Goal:** Strapi loaders + markdown pipeline + content collections wired. No user-visible markup yet.

- First task: introspect `https://infonet.icjia-api.cloud/graphql` to detect Strapi v3 vs v4 response shape (record finding in plan + `docs/icjia-strapi-cheatsheet.md`)
- Strapi GraphQL loaders + Zod schemas (`.nullable().optional()` on every field — per Strapi cheatsheet)
- `.cache/strapi/<sha256>.json` build-time caching
- `markdown.ts` — markdown-it + xss + post-process for `loading="lazy"` + `decoding="async"` + manifest image rewrite + heading IDs + external-link `_blank`
- `AbortSignal.timeout(60_000)` on every Strapi fetch (Hard Rule #8 from v6)
- **Exit gates:** Loaders return data matching Zod schemas; markdown rendering parity check against 3 legacy pages.
- **Deliverable:** `docs/perf/phase3-<sha>.md`

### Phase 4 — Static Pages + Dynamic Routes

**Goal:** Every legacy URL resolves to 200. SimpleCard placeholder for listings (real cards come Phase 5a).

Routes to ship (14 total):

- **Static:** `index`, `404`, `translate`, `search` (shell only — Pagefind wiring in Phase 6), `contact`, `debug`, `data-and-publications`, `faqs/`
- **Dynamic via `getStaticPaths`:** `[...slug]`, `tabs/[...slug]`, `news/[slug]`, `meetings/[slug]`, `news/` (list), `meetings/` (list)
- CMS catch-all (`[...slug].astro`) with `RESERVED_SLUGS` filter to avoid clashes with static routes
- `/<route>/` canonical via `astro-seo` (the SEO=92 gap from baseline closes here)
- **Exit gates:**
  - All legacy URLs from `app/data/appRoutes.json` return 200 on branch preview
  - viewcap layout-only check on 14 routes (SimpleCard OK as placeholder)
  - mobile Perf ≥ 98
  - mobile SEO = 100 (canonical present)
- **Deliverable:** `docs/perf/phase4-<sha>.md`

### Phase 5a — Image Pipeline + Card Primitives

**Goal:** Real cards replace SimpleCard; Strapi images self-hosted via Sharp.

- `scripts/fetch-cms-images.mjs` — Sharp pipeline, manifest at `src/lib/cms-image-manifest.json` keyed by sha256 of source URL
- `CmsImage.astro` — responsive `<img srcset sizes>` with raw-URL fallback for misses
- Cards: `PostedMeta`, `LastUpdated`, `SplashNews`, `InfoCard`, `EventCard`
- Replace SimpleCard everywhere
- Wire `markdown.ts` image rewrite to use manifest
- Self-host orphan Strapi assets (one-time download via Thumbor cache → `public/`)
- **Exit gates:**
  - `grep -rn -E "thumbor|image\.icjia\.cloud|getImageURL" astro/src/` → only comments (Hard Rule #2)
  - viewcap diff on news list / news detail / data-and-publications matches legacy
  - mobile Perf ≥ 98 with real images
- **Deliverable:** `docs/perf/phase5a-<sha>.md`

### Phase 5b — Home Interactive Components

**Goal:** Home page matches legacy exactly; detail pages have TOC + read progress.

- `HomeSlider.astro` — Alpine carousel using CSS `background-image` (LCP-safe — matches Vuetify v-img semantics)
- `HomeFeatureBoxes` (cycling colors via `colors[i % length]`)
- `HomeEvents`, `HomePosts`
- Drop `HomeBoxes` IF legacy comments it out in rendered DOM (verify via `mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script` on legacy home, not just source — per migration prompt anti-pattern #2)
- `EventCalendar.astro` — Alpine month-grid only (no `role="grid"` — axe will flag)
- `ReadProgress.astro`, `Toc.astro` — port v2.3.9 scroll-spy logic from `src/components/Toc.vue` (commit `5fc29d0`)
- `prefers-reduced-motion: reduce` honored on every animation (Hard Rule #9)
- **Exit gates:**
  - viewcap diff: home (all slides + all states) + a TOC-bearing detail page, mobile + desktop + reduced-motion
  - LCP ≤ 2.5s on home
  - CLS = 0.00
  - mobile Perf ≥ 98
- **Deliverable:** `docs/perf/phase5b-<sha>.md`

### Phase 6 — Pagefind Search + Cleanup

**Goal:** `/search/` works; legacy Fuse.js + Vue search removed; no legacy refs remain in `astro/src/`.

- `pnpm pagefind` step (final build phase)
- `data-pagefind-body` on `<main>`, per-page `data-pagefind-meta`
- `/search/` route with Pagefind UI **dynamic `<script src>` load** (IIFE bundle, NOT ESM — per v6 anti-pattern)
- `?q=` deep-link via input event dispatch
- **Audit:** `grep -rn -E "GatedPage|vuex-persistedstate|vue-gtag|fuse\.js|thumbor|@nuxt|@vue|vuetify" astro/src/` → empty
- **Exit gates:**
  - 5 representative search queries return same top-5 results as legacy `/search/?q=...`
  - mobile Perf ≥ 98 on `/search/`
  - No legacy-stack imports anywhere in `astro/src/`
- **Deliverable:** `docs/perf/phase6-<sha>.md`

### Phase 7 — Audit-and-Trim + Cutover

**Goal:** Production-ready. Single atomic cutover commit per §5.

- `scripts/csp-hashes.mjs` — sweep `dist/**/*.html`, hash inline scripts, paste-ready `netlify.toml` snippet
- `scripts/build-og-image.mjs` — Sharp 1200×630 SVG→PNG (`font-family="sans-serif"` only — v6 Hard Rule #5; dual-write to `public/` + `dist/`)
- CSS subsetting / critical CSS inlining for final Perf push
- `@astrojs/sitemap` with exact-suffix regex filter (avoids over-aggressive exclusion)
- **Full viewcap sweep** — every route, every breakpoint, every interactive state. Drift triage: 4–6 commits to converge per IFVCC.
- **Pause for explicit user authorization** before cutover commit
- Cutover commit per §5: tag `v1-final` → delete legacy → `mv astro/* .` → flip `netlify.toml`
- Tag `v3.0.0`
- **Pause for explicit user authorization** before merging to `main`
- **Exit gates (production-ready):**
  - All public routes mobile Perf ≥ 98, A11y 100, BP 100, SEO 100
  - axe-core AA = 0 on all 4 representative template types
  - contrastcap AA = 0 failures
  - Pixel-perfect viewcap diff vs legacy on every route + every interactive state
- **Deliverable:** `docs/perf/phase7-<sha>.md` + `CHANGELOG.md` cutover entry + git tags `v1-final`, `v3.0.0`

---

## 7. Pixel-Perfect Viewcap Enforcement (per phase)

The pixel-perfect mandate is the single most load-bearing requirement of this migration. The user has explicitly affirmed: managers approved the legacy look; the tech changes, nothing visual or functional changes.

### Viewcap workflow

```
1. mcp__viewcap__take_screenshot   url=https://infonet.icjia.illinois.gov/<route>  → legacy.png
2. mcp__viewcap__take_screenshot   url=<branch-preview>/<route>                    → astro.png
3. Visual compare: side-by-side. Any drift > font-aliasing noise = defect.
4. Repeat at breakpoints: mobile (375px), tablet (768px), desktop (1280px).
5. Repeat for interactive states: hover, focus, :focus-visible, <details> open,
   drawer open, sidebar focus-trap, dropdown expanded.
```

### Per-phase viewcap scope (cumulative)

| Phase | Viewcap targets |
|---|---|
| Phase 1 | n/a — no user-visible markup |
| Phase 2 | Nav (desktop + mobile drawer + dropdown open), sidebar (open + focus-trap), footer, breadcrumb, banner — 6+ captures × 3 breakpoints |
| Phase 3 | n/a — data layer only |
| Phase 4 | Every of 14 routes at desktop + mobile = 28 pairs (layout container only — SimpleCard placeholders OK) |
| Phase 5a | News list, news detail, faqs list, data-and-pubs, splash — ~10 pairs across breakpoints |
| Phase 5b | Home (all slides + all states), TOC-bearing detail page, calendar — ~20 pairs (mobile + desktop + reduced-motion) |
| Phase 6 | `/search/` shell + result state + `?q=` deep-link — 3 pairs |
| Phase 7 | **Full sweep:** every route, every breakpoint, every state. 4–6 convergence commits expected. |

### Functional parity (also per-phase)

- Every form field accepts/validates same input
- Every link routes the same place
- Every hover state appears at the same trigger
- Every keyboard shortcut/focus order works the same
- Every collapsible matches initial open/closed state
- `prefers-reduced-motion` honored everywhere

If any drift > font-aliasing-noise appears in viewcap, the phase does not exit. Fix forward, re-capture, then proceed.

---

## 8. Hard Rules (non-negotiable, from migration prompt + v6 checklist)

1. **No Vue runtime.** Port to `.astro` + Alpine — no `@astrojs/vue`.
2. **No Thumbor at runtime.** Sharp pipeline; orphan assets self-hosted to `public/`.
3. **pnpm 10 only.** Pin in `packageManager`, `engines.pnpm`, `PNPM_VERSION` in `netlify.toml`.
4. **Pixel-perfect mandate.** Viewcap diff per phase (§7). Drift = defect.
5. **Per-phase audit gates:** mobile Perf ≥ 98, A11y = 100, BP = 100, SEO = 100, axe-core AA = 0, contrastcap = 0.
6. **Path-mount handling: N/A** for Infonet (dedicated subdomain).
7. **CSP `script-src 'self'`** + sha256 hashes for inline (Phase 7).
8. **`trailingSlash: 'always'`** + Netlify 200 rewrites for non-slash variants.
9. **`prefers-reduced-motion: reduce` honored** on every animation.
10. **`main` untouched until cutover.** Single atomic cutover commit. Pause for explicit user authorization before merging.

---

## 9. Identified Risks (Infonet-specific)

| # | Risk | Detection | Mitigation |
|---|---|---|---|
| 1 | Home LCP regression if HomeSlider uses `<img>` instead of CSS `background-image` | LCP > 2.5s on Phase 5b audit | CSS `background-image` only; chrome-devtools-mcp LCP element check |
| 2 | CLS regression from Alpine hydration | CLS > 0.05 on any phase audit | `x-cloak` on every above-fold `x-show`; `[x-cloak] { display: none !important }` in base CSS |
| 3 | Vuetify palette drift in Tailwind `@theme` calibration | viewcap diff at Phase 2 | Grep `app/assets/` for color vars first; calibrate `@theme` before any component ports |
| 4 | Strapi v3 vs v4 response-shape mismatch | Loader returns unexpected shape | Phase 3 first task: GraphQL introspection probe; document in plan + cheatsheet |
| 5 | Search index parity (Fuse.js → Pagefind) | User-reported search regression | Phase 6 exit gate: identical top-5 on 5 queries from legacy `/search?q=...` |
| 6 | Markdown content has legacy-style image references | Images broken in Phase 5a | `markdown.ts` post-process rewrites through manifest; fallback to raw URL |
| 7 | v2.3.9 TOC scroll-spy logic regression | viewcap + manual scroll test at Phase 5b | Port logic from commit `5fc29d0` / `src/components/Toc.vue` directly |
| 8 | v2.3.8 voluntary AAA fixes regression | axe-core `level=aaa delta=true` per phase on home/news/contact | Compare against legacy AAA delta; restore if any new AAA-only issue appears |
| 9 | Plausible analytics port (`@nuxtjs/plausible` → bare script) | DevTools network tab on Phase 1 audit | `BaseLayout` includes `<script defer data-domain="infonet.icjia.illinois.gov" src="https://plausible.io/js/script.js">` |
| 10 | Netlify primary-domain config | Branch preview hostname check pre-cutover | Verify branch preview accepts `infonet.icjia.illinois.gov`; flip primary at cutover |

---

## 10. Decision Points (pause for explicit user authorization)

1. **Before Phase 7 cutover commit** (per migration prompt rule #10 + v6 §13)
2. **Before tagging `v1-final`**
3. **Before merging `feat/astro-migration` to `main`**
4. **Any hard rule violation** that cannot be satisfied without user input (e.g., Strapi data shape not matching cheatsheet)

---

## 11. Execution Rhythm (per phase)

```
1. Write per-phase plan to docs/superpowers/plans/2026-05-26-astro-migration-phase<N>.md
   (use IFVCC plan as template — same shape, Infonet-specific tasks)
2. Dispatch IMPLEMENTER subagent wave (3–5 grouped tasks per wave)
3. Dispatch REVIEWER subagent wave (spec compliance + code quality)
4. Address reviewer findings (controller — main session — drives convergence)
5. Run audit gates:
   a. pnpm build → Netlify branch preview
   b. lightcap mobile audit on routes touched in this phase
   c. axecap AA on representative routes (axecap AAA delta on home/news/contact)
   d. contrastcap if color/contrast changed
   e. viewcap pixel-perfect diff per §7 scope for this phase
6. If any gate fails → fix forward, re-audit. Phase does not exit.
7. Commit + write docs/perf/phase<N>-<sha>.md
8. Update docs/astro-conversion-checklist-v6.2.md with any new abstractable lesson
9. Present results to user, get go-ahead for Phase N+1.
```

Wave size: 3–5 grouped tasks per subagent. Group by same-subdirectory creates or same-shape data ports. IFVCC ran ~25 implementer + ~25 reviewer dispatches across 7 phases — validated scale.

---

## 12. Deliverables Summary

- **This file:** `docs/superpowers/specs/2026-05-26-astro-migration-design.md`
- **Per-phase plans:** `docs/superpowers/plans/2026-05-26-astro-migration-phase{1..7}.md` (7 files — `5a`/`5b` may split per IFVCC convention)
- **Per-phase audit logs:** `docs/perf/phase{1..7}-<sha>.md` (Phase 0 already complete: `phase0-baseline-d725000.md`)
- **Astro source:** `astro/src/`, `astro/scripts/`, `astro/public/` (built at Phase 1, moved to repo root at cutover)
- **v6 checklist updates:** any new abstractable lesson appended to `docs/astro-conversion-checklist-v6.2.md`
- **Git tags:** `v1-final` (pre-cutover safety), `v3.0.0` (cutover commit)
- **Final commit:** atomic cutover on `feat/astro-migration`, merged to `main` only after explicit user authorization

---

## 13. Out of Scope

- Redesign of any page, component, or interaction
- New features (event RSVP, comments, gated content, etc.)
- Strapi schema changes (migration consumes existing schema as-is)
- Multilingual / `/translate` rework beyond what legacy already has
- Mobile-app companion
- Newsletter signup or any new third-party integration

---

## 14. Companion Documents

- `docs/llm-migration-prompt.md` — copy-paste prompt that bootstrapped this design
- `docs/astro-conversion-checklist-v6.2.md` — canonical playbook
- `docs/icjia-strapi-cheatsheet.md` — Strapi field renames, response-shape detection
- `docs/perf/phase0-baseline-d725000.md` — legacy site baseline (gap to target)
- IFVCC reference: `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/` (v6 source — copy patterns)
- DVFR reference: `/Volumes/satechi/webdev/icjia-dvfr-nuxt4/` (Nuxt 4 source playbook)
