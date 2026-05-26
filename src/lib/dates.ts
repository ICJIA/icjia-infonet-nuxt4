// astro/src/lib/dates.ts
//
// Date/time formatters using Intl APIs, always in America/Chicago timezone
// (per siteConfig.timezone).
//
// All functions return '' for null/undefined/invalid inputs — UI templates
// should never crash on missing CMS date fields.

import { siteConfig } from './siteConfig';

const TZ = siteConfig.timezone; // 'America/Chicago'

// --- Formatter singletons (created once) ------------------------------------

const fmtShort = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: TZ,
});

const fmtLong = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: TZ,
});

const fmtDateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZoneName: 'short',
  timeZone: TZ,
});

const fmtRelative = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
});

// --- Helpers ----------------------------------------------------------------

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO date-only string (e.g. "2026-03-05") from a Date in Chicago time. */
function toChicagoIso(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: TZ,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

// --- Public API -------------------------------------------------------------

/**
 * Format an ISO datetime string as a date.
 *
 * @param iso - ISO 8601 string (or null/undefined)
 * @param fmt - Output format:
 *   - 'short' (default) → "Mar 5, 2026"
 *   - 'long'            → "Thursday, March 5, 2026"
 *   - 'iso'             → "2026-03-05"
 */
export function formatDate(
  iso: string | null | undefined,
  fmt: 'short' | 'long' | 'iso' = 'short',
): string {
  const d = parseDate(iso);
  if (!d) return '';
  if (fmt === 'iso')  return toChicagoIso(d);
  if (fmt === 'long') return fmtLong.format(d);
  return fmtShort.format(d);
}

/**
 * Format an ISO datetime string as a date + time.
 * Example: "Mar 5, 2026, 2:30 PM CDT"
 */
export function formatDateTime(iso: string | null | undefined): string {
  const d = parseDate(iso);
  if (!d) return '';
  return fmtDateTime.format(d);
}

/**
 * Format an ISO datetime string as a relative time.
 * Examples: "3 days ago", "in 2 weeks", "yesterday", "today"
 */
export function formatRelative(iso: string | null | undefined): string {
  const d = parseDate(iso);
  if (!d) return '';

  const diffMs   = d.getTime() - Date.now();
  const diffSecs = Math.round(diffMs / 1000);
  const absSecs  = Math.abs(diffSecs);

  if (absSecs < 60)        return fmtRelative.format(diffSecs, 'second');
  if (absSecs < 3600)      return fmtRelative.format(Math.round(diffSecs / 60), 'minute');
  if (absSecs < 86400)     return fmtRelative.format(Math.round(diffSecs / 3600), 'hour');
  if (absSecs < 604800)    return fmtRelative.format(Math.round(diffSecs / 86400), 'day');
  if (absSecs < 2592000)   return fmtRelative.format(Math.round(diffSecs / 604800), 'week');
  if (absSecs < 31536000)  return fmtRelative.format(Math.round(diffSecs / 2592000), 'month');
  return fmtRelative.format(Math.round(diffSecs / 31536000), 'year');
}
