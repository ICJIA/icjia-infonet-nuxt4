// astro/src/lib/strapi.ts
//
// Strapi v4 GraphQL fetch wrapper used by content loaders.
// Hashes query + variables → caches response under .cache/strapi/<sha256>.json
// so repeat builds skip the network. AbortSignal.timeout(timeoutMs) prevents
// a hung Strapi from stalling Netlify's build.
//
// Strapi v4 specifics (confirmed via live introspection):
//   - Response shape: { data: { <entity>: { data: [{ id, attributes: {...} }] } } }
//   - Field names use camelCase: createdAt, updatedAt, publishedAt (NOT v3 snake_case)
//   - Pagination: pagination: { limit: N, page: M }

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { siteConfig } from './siteConfig';

// Relative to Astro build cwd which is astro/
const CACHE_DIR = path.resolve('.cache/strapi');
const TIMEOUT_MS = siteConfig.api.timeoutMs ?? 60_000;

export interface GraphQLError {
  message: string;
  path?: string[];
  extensions?: Record<string, unknown>;
}

export class StrapiError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly errors?: GraphQLError[],
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

export async function strapiFetch<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  // Cache key: sha256 of serialised query + variables (sorted keys for stability).
  const payload = JSON.stringify({ query, variables }, Object.keys(variables).sort());
  const cacheKey = crypto.createHash('sha256').update(payload).digest('hex');
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

  // Fast path: return cached response (~1ms) to skip the network (~50-500ms).
  try {
    const cached = await fs.readFile(cachePath, 'utf8');
    if (cached) return JSON.parse(cached) as T;
  } catch {
    // cache miss — fall through to network
  }

  // Network fetch with timeout.
  let response: Response;
  try {
    response = await fetch(siteConfig.api.baseGraphQL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new StrapiError(
        `Strapi fetch timed out after ${TIMEOUT_MS}ms`,
        siteConfig.api.baseGraphQL,
      );
    }
    throw new StrapiError(
      `Strapi fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      siteConfig.api.baseGraphQL,
    );
  }

  if (!response.ok) {
    throw new StrapiError(
      `Strapi HTTP ${response.status} ${response.statusText}`,
      siteConfig.api.baseGraphQL,
    );
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: GraphQLError[];
  };

  if (json.errors && json.errors.length > 0) {
    const msgs = json.errors.map((e) => e.message).join('; ');
    throw new StrapiError(
      `Strapi GraphQL errors in query "${query.slice(0, 60).trim()}...": ${msgs}`,
      siteConfig.api.baseGraphQL,
      json.errors,
    );
  }

  if (!json.data) {
    throw new StrapiError(
      'Strapi response had no `data` field',
      siteConfig.api.baseGraphQL,
    );
  }

  // Persist to cache for the next build.
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(json.data, null, 2), 'utf8');

  return json.data;
}
