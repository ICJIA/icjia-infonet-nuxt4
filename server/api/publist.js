/**
 * API endpoint for Publist publications
 * Provides access to publications from Publist service
 * @module server/api/publist
 */

import content from "../../app/data/publist.json";

/**
 * GET /api/publist
 * Retrieves Publist publications data
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Publist publications response
 * @returns {Array<Object>} returns.content - Array of publication objects from Publist
 * @example
 * // Request
 * GET /api/publist
 *
 * // Response
 * {
 *   "content": [
 *     { "id": 1, "title": "Publication Title", "authors": [...], "year": 2024, ... },
 *     ...
 *   ]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
