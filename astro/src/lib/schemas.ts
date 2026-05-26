// astro/src/lib/schemas.ts
//
// Zod validation schemas for Strapi v4 GraphQL response shapes.
//
// Rules (per v6 migration checklist):
//   - Every CMS-supplied field must be .nullable().optional() — editors can
//     leave fields empty and that must NOT break the build.
//   - id arrives as a string from Strapi v4 (confirmed in live responses) but
//     we guard with z.union([z.string(), z.number()]).transform(String) for safety.
//   - Permissive > strict: a new field added in Strapi without a schema update
//     should not cause a parse failure.
//
// Confirmed field shapes via live introspection 2026-05-26:
//   Post: title|slug|dateOverride|category|hideFromSearch|hideFromSitemap|
//         showTableOfContents|summary|body|section|splash|searchMeta|
//         createdAt|updatedAt|publishedAt
//   Page: title|slug|summary|body|section|showTableOfContents|hideFromSearch|
//         hideFromSitemap|searchMeta|createdAt|updatedAt|publishedAt
//   Faq:  question|answer|ranking|slug|category|agency|cat|subcat|
//         createdAt|updatedAt|publishedAt
//   Tab:  title|slug|agency|summary|body|sectionID|ranking|searchMeta|
//         createdAt|updatedAt|publishedAt

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Strapi IDs come back as strings from v4, but guard for numeric too. */
const IdSchema = z.union([z.string(), z.number()]).transform(String);

/** ISO 8601 datetime — nullable/optional per CMS rules. */
const IsoDateSchema = z.string().nullable().optional();

// ---------------------------------------------------------------------------
// UploadFile (splash image)
// ---------------------------------------------------------------------------

export const UploadFileAttrSchema = z.object({
  url: z.string().nullable().optional(),
  alternativeText: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  formats: z.unknown().nullable().optional(), // JSON blob with thumbnail/small/medium/large
});

export const UploadFileEntitySchema = z.object({
  id: IdSchema,
  attributes: UploadFileAttrSchema,
});

export const UploadFileEntityResponseSchema = z.object({
  data: UploadFileEntitySchema.nullable().optional(),
});

export type UploadFileAttr = z.infer<typeof UploadFileAttrSchema>;
export type UploadFileEntity = z.infer<typeof UploadFileEntitySchema>;

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const PageAttrSchema = z.object({
  title: z.string().nullable().optional(),
  slug: z.string(),
  summary: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  showTableOfContents: z.boolean().nullable().optional(),
  hideFromSearch: z.boolean().nullable().optional(),
  hideFromSitemap: z.boolean().nullable().optional(),
  searchMeta: z.string().nullable().optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  publishedAt: IsoDateSchema,
});

export const PageSchema = z.object({
  id: IdSchema,
  attributes: PageAttrSchema,
});

export const PageListResponseSchema = z.object({
  pages: z.object({
    data: z.array(PageSchema),
    meta: z.object({
      pagination: z.object({ total: z.number() }).nullable().optional(),
    }).nullable().optional(),
  }),
});

export const PageBySlugResponseSchema = z.object({
  pages: z.object({
    data: z.array(PageSchema),
  }),
});

export type PageAttr = z.infer<typeof PageAttrSchema>;
export type Page = z.infer<typeof PageSchema>;

// ---------------------------------------------------------------------------
// Posts (user-facing: "news")
// ---------------------------------------------------------------------------

export const PostAttrSchema = z.object({
  title: z.string().nullable().optional(),
  slug: z.string(),
  summary: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  dateOverride: z.string().nullable().optional(), // Date-only string e.g. "2023-10-03"
  showTableOfContents: z.boolean().nullable().optional(),
  hideFromSearch: z.boolean().nullable().optional(),
  hideFromSitemap: z.boolean().nullable().optional(),
  searchMeta: z.string().nullable().optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  publishedAt: IsoDateSchema,
  splash: UploadFileEntityResponseSchema.nullable().optional(),
});

export const PostSchema = z.object({
  id: IdSchema,
  attributes: PostAttrSchema,
});

export const PostListResponseSchema = z.object({
  posts: z.object({
    data: z.array(PostSchema),
    meta: z.object({
      pagination: z.object({ total: z.number() }).nullable().optional(),
    }).nullable().optional(),
  }),
});

export const PostBySlugResponseSchema = z.object({
  posts: z.object({
    data: z.array(PostSchema),
  }),
});

export type PostAttr = z.infer<typeof PostAttrSchema>;
export type Post = z.infer<typeof PostSchema>;

// ---------------------------------------------------------------------------
// FAQs
// Note: Infonet uses `question` + `answer` (not name/identifier/details).
// ---------------------------------------------------------------------------

export const FaqAttrSchema = z.object({
  question: z.string().nullable().optional(),
  answer: z.string().nullable().optional(),
  ranking: z.number().nullable().optional(),
  slug: z.string(),
  category: z.string().nullable().optional(),
  agency: z.string().nullable().optional(),
  cat: z.string().nullable().optional(),
  subcat: z.string().nullable().optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  publishedAt: IsoDateSchema,
});

export const FaqSchema = z.object({
  id: IdSchema,
  attributes: FaqAttrSchema,
});

export const FaqListResponseSchema = z.object({
  faqs: z.object({
    data: z.array(FaqSchema),
    meta: z.object({
      pagination: z.object({ total: z.number() }).nullable().optional(),
    }).nullable().optional(),
  }),
});

export type FaqAttr = z.infer<typeof FaqAttrSchema>;
export type Faq = z.infer<typeof FaqSchema>;

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export const TabAttrSchema = z.object({
  title: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  agency: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  sectionID: z.string().nullable().optional(),
  ranking: z.number().nullable().optional(),
  searchMeta: z.string().nullable().optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  publishedAt: IsoDateSchema,
});

export const TabSchema = z.object({
  id: IdSchema,
  attributes: TabAttrSchema,
});

export const TabListResponseSchema = z.object({
  tabs: z.object({
    data: z.array(TabSchema),
    meta: z.object({
      pagination: z.object({ total: z.number() }).nullable().optional(),
    }).nullable().optional(),
  }),
});

export const TabBySlugResponseSchema = z.object({
  tabs: z.object({
    data: z.array(TabSchema),
  }),
});

export type TabAttr = z.infer<typeof TabAttrSchema>;
export type Tab = z.infer<typeof TabSchema>;
