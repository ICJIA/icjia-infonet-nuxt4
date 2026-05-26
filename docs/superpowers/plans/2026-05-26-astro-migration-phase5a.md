# Astro Migration — Phase 5a: Image pipeline + card primitives

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Eliminate `image.icjia.cloud` from the dist HTML/CSS (Hard Rule #2). Self-host every Strapi-hosted image via Sharp. Replace `SimpleCard` everywhere with real card primitives. Wire `markdown.ts` image rewrite via manifest.

**Architecture:**
- `astro/scripts/fetch-cms-images.mjs` — walks `.cache/strapi/*.json`, extracts image URLs, downloads originals, runs Sharp through size variants (320/640/960/1280 width), writes to `astro/public/_cms-img/<hash>/{w}.{ext}`, builds `astro/src/lib/cms-image-manifest.json` keyed by sha256-of-source-URL
- `astro/src/components/CmsImage.astro` — responsive `<img srcset sizes>` consuming manifest; falls back to raw URL if manifest miss
- Card components: `PostedMeta`, `LastUpdated`, `SplashNews`, `InfoCard`, `EventCard`
- `markdown.ts` post-process: rewrite `<img src=...>` through manifest lookup (Phase 3 stub becomes real here)
- Build chain becomes 2-pass: `pnpm build && pnpm fetch:cms-images && pnpm build` (manifest needs Strapi cache; final build needs manifest)

**Companion docs:**
- IFVCC references (~~v6~~ closest match):
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/scripts/fetch-cms-images.mjs` (184 lines)
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/CmsImage.astro` (97 lines)
  - `/Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/{InfoCard,SplashNews,EventCard,PostedMeta}.astro`

**Exit criteria:**
- `grep -rn -E "thumbor|image\.icjia\.cloud|getImageURL" astro/src/ astro/public/` returns only comments (Hard Rule #2).
- `cd astro && pnpm fetch:cms-images && pnpm build` succeeds and emits images under `astro/public/_cms-img/`.
- `astro/src/lib/cms-image-manifest.json` populated (not `{}`).
- News listing renders `SplashNews` (latest) + `InfoCard` (rest). Replaces SimpleCard.
- News detail renders `PostedMeta` (author + date) at top of article.
- Mobile Lighthouse on `/`, `/news/`, `/news/<slug>/`: Perf ≥ 98, A11y/BP/SEO = 100.
- axe-core AA = 0 on the same 3 routes.

**Estimated tasks:** 7 tasks. Execution: ~75 min.

---

## Required reading

```bash
# IFVCC references (all closest reference for Phase 5a)
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/scripts/fetch-cms-images.mjs
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/CmsImage.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/InfoCard.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/SplashNews.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/EventCard.astro
cat /Volumes/satechi/webdev/icjia-ifvcc-2021/astro/src/components/PostedMeta.astro

# Existing infrastructure (Phase 1 stub + Phase 3 markdown stub)
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/scripts/fetch-cms-images.mjs
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/src/lib/cms-image-manifest.json
cat /Volumes/satechi/webdev/icjia-infonet-nuxt4/astro/src/lib/markdown.ts  # manifest stub here

# Strapi schema — what image fields exist on posts?
curl -fsS -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"PostEntity\") { fields { name type { name kind ofType { name } } } } }"}' \
  https://infonet.icjia-api.cloud/graphql | head -c 4000
```

## Tasks

### Task 1: Implement `astro/scripts/fetch-cms-images.mjs` (real, not stub)

Port from IFVCC. Algorithm:
1. Read every `.cache/strapi/*.json` in `astro/.cache/strapi/`.
2. Extract every Strapi attachment URL — typically under `attributes.<field>.data.attributes.url` for individual images or `attributes.<field>.data[].attributes.url` for repeatable. Recursive walker.
3. For each unique source URL:
   - sha256 = hash of source URL (canonical absolute URL — prepend `https://infonet.icjia-api.cloud` if relative)
   - skip if manifest already has the hash AND files exist
   - download original to `astro/.cache/cms-images/<hash>.<ext>` (cached so re-runs don't re-download)
   - run Sharp through size variants: 320, 640, 960, 1280 width (don't upscale beyond original)
   - emit to `astro/public/_cms-img/<hash>/<width>.<ext>` (use webp + jpeg pairs ideally; jpeg-only is fine for Phase 5a)
   - record manifest entry: `{ hash: { originalUrl, alt?, width, height, sources: [{ src, width, ext }, ...] } }`
4. Write `astro/src/lib/cms-image-manifest.json` (overwrite — manifest is built artifact).
5. Handle network errors gracefully — log skip, don't crash the build.

**Orphan handling:** if a Strapi URL 404s on direct download but matches a Thumbor-cached URL pattern (`image.icjia.cloud/<sig>/<url>`), download via Thumbor URL and self-host. Note in manifest entry as `orphan: true`.

Add npm script: `"fetch:cms-images": "node scripts/fetch-cms-images.mjs"` (Phase 1 stub had this — replace stub body).

Commit:
```
feat(astro): fetch-cms-images.mjs — Sharp pipeline self-hosts Strapi images
```

### Task 2: `astro/src/components/CmsImage.astro`

Props:
```ts
interface Props {
  src: string;        // raw Strapi URL (relative or absolute)
  alt: string;
  sizes?: string;     // default '(max-width: 768px) 100vw, 50vw'
  loading?: 'lazy' | 'eager';
  className?: string;
}
```

Behavior:
1. Compute sha256 of canonicalized `src`.
2. Look up in `cms-image-manifest.json`.
3. If found: emit `<img srcset="..." sizes="..." width="..." height="..." loading="lazy" decoding="async">`.
4. If miss: emit raw-URL `<img src={src} alt={alt} loading="lazy" decoding="async">`. Log a build-time warning (so manifest gaps surface).

Always `loading="lazy" decoding="async"` (unless `loading="eager"` passed explicitly).

Commit:
```
feat(astro): CmsImage.astro — responsive srcset with manifest lookup + raw fallback
```

### Task 3: Update `markdown.ts` image rewrite

The Phase 3 stub does identity passthrough. Replace with manifest lookup:
1. For each `<img>` tag in the rendered markdown, hash the `src` URL.
2. If manifest has the hash, swap `src` to the largest source AND emit `srcset` + `sizes` attributes inline. Or just swap `src` to a representative size (e.g., 960px).
3. If manifest miss, leave the raw URL (Sharp pipeline misses are degraded but not broken).

Keep the existing `loading="lazy"` + `decoding="async"` post-process.

Commit:
```
feat(astro): markdown.ts wires real manifest image rewrite
```

### Task 4: `PostedMeta` + `LastUpdated`

**File:** `astro/src/components/PostedMeta.astro`
Renders author + post date. Props: `{ author?: string; date: string }`. Use `formatDate` from `~/lib/dates`. Tiny component (~20 lines).

**File:** `astro/src/components/LastUpdated.astro`
Renders "Updated: <date>". Props: `{ date: string }`. ~15 lines.

Commit:
```
feat(astro): PostedMeta + LastUpdated components
```

### Task 5: `SplashNews` + `InfoCard`

**SplashNews.astro** — featured-card variant for the latest post on `/news/`. Large image, large title, summary, "Read more →" link. Use `CmsImage` for the splash. Look at legacy news listing for the visual spec.

**InfoCard.astro** — secondary card variant. Smaller image, title, date, summary. Used for non-latest posts on `/news/`.

Both consume the same post entity shape from Phase 3 schemas.

Commit:
```
feat(astro): SplashNews + InfoCard components — replace SimpleCard on /news/
```

### Task 6: `EventCard` + update news listing

**EventCard.astro** — date-prominent card variant for events. Used on home (Phase 5b) and possibly elsewhere. Even if Infonet has no current events, ship this for parity with the IFVCC pattern.

**Update `pages/news/index.astro`:** replace the SimpleCard loop:
```astro
{posts.length > 0 && (
  <SplashNews post={posts[0]} />
  {posts.slice(1).map(p => <InfoCard post={p} />)}
)}
```

Commit:
```
feat(astro): EventCard + wire SplashNews/InfoCard into /news/ listing
```

### Task 7: 2-pass build chain + audit gates + log

**Update `astro/package.json` build script:**
```json
"build": "astro build && node scripts/fetch-cms-images.mjs && astro build"
```

(First build seeds `.cache/strapi/`. Then fetch-cms-images populates `/public/_cms-img/` and the manifest. Then second build picks up the manifest and emits real srcset.)

Add a separate `build:fast`:
```json
"build:fast": "astro build"
```

(For dev iteration — skips the fetch.)

**Audit:**
1. `cd astro && pnpm build` (full 2-pass)
2. Verify `astro/public/_cms-img/` populated, `astro/src/lib/cms-image-manifest.json` non-empty
3. `grep -rn -E "thumbor|image\.icjia\.cloud|getImageURL" dist/` — only comments OK
4. `pnpm preview` + audit 3 routes (`/`, `/news/`, `/news/<slug>/`) on mobile via lightcap
5. axe-core AA on same 3 routes
6. Write `docs/perf/phase5a-<sha>.md`
7. Commit + push

Commit:
```
docs(perf): Phase 5a audit log — image pipeline + cards
```

---

## Phase 5a exit checklist

- [x] `fetch-cms-images.mjs` populates `/public/_cms-img/` + manifest
- [x] `CmsImage.astro` emits srcset for manifested images, falls back gracefully
- [x] `markdown.ts` rewrites image URLs through manifest
- [x] SplashNews + InfoCard + EventCard + PostedMeta + LastUpdated all shipped
- [x] /news/ uses SplashNews/InfoCard (no SimpleCard left on news listing)
- [x] No `image.icjia.cloud` / `thumbor` URLs in `dist/` (only comments)
- [x] 2-pass build chain configured + working
- [x] Mobile Lighthouse 98+ + axe AA 0 on 3 routes
- [x] `docs/perf/phase5a-<sha>.md` committed
