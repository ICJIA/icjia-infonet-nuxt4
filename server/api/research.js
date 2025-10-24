/**
 * API endpoint for research data and publications
 * Provides merged research data from hub and Publist sources
 * @module server/api/research
 */

import content from "../../app/data/dataAndPublications.json";

/**
 * GET /api/research
 * Retrieves merged research data and publications
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Research data response
 * @returns {Array<Object>} returns.content - Array of research and publication objects
 * @example
 * // Request
 * GET /api/research
 *
 * // Response
 * {
 *   "content": [
 *     { "id": 1, "title": "Research Title", "source": "hub|publist", "date": "2024-01-01", ... },
 *     ...
 *   ]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
