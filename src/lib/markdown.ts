// astro/src/lib/markdown.ts
//
// CMS markdown rendering pipeline.
//
//   1. markdown-it (html: true, linkify: true, breaks: false, typographer: true)
//   2. xss sanitise (extended whitelist — img, iframe/YouTube, details/summary,
//      plus standard inline/block tags; preserves inline style on <img> for
//      float:left bio headshot patterns CMS authors use)
//   3. Post-process:
//      - Add loading="lazy" + decoding="async" to every <img> not already having them
//      - Rewrite image src via cms-image-manifest.json lookup (falls back to
//        identity URL when manifest has no entry — manifest is populated by
//        Phase 5a's scripts/fetch-cms-images.mjs)
//      - Add id="<slug>" to every <h1..h6>
//      - Add target="_blank" rel="noopener noreferrer" to external links
//        (href starting with http, not matching siteOrigin)
//   4. Extract headings into a separate return value for TOC support.
//
// Returns { html: '', headings: [] } for null/undefined/empty input.
//
// xss CJS note: FilterXSS is a named export; getDefaultWhiteList lives only
// on the default export. Both are accessed via type-assertion casts.

import MarkdownIt from 'markdown-it';
import xssLib, * as xssNs from 'xss';
import { siteConfig } from './siteConfig';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ManifestEntry {
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  sources: Array<{ width: number; src: string }>;
  ext: string;
}

// Derived shape used for image rewriting (src/srcset/width/height).
interface ResolvedImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// CMS image manifest (Phase 5a: populated by scripts/fetch-cms-images.mjs)
// ---------------------------------------------------------------------------

import crypto from 'node:crypto';

let cmsImageManifest: Record<string, ManifestEntry> = {};
try {
  // Dynamic import evaluated once per build. If the file is missing (fresh
  // checkout before pnpm fetch:cms-images runs), catch and keep empty map.
  const mod = await import('./cms-image-manifest.json', { with: { type: 'json' } });
  cmsImageManifest = (mod.default ?? mod) as Record<string, ManifestEntry>;
} catch {
  cmsImageManifest = {};
}

function lookupCmsImage(src: string): ResolvedImage | null {
  // Canonicalise to bare /uploads/... path.
  const relPath = src.startsWith('http')
    ? src.replace(siteConfig.api.base, '')
    : src;
  if (!relPath.startsWith('/uploads')) return null;

  // Manifest is keyed by sha256 of the relative path (same hash as the script).
  const hash = crypto.createHash('sha256').update(relPath).digest('hex');
  const entry = cmsImageManifest[hash];
  if (!entry || !entry.sources || entry.sources.length === 0) return null;

  // Use the 960-wide source as the primary src (mid-resolution representative),
  // falling back to the largest available.
  const preferred = entry.sources.find((s) => s.width === 960)
    ?? entry.sources[entry.sources.length - 1];
  const srcset = entry.sources.map((s) => `${s.src} ${s.width}w`).join(', ');

  return {
    src: preferred.src,
    srcset,
    width: preferred.width,
    height: entry.originalHeight
      ? Math.round((preferred.width / entry.originalWidth) * entry.originalHeight)
      : 0,
  };
}

// ---------------------------------------------------------------------------
// markdown-it instance
// ---------------------------------------------------------------------------

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  typographer: true,
});

// ---------------------------------------------------------------------------
// xss filter
// ---------------------------------------------------------------------------

// xss CJS interop: FilterXSS is a named export (confirmed live).
// getDefaultWhiteList only exists on the CJS default object — access via cast.
type XssLib = {
  FilterXSS: new (opts: Record<string, unknown>) => { process: (html: string) => string };
  getDefaultWhiteList: () => Record<string, string[]>;
};

const xss = (xssLib ?? xssNs) as unknown as XssLib;
const { FilterXSS, getDefaultWhiteList } = xss;

// Image attrs: extend defaults to include perf attrs + inline style for bio headshots.
const imgAllowedAttrs = [
  'src', 'alt', 'title', 'width', 'height',
  'loading', 'decoding', 'fetchpriority',
  'sizes', 'srcset',
  'style', 'align', // float:left bio headshots use inline style
];

const xssWhiteList = {
  ...getDefaultWhiteList(),
  img: imgAllowedAttrs,
  // YouTube / video embeds
  iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'loading'],
  // HTML5 disclosure widget
  details: ['open'],
  summary: [],
};

const filter = new FilterXSS({
  stripIgnoreTagBody: ['script', 'style'],
  whiteList: xssWhiteList,
  // CMS bios use style="float:left; padding-right:10px;" on <img>.
  // Extend CSS whitelist so those are preserved.
  css: {
    whiteList: {
      float: true, clear: true,
      display: true, 'vertical-align': true,
      margin: true,
      'margin-top': true, 'margin-right': true,
      'margin-bottom': true, 'margin-left': true,
      padding: true,
      'padding-top': true, 'padding-right': true,
      'padding-bottom': true, 'padding-left': true,
      width: true, height: true,
      'max-width': true, 'max-height': true,
    },
  },
});

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

const IMG_RX = /<img\b((?:[^>"]|"[^"]*")*?)\s*\/?\s*>/gi;
const EXT_LINK_RX = new RegExp(
  `<a\\b([^>]*?)href="(https?://(?!${escapeRegex(new URL(siteConfig.siteOrigin).hostname)})[^"]+)"([^>]*)>`,
  'gi',
);
const HEADING_RX = /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Slugify heading text → safe anchor id.
function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')           // strip inner HTML
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Post-processing helpers
// ---------------------------------------------------------------------------

function rewriteImages(html: string): string {
  return html.replace(IMG_RX, (_full, attrs: string) => {
    let out = attrs;

    // Inject lazy loading if missing.
    if (!/\bloading\s*=/i.test(out))   out += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(out))  out += ' decoding="async"';

    // Phase 5a: swap Strapi /uploads/* src for optimised local asset.
    const srcMatch = out.match(/\bsrc\s*=\s*"([^"]+)"/i);
    if (srcMatch) {
      const manifestHit = lookupCmsImage(srcMatch[1]);
      if (manifestHit) {
        out = out.replace(/\bsrc\s*=\s*"[^"]+"/i, `src="${manifestHit.src}"`);
        if (!/\bsrcset\s*=/i.test(out))  out += ` srcset="${manifestHit.srcset}"`;
        if (!/\bsizes\s*=/i.test(out))   out += ` sizes="(min-width: 960px) 800px, 100vw"`;
        if (!/\bwidth\s*=/i.test(out))   out += ` width="${manifestHit.width}"`;
        if (!/\bheight\s*=/i.test(out))  out += ` height="${manifestHit.height}"`;
      }
    }

    return `<img${out}>`;
  });
}

function rewriteExternalLinks(html: string): string {
  return html.replace(EXT_LINK_RX, (_full, pre: string, href: string, post: string) => {
    const hasTarget = /\btarget\s*=/i.test(pre + post);
    const hasRel    = /\brel\s*=/i.test(pre + post);
    let extra = '';
    if (!hasTarget) extra += ' target="_blank"';
    if (!hasRel)    extra += ' rel="noopener noreferrer"';
    return `<a${pre}href="${href}"${post}${extra}>`;
  });
}

function injectHeadingIds(html: string): string {
  return html.replace(HEADING_RX, (full, level: string, attrs: string | undefined, text: string) => {
    // Skip headings that already have an id attribute.
    if (attrs && /\bid\s*=\s*"[^"]*"/i.test(attrs)) return full;
    const id = slugify(text);
    if (!id) return full;
    const attrsStr = attrs ?? '';
    return `<h${level}${attrsStr} id="${id}">${text}</h${level}>`;
  });
}

function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const rx = /<h([1-6])[^>]*(?:\bid\s*=\s*"([^"]*)")?[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    const level = parseInt(m[1], 10);
    // id may be in a different capture position — re-extract from the full tag
    const fullTag = m[0];
    const idMatch = fullTag.match(/\bid\s*=\s*"([^"]*)"/i);
    const id = idMatch ? idMatch[1] : '';
    const text = m[3].replace(/<[^>]+>/g, '').trim();
    if (id && text) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a CMS markdown body to sanitised HTML, and extract headings for TOC.
 *
 * Returns `{ html: '', headings: [] }` for null/undefined/empty input so
 * templates never crash on missing CMS fields.
 */
export function renderMarkdown(
  src: string | null | undefined,
): { html: string; headings: Heading[] } {
  if (!src || !src.trim()) return { html: '', headings: [] };

  const rendered = md.render(src);
  const safe     = filter.process(rendered);
  const withImgs = rewriteImages(safe);
  const withLinks = rewriteExternalLinks(withImgs);
  const html      = injectHeadingIds(withLinks);
  const headings  = extractHeadings(html);

  return { html, headings };
}
