# ICJIA Strapi Cheatsheet (for Astro migrations)

> **Companion to `docs/astro-conversion-checklist-v4.md`.** This doc
> captures everything specific to ICJIA's Strapi GraphQL surface that
> the next migration will need — entity names, field renames,
> attachment shapes, image URL patterns, webhook setup. It's the
> reference you'd otherwise have to reconstruct by reading several
> Nuxt creator scripts + the live API.
>
> Last verified against `dvfr.icjia-api.cloud` on 2026-05-25.

---

## GraphQL endpoint pattern

Every ICJIA site has its own subdomain: `https://<sitename>.icjia-api.cloud/graphql`.

| Site | Endpoint |
|---|---|
| DVFR | `https://dvfr.icjia-api.cloud/graphql` |
| i2i | `https://i2i.icjia-api.cloud/graphql` |
| SFS | `https://sfs.icjia-api.cloud/graphql` |
| ARI (adultredeploy) | `https://ari.icjia-api.cloud/graphql` |
| R3 | `https://r3.icjia-api.cloud/graphql` (probable) |
| IFVCC | `https://ifvcc.icjia-api.cloud/graphql` (verify) |
| ICJIA public | `https://icjia.icjia-api.cloud/graphql` (verify; may be different) |

**Verify the endpoint with a simple introspection call before writing loaders:**

```sh
curl -X POST https://<sitename>.icjia-api.cloud/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { fields { name } } } }"}' \
  | jq -r '.data.__schema.queryType.fields[].name' | sort
```

This prints every available query (collection) name. Watch for legacy names like `posts`, `pages`, etc.

---

## Common entity names + their consumer-facing aliases

ICJIA sites tend to follow these patterns, **but verify per-site** with the introspection query above.

| GraphQL entity (in Strapi) | Astro Content Collection name | Consumer-facing URL pattern | Notes |
|---|---|---|---|
| `pages` | `pages` | `/<slug>/` (or `/` for `slug=index`) | Hub: site-wide CMS pages (about, contact, privacy, etc.) |
| `meetings` | `meetings` | `/meetings/<slug>/` | DVFR-specific; other sites may not have |
| **`posts`** | **`news`** ⚠️ | `/news/<slug>/` | **Legacy name mismatch: entity is `posts`, UI calls it `news`.** Every ICJIA site I've checked follows this. |
| `publications` | `publications` | `/publications/<slug>/` | |
| `faqs` | `faqs` | `/faq/#<slug>` | **Different field naming convention** (see below) |
| `cohorts` | `cohorts` | `/cohorts/<slug>/` | Adultredeploy + others |
| `apps` | `apps` | `/apps/` (list, no detail) | Researchhub uses this for application listings |

**Rule of thumb:** if the legacy Nuxt creator script imports from `creators/createMarkdown<Name>.js`, the Strapi entity is usually the lowercase plural of `<Name>` — but check the actual GraphQL query in that file to confirm.

---

## Shared field conventions (most collections)

```graphql
{
  <entity>s {
    data {
      id
      attributes {
        title           # most collections
        slug            # most collections (URL identifier)
        hideFromSearch  # boolean, defaults false
        hideFromSitemap # boolean, defaults false
        showTableOfContents # boolean, drives the TOC sidebar
        summary         # short description (used for OG/SEO descriptions + listing cards)
        body            # long markdown content
        section         # category-like grouping
        createdAt       # ISO 8601 UTC
        updatedAt       # ISO 8601 UTC
        publishedAt     # ISO 8601 UTC (null = draft)
        searchMeta      # extra search index hints (string)
      }
    }
  }
}
```

**Permissive Zod schemas are mandatory.** Use `.nullable().optional()` on every CMS field. An editor saving an empty string or leaving a field null should NOT break the build.

---

## Field-naming exceptions (the gotchas)

### FAQs — entirely different field set

```graphql
{
  faqs(sort: "ranking:asc,createdAt") {
    data {
      id
      attributes {
        name           # → rename to `title` in the loader
        identifier     # → rename to `slug`
        summary        # the question / short header
        details        # → rename to `body` (the long answer)
        ranking        # → numeric sort order, ascending
        section        # category
        createdAt
        publishedAt
        updatedAt
      }
    }
  }
}
```

**Rename at load time** so the consumer-facing collection has the same shape as other collections (title/slug/body), even though Strapi stores them as name/identifier/details. See `src/content.config.ts` in DVFR for the canonical pattern.

### Meetings — additional fields

```graphql
{
  meetings {
    data {
      id
      attributes {
        # ... shared fields ...
        start         # ISO 8601 (meeting start datetime)
        end           # ISO 8601 (meeting end datetime)
        category      # 'regular' | 'special' | etc.
        isCancelled   # boolean — drives the red CANCELLED banner
        cancelMessage # string — explanation shown if isCancelled
        attachments { data { attributes { ... } } }  # see Attachments below
      }
    }
  }
}
```

### News (Strapi entity: `posts`) — additional fields

```graphql
{
  posts {              # NOTE: GraphQL entity is `posts`, NOT `news`
    data {
      id
      attributes {
        # ... shared fields ...
        dateOverride  # ISO 8601 — use this for sort/display if set, else publishedAt
        category      # tag-like string for filtering
        link {        # ARRAY of components (not singleton!)
          id
          title
          url
          summary
        }
        splash {      # single-image relation
          data {
            id
            attributes {
              caption
              name
              formats   # nested object: thumbnail/small/medium/large each with url, width, height
            }
          }
        }
        attachments { data { attributes { ... } } }
      }
    }
  }
}
```

### Publications

Same as news minus `splash`. `link` is still an array, attachments same shape.

---

## Attachment shape (consistent across all collections)

```graphql
attachments {
  data {
    attributes {
      createdAt
      updatedAt
      name             # original filename WITH extension
      alternativeText  # alt text
      url              # /uploads/<hashedfilename>.<ext> (relative to <site>.icjia-api.cloud)
      ext              # ".pdf", ".docx", etc.
      size             # ⚠️ in KB (decimal), NOT raw bytes
    }
  }
}
```

**`size` is in KB, NOT bytes.** The Vue helper `niceBytes(size)` in the legacy Nuxt site treats it as bytes, so a 575 KB PDF renders as "575.8 B" on prod. For Tier 1 visual continuity, **preserve the bug** in the Astro port. Document in CHANGELOG. Fix in a Phase 7+ commit once Tier 1 is no longer the dominant constraint.

---

## Image URL patterns

Strapi-hosted images live at one of two URL shapes:

1. **Direct upload URL** — `<entity>.url` in nested objects (splash, profile picture, etc.):
   ```
   https://<sitename>.icjia-api.cloud/uploads/<hashed-name>.{jpg|jpeg|png|gif|webp}
   ```

2. **Inline in markdown body** — CMS authors paste HTML or markdown image syntax inside `body`:
   ```html
   <img src="https://<sitename>.icjia-api.cloud/uploads/<hashed-name>.jpg"
        width="100" alt="..."
        style="float:left; padding-right:10px;" />
   ```
   ⚠️ Bio headshots use `style="float:left"` to wrap paragraph text. Your `xss` config MUST allow the `style` attribute on `<img>` AND extend the CSS whitelist to include `float`, `clear`, `display`, `padding-*`, `margin-*`. Default xss strips all of these. See `src/lib/markdown.ts` in DVFR.

3. **`splash.formats.*` nested URLs** — Strapi auto-generates `thumbnail`, `small`, `medium`, `large` variants with `formats: { thumbnail: { url: "/uploads/thumbnail_xxx.jpg", width, height }, ... }`. Build-time image pipeline (`scripts/fetch-cms-images.mjs`) walks for all of these.

---

## MDC component invocations in markdown body

Many ICJIA sites use `@nuxt/content`'s **MDC syntax** to embed Vue components inside markdown. Tokens look like `:component-name` on a line by themselves:

```
Some intro text here.

:home-text


:home-boxes


More text here.
```

When migrating to Astro, `markdown-it` does NOT interpret `:component-name` — it renders as literal text. **Audit every body string for MDC tokens BEFORE writing the markdown renderer:**

```sh
# After Phase 3 populates .cache/strapi/, run:
grep -nE "^\s*:[a-z][a-z0-9-]*\s*$" .cache/strapi/*.json
```

For each unique token, decide between:
- **Strategy 1 (direct render):** Render the Astro port of the component DIRECTLY in the page template, skip the markdown body for that page. Simplest. Used by DVFR for `:home-text`.
- **Strategy 2 (pre-processor):** Pre-process the body string to swap MDC tokens for inline HTML. Scales to many components, but pre-rendering Astro components to strings is non-trivial.

Full pattern + catalog in `docs/astro-conversion-checklist-v4.md` § "MDC components called from Strapi markdown".

---

## Webhook / deploy automation

Most ICJIA Strapi installs have a **Strapi-side webhook** that POSTs to a Netlify build hook on content publish. To find it:

1. Log into the Strapi admin (`https://<sitename>.icjia-api.cloud/admin`)
2. Look for a **"Netlify" or "Deployments" sidebar link** (some installs have `strapi-plugin-netlify-deployments`)
3. OR check **Settings → Global settings → Webhooks** for an entry pointing at `https://api.netlify.com/build_hooks/<id>`

Cross-check on the Netlify side:

```sh
netlify api listSiteBuildHooks --data '{"site_id":"<netlify-site-id>"}'
```

If you find a hook there but NOT in the Strapi admin → it's an orphan (someone deleted the Strapi side without deleting the Netlify side). Or the trigger is in Strapi backend code (`src/api/<entity>/content-types/lifecycles.ts`) rather than the admin UI.

DVFR finding (2026-05-25): a hook named `strapi_build_032023` was firing without anyone realizing — likely a `strapi-plugin-netlify-deployments` plugin install from March 2023.

---

## CMS authoring conventions worth knowing

- **`section: "root"` is the homepage-level page.** `pages` entries with `section: "root"` live at `/`; entries with other sections like `section: "about"` typically map to `/about/<slug>/`. DVFR doesn't use nested sections; the v4 catch-all template assumes flat routes.
- **`hideFromSearch: true`** excludes from the search index. **`hideFromSitemap: true`** excludes from `sitemap.xml`. Used for unlisted/draft-but-published pages.
- **`searchMeta`** is a free-form string the author can use to add invisible search keywords. Index it as part of the search body but don't display it.
- **`isPublished`** is sometimes a Strapi schema field (separate from `publishedAt`) — boolean. When migrating older sites, check whether `attributes.isPublished` exists; if so, treat `isPublished === false` as a draft to skip.

---

## Common Strapi v4 → v5 differences (if you encounter v5)

The patterns above assume Strapi v4 (the dominant ICJIA version as of mid-2026). Strapi v5 changes the response shape:

- v4: `{ data: [{ id, attributes: { title, ... } }] }`
- v5: `{ data: [{ id, documentId, title, ... }] }` (no `attributes` wrapper)

If you migrate a site that's been upgraded to Strapi v5, the loader's unwrap step changes from `entry.attributes.title` to `entry.title`. Detect via the response shape on the first GraphQL call; the rest of the patterns (`hideFromSearch`, repeatable components, attachments) carry over.

---

## Pre-migration audit recipe

Run this against any new ICJIA site BEFORE writing the Astro spec:

```sh
# 1. Inventory Strapi entities
curl -s -X POST https://<site>.icjia-api.cloud/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { fields { name type { name kind ofType { name } } } } } }"}' \
  | jq '.data.__schema.queryType.fields[] | {name, type: .type.ofType.name}'

# 2. Inventory entity field counts (so you know roughly how many entries to expect)
for entity in pages posts publications meetings faqs; do
  count=$(curl -s -X POST https://<site>.icjia-api.cloud/graphql \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"{ ${entity} { meta { pagination { total } } } }\"}" \
    | jq -r ".data.${entity}.meta.pagination.total // \"n/a\"")
  echo "${entity}: ${count}"
done

# 3. Sample one entity body for MDC token detection
curl -s -X POST https://<site>.icjia-api.cloud/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ pages { data { attributes { slug body } } } }"}' \
  | jq -r '.data.pages.data[] | .attributes.slug + " :: " + (.attributes.body // "")[0:200]' \
  | head -20
```

If step 3 surfaces `:foo-component` tokens, you have MDC components to plan for in Phase 4 of the migration spec.
