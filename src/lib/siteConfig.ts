// astro/src/lib/siteConfig.ts
//
// Replaces the legacy nuxt.config.js head/runtimeConfig blocks.
// Drops every thumbor / image-proxy key (Astro Sharp covers all images).
// Drops GA tracker (Plausible remains).

export const siteConfig = {
  // Subdomain mount — NO publicPath; site is the bare origin.
  siteOrigin: 'https://infonet.icjia.illinois.gov',
  siteName: 'InfoNet',
  siteShortName: 'InfoNet',
  titleTemplate: 'ICJIA | %s',
  defaultDescription:
    'InfoNet is a web-based data collection and reporting system used by ' +
    'victim service providers in Illinois to facilitate standardized ' +
    'statewide data collection.',
  author: 'Illinois Criminal Justice Information Authority',

  api: {
    base: 'https://infonet.icjia-api.cloud',
    baseGraphQL: 'https://infonet.icjia-api.cloud/graphql',
    timeoutMs: 60_000,
  },

  home: {
    eventLimit: 3,
    postLimit: 3,
  },

  timezone: 'America/Chicago',

  // Path metadata for Strapi entity → user-facing route mapping.
  pathMeta: {
    tags:     { prefix: '/tags' },
    pages:    { prefix: '/' },
    posts:    { prefix: '/news' },       // Strapi "posts" → user-facing /news
    meetings: { prefix: '/meetings' },
    tabs:     { prefix: '/tabs' },
    faqs:     { prefix: '/faqs' },
  },

  plausible: {
    host: 'https://plausible.icjia.cloud',
    domain: 'infonet.icjia.illinois.gov',
    scriptSrc: 'https://plausible.icjia.cloud/js/script.js',
  },

  // Reserved slugs that the [...slug] catch-all must NOT match.
  reservedSlugs: [
    '', '/',
    '404', 'translate', 'search', 'contact', 'debug',
    'data-and-publications', 'faqs',
    'news', 'meetings', 'tabs',
    'index',  // Strapi has a page slug "index" used as home-body content;
              // exclude it from the catch-all to avoid /index/ route collision
  ] as readonly string[],

  // Open Graph defaults
  og: {
    image: 'https://infonet.icjia.illinois.gov/og-image.png',
    fbAppId: '', // legacy NUXT_PUBLIC_FB_APP_ID — empty in build env
  },

  mdiFontCdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
} as const;

export type SiteConfig = typeof siteConfig;
