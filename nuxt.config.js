// nuxt.config.ts
//
// https://v3.nuxtjs.org/api/configuration/nuxt.config\

import vuetify from "vite-plugin-vuetify";
import appRoutes from "./src/appRoutes.json";

export default defineNuxtConfig({
  experimental: {
    viewTransition: true,
    payloadExtraction: true,
  },
  devtools: true,
  app: {
    // baseURL: "/infonet/",
    // pageTransition: { name: "page", mode: "out-in" },
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "InfoNet",
      titleTemplate: "ICJIA | %s ",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "InfoNet",
        },
        {
          hid: "permissions-policy",
          "http-equiv": "Permissions-Policy",

          content: "interest-cohort=()",
        },
        {
          hid: "og-title",
          property: "og:title",
          content: "InfoNet",
        },
        {
          hid: "og-desc",
          property: "og:description",
          content: "InfoNet",
        },
        {
          hid: "og-image",
          property: "og:image",
          content: "https://infonet.icjia.dev/icjia-logo.png",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: true,
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Material+Icons",
        },
      ],

      script: [
        {
          src: "https://code.jquery.com/jquery-3.7.1.slim.min.js",
          type: "text/javascript",
        },
        // {
        //   src: "https://analytics.icjia-api.cloud/js/plausible.js",
        //   "data-domain": "infonet.illinois.gov",
        //   defer: true,
        // },
        // {
        //   src: "https://www.googletagmanager.com/gtag/js?id=G-xxxxxxx",
        //   async: true,
        // },
        // {
        //   src: "ga.js",
        // },
      ],
    },
  },
  plugins: [{ src: "~/plugins/aos", mode: "client" }],
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "~/assets/css/variables.scss",
    "~/assets/css/app.css",
    "~/assets/css/github-markdown.css",
  ],
  build: {
    transpile: ["vuetify"],
  },

  vite: {},
  runtimeConfig: {
    // The private keys which are only available within server-side
    // apiSecret: "123",
    // Keys within public, will be also exposed to the client-side
    private: {
      thumborKey:
        process.env.NUXT_THUMBOR_KEY || "ERROR: thumbor key not specified",
    },
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE_URL ||
        "ERROR: no api base url specified",
      siteBase:
        process.env.NUXT_PUBLIC_BASE_URL || "ERROR: no site base url specified",
    },
  },

  modules: [
    // "@nuxtjs/google-fonts",
    // "@nuxtjs/apollo",
    // "@pinia/nuxt",
    "@nuxt/image-edge",
    "@vueuse/nuxt",
    "@nuxt/content",
    "@nuxtjs/apollo",
    // "nuxt-link-checker",

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (options, nuxt) => {
      await nuxt.hooks.hook("vite:extendConfig", (config) => {
        // console.log(config);
        config?.plugins?.push(vuetify());
      });
    },
  ],
  content: {
    documentDriven: false,
    markdown: {
      mdc: true,
      anchorLinks: {
        depth: 0,
        exclude: [1, 2, 3, 4, 5, 6],
      },
    },
    // experimental: {
    //   clientDb: true,
    // },
  },

  // googleFonts: {
  //   inject: true,
  //   download: true,
  //   display: "swap",
  //   prefetch: true,
  //   base64: false,
  //   fontsPath: '~assets/fonts'
  //   families: {
  //     Roboto: {
  //       wght: [100, 400, 700, 900],
  //       ital: [100],
  //     },
  //     Lato: {
  //       wght: [100, 300, 400, 700, 900],
  //       ital: [100],
  //     },
  //     Raleway: {
  //       wght: [100, 300, 400, 900],
  //       ital: [100],
  //     },
  //     Oswald: {
  //       wght: [100, 400, 900],
  //     },
  //   },
  // },

  image: {
    // The screen sizes predefined by `@nuxt/image`:
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1536,
    },
  },
  generate: {
    routes: appRoutes,
  },
  // experimental: {
  //   componentIslands: true,
  // },
  apollo: {
    clients: {
      default: {
        httpEndpoint: "https://researchhub.icjia-api.cloud/graphql",
      },
    },
  },
});
