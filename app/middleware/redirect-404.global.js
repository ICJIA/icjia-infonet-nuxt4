/**
 * Global route middleware for 404 redirect
 * Redirects to 404 page when no matching route is found
 * @module middleware/redirect-404
 * @global
 */

/**
 * Redirect to 404 page for unmatched routes
 * Runs on every route navigation to catch unmatched paths
 * @function redirect404Middleware
 * @param {Object} to - Target route object
 * @param {Object} from - Source route object
 * @returns {void|Promise} Navigates to 404 page if no route matches
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.matched.length === 0) {
    return navigateTo("/404", { redirectCode: 404 });
  }
});
