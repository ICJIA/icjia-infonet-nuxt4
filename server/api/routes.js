/**
 * API endpoint for retrieving application routes
 * Returns all valid routes in the application for routing and navigation
 * @module server/api/routes
 */

import content from "../../app/data/appRoutes.json";

/**
 * GET /api/routes
 * Retrieves all application routes
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Routes response object
 * @returns {Array<string>} returns.content - Array of valid application routes
 * @example
 * // Request
 * GET /api/routes
 *
 * // Response
 * {
 *   "content": ["/", "/about", "/faqs", "/news", "/search", ...]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
