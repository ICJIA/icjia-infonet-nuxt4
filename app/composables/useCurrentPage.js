/**
 * Composable for accessing current page information
 * Provides utilities for working with the current page's slug and metadata
 * @module composables/useCurrentPage
 * @param {Object} options - Configuration options
 * @param {string} options.slug - The page slug identifier
 * @returns {Object} Page information object
 * @returns {string} returns.slug - The page slug
 * @returns {string} returns.msg - Greeting message
 * @example
 * const page = useCurrentPage({ slug: 'about' });
 * console.log(page.slug); // 'about'
 */
export default function useCurrentPage({ slug }) {
  console.log("in composable function");
  return {
    slug,
    msg: "Hello from composable function",
  };
}
