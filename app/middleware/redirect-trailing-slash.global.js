/**
 * Global route middleware for trailing slash redirect
 * Removes trailing slashes from URLs and redirects with 301 status
 * @module middleware/redirect-trailing-slash
 * @global
 */

/**
 * Redirect URLs with trailing slashes to clean URLs
 * Runs on every route navigation to normalize URL format
 * @function redirectTrailingSlashMiddleware
 * @param {Object} to - Target route object
 * @returns {void|Promise} Navigates to clean URL if trailing slash detected
 * @example
 * // /about/ → /about (301 redirect)
 * // /faqs/ → /faqs (301 redirect)
 * // / → / (no redirect, root path allowed)
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/" && to.path.endsWith("/")) {
    const { path, query, hash } = to;
    const nextPath = path.replace(/\/+$/, "") || "/";
    const nextRoute = { path: nextPath, query, hash };
    return navigateTo(nextRoute, { redirectCode: 301 });
  }
});
