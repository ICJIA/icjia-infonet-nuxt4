// astro/astro.config.ts
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

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
      filter: (page) =>
        !page.endsWith('/404/')
        && !page.endsWith('/debug/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
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
