/**
 * API endpoint for tags metadata
 * Provides all available tags used for content categorization
 * @module server/api/tags
 */

import content from "../../app/data/tags.json";

/**
 * GET /api/tags
 * Retrieves all available tags for content filtering
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Tags response object
 * @returns {Array<string>} returns.content - Array of available tags
 * @example
 * // Request
 * GET /api/tags
 *
 * // Response
 * {
 *   "content": ["domestic-violence", "sexual-assault", "training", "resources", ...]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
