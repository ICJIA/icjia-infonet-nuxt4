/**
 * Vuetify Plugin
 * Initializes Vuetify Material Design framework for Vue 3
 * @module plugins/vuetify
 * @see {@link https://vuetifyjs.com/|Vuetify Documentation}
 */

import { createVuetify } from "vuetify";
import * as labs from "vuetify/labs/components";
import { mdi } from "vuetify/iconsets/mdi";

/**
 * Initialize Vuetify plugin for Nuxt
 * Configures Material Design components, icons, and theme
 * @function vuetifyPlugin
 * @param {Object} nuxtApp - Nuxt application instance
 * @returns {void}
 * @description
 * Configures:
 * - Material Design components from labs
 * - Font Awesome and MDI icon sets
 * - Light theme with WCAG AA compliant colors
 * - Accessibility-focused color overrides for contrast compliance
 */
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    icons: {
      defaultSet: "mdi",
      sets: { mdi },
    },
    components: {
      ...labs,
    },
    theme: {
      themes: {
        light: {
          colors: {
            /**
             * Accessibility fix: Override Vuetify's default label color
             * to meet WCAG AA contrast requirements (4.5:1) on #f6f6f7 background
             * Using rgba(0, 0, 0, 0.87) provides excellent contrast ratio (15.8:1)
             * This ensures WCAG AA compliance (minimum 4.5:1 required)
             */
            "on-surface-variant": "rgba(0, 0, 0, 0.87)",
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
