// Vitest setup file
// Mock Nuxt auto-imports and Vue composables used across the app

import { vi } from "vitest";

// Mock Nuxt composables
vi.stubGlobal("definePageMeta", vi.fn());
vi.stubGlobal("defineNuxtConfig", (config) => config);
vi.stubGlobal("defineAppConfig", (config) => config);
vi.stubGlobal("defineEventHandler", (handler) => handler);
vi.stubGlobal("useHead", vi.fn());
vi.stubGlobal("useSeoMeta", vi.fn());
vi.stubGlobal("useRoute", () => ({ path: "/", params: {}, query: {} }));
vi.stubGlobal("useRouter", () => ({
  push: vi.fn(),
  currentRoute: { value: { path: "/" } },
}));
vi.stubGlobal("useRuntimeConfig", () => ({
  public: {
    apiBase: "https://infonet.icjia-api.cloud",
    siteBase: "https://infonet.icjia.illinois.gov",
  },
}));
vi.stubGlobal("useAppConfig", () => ({
  title: "InfoNet",
  isTranslationEnabled: true,
  strapiEnumMap: {
    faqs: {
      general: { heading: "General", level: 0 },
      dv: { heading: "Domestic Violence (DV)", level: 0 },
      sa: { heading: "Sexual Assault (SA)", level: 0 },
      cac: { heading: "Children's Advocacy Center (CAC)", level: 0 },
    },
  },
}));
vi.stubGlobal("useState", (key, init) => {
  const val = init ? init() : undefined;
  return { value: val };
});
vi.stubGlobal("useAsyncData", async (key, fn) => {
  const data = fn ? await fn() : null;
  return { data: { value: data }, pending: { value: false } };
});
vi.stubGlobal("useFetch", async () => ({
  data: { value: { content: [] } },
  pending: { value: false },
}));
vi.stubGlobal("queryContent", () => ({
  where: () => ({
    findOne: async () => null,
    sort: function () {
      return this;
    },
    find: async () => [],
  }),
}));
vi.stubGlobal("useEvent", vi.fn());
vi.stubGlobal("useTranslateToggle", () => ({ value: false }));
vi.stubGlobal("navigateTo", vi.fn());
vi.stubGlobal("showError", vi.fn());
vi.stubGlobal("ref", (val) => ({ value: val }));
vi.stubGlobal("computed", (fn) => ({ value: fn() }));
vi.stubGlobal("toRaw", (val) => val);
vi.stubGlobal("nextTick", async (fn) => {
  if (fn) fn();
});
vi.stubGlobal("onMounted", vi.fn());
vi.stubGlobal("onUnmounted", vi.fn());
vi.stubGlobal("onBeforeMount", vi.fn());
vi.stubGlobal("watchEffect", vi.fn());
vi.stubGlobal("watch", vi.fn());
