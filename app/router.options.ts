/**
 * Router Configuration Options
 * Configures scroll behavior for route navigation
 * @module router.options
 * @see {@link https://router.vuejs.org/|Vue Router Documentation}
 */

/* eslint-disable require-await */
import { useNuxtApp } from "#imports";

/**
 * Router options configuration
 * @typedef {Object} RouterOptions
 * @property {Function} scrollBehavior - Custom scroll behavior handler
 */

/**
 * Custom scroll behavior for route navigation
 * Handles smooth scrolling to hash anchors, saved positions, and default behavior
 * @async
 * @function scrollBehavior
 * @param {Object} to - Target route object
 * @param {Object} from - Source route object
 * @param {Object} savedPosition - Previously saved scroll position
 * @returns {Promise<Object>} Scroll position object with top, left, and behavior
 * @description
 * Scroll behavior priority:
 * 1. If navigating to hash anchor, scroll to top with smooth behavior
 * 2. If returning to previously visited page, restore saved position
 * 3. Otherwise, scroll to top with smooth behavior
 * Uses page:finish hook to ensure DOM is ready before scrolling
 */
export default {
  async scrollBehavior(to: any, from: any, savedPosition: any) {
    return new Promise((resolve, reject) => {
      const nuxtApp = useNuxtApp();

      if (to.hash) {
        setTimeout(
          () => {
            resolve({ top: 0, left: 0, behavior: "smooth" });
          },
          !from || to.path !== from.path ? 10 : 1
        );
      } else if (savedPosition) {
        nuxtApp.hooks.hook("page:finish", async () => {
          await nextTick();
          setTimeout(() => {
            resolve({ top: 0, left: 0, behavior: "smooth" });
          }, 500);
        });
      } else {
        nuxtApp.hooks.hook("page:finish", async () => {
          await nextTick();
          setTimeout(() => {
            resolve({ top: 0, left: 0, behavior: "smooth" });
          }, 230);
        });
      }
    });
  },
};
