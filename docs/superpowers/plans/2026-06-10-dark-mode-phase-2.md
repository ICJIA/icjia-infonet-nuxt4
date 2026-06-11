# Dark Mode Phase 2 Implementation Plan (palette, toggle, dark skins)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A light/dark toggle for the whole site: a `.dark` class on `<html>` re-maps the phase-1 tokens to a dark palette, persisted in localStorage, **defaulting to LIGHT for everyone** (explicit user decision 2026-06-10: the site keeps its current bright look by default; dark is an opt-in for visitors bothered by the brilliant white — no OS-preference sniffing) — with light mode pixel-identical to today and dark mode passing axe WCAG 2.1 AA on every audited page.

**Architecture:** Phase 1 already routed every color through tokens. Phase 2: (1) a `.dark { --token: … }` override block in `global.css` after `@theme`; (2) a tiny inline `<head>` script that applies `.dark` before first paint (`?theme=` test override → localStorage → LIGHT default) — this adds ONE new CSP hash; (3) an `Alpine.store('theme')` + nav toggle button (same pattern as the drawer store); (4) dark skins for the two non-token surfaces: `.dark .markdown-body` prose overlay (vendor CSS stays untouched) and Pagefind (already var-mapped); (5) resolution of the phase-1 "retheme hazards" list BEFORE flipping any overlay token.

**Tech Stack:** Plain CSS custom properties, Alpine 3 store, one inline script. No new dependencies. No Tailwind `dark:` variant needed (nothing consumes utilities for color) — skip `@custom-variant` (YAGNI; add later if `dark:` utilities are ever wanted).

**Verification model:** light mode = regression (axe + screenshot identical); dark mode = `?theme=dark` URL override makes every page dark-auditable by axecap/viewcap without touching localStorage. Dark axe AA = the contrast gate. The CSP hash set CHANGES this phase (one new head script) — netlify.toml must be updated via `pnpm csp-hashes`.

---

## Global rules

1. **Light mode must not change.** All light values stay exactly as phase 1 left them. New tokens added this phase take light values identical to current rendering.
2. **Dark values live ONLY in `global.css`** (the `.dark` block and `.dark .markdown-body` overlay) or component-scoped `.dark .dv-awareness-month` blocks. The phase-1 site-wide literal gate must still pass unchanged (it excludes global.css; component `.dark` blocks are token DEFINITIONS, mirror the `--dv-*` precedent).
3. **Hazards first:** the plan-doc "Phase-2 retheme hazards" rows must be re-pointed to shadow-specific tokens BEFORE `.dark` flips `--overlay-hover`/`--overlay-divider` to white-alpha — otherwise card shadows turn white.
4. **Contrast targets:** body/UI text ≥ 4.5:1 on its surface; large display text ≥ 3:1 (aim higher); focus indicators ≥ 3:1 against adjacent colors. The dark axe sweep is the empirical gate; if axe flags a pair, adjust the dark value (never the light one).
5. Conventions from phase 1 carry over: no drive-by edits; comments cite values; commit per task, no AI trailers; `pnpm csp-hashes` after any inline-script change.

## New tokens (Task 1 adds to `@theme` with LIGHT values; consumers re-pointed same task)

```css
  /* Phase 2 role splits — light values identical to current rendering. */
  --color-chart-bar: #0d4471;        /* was --color-brand-footer on the home SVG bars; bars need a LIGHT blue in dark mode while the footer band stays navy */
  --color-button-bg: #0d4270;        /* solid-navy button backgrounds (contact submit, active DAP chip) — stays navy in dark (white label), while --color-brand flips light-blue for text */
  --color-button-bg-hover: #0a3050;
  --color-mark-ink: #222;            /* text inside <mark> — constant; amber highlight needs dark text in BOTH modes */
  /* Shadow colors — constant across modes (shadows stay black on dark
     surfaces); replaces the hazard-listed shadow uses of overlay tokens so
     --overlay-divider/-hover can flip to white-alpha in .dark. */
  --shadow-color-soft: rgba(0, 0, 0, 0.12);
  --shadow-color: rgba(0, 0, 0, 0.15);
  --shadow-color-mid: rgba(0, 0, 0, 0.2);
```

Consumer re-points (Task 1, all value-identical in light):
- `src/components/HomeBarGraph.astro` rect fill → `var(--color-chart-bar)` (comment: light = brand-footer value).
- `src/pages/contact.astro` `.btn-submit` background → `var(--color-button-bg)`, `:hover` → `var(--color-button-bg-hover)`.
- `src/pages/data-and-publications/index.astro` `.tag-chip.active` background + border → `var(--color-button-bg)`.
- `src/pages/search.astro` mark rule: `color: inherit` → `color: var(--color-mark-ink)` (light-identical: inherited text was #222 via `--pagefind-ui-text`).
- Shadow re-points per the hazards list: SplashNews + NewsCard + SimpleCard shadows `var(--overlay-divider)` → `var(--shadow-color-soft)`; EventCard + AppSidebar drawer + DvAwarenessMonth hover shadows `var(--overlay-scrim)` → `var(--shadow-color)`; InfoCard shadow `var(--overlay-scrim-mid)` → `var(--shadow-color-mid)`; DvAwarenessMonth resting card shadow `var(--overlay-divider)` → `var(--shadow-color-soft)`. (`--overlay-shadow-modal`, `--overlay-brand-shadow`, `--dv-icon-shadow` are already shadow-specific — leave, and do NOT override them in `.dark`.) Update each corresponding hazards row with "resolved phase 2 → shadow token".

## The `.dark` block (Task 1 installs verbatim, in global.css AFTER the @theme block)

```css
/* ── Dark palette (phase 2) ─────────────────────────────────────────────
   Applied via class on <html> by the theme-init script in BaseLayout
   (localStorage → OS preference → ?theme= test override). Light values
   live in @theme above and are unchanged. Values chosen for ≥4.5:1 text
   contrast on their usage surfaces — verified by the dark axe sweep.    */
:root { color-scheme: light; }

.dark {
  color-scheme: dark;

  /* Brand — text-role blues LIGHTEN for contrast on dark surfaces;
     surface-role navies stay navy (buttons split to --color-button-bg). */
  --color-brand: #82b4e8;            /* wordmark, headings, links, chevrons */
  --color-brand-hover: #a8cdf2;      /* text-role hover (Toc) */
  --color-brand-pressed: #234e76;    /* bg-role hover (404 cards, all-btn) — navy */
  --color-brand-deep: #1b3a5c;       /* breadcrumb bar, badge, box 1 */
  --color-brand-footer: #122c47;     /* footer band */
  --color-brand-home-title: #8fc1ee;
  --color-brand-box-2: #29516f;
  --color-brand-box-3: #3d5269;
  --color-chart-bar: #6aa5d8;
  --color-button-bg: #1f4a73;
  --color-button-bg-hover: #2a5d8f;

  /* Links & focus */
  --color-link-strong: #8ab4f0;
  --color-link-alt: #7fb3e8;
  --color-link-alt-tint-25: rgba(127, 179, 232, 0.25);
  --color-link-alt-tint-35: rgba(127, 179, 232, 0.35);
  --color-link-deep: #9cc3f0;
  --color-accent-indigo: #aab4f5;
  --color-input-focus: #6fa9e8;
  --color-primary: #6cb1f0;          /* focus rings need ≥3:1 on dark */
  --color-primary-tint: rgba(108, 177, 240, 0.16);

  /* Ink scale — inverted, each ≥4.5:1 on --color-surface */
  --color-ink-max: #f7f9fb;
  --color-ink-near: #eef1f4;
  --color-ink: #e4e8ec;
  --color-ink-body: #d4d9df;
  --color-ink-mid: #c0c6cd;
  --color-ink-soft: #a9b1b9;
  --color-ink-muted: #939ca6;
  --color-ink-faint: #828b95;
  --color-ink-hint: #7d8791;
  --color-ink-label: #aab0b6;
  --color-ink-87: rgba(255, 255, 255, 0.87);
  --color-text: #e4e8ec;             /* legacy Vuetify token, used as body default */
  --color-text-secondary: rgba(255, 255, 255, 0.87);

  /* on-dark family: UNCHANGED on purpose (sits on chrome/navy in both modes) */

  /* Surfaces */
  --color-surface: #14171c;          /* page + cards */
  --color-surface-faint: #181c21;
  --color-surface-fainter: #171a1f;
  --color-surface-soft: #232932;     /* form fields, noscript nav */
  --color-surface-band: #1b2026;     /* home gray bands (lighter than page, mirrors light hierarchy) */
  --color-surface-card: #1d232b;     /* search result cards */
  --color-surface-hover: #21262e;
  --color-surface-press: #2a313b;
  --color-surface-dim: #3a424d;
  --color-surface-chip: #1f2a36;
  --color-surface-chip-hover: #28384a;
  --color-background: #14171c;

  /* Borders */
  --color-border: #3a4148;
  --color-border-soft: #333a41;
  --color-border-mid: #404750;
  --color-border-input: #4a525c;
  --color-border-strong: #566069;
  --color-border-faint: #4e565f;
  --color-border-card: #363d46;
  --color-border-chip: #3b5470;

  /* Dark chrome (tabs) — keep distinct from panels */
  --color-chrome: #2b3036;
  --color-chrome-active: #3d434b;

  /* Overlays — hover/divider flip to white-alpha; scrims/backdrops STAY black
     (they sit over content in both modes); shadow tokens are NOT overridden. */
  --overlay-hover: rgba(255, 255, 255, 0.06);
  --overlay-divider: rgba(255, 255, 255, 0.14);

  /* States */
  --color-error-text: #f49b93;
  --color-error-deep: #f6b3ad;
  --color-error-bg: #3a2222;
  --color-success-deep: #8fd19c;
  --color-note: #8ab9ff;             /* mock-data note */
  /* --color-mark stays amber; --color-mark-ink stays #222 (dark text on amber) */
}
```

Also Task 1: `.dark .dv-awareness-month { --dv-purple: #8d7cc0; --dv-purple-deep: #6d5a9e; --dv-slate-deep: #46598a; --dv-lavender-bg: #262033; }` appended to DvAwarenessMonth's `<style>` (slate + icon-shadow + on-accent stay).

## Task overview

| Task | Scope |
|---|---|
| 1 | Hazard re-points + new tokens + the `.dark` block + DV dark palette. Light regression verified; dark smoke via Chrome class injection. |
| 2 | Theme-init head script (+ `?theme=` override) + CSP hash update + `Alpine.store('theme')` + nav toggle buttons + theme-color metas. Toggle flow + persistence verified live. |
| 3 | `.dark .markdown-body` prose overlay + Pagefind dark verification/patches. |
| 4 | Dark sweep: viewcap dark screenshots of ~12 pages read for visual defects; dark axe AA on the full spot set → 0 violations; fix dark values as needed. |
| 5 | Release: light full regression, csp-hashes final check, CHANGELOG [3.4.0] + version bump, commit. (Controller: final whole-range review, push, live verify.) |

### Task 2 details (the only inline-script change)

Head script, inserted in `BaseLayout.astro` `<head>` immediately after the viewport meta (BEFORE stylesheets/preloads — must run pre-paint):

```html
    {/* Theme init — applies .dark before first paint. Order: ?theme= test
        override (not persisted) → localStorage 'theme' → LIGHT default.
        Deliberately NO prefers-color-scheme sniffing: the site defaults to
        its standard light look for everyone; dark is an explicit opt-in
        (user decision 2026-06-10). Inline + hashed in the CSP (netlify.toml)
        — re-run pnpm csp-hashes after ANY edit to this script. */}
    <script is:inline>
      (function () {
        try {
          var p = new URLSearchParams(location.search).get('theme');
          var s = localStorage.getItem('theme');
          var t = p === 'dark' || p === 'light' ? p : s;
          if (t === 'dark') {
            document.documentElement.classList.add('dark');
            var m = document.querySelector('meta[name="theme-color"]');
            if (m) m.setAttribute('content', '#14171c');
          }
        } catch (e) {}
      })();
    </script>
```

(`?theme=light|dark` is a non-persisted test/support override; otherwise stored `'dark'` applies; anything else — including junk params — falls through to light.) The theme-color meta `<meta name="theme-color" content="#ffffff" />` must be rendered BEFORE this script (so the script can flip it for stored-dark visitors); the Alpine store toggle also updates it at runtime so mobile browser chrome follows the chosen theme.

Store (alpine-entry.ts, after the drawer store, same typed-const pattern):

```ts
// Theme state — the head script in BaseLayout applies .dark pre-paint;
// this store mirrors that state for the nav toggle and persists choices.
type ThemeStore = { dark: boolean; toggle(): void };
const themeStore: ThemeStore = {
  dark: document.documentElement.classList.contains('dark'),
  toggle() {
    this.dark = !this.dark;
    document.documentElement.classList.toggle('dark', this.dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', this.dark ? '#14171c' : '#ffffff');
    try {
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    } catch {
      // private-mode storage failures: theme still applies for this page
    }
  },
};
Alpine.store('theme', themeStore);
```

Toggle button — TWO instances in AppNav.astro (one in the mobile `md-hide` cluster immediately before the search link, with a "THEME" micro-label matching MENU/SEARCH; one desktop in the `md-show` utility span immediately before the ⋮ dropdown, icon-only). Markup per instance (mobile shown; desktop drops the label span and uses the icon-button sizing of the ⋮ summary):

```astro
    <button
      type="button"
      class="theme-toggle md-hide"
      x-data
      aria-pressed="false"
      aria-label="Switch to dark theme"
      :aria-pressed="$store.theme.dark"
      :aria-label="$store.theme.dark ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="$store.theme.toggle()"
      style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;padding:8px;min-width:44px;min-height:44px;color:var(--color-ink-87);"
    >
      <!-- moon (shown in light mode) / sun (shown in dark) — CSS-driven via
           .dark so the correct icon renders pre-Alpine (head script already
           set the class). MDI weather-night / white-balance-sunny paths. -->
      <svg class="theme-toggle__moon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95Z"/></svg>
      <svg class="theme-toggle__sun" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z"/></svg>
      <span style="font-size: 10px; font-weight: 900; letter-spacing: 0.04em;">THEME</span>
    </button>
```

Scoped CSS in AppNav's `<style>`: `.theme-toggle__sun { display: none; } .dark .theme-toggle__sun { display: block; } .dark .theme-toggle__moon { display: none; }` plus hover/focus rules matching `#nav-hamburger`. Note: static `aria-pressed="false"`/label may be wrong for ~1 tick pre-Alpine when the OS prefers dark — the button is inert until Alpine boots, accepted (same pattern as the hamburger).

After ALL Task 2 edits: rebuild, `pnpm csp-hashes`, update the hash set in netlify.toml (the new head script ADDS one hash; the existing six stay — confirm count = 7) and the netlify.toml comment list ("theme init (BaseLayout)").

### Task 3 details — prose + Pagefind dark

Append to global.css after the `.dark` block (NOT inside it):

```css
/* ── Dark prose skin ────────────────────────────────────────────────────
   github-markdown.css (vendored, light-only) stays untouched; this overlay
   re-skins CMS prose under .dark. Images keep their white background from
   the vendor CSS — screenshots read as intentionally "framed" on dark.   */
.dark .markdown-body {
  color: var(--color-ink-body);
  background-color: transparent;
}
.dark .markdown-body h1, .dark .markdown-body h2, .dark .markdown-body h3,
.dark .markdown-body h4, .dark .markdown-body h5, .dark .markdown-body h6 {
  color: var(--color-ink);
  border-bottom-color: var(--color-border);
}
.dark .markdown-body a { color: var(--color-link-strong); }
.dark .markdown-body hr { background-color: var(--color-border); }
.dark .markdown-body blockquote { color: var(--color-ink-muted); border-left-color: var(--color-border-mid); }
.dark .markdown-body code, .dark .markdown-body kbd { background-color: var(--color-surface-press); color: var(--color-ink-body); }
.dark .markdown-body pre { background-color: var(--color-surface-soft); color: var(--color-ink-body); }
.dark .markdown-body pre code { background-color: transparent; }
.dark .markdown-body table th, .dark .markdown-body table td { border-color: var(--color-border-mid); }
.dark .markdown-body table tr { background-color: transparent; border-top-color: var(--color-border-mid); }
.dark .markdown-body table tr:nth-child(2n) { background-color: var(--color-surface-faint); }
.dark .markdown-body img { background-color: #fff; } /* keep vendor behavior explicit */
```

Then load `http://localhost:4323/about/?theme=dark` and any page with tables/code in CMS prose; adjust selectors against the actual vendor specificity (the vendor file may need `!important`-free specificity wins — match its exact selectors; verify by computed style in Chrome MCP). Pagefind: load `/search/?q=data&theme=dark`, verify cards/inputs/buttons; patch any remaining hardcoded pagefind-ui.css colors with `.dark #pagefind-ui …` overrides in search.astro's `:global` block.

### Task 4 details — dark sweep

viewcap (full page, `?theme=dark`) + READ each image hunting: invisible text, navy-on-navy, washed borders, wrong icon colors. Pages: `/`, `/about/`, `/agencies/`, `/screenshots/`, `/resources/`, `/faqs/`, `/news/`, one news article (with Updated line), `/contact/`, `/data-and-publications/`, `/search/?q=data`, `/404.html`, `/translate/`. Then axe AA on the same URLs (with `&`/`?theme=dark`) → 0 violations each. Fix = adjust `.dark` values only; re-shoot the affected page.

### Task 5 details — release

Light regression: axe AA light on `/`, `/faqs/`, `/contact/`, `/search/?q=data`, one news article → 0; viewcap light home vs pre-phase-2 baseline → identical. `pnpm check` 0 errors; full `pnpm build:fast && pnpm pagefind`; `pnpm csp-hashes` = 7 hashes = netlify.toml. CHANGELOG `[3.4.0] - 2026-06-10 — Light/dark theme toggle (dark-mode phase 2)` (~12 lines: .dark token remap, head script + CSP hash, nav toggle + Alpine store, OS-preference default + localStorage persistence + ?theme= test override, prose/Pagefind dark skins, hazards resolved via shadow tokens, dark axe AA clean site-wide, light pixel-identical). package.json → 3.4.0. Commit `feat(theme): light/dark toggle — dark token palette, theme-init script, nav toggle (phase 2)`.

## Out of scope
- Per-image dark treatments (dimming, dark-specific assets); any `prefers-color-scheme` auto-default or "system" toggle state (DELIBERATE: the user decided 2026-06-10 the site defaults to light for everyone, dark is a pure opt-in — do not "fix" this by adding OS sniffing); Tailwind `dark:` variant.

## Self-review notes
- Every consumer re-point in Task 1 has its file named; the `.dark` block covers every @theme color/overlay token except the deliberately-constant ones (on-dark family, scrims/backdrops, shadow tokens, mark, yt-play, chrome's `--color-secondary` twin — `--color-secondary`/`--color-accent`/`--color-info`/`--color-warning`/`--color-error`/`--color-success` legacy Vuetify tokens have near-zero consumers; leave constant, note in block comment if desired).
- The hazards-before-flip ordering is enforced by both living in Task 1, re-points listed before the block install.
- `?theme=` override never persists (test-only) — the head script reads it before localStorage.
