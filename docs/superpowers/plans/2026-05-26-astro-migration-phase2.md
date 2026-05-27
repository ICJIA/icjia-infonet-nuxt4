# Astro Migration — Phase 2: Chrome Ports

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Port the 4 Infonet chrome components (`TheNav`, `TheSidebar`, `TheFooter`, `TheBreadcrumbBar`) from Vue 3 + Vuetify to Astro + Alpine. Wire them into `BaseLayout.astro` so every Phase 4+ page gets correct chrome. First viewcap pixel-perfect-vs-legacy diff phase. Mobile Lighthouse Perf ≥ 98, A11y = 100, axe-core AA = 0.

**Architecture:** Use DVFR's "preserve inline styles verbatim + native `<details>/<summary>` + body class drawer state" pattern (closer port path for a Nuxt 4 source) rather than IFVCC's Alpine `$store` pattern. Alpine.js is still used for the small interactions that genuinely need state (focus-trap on drawer, click-outside-to-close). Keep menu data in a typed TS module rather than relying on Strapi (Phase 3 wires up Strapi; Phase 2 must work without it).

**Tech Stack:** Astro 6 + Tailwind 4 (in place from Phase 1) + Alpine.js 3 + `@alpinejs/focus`. Inline SVG icons (NOT @mdi/font CSS — already established in Phase 1).

**Files to port (legacy source):**
- `app/components/content/TheNav.vue` (331 lines) → `astro/src/components/AppNav.astro`
- `app/components/content/TheSidebar.vue` (380 lines) → `astro/src/components/AppSidebar.astro`
- `app/components/content/TheFooter.vue` (211 lines) → `astro/src/components/AppFooter.astro`
- `app/components/content/TheBreadcrumbBar.vue` (68 lines) → `astro/src/components/Breadcrumb.astro`
- (Banner not in legacy — skip; add only if Phase 4 routes need one)

**Reference Astro implementations:**
- DVFR (Nuxt 4 source, closest match): `/Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheNav.astro`, `TheSidebar.astro`, `TheFooter.astro`
- IFVCC (v6 reference): `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/AppNav.astro`, `AppSidebar.astro`, `AppFooter.astro`, `Breadcrumb.astro`
- Use IFVCC's `Breadcrumb.astro` shape (60 lines, prop-driven `title`). DVFR's nav/sidebar/footer for everything else.

**Companion docs:**
- Spec: `docs/superpowers/specs/2026-05-26-astro-migration-design.md`
- v6 checklist: `docs/astro-conversion-checklist-v6.2.md` (especially the Phase 1 lesson re: skip-link forward-reference)
- Phase 1 audit log: `docs/perf/phase1-9915671.md` (Lighthouse insights to address — `@mdi/font` 92 KiB unused CSS deferred to Phase 7)

**Exit criteria:**
- `pnpm build` succeeds; `astro check` 0 errors.
- Mobile Lighthouse on `/`: Perf ≥ 98, A11y = 100, BP = 100, SEO = 100.
- axe-core AA on `/`: 0 violations.
- viewcap pair on `/` (legacy vs Astro) matches at desktop (1280×800) AND mobile (375×812). Tolerable diffs: font anti-aliasing rendering, scrollbar width, browser-chrome differences. NOT tolerable: layout shifts, color drift > 1 hex digit, spacing > 2px, missing/extra elements, different fonts.
- Interactive-state viewcap pairs match: drawer open (mobile), drawer closed (mobile), hover on a desktop nav link, focus on a desktop nav link, accordion expanded in drawer.
- `#main-navigation` skip-link reintroduced (Phase 1 lesson — needs a matching nav element).
- All animations honor `prefers-reduced-motion: reduce`.

**Estimated tasks:** 8 tasks across 2 waves. Execution: 60–90 min.

---

## Required reading before starting

The implementer subagent for Wave A MUST read these legacy Vue components in full first:

```bash
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/TheNav.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/TheSidebar.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/TheFooter.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/components/content/TheBreadcrumbBar.vue
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/app.vue
```

The implementer for Wave B MUST read these reference Astro components:

```bash
cat /Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheNav.astro
cat /Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheSidebar.astro
cat /Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheFooter.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/Breadcrumb.astro
```

For the menu data structure, also look at how DVFR exports its menu:
```bash
ls /Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/lib/
cat /Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/lib/menu.ts  # or .js
```

---

## Wave A: Menu data + Breadcrumb + AppFooter (~3 tasks)

These three are independent of the drawer state machine. Ship them first.

### Task 1: Create `astro/src/lib/menu.ts`

**Why:** Phase 4 routes need a single source of truth for nav structure. Phase 3 will wire Strapi-backed menu (if applicable), but Phase 2 ships a static module.

**Files:** Create `astro/src/lib/menu.ts`

Steps:
1. Read the legacy `app/app.vue` + `TheNav.vue` + `TheSidebar.vue` to extract the EXACT nav structure (top-level items, children, hrefs). The legacy structure may be hardcoded in `<template>` blocks or pulled from `navMenu` data.
2. Define a TypeScript type for a menu item:
   ```ts
   export type MenuItem = {
     label: string;
     href: string;
     external?: boolean;
     children?: MenuItem[];
   };
   ```
3. Export `topNav: MenuItem[]` (desktop top nav — flat list, no children) and `sidebarMenu: MenuItem[]` (mobile drawer menu — may include children for accordions).
4. Export a separate `footerLinks: MenuItem[]` for footer navigation if the legacy footer has its own list.
5. Verify against the legacy by visual comparison — every nav link in `https://infonet.icjia.illinois.gov/` must appear in your export with the same label + href.

Verify `pnpm build` succeeds. Commit:
```
feat(astro): menu.ts — typed nav data extracted from legacy TheNav/TheSidebar
```

---

### Task 2: Port `TheBreadcrumbBar.vue` → `Breadcrumb.astro`

**Why:** Smallest, simplest port. Sets the visual fidelity bar for the rest of the wave.

**Files:** Create `astro/src/components/Breadcrumb.astro`

Steps:
1. Read legacy `app/components/content/TheBreadcrumbBar.vue` (68 lines).
2. Read IFVCC reference `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/Breadcrumb.astro` (60 lines) — use this as the structural template.
3. Port the visual styling EXACTLY:
   - Background color: `#0d4474` (legacy dark blue per research)
   - Font: Roboto, 13px
   - Text: "HOME » <CURRENT_PAGE>"
   - Truncate page title to 30 chars (per legacy)
   - Hide on `/` and `/debug` routes (per legacy)
4. Accept a typed `Props` interface with `title?: string` (caller passes the page title from frontmatter or static prop).
5. Use `Astro.url.pathname` to detect home / debug and conditionally render.
6. Use `<nav aria-label="Breadcrumb">` semantic markup with `<ol>` + `<li>` per WAI-ARIA breadcrumb pattern.

Verify with `pnpm build` + `pnpm exec astro check`. Commit:
```
feat(astro): Breadcrumb.astro — dark blue bar, "HOME » <PAGE>", hides on /, /debug
```

---

### Task 3: Port `TheFooter.vue` → `AppFooter.astro`

**Why:** Static markup, no state machine. Good warmup before the drawer beast.

**Files:**
- Create: `astro/src/components/AppFooter.astro`
- Copy any required logo/icon assets to `astro/public/` if not already there
- May need to copy ICJIA logo SVG/PNG

Steps:
1. Read legacy `app/components/content/TheFooter.vue` (211 lines).
2. Read DVFR reference `/Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheFooter.astro` for the Nuxt 4 → Astro port pattern.
3. Identify the assets used by legacy footer:
   - ICJIA logo
   - Social icons (Facebook, YouTube, Instagram, LinkedIn) — inline SVG from MDI (NOT `@mdi/font` CSS) or copy SVG paths from MDI source. DO NOT load `@mdi/font/css/materialdesignicons.css` just for 4 icons.
4. Verify legacy assets exist:
   ```bash
   ls public/ | grep -iE "icjia|logo"
   find app/ -name "*.svg" -o -name "*.png" | xargs grep -li "logo\|icjia" 2>/dev/null
   ```
5. Copy any needed assets to `astro/public/`.
6. Port the markup with EXACT colors:
   - Background `#0d4471` (legacy dark blue)
   - Logo 150×150
   - Centered layout
   - "Privacy", "Contact", "Translate" links with `Translate` opening `/translate/`
   - Copyright text "© <YEAR> Illinois Criminal Justice Information Authority" (or whatever legacy shows — verify)
7. Use semantic `<footer>` landmark with `aria-labelledby` or `aria-label`.
8. Inline SVG icons get `aria-hidden="true"` and the parent `<a>` gets an `aria-label="Facebook"` etc.

Verify `pnpm build` succeeds. Commit:
```
feat(astro): AppFooter.astro — dark footer, ICJIA logo, social icons (inline SVG)
```

---

## Wave B: Nav + Sidebar drawer state + BaseLayout wiring (~5 tasks)

### Task 4: Add Alpine.js entry point + global drawer state CSS

**Files:**
- Create: `astro/src/scripts/alpine-entry.ts` (or `.js`)
- Modify: `astro/src/styles/global.css` (add drawer-open body class rules + focus-visible rules)
- Modify: `astro/src/layouts/BaseLayout.astro` (load alpine-entry)

Steps:
1. Create `astro/src/scripts/alpine-entry.ts`:
   ```ts
   import Alpine from 'alpinejs';
   import focus from '@alpinejs/focus';
   Alpine.plugin(focus);
   window.Alpine = Alpine;
   Alpine.start();
   ```
   Add the type augmentation if needed:
   ```ts
   declare global {
     interface Window { Alpine: typeof Alpine }
   }
   ```
2. In `BaseLayout.astro`, just BEFORE the closing `</body>`, add:
   ```astro
   <script>
     import '~/scripts/alpine-entry';
   </script>
   ```
   (Bundled, NOT `is:inline` — Alpine is too big for inline.)
3. In `global.css`, add:
   ```css
   /* Drawer open prevents body scroll */
   body.drawer-open { overflow: hidden; }
   /* Reduced motion */
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
   }
   ```

Verify `pnpm build` and `pnpm check`. Commit:
```
feat(astro): Alpine.js entry + drawer-open body class + reduced-motion guard
```

---

### Task 5: Port `TheSidebar.vue` → `AppSidebar.astro`

**Files:** Create `astro/src/components/AppSidebar.astro`

Steps:
1. Read legacy `app/components/content/TheSidebar.vue` (380 lines).
2. Read DVFR reference `/Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheSidebar.astro` (109 lines) — copy structure.
3. Import `sidebarMenu` from `~/lib/menu`.
4. Render as `<aside>` landmark with `aria-label="Mobile navigation"`.
5. Use Alpine's `x-data="{ open: false }"` + `x-show="open"` + `x-trap.noscroll.inert="open"` + `@keydown.escape="open = false"`. Listen for a custom event from the hamburger toggle (Task 6) via `@drawer-toggle.window="open = !open"`.
6. Apply `body.drawer-open` class via Alpine watcher OR the @drawer-toggle handler.
7. Backdrop click closes drawer.
8. Render each menu item; items with `.children` render as `<details>` (native accordion — keyboard-accessible out of box, no extra Alpine state).
9. Width: 280px per DVFR; verify against legacy by viewcap.

Visual targets from legacy:
- Drawer width 280px (or whatever legacy uses — verify with DOM inspector on production)
- White background
- Dark text (`#212121` or `rgba(0,0,0,0.87)`)
- Slide-in animation from left
- Backdrop with `rgba(0,0,0,0.5)`

Verify `pnpm build` + `pnpm check`. Commit:
```
feat(astro): AppSidebar.astro — Alpine drawer with focus-trap + native <details> accordions
```

---

### Task 6: Port `TheNav.vue` → `AppNav.astro`

**Files:** Create `astro/src/components/AppNav.astro`

Steps:
1. Read legacy `app/components/content/TheNav.vue` (331 lines).
2. Read DVFR reference `/Volumes/satechi/webdev/icjia-dvfr-nuxt4/src/components/TheNav.astro` (325 lines).
3. Use the EXACT visual specs from legacy:
   - Height 150px (per research)
   - z-index 50
   - Title styling preserved verbatim (font, color, letter-spacing)
   - Mobile (< 960px): just hamburger + title
   - Desktop (≥ 960px): title + horizontal nav links from `topNav`
4. Hamburger icon: inline SVG (NOT `@mdi/font`); aria-label="Open navigation"; on click, dispatch `window.dispatchEvent(new CustomEvent('drawer-toggle'))` which AppSidebar (Task 5) listens for.
5. Add `id="main-navigation"` to the `<nav>` element so the (now-reintroduced) skip-link points to a real target.
6. For desktop nav links, use `<a aria-current="page">` for the active route (`Astro.url.pathname === href`).
7. If legacy has dropdown menus, port via `<details><summary>` (per DVFR pattern). NO Alpine state for dropdowns — native HTML accessibility.

Verify viewcap matches legacy at desktop and mobile. Verify hamburger triggers sidebar open (manual test in `pnpm preview`).

Verify build + check. Commit:
```
feat(astro): AppNav.astro — 150px header with hamburger (mobile) + desktop nav links
```

---

### Task 7: Wire chrome into BaseLayout + reintroduce `#main-navigation` skip-link

**Files:** Modify `astro/src/layouts/BaseLayout.astro`

Steps:
1. Import the four chrome components:
   ```astro
   import AppNav from '~/components/AppNav.astro';
   import AppSidebar from '~/components/AppSidebar.astro';
   import AppFooter from '~/components/AppFooter.astro';
   import Breadcrumb from '~/components/Breadcrumb.astro';
   ```
2. Add a prop `breadcrumbTitle?: string` to the layout's `Props` interface. (Pages pass the title via frontmatter or static prop.)
3. Reintroduce the second skip-link `<a href="#main-navigation" class="skip-link">Skip to navigation</a>` since `AppNav` now provides `id="main-navigation"`.
4. Replace the comment-block placeholder with the actual chrome:
   ```astro
   <AppNav />
   <AppSidebar />
   <Breadcrumb title={breadcrumbTitle} />
   <main id="main-content" style={...}>
     <slot />
   </main>
   <AppFooter />
   ```
5. Update the `mainTopPad` formula if needed — the 64/96 may need adjustment to account for the AppNav's 150px height. Re-check against legacy.

Verify build + check + manual visual sanity at `pnpm preview`. Commit:
```
feat(astro): wire AppNav/AppSidebar/Breadcrumb/AppFooter into BaseLayout
```

---

### Task 8: Audit gates + viewcap pixel-perfect pairs + audit log

**Files:** create `docs/perf/phase2-<sha>.md`

Steps:
1. Run `cd astro && pnpm preview` and let it bind on a free port (likely 4322).
2. Run lightcap mobile audit on `http://localhost:<port>/` — record Perf, A11y, BP, SEO.
3. Run axecap AA on `http://localhost:<port>/`.
4. Run viewcap pairs (legacy vs Astro local):
   - Desktop 1280×800: home (just the chrome — Phase 1 body content is OK as-is)
   - Mobile 375×812: home with drawer CLOSED
   - Mobile 375×812: home with drawer OPEN (use chrome-devtools-mcp `click` on the hamburger button selector, then take screenshot — OR use the viewcap `javascript` param to dispatch the toggle event before capture)
5. Compare each pair visually. Document drift findings + resolution commits in the audit log.
6. Test functional parity manually in a browser:
   - Tab key reveals skip-link top-left
   - Hamburger click opens drawer
   - Esc key closes drawer
   - Backdrop click closes drawer
   - `<details>` accordion expands/collapses with click + Enter/Space
   - Desktop nav links highlight as `aria-current="page"` when active
   - `prefers-reduced-motion: reduce` (set in DevTools rendering tab) kills animations
7. Write `docs/perf/phase2-<sha>.md` with all results + lessons.
8. Commit + push.

Exit gates (all hard):
- Mobile Perf ≥ 98 on `/`
- Mobile A11y = 100 on `/`
- axe-core AA = 0 on `/`
- viewcap home (desktop + mobile + drawer-open) matches legacy
- All functional-parity items above verified

---

## Phase 2 done. Exit checklist:

- [x] 4 chrome components shipped (`AppNav`, `AppSidebar`, `AppFooter`, `Breadcrumb`)
- [x] Alpine.js entry point bundled (not is:inline)
- [x] `body.drawer-open` overflow lock applied during drawer open
- [x] Native `<details>` accordions used (no Alpine state for dropdowns)
- [x] Skip-link `#main-navigation` reintroduced
- [x] `prefers-reduced-motion` honored
- [x] Mobile Perf ≥ 98, A11y = 100, axe AA = 0 on `/`
- [x] viewcap home matches legacy (desktop + mobile + drawer-open)
- [x] `docs/perf/phase2-<sha>.md` committed
