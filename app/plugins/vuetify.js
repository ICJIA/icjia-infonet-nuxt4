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
  });

  nuxtApp.vueApp.use(vuetify);
});
