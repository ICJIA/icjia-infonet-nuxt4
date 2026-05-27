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
    // 'always': inline the bundled stylesheet into every page <head> instead
    // of shipping a blocking <link rel="stylesheet">. Eliminates the
    // ~150-650 ms render-blocking-CSS penalty Lighthouse flags on cold loads
    // (BaseLayout.css ~35 KiB gzipped). Trade-off: per-page HTML grows by the
    // same ~35 KiB and the stylesheet is no longer separately cacheable —
    // acceptable on Netlify's CDN where every HTML response is gzipped and
    // brotli'd at the edge.
    inlineStylesheets: 'always',
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
