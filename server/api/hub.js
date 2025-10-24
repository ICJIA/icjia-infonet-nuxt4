/**
 * API endpoint for research hub articles
 * Provides access to ICJIA research hub article metadata
 * @module server/api/hub
 */

import content from "../../app/data/hub.json";

/**
 * GET /api/hub
 * Retrieves research hub articles metadata
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Hub articles response
 * @returns {Array<Object>} returns.content - Array of research hub article objects
 * @example
 * // Request
 * GET /api/hub
 *
 * // Response
 * {
 *   "content": [
 *     { "id": 1, "title": "Article Title", "slug": "article-slug", "date": "2024-01-01", ... },
 *     ...
 *   ]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
