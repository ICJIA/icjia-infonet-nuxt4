# Astro Migration — Phase 4: Static Pages + Dynamic Routes

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Every legacy URL resolves to 200 on the Astro build. SimpleCard placeholder for listings (real cards land Phase 5a). Wire `astro-seo` canonical for the SEO=92→100 gap. First viewcap pixel-perfect diffs on routes with REAL content.

**Architecture:**
- All routes use `BaseLayout` and pass `breadcrumbTitle` for the dark blue breadcrumb bar
- Listings render `SimpleCard.astro` (placeholder) — Phase 5a replaces with `EventCard`, `InfoCard`, `SplashNews`
- The `[...slug].astro` catch-all queries Strapi `pages` and filters via `siteConfig.reservedSlugs` (defined in Phase 1)
- `data-and-publications` and `meetings` routes use static legacy data sources (JSON / fallback to empty list since no content source found yet)
- `search.astro` ships as a shell only — Pagefind wires Phase 6
- `debug.astro` reproduces legacy debug page if present (15 lines in legacy — likely build-info dump)

**14 routes to ship:**

| # | URL | Source | Phase 4 strategy |
|---|---|---|---|
| 1 | `/` | replace Phase 1 placeholder with real home content | partial port — full home interactives Phase 5b |
| 2 | `/404/` | already done (Phase 1) | n/a |
| 3 | `/translate/` | legacy `app/pages/translate.vue` (237 lines) | port as static page |
| 4 | `/contact/` | legacy `app/pages/contact.vue` (308 lines) | port as static page |
| 5 | `/debug/` | legacy `app/pages/debug.vue` (15 lines) | port — minimal |
| 6 | `/search/` | shell only | empty `<div id="pagefind-ui">` — Phase 6 wires |
| 7 | `/data-and-publications/` | legacy `app/pages/data-and-publications/index.vue` (450 lines) — uses `app/data/publist.json` | port the data, render with SimpleCard placeholder |
| 8 | `/faqs/` | Strapi `faqs` (135 entries) | list rendered with `<details>` accordions OR SimpleCard |
| 9 | `/news/` | Strapi `posts` (22 entries) | list with SimpleCard |
| 10 | `/news/[slug]/` | Strapi `posts` detail | full markdown render via Phase 3 `markdown.ts` |
| 11 | `/meetings/` | NO content source identified | empty list with "no meetings to display" message (or skip until source found) |
| 12 | `/meetings/[slug]/` | NO content source identified | skip (no slugs to generate) |
| 13 | `/[...slug]/` | Strapi `pages` (10 entries) | catch-all, filter via `siteConfig.reservedSlugs`, render markdown |
| 14 | `/tabs/[...slug]/` | Strapi `tabs` (6 entries) | catch-all, render markdown |

**Companion docs:**
- Phase 2 audit log: `docs/perf/phase2-836aae4.md` (known follow-ups: legacy responsive nav breakpoints at desktop widths)
- Strapi cheatsheet — Infonet Faq fields (`question`/`answer`)
- Spec §6 Phase 4

**Exit criteria:**
- All 14 URLs build to 200 on `astro build`. The `meetings/*` routes either build successfully with an empty list message OR are intentionally absent (document the choice in the audit log).
- `pnpm build` succeeds with all routes accounted for.
- Mobile Lighthouse Perf ≥ 98, A11y = 100, BP = 100, SEO = 100 (canonical present now closes SEO=92 gap) on at least: `/`, `/news/`, `/news/<slug>/`, `/contact/`, `/faqs/`.
- axe-core AA = 0 violations on the same 5 routes.
- viewcap pair (Astro local vs legacy) on the same 5 routes at desktop + mobile. Drift documented in audit log.

**Estimated tasks:** 8 tasks in 2 waves. Execution: ~90 min.

---

## Wave A — Listings + static pages (6 tasks)

### Task 1: `SimpleCard.astro` placeholder

**File:** `astro/src/components/SimpleCard.astro`

Minimal card component used by listings until Phase 5a real cards land. Props:
```ts
interface Props {
  title: string;
  href: string;
  date?: string;       // ISO; format via dates.ts
  summary?: string;
  className?: string;
}
```

Render: `<a href={href}><div class="simple-card"><h3>{title}</h3><time>{formattedDate}</time><p>{summary}</p></div></a>`. No fancy styling — Phase 5a replaces.

Commit:
```
feat(astro): SimpleCard.astro — placeholder card for Phase 4 listings
```

### Task 2: Static page ports — translate, contact, debug, search

**Files:**
- `astro/src/pages/translate.astro`
- `astro/src/pages/contact.astro`
- `astro/src/pages/debug.astro`
- `astro/src/pages/search.astro`

For each:
1. Read the legacy `app/pages/<name>.vue` to extract content.
2. Port to `.astro` consuming `BaseLayout` with `breadcrumbTitle={titleString}`.
3. Strip Vuetify components (`v-card`, `v-btn`, etc.) — use semantic HTML.
4. Forms (e.g., contact) — if legacy has a form posting to an endpoint, port the form markup as-is. Don't wire JS handlers in Phase 4; defer to a later phase or leave as a noop submit (legacy may use Formspree or similar).

Special:
- `search.astro`: just a shell with `<div id="pagefind-ui"></div>` and an `<h1>Search</h1>`. Phase 6 wires Pagefind.
- `debug.astro`: keep minimal; show some build-time info if legacy did.

Commit per file (4 commits) OR one commit covering all four. Single commit is fine since they're small.

Commit:
```
feat(astro): static page ports — translate, contact, debug, search shell
```

### Task 3: `/faqs/` listing page

**File:** `astro/src/pages/faqs/index.astro`

Use `QUERY_FAQ_LIST` from Phase 3 to fetch all 135 FAQs. Sort by `attributes.ranking` then `attributes.createdAt`.

Render as accordion list using native `<details>`:
```astro
{faqs.map(f => (
  <details>
    <summary>{f.attributes.question}</summary>
    <div set:html={renderMarkdown(f.attributes.answer).html}></div>
  </details>
))}
```

Wrap in `<main>` content area with breadcrumb title "FAQs".

Commit:
```
feat(astro): /faqs/ listing with native <details> accordions (135 entries)
```

### Task 4: `/news/` listing page

**File:** `astro/src/pages/news/index.astro`

Use `QUERY_POST_LIST` to fetch all 22 posts. Sort by `attributes.createdAt` desc. Render each as `SimpleCard`. Phase 5a replaces with `SplashNews` for the latest + `InfoCard` for the rest.

Commit:
```
feat(astro): /news/ listing — 22 posts via SimpleCard
```

### Task 5: `/data-and-publications/` listing page

**File:** `astro/src/pages/data-and-publications/index.astro`

Read legacy `app/pages/data-and-publications/index.vue` (450 lines) to see what data source it uses. Likely `app/data/publist.json` or `app/data/dataAndPublications.json` — both exist in the repo.

Copy the JSON file to `astro/src/data/` and import:
```ts
import publist from '~/data/publist.json';
```

Render each entry as a SimpleCard.

If the legacy page has complex filtering / tabs / categorization, defer to Phase 5a — for Phase 4, just render a flat list.

Commit:
```
feat(astro): /data-and-publications/ listing — port publist data
```

### Task 6: `/meetings/` listing — placeholder

**File:** `astro/src/pages/meetings/index.astro`

NO content source found for meetings (no Strapi entity, no markdown directory). Two options:
- (a) Render "No meetings to display" empty state
- (b) Skip the route entirely (don't create the file)

Pick (a) — preserves the URL on the public site (existing internal/external links don't 404). Include a note in the file header explaining the absence of a content source.

Commit:
```
feat(astro): /meetings/ placeholder — content source not yet identified
```

---

## Wave B — Dynamic routes + home + audit (2 tasks)

### Task 7: Dynamic routes via getStaticPaths

**Files:**
- `astro/src/pages/news/[slug].astro` — single post (consume `QUERY_POST_BY_SLUG` via `getStaticPaths`)
- `astro/src/pages/[...slug].astro` — Strapi pages catch-all (filter via `siteConfig.reservedSlugs`)
- `astro/src/pages/tabs/[...slug].astro` — Strapi tabs catch-all

For each:
1. Implement `getStaticPaths` that returns `{ params: { slug }, props: { entity } }` for each Strapi entity.
2. In the page body, render the entity via `BaseLayout` + markdown.
3. For news single, include `<PostedMeta>` placeholder (Phase 5a real component) — Phase 4 can render the date inline.
4. The `[...slug]` catch-all must NOT match `404`, `translate`, `search`, `contact`, `debug`, `data-and-publications`, `faqs`, `news`, `meetings`, `tabs` — filter via `siteConfig.reservedSlugs.includes(slug)` (already defined).

Watch out for: if a Strapi page has a slug that collides with a static route, the static route wins in Astro.

For `getStaticPaths` returning an empty list (e.g., if Strapi temporarily returns no `tabs`), the build should still succeed (just no dynamic routes generated).

Commit per route OR one combined commit. Combined commit OK since they're related.

Commit:
```
feat(astro): dynamic routes — news/[slug], [...slug], tabs/[...slug]
```

### Task 8: Replace home Phase 1 placeholder + audit gates + log

**Files:**
- `astro/src/pages/index.astro` — replace Phase 1 placeholder with real home content (minus interactive components which land Phase 5b)
- Create `docs/perf/phase4-<sha>.md`

Steps:
1. Read legacy `app/pages/index.vue` to identify home structure.
2. Port the static parts (badge, title, tagline, body paragraph, "LIST OF PARTNERS" link). Defer:
   - HomeSlider → Phase 5b
   - HomeFeatureBoxes → Phase 5b
   - HomeBoxes → Phase 5b
   - HomeEvents / HomePosts → Phase 5b
   - Chart (Domestic and Sexual Violence Victims chart) → Phase 5b
3. Run audit gates:
   - `cd astro && pnpm preview` → audit `/`, `/news/`, `/news/<slug>/`, `/contact/`, `/faqs/` on mobile via lightcap
   - `axe-core AA` on the same 5 routes
   - `viewcap` pair (legacy vs Astro local) on the same 5 routes at desktop + mobile
4. Write audit log `docs/perf/phase4-<sha>.md` with all results.

If any audit gate fails (Perf < 98, A11y < 100, axe-core > 0), fix forward — don't exit Phase 4.

Commit:
```
feat(astro): home page real content + Phase 4 audit log
```

---

## Phase 4 exit checklist

- [x] All 14 legacy URLs resolve to 200 (or documented absence for meetings/*)
- [x] SimpleCard placeholder used for listings
- [x] Strapi catch-all `[...slug]` respects `reservedSlugs`
- [x] Mobile Lighthouse on `/`, `/news/`, `/news/<slug>/`, `/contact/`, `/faqs/`: Perf ≥ 98, A11y = 100, BP = 100, SEO = **100** (canonical present — closes the 92 gap)
- [x] axe-core AA = 0 on all 5 routes
- [x] viewcap pair vs legacy on all 5 routes (desktop + mobile)
- [x] `docs/perf/phase4-<sha>.md` committed

## Next: Phase 5a — Image pipeline + card primitives

Phase 5a replaces SimpleCard with real cards (PostedMeta, LastUpdated, SplashNews, InfoCard, EventCard) + wires the `fetch-cms-images.mjs` Sharp pipeline + `CmsImage.astro` responsive `<img srcset>`. After Phase 5a, listings have proper images and metadata.
