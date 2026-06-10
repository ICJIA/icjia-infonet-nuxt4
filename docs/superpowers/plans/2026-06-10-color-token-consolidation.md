# Color Token Consolidation Implementation Plan (dark-mode phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every hardcoded color literal in `src/` with CSS custom properties (semantic tokens), so a future `.dark` class can re-map the palette site-wide — with **zero visual change in light mode**.

**Architecture:** All tokens are defined once in the existing `@theme` block in `src/styles/global.css` (Tailwind 4 emits `@theme` variables as `:root` custom properties, so they are addressable from inline `style=""` attributes, scoped `<style>` blocks, and Tailwind arbitrary values alike). Components consume them via `var(--color-…)`. Phase 1 is mechanical and value-preserving: one token per distinct color value per *role* — no color consolidation, no new palette. Phase 2 (out of scope here) adds the `.dark` override block, the toggle, and the dark palette.

**Tech Stack:** Astro 6 components, Tailwind 4 `@theme` (via `@tailwindcss/vite`), plain CSS custom properties. No new dependencies.

**Verification model (this repo has no JS test suite):** each task uses a grep-based "failing test" (count of literals in the target files — nonzero before, zero after), `pnpm build:fast` as the compile gate, `mcp__axecap__audit_url` (or `pnpm` + manual axe) on affected pages for contrast regressions, and a viewcap screenshot eyeball against the pre-change screenshot. The site currently audits **axe AA-clean on all 45 pages and Lighthouse 100×4** — every task must keep it that way.

---

## Global rules (read before any task)

1. **Zero visual change.** Same value in → same value out, via a token. Never "simplify" two near-identical values into one (e.g. `#0d4470` vs `#0d4474`) in this phase. Exceptions allowed: pure case/length aliases (`#ffffff` → `--color-surface`, `#eeeeee` → `--color-surface-press`).
2. **Role beats value.** The same literal can map to *different* tokens depending on role, because roles diverge in dark mode. The big one: `#fff` as a **background/fill** → `--color-surface`; `#fff` as **text/icon/outline on a dark background** → `--color-on-dark`. Similarly `#555` as text → `--color-ink-soft`, but as the active-tab background → `--color-chrome-active`.
3. **Vendor file is off-limits:** `src/styles/github-markdown.css` keeps its literals (it is a vendored GitHub prose skin). Phase 2 will overlay `.dark .markdown-body { … }` or swap to the upstream dark build. Do not edit it in this phase.
4. **Component-local palettes** (DvAwarenessMonth purples) become *component-scoped* custom properties declared on the component's root in its own `<style>` block — still overridable from `.dark` later, but they don't pollute the global namespace.
5. **If you meet a literal not in the mapping table** (content drift since this plan was written): stop, add a row to the table in this document AND the token to `global.css` following the naming scheme, then continue. Never leave a literal behind silently.
6. **Whitelisted non-colors:** `src/lib/strapi.ts:44` contains `#201` inside a comment ("post #201") — not a color; leave it.
7. **SVG gotcha:** SVG *presentation attributes* (`fill="#0D4471"`) do **not** support `var()`. Move the fill into a `style` attribute (`style="fill: var(--color-brand-footer)"`) or a CSS rule. Plain HTML `style=""` attributes support `var()` fine.
8. **Tailwind arbitrary values:** `bg-[#f2f2f2]` → `bg-(--color-surface-band)` (Tailwind 4 parenthesized custom-property shorthand).
9. **Inline `box-shadow` triples** that exactly match a Vuetify elevation already tokenized in `@theme` (`--shadow-elevation-1/2/4/6/8`) → replace the whole shadow with `var(--shadow-elevation-N)`. Compare the triple exactly before substituting (the values are listed in `global.css:74-78`).
10. **Commit after every task** (conventional message given per task). Run `pnpm csp-hashes` before the final commit of the last task — none of these tasks should touch inline *scripts*, so the hash set must be unchanged; if it changed, you edited something you shouldn't have.

## The token block (Task 1 installs this verbatim)

Append inside the existing `@theme { … }` in `src/styles/global.css`, after the `--font-size-root` line:

```css
  /* ──────────────────────────────────────────────────────────────────
     Semantic color tokens — dark-mode phase 1 (2026-06-10 plan).
     Light values are the site's existing literals, captured 1:1.
     Phase 2 re-maps these under a `.dark` scope; until then this block
     must produce ZERO visual change. Naming: role, not value.
     ────────────────────────────────────────────────────────────────── */

  /* Brand blues — four near-identical values ported verbatim from legacy.
     Kept distinct on purpose (zero-visual-change rule); a future cleanup
     may collapse brand-deep/brand-footer after a viewcap diff. */
  --color-brand: #0d4270;            /* INFONET wordmark, buttons, links, chevrons */
  --color-brand-hover: #0a3050;      /* button hover */
  --color-brand-pressed: #0a3560;    /* darker hover variant (404 cards) */
  --color-brand-deep: #0d4474;       /* breadcrumb bar, home badge, home box 1 */
  --color-brand-footer: #0d4471;     /* footer band, home chart bars */
  --color-brand-home-title: #0b3a62; /* 75px INFONET home title */
  --color-brand-box-2: #1c5183;      /* home action box 2 */
  --color-brand-box-3: #3a5571;      /* home action box 3 */

  /* Links & focus */
  --color-link-strong: #0d47a1;      /* AA-safe blue on shaded fills (DAP CTA, search results) */
  --color-link-alt: #1e6bb8;         /* 404-page link blue */
  --color-link-alt-tint-25: rgba(30, 107, 184, 0.25);
  --color-link-alt-tint-35: rgba(30, 107, 184, 0.35);
  --color-link-deep: #0353a4;
  --color-accent-indigo: #1a237e;
  --color-input-focus: #1565c0;      /* contact field focus underline */
  --color-primary-tint: rgba(25, 118, 210, 0.12); /* aria-current row background */
  /* focus rings / aria-current text reuse the EXISTING --color-primary (#1976d2) */

  /* Ink (text) scale — distinct values kept distinct */
  --color-ink-max: #000;
  --color-ink-near: #111;
  --color-ink: #222;
  --color-ink-body: #333;
  --color-ink-mid: #444;
  --color-ink-soft: #555;
  --color-ink-muted: #666;
  --color-ink-faint: #888;
  --color-ink-hint: #999;
  --color-ink-label: #525252;        /* tabs hint text */
  --color-ink-87: rgba(0, 0, 0, 0.87);

  /* Text/icons sitting on dark backgrounds (diverges from surface in dark mode) */
  --color-on-dark: #fff;
  --color-on-dark-strong: rgba(255, 255, 255, 0.9);
  --color-on-dark-soft: rgba(255, 255, 255, 0.85);
  --color-on-dark-hover-bg: rgba(255, 255, 255, 0.08);

  /* Surfaces */
  --color-surface: #fff;             /* page/card/panel backgrounds (NOT on-dark text) */
  --color-surface-faint: #fafafa;
  --color-surface-fainter: #fbfbfb;
  --color-surface-soft: #f5f5f5;     /* form fields, noscript nav, debug pre */
  --color-surface-band: #f2f2f2;     /* home full-bleed gray bands */
  --color-surface-card: #f7f7f9;     /* search result cards (DVFR treatment) */
  --color-surface-hover: #f0f0f0;
  --color-surface-press: #eee;       /* (+ #eeeeee alias) */
  --color-surface-dim: #d8d8d8;
  --color-surface-chip: #f0f4f8;     /* DAP chips, btn-clear hover */
  --color-surface-chip-hover: #dce8f5;

  /* Borders */
  --color-border: #e0e0e0;
  --color-border-soft: #e5e5e5;      /* chart gridlines */
  --color-border-mid: #ddd;
  --color-border-input: #ccc;
  --color-border-strong: #aaa;       /* breadcrumb underline */
  --color-border-faint: #bdbdbd;     /* chart zero-axis */
  --color-border-card: #e2e2e8;      /* search result card hairline */
  --color-border-chip: #c5d5e8;

  /* Dark chrome (tabs components) */
  --color-chrome: #424242;           /* tablist background (same value as --color-secondary, distinct role) */
  --color-chrome-active: #555;       /* active tab background */

  /* Overlays */
  --overlay-hover: rgba(0, 0, 0, 0.04);
  --overlay-divider: rgba(0, 0, 0, 0.12);
  --overlay-scrim: rgba(0, 0, 0, 0.15);
  --overlay-scrim-mid: rgba(0, 0, 0, 0.2);  /* InfoCard hover shadow — added in Task 5 (rule 5 drift: value had no token) */
  --overlay-scrim-deep: rgba(0, 0, 0, 0.35); /* lightbox close-btn hover — added in Task 7 (rule 5 drift: value had no token) */
  --overlay-scrim-strong: rgba(0, 0, 0, 0.7); /* yt-facade play-button scrim — added in Task 8 (rule 5 drift: value had no token) */
  --overlay-brand-shadow: rgba(13, 66, 112, 0.12); /* 404 card hover shadow (brand-tinted) — added in Task 6 (rule 5 drift: value had no token) */
  --overlay-shadow-modal: rgba(0, 0, 0, 0.3); /* lightbox modal inner shadow — added in Task 7 (rule 5 drift: value had no token) */
  --overlay-backdrop: rgba(0, 0, 0, 0.5);   /* drawer backdrop */
  --overlay-backdrop-modal: rgba(0, 0, 0, 0.55); /* lightbox backdrop */

  /* States */
  --color-error-text: #c62828;
  --color-error-deep: #8e1f1a;
  --color-error-bg: #fdecea;
  --color-success-deep: #2e7d32;
  --color-mark: #fde68a;             /* search highlight */
  --color-note: blue;                /* tabs "mock data" note (legacy keyword) */
  --color-yt-play: #ff0000;          /* YouTube facade hover — brand red, stays in dark */
```

Notes:
- `rgba(0,0,0,0.2/0.14/0.12)` triples in box-shadows are NOT individual tokens — rule 9 maps whole shadows to the existing `--shadow-elevation-*` tokens.
- Existing `@theme` colors stay: `--color-primary` (#1976d2 — all focus outlines + `aria-current`), `--color-secondary`, `--color-error`, `--color-success`, `--color-text` (#212121), `--color-text-secondary`.
- `#169` (one hit, shorthand) — locate at execution; expected in a scoped style; map by role to `--color-link-deep` family or add a row.

## Task overview & file map

| Task | Scope | Files (literal counts at plan time) |
|---|---|---|
| 1 | Token block + grep harness | `src/styles/global.css` |
| 2 | Pilot: small chrome | `Breadcrumb` (9), `AppFooter` (9), `LastUpdated` (4), `PostedMeta` (1), `PageHeader` (2), `ReadProgress` (1) |
| 3 | Nav cluster | `AppNav` (38), `AppSidebar` (21) |
| 4 | Home cluster | `pages/index` (11), `HomeBoxes` (11), `HomeBarGraph` (13), `HomePosts` (4), `HomeFaqs` (10), `SplashNews` (12) |
| 5 | Content & cards | `NewsCard` (7), `EventCard` (11), `InfoCard` (11), `SimpleCard` (6), `Toc` (7), `pages/news/index` (2), `pages/news/[slug]` (2), `pages/[...slug]` (1), `pages/tabs/[...slug]` (2), `pages/faqs/index` (7) |
| 6 | Forms & utility pages | `contact` (19), `search` (12), `translate` (3), `404` (36), `data-and-publications` (22), `debug` (3) |
| 7 | MDC components | `TabsScreenshotsAccessible` (26 + `color: blue`), `TabsUserInfoAccessible` (16), `Partners` (4), `DvAwarenessMonth` (24 + `color: white`, component-scoped) |
| 8 | Globals & wrap-up | `global.css` own rules (yt-facade, skip-link in `BaseLayout` (3)), site-wide grep gate, CHANGELOG, version bump |

`github-markdown.css` — explicitly untouched (rule 3).

---

### Task 1: Install the token block + the grep harness

**Files:**
- Modify: `src/styles/global.css` (inside the `@theme` block, after `--font-size-root: 100%;`)

- [ ] **Step 1: Write the "failing test" — the literal counter**

Run this; it is the metric every later task drives to zero for its files:

```bash
grep -roE "#[0-9a-fA-F]{3,8}\b|rgba?\([0-9, .]+\)|color:\s*(blue|white)\b" src/ \
  --include="*.astro" --include="*.css" \
  | grep -v "src/styles/github-markdown.css" \
  | grep -v "src/styles/global.css" \
  | wc -l
```

Expected now: **~370** (nonzero = failing).

- [ ] **Step 2: Append the token block** from "The token block" section above, verbatim, inside `@theme`.

- [ ] **Step 3: Build to verify Tailwind accepts the tokens**

Run: `pnpm build:fast`
Expected: `46 page(s) built`, no errors. (Tokens are defined but unconsumed — output CSS grows slightly, pages unchanged.)

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css docs/superpowers/plans/2026-06-10-color-token-consolidation.md
git commit -m "feat(tokens): semantic color token layer in @theme (dark-mode phase 1, no consumers yet)"
```

---

### Task 2: Pilot — small chrome components

**Files:** Modify `src/components/Breadcrumb.astro`, `src/components/AppFooter.astro`, `src/components/LastUpdated.astro`, `src/components/PostedMeta.astro`, `src/components/PageHeader.astro`, `src/components/ReadProgress.astro`

This task exercises every replacement pattern once; later tasks repeat them at scale.

- [ ] **Step 1: Capture the before state**

```bash
mkdir -p /tmp/token-shots
# baseline screenshots (preview server: pnpm preview, port auto-bumps to 4323 if 4322 is busy)
# viewcap: http://localhost:4323/ and http://localhost:4323/news/<any-post>/
grep -coE "#[0-9a-fA-F]{3,8}\b|rgba?\([0-9, .]+\)" src/components/Breadcrumb.astro src/components/AppFooter.astro src/components/LastUpdated.astro src/components/PostedMeta.astro src/components/PageHeader.astro src/components/ReadProgress.astro
```

Expected: nonzero counts per file (9/9/4/1/2/1 at plan time).

- [ ] **Step 2: Replace literals via the mapping table.** Exemplars of each pattern:

Inline style attribute (Breadcrumb):
```astro
<!-- before -->
style="background:#0d4474;border-bottom:1px solid #aaa;font-size:13px;…"
<!-- after -->
style="background:var(--color-brand-deep);border-bottom:1px solid var(--color-border-strong);font-size:13px;…"
```

Scoped `<style>` (LastUpdated — keep the AA comment):
```css
color: var(--color-ink-muted); /* was #666 — 5.74:1 on white, AA-safe */
```

Role-split rule (AppFooter): footer band background `#0d4471` → `var(--color-brand-footer)`; white footer text → `var(--color-on-dark)` (NOT `--color-surface`).

- [ ] **Step 3: Verify zero literals remain in the task files**

```bash
grep -cE "#[0-9a-fA-F]{3,8}\b|rgba?\([0-9, .]+\)" src/components/Breadcrumb.astro src/components/AppFooter.astro src/components/LastUpdated.astro src/components/PostedMeta.astro src/components/PageHeader.astro src/components/ReadProgress.astro
```

Expected: `0` for every file.

- [ ] **Step 4: Build + visual + a11y check**

```bash
pnpm build:fast
```
Then viewcap the same two pages and compare against Step 1 (must be pixel-identical), and run axe (`mcp__axecap__audit_url`, level aa) on `http://localhost:4323/` and one news post. Expected: 0 violations.

- [ ] **Step 5: Commit**

```bash
git add src/components/Breadcrumb.astro src/components/AppFooter.astro src/components/LastUpdated.astro src/components/PostedMeta.astro src/components/PageHeader.astro src/components/ReadProgress.astro
git commit -m "refactor(tokens): migrate chrome components (Breadcrumb, AppFooter, meta lines) to color tokens"
```

---

### Task 3: Nav cluster (AppNav, AppSidebar)

**Files:** Modify `src/components/AppNav.astro`, `src/components/AppSidebar.astro`

- [ ] **Step 1: Failing grep** — same pattern as Task 2 Step 1 against the two files (38/21 expected).
- [ ] **Step 2: Replace.** Key mappings here: wordmark `#0d4270` → `var(--color-brand)`; subtitle `#000` → `var(--color-ink-max)`; item text `#333` → `var(--color-ink-body)`; `rgba(0,0,0,0.87)` → `var(--color-ink-87)`; hover `rgba(0,0,0,0.04)` → `var(--overlay-hover)`; dividers `rgba(0,0,0,0.12)` → `var(--overlay-divider)`; focus outlines `#1976d2` → `var(--color-primary)`; `aria-current` background `rgba(25,118,210,0.12)` → `var(--color-primary-tint)`; header/dropdown box-shadows → compare triples against `--shadow-elevation-*` (header bar = elevation-6 triple, dropdown = elevation-2 triple) and substitute the token; drawer backdrop `rgba(0,0,0,0.5)` → `var(--overlay-backdrop)`; noscript-nav `#f5f5f5`/`#0d4270` → `var(--color-surface-soft)`/`var(--color-brand)`; header/panel `background: #fff`/`#ffffff` → `var(--color-surface)`.
- [ ] **Step 3: Zero-grep** both files (expect 0).
- [ ] **Step 4: Build + viewcap home at desktop AND <960px (drawer open) + axe home.** Expected: identical pixels, 0 violations.
- [ ] **Step 5: Commit** — `refactor(tokens): migrate nav + drawer to color tokens`

---

### Task 4: Home cluster

**Files:** Modify `src/pages/index.astro`, `src/components/HomeBoxes.astro`, `src/components/HomeBarGraph.astro`, `src/components/HomePosts.astro`, `src/components/HomeFaqs.astro`, `src/components/SplashNews.astro`

- [ ] **Step 1: Failing grep** (11/11/13/4/10/12 expected).
- [ ] **Step 2: Replace.** Specific watch-outs:

Tailwind arbitrary values in `index.astro` (rule 8):
```astro
<!-- before -->  <section class="w-full bg-[#f2f2f2] px-8 pt-8 pb-12">
<!-- after  -->  <section class="w-full bg-(--color-surface-band) px-8 pt-8 pb-12">
```

SVG fills in `HomeBarGraph.astro` (rule 7 — presentation attrs can't take `var()`):
```astro
<!-- before -->  <rect … fill="#0D4471">           <line … stroke={tick === 0 ? '#bdbdbd' : '#e5e5e5'} …>  <text … fill="#666">
<!-- after  -->  <rect … style="fill: var(--color-brand-footer)">
                 <line … style={`stroke: var(${tick === 0 ? '--color-border-faint' : '--color-border-soft'})`} stroke-width="1" />
                 <text … style="fill: var(--color-ink-muted)">
```

`HomeBoxes.astro` box colors live in the frontmatter data array — swap the hex strings for token names and emit `style={`background: var(${box.color})`}`:
```ts
color: '--color-brand-deep',   // box 1 (was #0D4474)
color: '--color-brand-box-2',  // box 2 (was #1c5183)
color: '--color-brand-box-3',  // box 3 (was #3a5571)
```
Box text/icons `#fff` → `var(--color-on-dark)` (role rule). Home title `#0b3a62` → `var(--color-brand-home-title)`.

- [ ] **Step 3: Zero-grep** all six files.
- [ ] **Step 4: Build + viewcap `/` full page + axe `/`.** Expected identical, 0 violations.
- [ ] **Step 5: Commit** — `refactor(tokens): migrate home page cluster to color tokens`

---

### Task 5: Content & card components

**Files:** Modify `src/components/NewsCard.astro`, `src/components/EventCard.astro`, `src/components/InfoCard.astro`, `src/components/SimpleCard.astro`, `src/components/Toc.astro`, `src/pages/news/index.astro`, `src/pages/news/[slug].astro`, `src/pages/[...slug].astro`, `src/pages/tabs/[...slug].astro`, `src/pages/faqs/index.astro`

- [ ] **Step 1: Failing grep** across the ten files.
- [ ] **Step 2: Replace** via the table. Card headings use `'Raleway'` + `#0d4270`-family blues → `var(--color-brand)`; `#1a237e` → `var(--color-accent-indigo)`; muted metadata `#666` → `var(--color-ink-muted)`; borders `#e0e0e0` → `var(--color-border)`; FAQ chevron `#0d4270` → `var(--color-brand)`; faq summary `background: #fff` → `var(--color-surface)` (keep the axe-needs-resolvable-background comment).
- [ ] **Step 3: Zero-grep** all ten files.
- [ ] **Step 4: Build + axe `/news/`, one news post, `/faqs/`** (0 violations) + viewcap `/news/` and `/faqs/`.
- [ ] **Step 5: Commit** — `refactor(tokens): migrate content pages + card components to color tokens`

---

### Task 6: Forms & utility pages

**Files:** Modify `src/pages/contact.astro`, `src/pages/search.astro`, `src/pages/translate.astro`, `src/pages/404.astro`, `src/pages/data-and-publications/index.astro`, `src/pages/debug.astro`

- [ ] **Step 1: Failing grep** (19/12/3/36/22/3 expected).
- [ ] **Step 2: Replace.** Watch-outs:
  - `contact.astro`: field labels `#444` → `var(--color-ink-mid)`; focus underline `#1565c0` → `var(--color-input-focus)`; submit `#0d4270`/`#0a3050` → `var(--color-brand)`/`var(--color-brand-hover)`; success green `#2e7d32` → `var(--color-success-deep)`; error banner trio → `var(--color-error-bg)`/`var(--color-error-text)`/`var(--color-error-deep)`. The success/back-home inline styles (`color:#111`) → `var(--color-ink-near)`.
  - `search.astro`: card tokens `#f7f7f9`/`#e2e2e8` → `var(--color-surface-card)`/`var(--color-border-card)`; link `#0d47a1` → `var(--color-link-strong)` (keep the AA-ratio comment); `mark` `#fde68a` → `var(--color-mark)`. ALSO map Pagefind's own UI variables to tokens in the same `:global` block so phase 2 gets dark search for free:
    ```css
    :global(#pagefind-ui) {
      --pagefind-ui-text: var(--color-ink);
      --pagefind-ui-background: var(--color-surface);
      --pagefind-ui-border: var(--color-border-input);
      --pagefind-ui-primary: var(--color-link-strong);
    }
    ```
  - `404.astro`: largest single file (36) — link-alt blues `#1e6bb8` + tints → `var(--color-link-alt)`/`--color-link-alt-tint-25/35`; `#0353a4` → `var(--color-link-deep)`; `#d8d8d8` → `var(--color-surface-dim)`; locate the `#169` hit here or wherever the grep finds it and map by role (add a table row).
  - `data-and-publications/index.astro`: chips → `var(--color-surface-chip)`/`var(--color-border-chip)`/`var(--color-surface-chip-hover)`; active chip `#0d4270` → `var(--color-brand)`; CTA `#0d47a1` → `var(--color-link-strong)` (keep its AA comment).
- [ ] **Step 3: Zero-grep** all six files.
- [ ] **Step 4: Build + axe `/contact/`, `/search/?q=data` (waitFor `.pagefind-ui__result`), `/404.html`, `/data-and-publications/`** (0 violations) + viewcap `/404.html` and `/search/?q=data`.
- [ ] **Step 5: Commit** — `refactor(tokens): migrate forms + utility pages to color tokens; map Pagefind UI vars`

---

### Task 7: MDC components

**Files:** Modify `src/components/mdc/TabsScreenshotsAccessible.astro`, `src/components/mdc/TabsUserInfoAccessible.astro`, `src/components/mdc/Partners.astro`, `src/components/mdc/DvAwarenessMonth.astro`

- [ ] **Step 1: Failing grep** (26/16/4/24 + keyword hits `color: blue`, `color: white`).
- [ ] **Step 2: Replace.** Tabs components: tablist `#424242` → `var(--color-chrome)`; active tab `#555` → `var(--color-chrome-active)` (NOT ink-soft — role rule); tab text whites → `var(--color-on-dark)`/`-soft`/`-strong`; on-dark hover `rgba(255,255,255,0.08)` → `var(--color-on-dark-hover-bg)`; panels `#fafafa`/`#fbfbfb` → `var(--color-surface-faint)`/`-fainter`; `.ts-mock-note` `color: blue` → `var(--color-note)`; modal backdrop `rgba(0,0,0,0.55)` → `var(--overlay-backdrop-modal)`; card shadows → elevation tokens per rule 9.

  `DvAwarenessMonth.astro` (rule 4 — component-scoped). Declare on its root selector in the component `<style>`:
  ```css
  .dv-awareness {
    --dv-purple: #8b78b6;
    --dv-purple-deep: #7b68a6;
    --dv-slate: #5a6fa0;
    --dv-slate-deep: #4a5f8f;
    --dv-lavender-bg: #f3e5f5;
    --dv-on-accent: var(--color-on-dark);
  }
  ```
  (match the actual root class name in the file; if the purples appear with other values at execution time, extend the `--dv-*` set 1:1) — then consume via `var(--dv-…)` and replace `color: white` with `var(--dv-on-accent)`.
- [ ] **Step 3: Zero-grep** all four files (keyword grep too: `grep -nE "color:\s*(blue|white)\b" …` → 0).
- [ ] **Step 4: Build + axe `/screenshots/` and `/resources/`** (the pages that render these components; 0 violations) + viewcap `/screenshots/` (tabs + open the lightbox manually once).
- [ ] **Step 5: Commit** — `refactor(tokens): migrate MDC components to tokens; DvAwarenessMonth gets scoped --dv-* palette`

---

### Task 8: Globals, gate, and release

**Files:** Modify `src/styles/global.css` (its own non-token literals: yt-facade red/black/white, markdown-iframe rules), `src/layouts/BaseLayout.astro` (skip-link `#000`/`#fff` → `var(--color-ink-max)` bg + `var(--color-on-dark)` text/border), `CHANGELOG.md`, `package.json`

- [ ] **Step 1: Replace the global.css + BaseLayout literals.** yt-facade: `background: #000` → `var(--color-ink-max)`; play-button red `#ff0000` → `var(--color-yt-play)`; focus outline `#0d4270` → `var(--color-brand)`; `rgba(0,0,0,0.7)` play scrim stays a one-off → add `--overlay-scrim-strong: rgba(0, 0, 0, 0.7);` to the token block + table.
- [ ] **Step 2: The site-wide gate — run the Task 1 Step 1 grep again.**

Expected: **0** (the `-v` exclusions for `github-markdown.css` and the token definitions in `global.css` remain).

- [ ] **Step 3: Full verification**

```bash
pnpm check          # 0 errors
pnpm build:fast && pnpm pagefind
pnpm csp-hashes     # hash set must be UNCHANGED vs netlify.toml (rule 10)
```
Then axe the spot set (`/`, `/faqs/`, `/search/?q=data`, `/screenshots/`, `/contact/`, one news post, `/404.html`) — 0 violations everywhere — and a final viewcap pass on `/` and `/screenshots/`.

- [ ] **Step 4: CHANGELOG `[3.3.1]` entry + version bump** describing the token layer (no visual change, dark-mode phase 1 groundwork; `github-markdown.css` deliberately excluded).
- [ ] **Step 5: Commit**

```bash
git add -A ':!.vscode'
git commit -m "refactor(tokens): complete color-token consolidation (dark-mode phase 1) — zero literals outside vendor CSS"
```

---

## Phase-2 retheme hazards (role-mismatched value matches)

Phase 1 maps by VALUE; these spots use a token whose ROLE will diverge in dark
mode (shadows stay black while dividers/surfaces flip). Each carries a
`(legacy …)` comment inline; this list is the greppable set to revisit when
defining the dark palette:

- `src/components/SplashNews.astro` — `box-shadow: 0 4px 16px var(--overlay-divider)` (shadow color using the divider token)
- `src/components/AppSidebar.astro` — drawer `box-shadow: 2px 0 8px var(--overlay-scrim)` (shadow color using the scrim token)
- `src/components/HomeBarGraph.astro` — `border: 1px solid var(--color-surface-press)` (border using a surface token; consider a `--color-border-press` alias in phase 2)
- `src/components/NewsCard.astro` — `border: 1px solid var(--color-surface-press)` (border using a surface token, same pair as HomeBarGraph)
- `src/components/NewsCard.astro` — `box-shadow: 0 2px 10px var(--overlay-divider)` (shadow color using the divider token)
- `src/components/EventCard.astro` — `box-shadow: 0 4px 16px var(--overlay-scrim)` (shadow color using the scrim token)
- `src/components/InfoCard.astro` — `box-shadow: 0 0 15px var(--overlay-scrim-mid)` (shadow color using an overlay token; `--overlay-scrim-mid` added in Task 5 via rule 5 — rgba(0,0,0,0.2) had no token)
- `src/components/InfoCard.astro` — `border: 1px solid var(--color-surface-faint)` (image hairline border using a surface token)
- `src/components/SimpleCard.astro` — inline `onmouseover` shadow `0 4px 12px var(--overlay-divider)` (shadow color using the divider token, set via `el.style` in an inline handler)
- `src/pages/search.astro` — result card `box-shadow: 0 1px 2px var(--overlay-hover)` (shadow color using the hover-overlay token)
- `src/pages/search.astro` — result card hover `box-shadow: 0 4px 8px var(--overlay-divider)` (shadow color using the divider token)
- `src/pages/404.astro` — search input `box-shadow: 0 1px 2px var(--overlay-hover)` (shadow color using the hover-overlay token)
- `src/pages/404.astro` — quick-link card resting `box-shadow: 0 1px 2px var(--overlay-hover)` (shadow color using the hover-overlay token)
- `src/pages/404.astro` — quick-link card hover `box-shadow: 0 4px 12px var(--overlay-brand-shadow)` (brand-tinted shadow; `--overlay-brand-shadow` added in Task 6 via rule 5 — rgba(13,66,112,0.12) had no token)
- `src/pages/data-and-publications/index.astro` — card hover `box-shadow: 0 4px 12px var(--overlay-divider)` (shadow color using the divider token)
- `src/components/mdc/TabsScreenshotsAccessible.astro` — modal inner `box-shadow: 0 8px 32px var(--overlay-shadow-modal)` (shadow color using an overlay token; `--overlay-shadow-modal` added in Task 7 via rule 5 — rgba(0,0,0,0.3) had no token)
- `src/components/mdc/DvAwarenessMonth.astro` — card resting `box-shadow: 0 2px 6px var(--overlay-divider)` (shadow color using the divider token)
- `src/components/mdc/DvAwarenessMonth.astro` — card hover `box-shadow: 0 8px 16px var(--overlay-scrim)` (shadow color using the scrim token)
- Partners.astro / DvAwarenessMonth.astro — link color uses var(--color-input-focus) (#1565c0 value-match; rename or alias to a link token in phase 2)

Rule for remaining tasks: non-elevation box-shadow colors map to the
value-matching overlay token + legacy comment AND get a row added here.

---

## Out of scope (phase 2 — separate plan)

- The `.dark` palette values, the `@custom-variant dark` wiring, the toggle component (+ localStorage + `prefers-color-scheme` default + FOUC-prevention inline script, which WILL add a CSP hash), dark `markdown-body` prose skin, dark Pagefind values, and the full dark-mode AA contrast audit.

## Self-review notes

- Coverage: every file from the literal inventory (38 files) is assigned to a task or explicitly excluded (`github-markdown.css` vendor; `strapi.ts` whitelist; `debug.astro` included in Task 6).
- Token names used in Tasks 2–8 all exist in the Task 1 block (checked: brand family, ink scale, surfaces, borders, chrome, overlays, states, on-dark family, `--color-note`, `--color-yt-play`, `--overlay-scrim-strong` added via Task 8 Step 1 instruction).
- The two single-hit oddballs (`#169`, `#0353a4`) have an explicit locate-and-map instruction (rule 5 + Task 6).
