/**
 * API endpoint for search index data
 * Provides pre-built search index for full-text search functionality
 * @module server/api/search
 */

import content from "../../app/data/searchIndex.json";

/**
 * GET /api/search
 * Retrieves the search index for client-side search
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Search index response
 * @returns {Array<Object>} returns.content - Array of searchable content items
 * @example
 * // Request
 * GET /api/search
 *
 * // Response
 * {
 *   "content": [
 *     { "id": 1, "title": "About", "body": "...", "url": "/about" },
 *     { "id": 2, "title": "FAQs", "body": "...", "url": "/faqs" }
 *   ]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
