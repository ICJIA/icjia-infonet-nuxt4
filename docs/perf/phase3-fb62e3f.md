# Phase 3 audit — fb62e3f

**Date:** 2026-05-26
**Branch:** `feat/astro-migration`
**HEAD SHA:** `fb62e3f`
**Audit method:** No new user-visible markup — exit gate is "content layer wired and smoke-tested," verified via `astro/scripts/smoke-strapi.mjs`.

## Smoke-test results

- pages: **10** entries cached
- posts (news): **22** entries cached
- faqs: **135** entries cached
- tabs: **6** entries cached
- markdown round-trip: **PASS** (18/18 assertions)

## Build verification

- `pnpm exec astro check`: 0 errors, 0 warnings
- `pnpm build`: 2 pages (home + 404), 789ms — no errors
- `.cache/strapi/*.json`: 4 files (one per entity query)

## Lighthouse re-check (no regression)

Mobile `/` (still Phase 1 placeholder content):

| Perf | A11y | BP | SEO |
|---:|---:|---:|---:|
| **99** | **100** | **100** | **100** |

axe-core AA: **0 violations**

## Code quality findings (caught during implementation)

- **`strapi.ts` cache key bug:** initial impl used `JSON.stringify({query, variables}, Object.keys(variables))` which serialized to `{}` for all queries (empty variables). All queries hashed to same key. Fixed to `JSON.stringify(variables, Object.keys(variables).sort())` for stable cache key.
- **xss module shape:** `xss` package exports `FilterXSS` named + `getDefaultWhiteList` on CJS default. `markdown.ts` handles via `import xssLib, * as xssNs from 'xss'` typed cast.

## Strapi findings (appended to `docs/icjia-strapi-cheatsheet.md`)

- Infonet's `FaqEntity` uses `question` + `answer`, NOT the DVFR baseline `name`/`identifier`/`details`. Documented in cheatsheet's "Infonet Strapi findings" section.

## Predicted vs actual

| Metric | Predicted | Actual | Discrepancy |
|---|---|---|---|
| Strapi version | v3 or v4 (cheatsheet covers both) | **v4** confirmed | none ✅ |
| Loaders work | yes | yes (4 entities) | none ✅ |
| FAQ field shape | matches cheatsheet baseline | **diverges** (Infonet uses `question`/`answer`) | required schema adaptation |
| markdown round-trip | works | works | none ✅ |
| Lighthouse regression | none | none (99/100/100/100) | none ✅ |

## Commits shipped this phase (7)

| SHA | Subject |
|---|---|
| `4cb2ad9` | strapi.ts — v4 GraphQL fetch wrapper with build-time cache |
| `90972eb` | queries.ts — Strapi v4 GraphQL queries for pages/posts/faqs/tabs |
| `981422b` | schemas.ts — Zod validation for Strapi v4 response shapes |
| `1471e72` | markdown.ts — markdown-it + xss + lazy/heading-id post-process |
| `361c4d3` | dates.ts — Chicago-tz date formatters |
| `7c41d10` | smoke-strapi.mjs — Phase 3 content-layer integration test |
| `fb62e3f` | **fix: markdown.ts xss cast + JSON import attr; smoke-strapi unused import** (audit-driven fix during smoke) |

## Exit checklist

- [x] `strapi.ts` wrapper with `AbortSignal.timeout(60s)` + sha256 cache to `.cache/strapi/`
- [x] `queries.ts` covers `pages` / `posts` / `faqs` / `tabs` (list + detail)
- [x] `schemas.ts` Zod validators with `.nullable().optional()` per v6 rule
- [x] `markdown.ts` adds `loading="lazy"` + `decoding="async"` + heading IDs + external-link `_blank`
- [x] `dates.ts` formats in `America/Chicago`
- [x] Smoke test exercises all 4 entity loaders + markdown
- [x] `.cache/strapi/` populated (4 files)
- [x] `pnpm build` succeeds; no Phase 1/2 regressions
- [x] No new pages/components added (Phase 4 scope)

## Next: Phase 4 — Static pages + dynamic routes

Phase 4 consumes these loaders. 14 routes. First phase with actual content + viewcap pixel-perfect-vs-legacy diffs on routes with real data.
