/**
 * API endpoint for data and publications
 * Provides access to research data and publication information
 * @module server/api/dataAndPublications
 */

import content from "../../app/data/dataAndPublications.json";

/**
 * GET /api/data-and-publications
 * Retrieves data and publications information
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Data and publications response
 * @returns {Array<Object>} returns.content - Array of publication objects
 * @example
 * // Request
 * GET /api/data-and-publications
 *
 * // Response
 * {
 *   "content": [
 *     { "id": 1, "title": "Publication Title", "url": "...", "year": 2024 },
 *     ...
 *   ]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
