/**
 * API endpoint for tabs metadata
 * Provides information about available tabs (DV, SA, CAC)
 * @module server/api/tabs
 */

import content from "../../app/data/tabs.json";

/**
 * GET /api/tabs
 * Retrieves tabs metadata and configuration
 * @async
 * @param {Object} event - Nuxt event object
 * @returns {Promise<Object>} Tabs response object
 * @returns {Array<Object>} returns.content - Array of tab configurations
 * @example
 * // Request
 * GET /api/tabs
 *
 * // Response
 * {
 *   "content": [
 *     { "id": "dv", "title": "Domestic Violence", "slug": "domestic-violence" },
 *     { "id": "sa", "title": "Sexual Assault", "slug": "sexual-assault" },
 *     { "id": "cac", "title": "Children's Advocacy Center", "slug": "cac" }
 *   ]
 * }
 */
export default defineEventHandler((event) => {
  return {
    content,
  };
});
