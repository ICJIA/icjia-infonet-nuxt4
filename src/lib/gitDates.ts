// astro/src/lib/gitDates.ts
//
// Build-time helper: the git last-commit date of a source file, used as the
// JSON-LD `dateModified` for hand-authored static pages (contact, listing
// shells, translate, search) that have no CMS record to date them.
//
// Why git and not `new Date()`: stamping the build time makes every page look
// modified on every deploy, which trains crawlers to ignore the site's
// freshness signals entirely. The committer date only moves when the file's
// content actually changes — an honest signal. CMS-backed pages use their
// Strapi `updatedAt` instead and never call this.
//
// SSG/Node only — imported from .astro frontmatter at build time, never
// shipped to the client. If git is unavailable (e.g. a shallow CI checkout
// with no history for the file) it returns undefined and the caller simply
// omits dateModified rather than emitting a wrong date.
import { execFileSync } from 'node:child_process';

const cache = new Map<string, string | undefined>();

/**
 * ISO-8601 committer date of the most recent commit touching `repoRelativePath`
 * (e.g. "src/pages/contact.astro"), or `undefined` if the file is untracked or
 * git can't be reached. Cached per build so repeated calls are free.
 */
export function gitLastModifiedISO(repoRelativePath: string): string | undefined {
  if (cache.has(repoRelativePath)) return cache.get(repoRelativePath);

  let iso: string | undefined;
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', repoRelativePath],
      { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    iso = out || undefined;
    if (!iso) {
      console.warn(`[gitDates] no committed history for ${repoRelativePath} — dateModified omitted`);
    }
  } catch {
    console.warn(`[gitDates] git unavailable — dateModified omitted for ${repoRelativePath}`);
    iso = undefined;
  }

  cache.set(repoRelativePath, iso);
  return iso;
}
