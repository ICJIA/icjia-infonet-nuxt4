import { createVuetify } from "vuetify";
// import * as components from "vuetify/components";
// import * as directives from "vuetify/directives";
import * as labs from "vuetify/labs/components";

import { aliases, fa } from "vuetify/iconsets/fa";
import { mdi } from "vuetify/iconsets/mdi";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    // ssr: true,
    icons: {
      iconfont: ["mdiSvg", "fa", "fa4", "faSvg"], // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
    },
    components: {
      ...labs,
    },
    theme: {
      themes: {
        light: {
          colors: {
            // Accessibility fix: Override Vuetify's default label color
            // to meet WCAG AA contrast requirements (4.5:1) on #f6f6f7 background
            // Using rgba(0, 0, 0, 0.87) provides excellent contrast ratio (15.8:1)
            // This ensures WCAG AA compliance (minimum 4.5:1 required)
            "on-surface-variant": "rgba(0, 0, 0, 0.87)",
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
