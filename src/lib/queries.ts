// astro/src/lib/queries.ts
//
// Strapi v4 GraphQL queries — one export per entity/use case.
//
// Confirmed field shapes via live introspection against
// https://infonet.icjia-api.cloud/graphql (2026-05-26).
//
// All queries use plain string literals (no gql tag) — we POST to /graphql
// via native fetch in strapiFetch(), not Apollo.
//
// Infonet field notes:
//   pages: title, slug, summary, body, section, showTableOfContents,
//          hideFromSearch, hideFromSitemap, searchMeta, createdAt/updatedAt/publishedAt
//   posts: same + category, dateOverride, splash (UploadFileEntityResponse)
//   faqs:  question, answer, ranking, slug, category, agency, cat, subcat, createdAt...
//          (NOT name/identifier/details — those are DVFR's schema. Infonet uses question/answer.)
//   tabs:  title, slug, agency, summary, body, sectionID, ranking, searchMeta, createdAt...

// --- Pages -------------------------------------------------------------------

export const QUERY_PAGE_LIST = `
  query PageList {
    pages(
      sort: "createdAt:desc"
      pagination: { limit: 200 }
    ) {
      data {
        id
        attributes {
          title
          slug
          summary
          body
          section
          showTableOfContents
          hideFromSearch
          hideFromSitemap
          searchMeta
          createdAt
          updatedAt
          publishedAt
        }
      }
      meta {
        pagination { total }
      }
    }
  }
`;

export const QUERY_PAGE_BY_SLUG = `
  query PageBySlug($slug: String!) {
    pages(
      filters: { slug: { eq: $slug } }
      pagination: { limit: 1 }
    ) {
      data {
        id
        attributes {
          title
          slug
          summary
          body
          section
          showTableOfContents
          hideFromSearch
          hideFromSitemap
          searchMeta
          createdAt
          updatedAt
          publishedAt
        }
      }
    }
  }
`;

// --- Posts (user-facing: "news") --------------------------------------------

export const QUERY_POST_LIST = `
  query PostList {
    posts(
      sort: "createdAt:desc"
      pagination: { limit: 200 }
    ) {
      data {
        id
        attributes {
          title
          slug
          summary
          body
          section
          category
          dateOverride
          showTableOfContents
          hideFromSearch
          hideFromSitemap
          searchMeta
          createdAt
          updatedAt
          publishedAt
          splash {
            data {
              id
              attributes {
                url
                alternativeText
                caption
                formats
              }
            }
          }
        }
      }
      meta {
        pagination { total }
      }
    }
  }
`;

export const QUERY_POST_BY_SLUG = `
  query PostBySlug($slug: String!) {
    posts(
      filters: { slug: { eq: $slug } }
      pagination: { limit: 1 }
    ) {
      data {
        id
        attributes {
          title
          slug
          summary
          body
          section
          category
          dateOverride
          showTableOfContents
          hideFromSearch
          hideFromSitemap
          searchMeta
          createdAt
          updatedAt
          publishedAt
          splash {
            data {
              id
              attributes {
                url
                alternativeText
                caption
                formats
              }
            }
          }
        }
      }
    }
  }
`;

// --- FAQs -------------------------------------------------------------------
// Note: Infonet FAQs use `question` + `answer` fields (not name/identifier/details
// which DVFR uses). The `ranking` field controls display order.

export const QUERY_FAQ_LIST = `
  query FaqList {
    faqs(
      sort: ["ranking:asc", "createdAt:asc"]
      pagination: { limit: 500 }
    ) {
      data {
        id
        attributes {
          question
          answer
          ranking
          slug
          category
          agency
          cat
          subcat
          createdAt
          updatedAt
          publishedAt
        }
      }
      meta {
        pagination { total }
      }
    }
  }
`;

// --- Tabs -------------------------------------------------------------------
// Tabs are fetched by slug (the legacy app fetches them individually for
// each "section" display — dv, sa, cac).

export const QUERY_TAB_BY_SLUG = `
  query TabBySlug($slug: String!) {
    tabs(
      filters: { slug: { eq: $slug } }
      pagination: { limit: 1 }
    ) {
      data {
        id
        attributes {
          title
          slug
          agency
          summary
          body
          sectionID
          ranking
          searchMeta
          createdAt
          updatedAt
          publishedAt
        }
      }
    }
  }
`;

// Also export a full tab list for build-time static path generation.
export const QUERY_TAB_LIST = `
  query TabList {
    tabs(
      sort: "ranking:asc"
      pagination: { limit: 100 }
    ) {
      data {
        id
        attributes {
          title
          slug
          agency
          summary
          body
          sectionID
          ranking
          searchMeta
          createdAt
          updatedAt
          publishedAt
        }
      }
      meta {
        pagination { total }
      }
    }
  }
`;
