// astro/astro.config.ts
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';
import { strapiFetch } from './src/lib/strapi';
import { QUERY_PAGE_LIST, QUERY_POST_LIST } from './src/lib/queries';

// Honor the CMS `hideFromSitemap` flag (it was queried and schema'd but never
// consumed — an editor checking the box got a silent no-op). Fetched at
// config-load time; strapiFetch disk-caches the response, so the page builds
// reuse the same payload and the build sees one consistent snapshot. On fetch
// failure (e.g. offline `astro dev`) we warn and exclude nothing — hiding a
// URL from the sitemap is cosmetic, not worth failing the build over.
type SitemapFlagEntry = {
  attributes?: { slug?: string | null; hideFromSitemap?: boolean | null } | null;
};
let hiddenFromSitemap: string[] = [];
try {
  const [pagesRes, postsRes] = await Promise.all([
    strapiFetch<{ pages: { data: SitemapFlagEntry[] } }>(QUERY_PAGE_LIST),
    strapiFetch<{ posts: { data: SitemapFlagEntry[] } }>(QUERY_POST_LIST),
  ]);
  hiddenFromSitemap = [
    ...pagesRes.pages.data
      .filter((e) => e.attributes?.hideFromSitemap && e.attributes.slug)
      .map((e) => `/${e.attributes!.slug}/`),
    ...postsRes.posts.data
      .filter((e) => e.attributes?.hideFromSitemap && e.attributes.slug)
      .map((e) => `/news/${e.attributes!.slug}/`),
  ];
  if (hiddenFromSitemap.length > 0) {
    console.log(`[astro.config] hideFromSitemap excludes: ${hiddenFromSitemap.join(', ')}`);
  }
} catch (err) {
  console.warn(
    '[astro.config] could not fetch hideFromSitemap flags — sitemap will include all pages:',
    err instanceof Error ? err.message : err,
  );
}

export default defineConfig({
  // Infonet is a dedicated subdomain — full URL, no base path.
  site: 'https://infonet.icjia.illinois.gov',
  trailingSlash: 'always',
  output: 'static',
  build: {
    // 'auto': inline only stylesheets under ~4 KiB; ship the main bundle as a
    // separate <link rel="stylesheet">. We tested 'always' in v3.2.1 — it
    // boosted /about/ desktop perf (text-LCP page that gates on CSS apply)
    // but cost ~600 ms FCP on mobile (35 KiB inline pushes the HTML beyond
    // a single TCP round-trip on slow links) and -3 perf on image-LCP pages
    // (/screenshots/ mobile) where bigger HTML delays image discovery without
    // a compensating gain. 'auto' is the better default for browse traffic:
    // the bundle is fetched once and cached across navigations.
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      // /tabs/* are standalone copies of content already rendered on
      // /screenshots/ and /resources/ (and nothing links to them) — keep the
      // duplicate URLs out of the sitemap; the route also sends noindex.
      // No `lastmod`: stamping new Date() claimed every URL changed on every
      // deploy, which teaches crawlers to ignore the signal entirely.
      filter: (page) => {
        const path = new URL(page).pathname;
        return (
          path !== '/404/'
          && path !== '/debug/'
          && !path.startsWith('/tabs/')
          && !hiddenFromSitemap.includes(path)
        );
      },
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://infonet.icjia.illinois.gov/') {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
});
