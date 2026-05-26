# Astro Migration — Phase 3: Content Layer

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Wire Strapi v4 GraphQL loaders + Zod schemas + markdown pipeline + build-time caching. No new user-visible markup this phase. Phase 4 consumes these loaders.

**Strapi API probe (already done by controller):**
- Endpoint: `https://infonet.icjia-api.cloud/graphql`
- **Version: v4** (response shape `{ data: { posts: { data: [{ id, attributes: {...} }] } } }`)
- Available top-level entities: `faqs`, `forms`, `pages`, `posts`, `tabs`
- Pagination: `pagination: { limit: N, page: M }`
- Field naming: camelCase (`createdAt`, NOT v3's `created_at`)

**Architecture:**
- `astro/src/lib/strapi.ts` — GraphQL fetch wrapper with `AbortSignal.timeout(60_000)` + build-time cache to `.cache/strapi/<sha256>.json`
- `astro/src/lib/queries.ts` — every GraphQL query the app runs (one per entity / list-vs-detail)
- `astro/src/lib/schemas.ts` — Zod schemas mirroring Strapi response shapes (`.nullable().optional()` everywhere — v6 rule)
- `astro/src/lib/markdown.ts` — markdown-it + xss + post-processor (lazy/decoding attrs + heading IDs + external links + manifest image rewrite stub for Phase 5a)
- `astro/src/lib/dates.ts` — Chicago-timezone date formatters (legacy uses `America/Chicago`)
- Field renames per `docs/icjia-strapi-cheatsheet.md`:
  - FAQ: `name`→`title`, `identifier`→`slug`, `details`→`body`, `ranking`→`ranking`
  - News (posts): `dateOverride`→`createdAt` (Strapi v4 already has `createdAt`)

**Companion docs:**
- Spec: `docs/superpowers/specs/2026-05-26-astro-migration-design.md`
- Strapi cheatsheet: `docs/icjia-strapi-cheatsheet.md`
- IFVCC reference (V4 Strapi loader):
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/strapi.ts` (116 lines)
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/queries.ts` (184 lines)
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/markdown.ts` (180 lines)

**Exit criteria:**
- `pnpm build` succeeds.
- A `.cache/strapi/*.json` directory contains at least one cached entry after a build that runs a Strapi fetch (verified by a small smoke script or a build-time `console.log`).
- A test script (or a Phase 4 page preview) can load `posts`, `faqs`, `pages`, `tabs` and Zod-validate the response without errors.
- `markdown.ts` round-trip: feed a small markdown sample with `**bold**` + `[link](https://example.com)` + `![alt](https://image.icjia.cloud/sig/url.jpg)` + `## heading`. Output should:
  - Render `<strong>bold</strong>`
  - Render `<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>`
  - Rewrite the image src through the manifest stub (Phase 5a wires the real manifest; for Phase 3, the stub returns raw URL)
  - Render `<h2 id="heading">heading</h2>`
- No user-visible markup added or modified in this phase.

**Estimated tasks:** 6 tasks. Execution ~60 min.

---

## Required reading

```bash
# IFVCC reference (v4 Strapi loader — closest match)
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/strapi.ts
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/queries.ts
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/markdown.ts
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/lib/dates.ts

# Strapi cheatsheet — field renames + v3/v4 detection
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/docs/icjia-strapi-cheatsheet.md

# Legacy Infonet GraphQL queries — what to port
ls /Volumes/satechi/webdev/icjia-infonet-nuxt4/app/graphql/ 2>/dev/null
find /Volumes/satechi/webdev/icjia-infonet-nuxt4/app -name "*.js" -o -name "*.ts" 2>/dev/null | xargs grep -li "graphql\|gql\|fetch\|axios" 2>/dev/null | head -10
```

## Tasks

### Task 1: `astro/src/lib/strapi.ts` — fetch wrapper + cache

Port from IFVCC. Key contract:

```ts
export async function strapiFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T>;
```

- Uses `fetch` with `AbortSignal.timeout(siteConfig.api.timeoutMs)`
- Caches keyed by sha256 of `JSON.stringify({ query, variables })` to `.cache/strapi/<hash>.json`
- Cache directory created if missing
- On `Strapi error` response, throws — don't silently fail
- Read-from-cache is the default behavior at build time (re-fetch only if cache miss)

Commit:
```
feat(astro): strapi.ts — v4 GraphQL fetch wrapper with build-time cache
```

### Task 2: `astro/src/lib/queries.ts` — typed GraphQL queries

One export per entity/use:

```ts
export const QUERY_PAGE_LIST = `query Pages { pages { data { id attributes { slug title createdAt updatedAt } } } }`;
export const QUERY_PAGE_BY_SLUG = `query Page($slug: String) { pages(filters: { slug: { eq: $slug } }) { data { id attributes { ... } } } }`;
export const QUERY_POST_LIST = `...`;   // news
export const QUERY_POST_BY_SLUG = `...`;
export const QUERY_FAQ_LIST = `...`;
export const QUERY_TAB_BY_SLUG = `...`;
export const QUERY_HOME = `...`;          // home content (if applicable — check legacy)
```

For attributes payload, include EVERY field consumed by Phase 4 routes. Look at legacy:
- `app/composables/`, `app/utils/`, `app/pages/` for actual field usage in templates
- legacy GraphQL queries are typically in `app/graphql/` or inline in pages

For each entity, request: `id`, `slug`, `title`, `body`, `createdAt`, `updatedAt`, plus entity-specific fields.

Commit:
```
feat(astro): queries.ts — Strapi v4 GraphQL queries for pages/posts/faqs/tabs
```

### Task 3: `astro/src/lib/schemas.ts` — Zod validation

One schema per entity. Wrap every nullable/optional field with `.nullable().optional()`:

```ts
import { z } from 'zod';

export const PageAttrSchema = z.object({
  title: z.string().nullable().optional(),
  slug: z.string(),                      // not nullable for routing
  body: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  // ... entity-specific fields
});

export const PageSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),  // Strapi sometimes returns numeric id
  attributes: PageAttrSchema,
});

export const PageListResponseSchema = z.object({
  data: z.object({
    pages: z.object({
      data: z.array(PageSchema),
    }),
  }),
});
```

Add Zod to deps if not present: `cd astro && pnpm add zod`.

Commit:
```
feat(astro): schemas.ts — Zod validation for Strapi v4 response shapes
```

### Task 4: `astro/src/lib/markdown.ts` — markdown pipeline

Port from IFVCC. Steps after the markdown-it parse:
1. `xss` sanitize the output (allowlist standard tags + the attribute set IFVCC uses)
2. Add `loading="lazy"` + `decoding="async"` to all `<img>` tags via regex post-process
3. Rewrite image `src` through `cms-image-manifest.json` lookup (Phase 5a wires the manifest; Phase 3 stubs this with identity passthrough — `src` → `src` unchanged)
4. Add `id="<slug-of-text>"` to every `<h1..h6>` for in-page anchors
5. Add `target="_blank" rel="noopener noreferrer"` to external links (use `rehype-external-links` OR a regex post-pass)

Provide:

```ts
export function renderMarkdown(md: string): { html: string; headings: { id: string; text: string; level: number }[] };
```

The `headings` array feeds the TOC component (Phase 5b).

Commit:
```
feat(astro): markdown.ts — markdown-it + xss + lazy/heading-id post-process
```

### Task 5: `astro/src/lib/dates.ts` — Chicago-timezone formatters

Port from IFVCC. Key exports:

```ts
export function formatDate(iso: string | null | undefined, fmt?: 'short' | 'long' | 'iso'): string;
export function formatRelative(iso: string | null | undefined): string;  // "3 days ago"
```

Use `Intl.DateTimeFormat` with `timeZone: 'America/Chicago'` (Infonet's site-wide timezone per `siteConfig.timezone`).

Commit:
```
feat(astro): dates.ts — Chicago-tz date formatters
```

### Task 6: Smoke test + cache directory verification

**Files:**
- Create: `astro/scripts/smoke-strapi.mjs` — small Node script that calls each entity loader and prints counts
- Modify: `astro/package.json` — add `smoke:strapi` script
- Verify the cache files land in `.cache/strapi/`

```bash
cd astro && pnpm smoke:strapi
```

Expected output:
```
pages: 30 entries cached
posts: 100 entries cached
faqs: 20 entries cached
tabs: 5 entries cached
```

If a fetch fails (timeout, network error), the script should print the failure but NOT cache. Re-running should re-attempt.

Add a markdown round-trip smoke:
```bash
cd astro && pnpm node -e "
  import('./src/lib/markdown.ts').then(m => {
    const { html, headings } = m.renderMarkdown('# Hello\\n\\n**bold** [link](https://example.com)\\n\\n![alt](https://image.icjia.cloud/sig/url.jpg)');
    console.log('html:', html);
    console.log('headings:', headings);
  });
"
```

(Use whatever runner works for `.ts` files — `tsx`, `bun`, or compile to `.mjs` first. IFVCC's pattern was a separate `.mjs` test script.)

Commit:
```
feat(astro): smoke-strapi.mjs — Phase 3 content-layer integration test
```

---

## Phase 3 exit checklist

- [x] `strapi.ts` fetch wrapper with timeout + cache
- [x] `queries.ts` covers all Phase 4 routes (pages, posts, faqs, tabs)
- [x] `schemas.ts` Zod validation for v4 response shapes
- [x] `markdown.ts` produces lazy-loaded images, heading IDs, external-link `_blank`
- [x] `dates.ts` formats in America/Chicago
- [x] Smoke test exercises all loaders, caches present in `.cache/strapi/`
- [x] `pnpm build` succeeds
- [x] No new pages/components added (Phase 4 scope)
- [x] No regressions on Phase 2's audit gates

## Next: Phase 4 — Static pages + dynamic routes

Phase 4 consumes the loaders this phase ships. 14 routes total: `index`, `404`, `translate`, `search`, `contact`, `debug`, `[...slug]`, `tabs/[...slug]`, `news/` (list + detail), `meetings/` (list + detail), `data-and-publications`, `faqs`. Once Phase 4 ships, viewcap pixel-perfect-vs-legacy diffs become possible against routes with REAL content.
