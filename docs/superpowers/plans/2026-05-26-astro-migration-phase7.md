# Astro Migration — Phase 7: Audit-and-Trim + Cutover

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Final polish + audit + cutover. Cutover is the atomic commit that replaces the legacy Nuxt 4 source with the Astro source on `feat/astro-migration` for eventual merge to `main`.

**HARD GATE:** Cutover commit (Task 7) AND merge to `main` (Task 8) PAUSE for explicit user authorization. The controller MUST stop and ask before proceeding.

**Architecture:**
- `csp-hashes.mjs` — sweep `dist/**/*.html`, sha256 every inline `<script>` block (skipping `src=`, `application/ld+json`, `application/json`), print paste-ready `script-src` snippet for `netlify.toml`.
- `build-og-image.mjs` — Sharp SVG → PNG 1200×630, `font-family="sans-serif"` only (NEVER named fonts — librsvg silently fails on Linux CI). Dual-write to `public/og-image.png` AND `dist/og-image.png` (last build step).
- Polish: chart Y-axis, home 2-column layout, all-caps partners link, responsive nav breakpoints.
- Sitemap exact-suffix regex verification.
- Full viewcap sweep — every route + breakpoint + interactive state.
- Cutover commit per design spec §5.

**Companion docs:**
- v6 checklist (§§8, 11, 13, OG image canonical pipeline)
- IFVCC reference Phase 7 plan + scripts

**Exit criteria:**
- `csp-hashes.mjs` outputs a real CSP `script-src` snippet (manual paste into netlify.toml after cutover)
- `build-og-image.mjs` emits a 1200×630 PNG at `public/og-image.png` and `dist/og-image.png`
- All Phase 7 polish items shipped (chart, layout, all-caps, breakpoints)
- Full viewcap sweep result documented
- All mobile Perf scores still ≥ 98, A11y/BP/SEO 100, axe AA 0 across all audit routes
- Cutover commit completes (post-authorization)
- `v1-final` and `v3.0.0` tags created

**Estimated tasks:** 9 tasks. The non-cutover portion (Tasks 1-6) ~60 min. Cutover (Tasks 7-9) requires user-authorization pause.

---

## Task 1: `csp-hashes.mjs` real implementation

Replace `astro/scripts/csp-hashes.mjs` stub with the real walker.

Algorithm:
1. Walk `dist/**/*.html` (use `globby` or readdir recursive)
2. For each HTML, parse via regex or a tiny HTML walker
3. For each `<script>` block:
   - Skip if `src=` attribute present
   - Skip if `type="application/ld+json"` or `type="application/json"`
   - sha256-hash the inner script body
   - Collect unique hashes
4. Output a sorted unique list of `'sha256-<base64>'` strings ready to paste into `netlify.toml [[headers]] Content-Security-Policy`

```
'self' 'sha256-xxx' 'sha256-yyy' ...
```

Add `globby` as dev dep if not present.

Commit:
```
feat(astro): csp-hashes.mjs — real implementation (sweep dist HTML inline scripts)
```

## Task 2: `build-og-image.mjs` real implementation

Replace the Phase 1 placeholder PNG with a generated 1200×630 SVG → PNG.

```js
// astro/scripts/build-og-image.mjs
import sharp from 'sharp';
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0d4270"/>
  <text x="600" y="280" text-anchor="middle" font-family="sans-serif" font-size="120" font-weight="900" fill="#ffffff">INFONET</text>
  <text x="600" y="360" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="400" fill="#ffffff">Data Collection &amp; Reporting System</text>
  <text x="600" y="420" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="400" fill="#ffffff" opacity="0.85">Illinois&apos; victim service data resource for over 25 years</text>
</svg>
`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
await sharp(Buffer.from(svg)).png().toFile('dist/og-image.png');
console.log('og-image.png written to public/ and dist/');
```

CRITICAL: `font-family="sans-serif"` ONLY. NEVER use named fonts (Lato, Raleway) — librsvg silently fails on Linux CI to render them.

Add `"og:image": "node scripts/build-og-image.mjs"` to npm scripts.

Add `pnpm og:image` to the build chain as the LAST step:
```json
"build": "astro build && node scripts/fetch-cms-images.mjs && astro build && pnpm pagefind && pnpm og:image"
```

Commit:
```
feat(astro): build-og-image.mjs — Sharp SVG→PNG 1200×630, dual-write
```

## Task 3: Phase 7 polish items

### 3a. Chart Y-axis `beginAtZero: true`

Edit `astro/src/components/HomeBarGraph.astro` — Chart constructor `options.scales.y.beginAtZero: true`.

### 3b. Home 2-column desktop layout

Edit `astro/src/pages/index.astro` — wrap hero body + chart in a CSS grid that's 1-column on mobile (default) and 2-column at `@media (min-width: 960px)`. Body in left column, chart in right column.

### 3c. "List of Partners »" CSS uppercase

Edit `astro/src/pages/index.astro` `.home-partners-link a` style: add `text-transform: uppercase`.

### 3d. AppNav responsive breakpoint

Edit `astro/src/components/AppNav.astro` — change `@media (min-width: 960px)` for the desktop nav items to `@media (min-width: 1280px)` so About/Resources/News & Updates inline only appear at lg+ widths. Matches legacy behavior at 1072px viewport (carried from Phase 2 observation).

Commit per item OR all four in one commit. Single commit fine since they're all visual polish.

Commit:
```
feat(astro): Phase 7 polish — chart Y-axis 0, home 2-col, all-caps partners, lg nav breakpoint
```

## Task 4: Sitemap verification

Inspect `dist/sitemap-index.xml` and `dist/sitemap-0.xml`. Verify:
- Every public route appears
- `/404/` is NOT listed
- `/debug/` is NOT listed (per Phase 1 filter)
- Dynamic routes (news/[slug], tabs/[slug], [...slug]) all appear
- URLs use the production origin `https://infonet.icjia.illinois.gov/`

If any route is missing or `/404/` appears, fix the filter in `astro.config.ts` and re-build.

Commit (only if a fix is needed):
```
fix(astro): sitemap exact-suffix filter — ensure 404/debug excluded
```

## Task 5: Full audit gate sweep

Run lightcap mobile + axecap AA on EVERY public route. At minimum:
- `/`, `/news/`, `/news/<slug>/` (×2 different slugs), `/contact/`, `/faqs/`, `/data-and-publications/`, `/meetings/`, `/translate/`, `/search/`, `/about/`, `/partners/`, `/agencies/`

For each:
- Mobile Perf ≥ 98
- Mobile A11y = 100
- BP = 100
- SEO = 100
- axe AA = 0

Document any route that doesn't pass — fix forward.

## Task 6: Full viewcap pixel-perfect sweep

Capture pairs (legacy production URL vs Astro local preview) for:
- Home (mobile + desktop)
- News listing (mobile + desktop)
- News detail (mobile + desktop)
- Contact (mobile)
- FAQs (mobile)
- Data and Publications (mobile + desktop)
- About page (mobile + desktop)
- Search (mobile)

For each, document drift findings + resolution commits.

Per design spec: drift > font-aliasing-noise = defect. Phase 7 is where the pixel-perfect mandate is enforced. Iterate: typically 4-6 commits to converge per IFVCC.

Commit per fix:
```
fix(astro): viewcap drift on /<route>/ — <what was fixed>
```

## Task 7: ⏸️ AUTHORIZATION GATE — Cutover commit

**STOP HERE.** The cutover commit is destructive: it deletes the legacy Nuxt 4 source from the repo root. Per design spec §10, the controller MUST pause for explicit user authorization before proceeding.

The cutover commit, when authorized, is:

```bash
# Tag pre-cutover state for safety
git tag v1-final

# Move astro/ to root
cd /Volumes/satechi/webdev/icjia-infonet-nuxt4

# Delete legacy
rm -rf app content creators server scripts/  # (verify scripts/ is only legacy)
rm -f nuxt.config.js package.json yarn.lock vitest.config.js tsconfig.json
rm -rf src/  # only if `src/` was the legacy Vue dir (verify before)

# Move Astro to root
mv astro/.* . 2>/dev/null || true
mv astro/* .

# Empty astro/ dir
rmdir astro

# Flip netlify.toml [build] from legacy to Astro
# (Edit netlify.toml — replace [build] command with `pnpm build` and remove [context.branch-deploy] overrides since they're now redundant)

# Update package.json version 3.0.0-alpha.X → 3.0.0
# Update README.md, CHANGELOG.md cutover entry

git add -A
git commit -m "feat: cutover — Astro 6 / Alpine 3 / Tailwind 4 replaces Nuxt 4 + Vuetify"

# Tag the cutover commit
git tag v3.0.0
```

**Pause before each `rm -rf` step** — verify each file/dir being deleted is genuinely legacy.

## Task 8: ⏸️ AUTHORIZATION GATE — Merge to `main`

Per design spec §10, the merge to `main` ALSO pauses for explicit user authorization.

```bash
git push origin feat/astro-migration --tags
gh pr create --base main --head feat/astro-migration --title "feat: Astro 6 / Alpine 3 / Tailwind 4 migration" --body "<auto-generated from audit logs>"
# After user approves the PR review:
gh pr merge --merge   # OR gh pr merge --squash (per user preference)
```

## Task 9: Post-cutover verification

After merge, Netlify auto-builds `main` from the new Astro source. Verify:
- `https://infonet.icjia.illinois.gov/` serves the Astro build (no `__NUXT`, no `v-application` markers)
- All 14 logical routes return 200
- Mobile Lighthouse on production: still 98+/100/100/100
- Plausible firing on production domain (`/api/event` returns 202)

Write final `docs/perf/phase7-post-cutover-<sha>.md`.

If anything regresses, the `v1-final` tag is the rollback point.

---

## Phase 7 exit checklist

- [ ] csp-hashes.mjs real implementation outputs paste-ready snippet
- [ ] build-og-image.mjs emits 1200×630 PNG
- [ ] Polish items shipped (chart, layout, all-caps, breakpoints)
- [ ] Sitemap verified
- [ ] Full audit gate sweep ≥ 98/100/100/100 on every public route
- [ ] Full viewcap sweep, drift documented + resolved
- [ ] **Cutover commit authorized + executed**
- [ ] `v1-final` + `v3.0.0` tags created
- [ ] **Merge to `main` authorized + executed**
- [ ] Production verified post-cutover
- [ ] `docs/perf/phase7-<sha>.md` committed

---

**Migration complete after Phase 7. Total expected commits on `feat/astro-migration` at cutover: ~85+.**
