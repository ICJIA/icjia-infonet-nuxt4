/**
 * AOS (Animate On Scroll) Plugin
 * Initializes AOS library for scroll-triggered animations
 * @module plugins/aos
 * @see {@link https://michalsnik.github.io/aos/|AOS Documentation}
 */

import { defineNuxtPlugin } from "#app";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * Initialize AOS plugin for Nuxt
 * Enables scroll-triggered animations on page elements
 * @function aosPlugin
 * @param {Object} nuxtApp - Nuxt application instance
 * @returns {void}
 * @example
 * // AOS is automatically initialized on client-side
 * // Use data-aos attribute on elements to trigger animations
 * // <div data-aos="fade-in">Content</div>
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window !== "undefined") {
    nuxtApp.AOS = AOS.init({
      once: false,
    });
  }
});
