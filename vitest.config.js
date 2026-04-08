import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.{js,ts}"],
    setupFiles: ["tests/setup.js"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "app"),
      "~": resolve(__dirname, "app"),
      "#app": resolve(__dirname, "node_modules/nuxt/dist/app"),
    },
  },
});
