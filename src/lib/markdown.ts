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

export interface MdcRef {
  name: string;
  props: Record<string, string>;
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
// MDC pre-processor — strip MDC blocks before markdown-it sees them
// ---------------------------------------------------------------------------

// Block form: ::ComponentName\n---\nprop: "value"\n---\n::
// Must be anchored to the start of a line in the source body.
const MDC_BLOCK_RX = /^::([A-Z][a-zA-Z]+)\n---\n((?:.|\n)*?)\n---\n::$/gm;

// Inline form: :ComponentName on a line by itself
const MDC_INLINE_RX = /^:([A-Z][a-zA-Z]+)$/gm;

function parseMdcProps(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const k = line.slice(0, colonIdx).trim();
    const v = line.slice(colonIdx + 1).trim().replace(/^"(.*)"$/, '$1');
    if (k) props[k] = v;
  }
  return props;
}

/**
 * Strip MDC block/inline references from markdown source.
 * Returns the cleaned source and an ordered list of MdcRef objects.
 */
function stripMdcBlocks(src: string): { cleaned: string; mdcRefs: MdcRef[] } {
  // Collect all matches with their start positions so we can preserve order.
  type MatchEntry = { index: number; ref: MdcRef; fullMatch: string };
  const entries: MatchEntry[] = [];

  // Reset regex state (global flags carry lastIndex across calls).
  MDC_BLOCK_RX.lastIndex = 0;
  MDC_INLINE_RX.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = MDC_BLOCK_RX.exec(src)) !== null) {
    entries.push({
      index: m.index,
      fullMatch: m[0],
      ref: { name: m[1], props: parseMdcProps(m[2] ?? '') },
    });
  }

  MDC_INLINE_RX.lastIndex = 0;
  while ((m = MDC_INLINE_RX.exec(src)) !== null) {
    entries.push({
      index: m.index,
      fullMatch: m[0],
      ref: { name: m[1], props: {} },
    });
  }

  // Sort by position in source.
  entries.sort((a, b) => a.index - b.index);

  // Replace each matched block with a placeholder token at its position, so
  // the calling template can interleave rendered MDC components inline with
  // the surrounding markdown (matches legacy MDC inline placement). The
  // token is a sentinel string that markdown-it and xss both pass through
  // verbatim — see splitMdcPlaceholders() in this module for the consumer.
  let cleaned = src;
  for (let i = 0; i < entries.length; i++) {
    cleaned = cleaned.split(entries[i].fullMatch).join(
      `\n\n${MDC_PLACEHOLDER_PREFIX}${i}${MDC_PLACEHOLDER_SUFFIX}\n\n`,
    );
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  const mdcRefs = entries.map((e) => e.ref);
  return { cleaned, mdcRefs };
}

// Unique sentinel that markdown-it wraps in <p>…</p> and xss leaves alone.
// Consumers (templates) split the rendered HTML on this token and inject
// the matching component at each split boundary.
export const MDC_PLACEHOLDER_PREFIX = 'MDCREFPLACEHOLDER_';
export const MDC_PLACEHOLDER_SUFFIX = '_MDCREFEND';
const MDC_PLACEHOLDER_RX = new RegExp(
  // Markdown-it wraps lone text on its own line in <p>…</p>; we strip that
  // wrapper too so the injected component isn't trapped inside an empty <p>.
  `(?:<p>\\s*)?${MDC_PLACEHOLDER_PREFIX}(\\d+)${MDC_PLACEHOLDER_SUFFIX}(?:\\s*<\\/p>)?`,
  'g',
);

/**
 * Split rendered markdown HTML at every MDC placeholder, returning an
 * alternating list of HTML chunks and ref-indexes. The template walks
 * the segments and renders the corresponding component between chunks.
 *
 * Example output (5 entries — 3 HTML, 2 refs):
 *   [{ html: '<h2>A</h2>' }, { refIndex: 0 }, { html: '<p>B</p>' },
 *    { refIndex: 1 }, { html: '<h2>C</h2>' }]
 */
export type MdcSegment = { html: string } | { refIndex: number };
export function splitMdcPlaceholders(html: string): MdcSegment[] {
  const segments: MdcSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  MDC_PLACEHOLDER_RX.lastIndex = 0;
  while ((m = MDC_PLACEHOLDER_RX.exec(html)) !== null) {
    const before = html.slice(last, m.index);
    if (before) segments.push({ html: before });
    segments.push({ refIndex: parseInt(m[1], 10) });
    last = m.index + m[0].length;
  }
  const tail = html.slice(last);
  if (tail) segments.push({ html: tail });
  return segments;
}

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

// Replace any CMS-embedded YouTube iframe with a "lite facade": a clickable
// thumbnail placeholder. Three wins over rendering the iframe directly:
//   1. Best Practices: no third-party YouTube cookies are set until the
//      user actually clicks play (Lighthouse flags cookie issues otherwise).
//   2. Performance: YouTube's ~500 KiB player bundle is deferred — only the
//      thumbnail JPEG loads on page view.
//   3. Privacy: matches the legacy site's lazy-load behaviour and respects
//      visitors who never play the video.
// The swap is wired by initYtFacades() in BaseLayout — on click, the facade
// element is replaced with a real <iframe src="youtube-nocookie.com/embed/<id>?autoplay=1">.
function rewriteYouTubeIframes(html: string): string {
  return html.replace(
    /<iframe([^>]*?)\bsrc\s*=\s*"(https?:)?\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com)\/embed\/([^"?&"]+)([^"]*)"([^>]*)>(?:[\s\S]*?<\/iframe>)?/gi,
    (_full, _pre: string, _proto: string | undefined, videoId: string, _query: string, _post: string) => {
      const safeId = videoId.replace(/[^A-Za-z0-9_-]/g, '');
      if (!safeId) return _full;
      const thumb = `https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`;
      const watchUrl = `https://www.youtube.com/watch?v=${safeId}`;
      return [
        `<div class="yt-facade" data-yt-id="${safeId}">`,
          `<a class="yt-facade__link" href="${watchUrl}" target="_blank" rel="noopener noreferrer" aria-label="Play YouTube video">`,
            `<img class="yt-facade__thumb" src="${thumb}" alt="YouTube video thumbnail" loading="lazy" decoding="async" width="480" height="360">`,
            `<span class="yt-facade__play" aria-hidden="true"></span>`,
          `</a>`,
        `</div>`,
      ].join('');
    },
  );
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
 * MDC block/inline references are stripped BEFORE markdown-it parses the
 * source, so the parser never sees the `::ComponentName\n---` pattern that
 * would otherwise be misread as setext h2 headings. The stripped refs are
 * returned as `mdcRefs` in source order for the calling template to render.
 *
 * Returns `{ html: '', headings: [], mdcRefs: [] }` for null/undefined/empty
 * input so templates never crash on missing CMS fields.
 */
export function renderMarkdown(
  src: string | null | undefined,
): { html: string; headings: Heading[]; mdcRefs: MdcRef[] } {
  if (!src || !src.trim()) return { html: '', headings: [], mdcRefs: [] };

  // 1. Strip MDC blocks first — prevents markdown-it setext-h2 misparse.
  const { cleaned, mdcRefs } = stripMdcBlocks(src);

  // 2. If stripping consumed the entire body (pure-MDC body), skip render.
  if (!cleaned) return { html: '', headings: [], mdcRefs };

  const rendered  = md.render(cleaned);
  const safe      = filter.process(rendered);
  const withImgs    = rewriteImages(safe);
  const withIframes = rewriteYouTubeIframes(withImgs);
  const withLinks   = rewriteExternalLinks(withIframes);
  const html        = injectHeadingIds(withLinks);
  const headings  = extractHeadings(html);

  return { html, headings, mdcRefs };
}
