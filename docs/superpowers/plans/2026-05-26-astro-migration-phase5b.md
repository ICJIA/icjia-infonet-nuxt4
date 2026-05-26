# Astro Migration — Phase 5b: Home interactive components

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Land the home page interactive widgets so home matches legacy pixel-perfect: blue "Illinois Criminal Justice Information Authority" badge + INFONET hero + tagline + body paragraph + LIST OF PARTNERS link + colored HomeBoxes grid + HomeBarGraph chart. Plus Toc + ReadProgress on detail pages. First formal viewcap pixel-perfect-vs-legacy diff on the FULL home page.

**Scope (Infonet-specific — narrower than IFVCC v6):**

Infonet's home uses fewer interactive widgets than IFVCC. Surveyed legacy home components:
- ✓ `HomeBoxes` — colored boxes grid (legacy `app/components/content/HomeBoxes.vue`)
- ✓ `HomeBarGraph` — chart "Domestic and Sexual Violence Victims..." (legacy `app/components/content/HomeBarGraph.vue` using `chart.js`)
- ✓ `HomeButtons` — secondary buttons
- ✓ `HomeSplash` — INFONET title hero (already handled in Phase 4 inline)
- ✓ `NewsCard` — news section items (similar to Phase 5a InfoCard)

NO HomeSlider (no hero carousel on this site). NO HomeEvents / EventCalendar (no events data source). NO HomePosts beyond what's already on `/news/`.

Additionally for detail pages (per design spec):
- `Toc.astro` — table of contents w/ scroll-spy (port v2.3.9 logic from legacy `src/components/Toc.vue` commit `5fc29d0`)
- `ReadProgress.astro` — scroll progress bar

**Architecture:**
- HomeBoxes — pure Astro + Tailwind, cycling colors via index modulo
- HomeBarGraph — port from Chart.js (`chart.js` in legacy package.json). Render via `<canvas>` + Alpine `x-init` to instantiate Chart.js on the client. Defer-loaded.
- Toc — Alpine `x-data` with `IntersectionObserver` to track current section
- ReadProgress — Alpine scroll listener computing % scrolled

**Companion docs:**
- Legacy `app/pages/index.vue` (698 lines)
- IFVCC references (use selectively):
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/Toc.astro`
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/ReadProgress.astro`
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/HomeBoxes.astro`
- Spec §6 Phase 5b

**Exit criteria:**
- HomeBoxes + HomeBarGraph rendering on `/`
- Toc + ReadProgress on news detail pages
- Mobile Lighthouse on `/`, `/news/<slug>/`: Perf ≥ 98, A11y/BP/SEO = 100
- axe-core AA = 0 on same 2 routes
- `prefers-reduced-motion: reduce` kills chart animation + scroll-progress animation
- **Formal viewcap pair vs legacy on home (desktop + mobile)** — drift documented

**Estimated tasks:** 5 tasks. Execution: ~60 min.

---

## Required reading

```bash
# Legacy home + bar graph + boxes
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/pages/index.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/HomeBoxes.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/HomeBarGraph.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/HomeButtons.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/HomeSplash.vue 2>/dev/null

# Legacy Toc (v2.3.9 scroll-spy logic — commit 5fc29d0)
git log --all --oneline -3 -- app/components/Toc.vue 2>/dev/null
find /Volumes/satechi/webdev/icjia-infonet-nuxt4/app -name "Toc.vue" -o -name "*Toc*.vue" 2>/dev/null
find /Volumes/satechi/webdev/icjia-infonet-nuxt4/app -name "*ReadProgress*" -o -name "*Progress*.vue" 2>/dev/null

# IFVCC references
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/HomeBoxes.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/Toc.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/ReadProgress.astro

# Current astro home (Phase 4 static-only version)
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/src/pages/index.astro
```

## Tasks

### Task 1: `HomeBoxes.astro`

Port from legacy `HomeBoxes.vue`. Likely structure:
- Grid of N colored boxes
- Each box: title, optional icon, link
- Colors cycle through a palette
- Mobile: stacks vertically
- Desktop: grid (likely 4 columns?)

Port to pure Astro + Tailwind. NO Alpine state needed — static markup.

For the box data, look at legacy — it's probably hardcoded array in the component OR pulled from a JSON. Port the array verbatim.

Use inline SVG for any icons (NO @mdi/font CSS).

Commit:
```
feat(astro): HomeBoxes.astro — colored grid component
```

### Task 2: `HomeBarGraph.astro`

The chart "Domestic and Sexual Violence Victims Who Received Services in Illinois, 2018-2024".

Legacy uses `chart.js` (in package.json). Port:
- Add `chart.js` to astro deps: `cd astro && pnpm add chart.js`
- Render `<canvas id="home-bar-graph" data-astro-cid-...>` in markup
- Use `<script>` with `import { Chart } from 'chart.js/auto'` to instantiate on mount
- Data: port the dataset from legacy (or use realistic placeholder if data source unclear)
- Honor `prefers-reduced-motion`: skip animation when set
- Use `aria-label` on canvas + provide a hidden `<table>` summary for screen reader accessibility (Chart.js canvases are NOT screen-reader-friendly by default — must provide tabular alternative)

Commit:
```
feat(astro): HomeBarGraph.astro — Chart.js bar chart with a11y fallback table
```

### Task 3: `Toc.astro` (table of contents w/ scroll-spy)

Port from IFVCC reference. Accepts a `headings: Heading[]` prop (from `markdown.ts.renderMarkdown()` return value).

Renders `<nav aria-label="Table of contents"><ol>...</ol></nav>`. Each item is a link to `#<heading.id>`.

Scroll-spy: Alpine `x-data` with `IntersectionObserver`:
- Observe all `[id]` headings in `<main>`
- The first one currently intersecting the viewport gets `aria-current="location"` on its TOC link
- Update on scroll

Match v2.3.9 logic from legacy `src/components/Toc.vue` (commit `5fc29d0`) — that fix corrected scroll-spy current-section tracking. Preserve the fix.

`prefers-reduced-motion`: no smooth-scroll animation.

Commit:
```
feat(astro): Toc.astro — table of contents with IntersectionObserver scroll-spy
```

### Task 4: `ReadProgress.astro`

Port from IFVCC. Top-of-page progress bar that fills as user scrolls.

Alpine `x-data` with scroll listener computing `(scrollY / (documentHeight - viewportHeight)) * 100`. Update CSS `width` of the bar.

Position: `position: fixed; top: 0; left: 0; height: 3px; background: <accent color>`. Z-index above AppNav (since AppNav is z:50, use z:51).

`prefers-reduced-motion`: keep static at 100% (don't animate transitions).

Commit:
```
feat(astro): ReadProgress.astro — scroll-progress bar atop AppNav
```

### Task 5: Wire into home + news detail + audit

**Update `astro/src/pages/index.astro`:** add `<HomeBoxes />` and `<HomeBarGraph />` below the hero section (after "LIST OF PARTNERS"). Match the legacy layout (boxes in a colored row, chart in right column on desktop).

**Update `astro/src/pages/news/[slug].astro`:** add `<ReadProgress />` at the top of `<BaseLayout>` slot, and `<Toc headings={headings} />` either:
- As a sticky sidebar on desktop (`<aside>` next to article)
- As a collapsible `<details>` at top on mobile

Pull headings from the `renderMarkdown(post.attributes.body)` return value.

Audit:
1. Full `pnpm build` (2-pass — fetch-cms-images then second build)
2. `pnpm preview` → lightcap mobile on `/` and `/news/<slug>/`
3. axe-core AA on same routes
4. **Viewcap pixel-perfect pair: legacy `/` vs Astro `/`** at desktop 1280×800 + mobile 375×812
5. Write `docs/perf/phase5b-<sha>.md`

Commit:
```
feat(astro): wire HomeBoxes/HomeBarGraph into home + Toc/ReadProgress into news detail
```

---

## Phase 5b exit checklist

- [x] HomeBoxes + HomeBarGraph rendering on `/`
- [x] Toc + ReadProgress rendering on news detail
- [x] Chart has hidden `<table>` fallback for screen readers
- [x] `prefers-reduced-motion: reduce` honored on chart + scroll progress
- [x] Mobile Lighthouse Perf ≥ 98 + A11y = 100 + axe AA = 0 on `/` and `/news/<slug>/`
- [x] viewcap legacy vs Astro home (mobile + desktop) captured with drift documented
- [x] `docs/perf/phase5b-<sha>.md` committed

## Next: Phase 6 — Pagefind search + cleanup

Phase 6 wires `/search/` with real Pagefind UI + audits zero legacy refs in `astro/src/`.
