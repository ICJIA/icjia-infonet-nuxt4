import { describe, it, expect } from "vitest";

const nuxtConfig = (await import("../nuxt.config.js")).default;

describe("Nuxt configuration", () => {
  it("has app head configuration", () => {
    expect(nuxtConfig.app).toBeDefined();
    expect(nuxtConfig.app.head).toBeDefined();
  });

  it("sets utf-8 charset", () => {
    expect(nuxtConfig.app.head.charset).toBe("utf-8");
  });

  it("has viewport meta", () => {
    expect(nuxtConfig.app.head.viewport).toContain("width=device-width");
  });

  it("has title and titleTemplate", () => {
    expect(nuxtConfig.app.head.title).toBe("InfoNet");
    expect(nuxtConfig.app.head.titleTemplate).toContain("%s");
  });

  describe("CSS configuration", () => {
    it("includes Vuetify styles", () => {
      expect(nuxtConfig.css).toContain("vuetify/lib/styles/main.sass");
    });

    it("includes MDI icons", () => {
      const hasMdi = nuxtConfig.css.some((c) =>
        c.includes("materialdesignicons")
      );
      expect(hasMdi).toBe(true);
    });

    it("includes app.css and github-markdown.css", () => {
      const hasApp = nuxtConfig.css.some((c) => c.includes("app.css"));
      const hasMd = nuxtConfig.css.some((c) =>
        c.includes("github-markdown.css")
      );
      expect(hasApp).toBe(true);
      expect(hasMd).toBe(true);
    });
  });

  describe("Modules", () => {
    it("includes @vueuse/nuxt", () => {
      const modules = nuxtConfig.modules.filter(
        (m) => typeof m === "string"
      );
      expect(modules).toContain("@vueuse/nuxt");
    });

    it("includes @nuxt/content", () => {
      const modules = nuxtConfig.modules.filter(
        (m) => typeof m === "string"
      );
      expect(modules).toContain("@nuxt/content");
    });
  });

  describe("Nitro prerender", () => {
    it("has prerender routes configured", () => {
      expect(nuxtConfig.nitro.prerender.routes).toBeDefined();
      expect(nuxtConfig.nitro.prerender.routes.length).toBeGreaterThan(0);
    });

    it("prerenders API routes", () => {
      const routes = nuxtConfig.nitro.prerender.routes;
      expect(routes).toContain("/api/routes");
      expect(routes).toContain("/api/tabs");
      expect(routes).toContain("/api/search");
    });
  });

  describe("External scripts", () => {
    it("loads Plausible analytics", () => {
      const scripts = nuxtConfig.app.head.script;
      const plausible = scripts.find((s) =>
        s.src?.includes("plausible")
      );
      expect(plausible).toBeDefined();
      expect(plausible.defer).toBe(true);
    });

    it("jQuery is deferred", () => {
      const scripts = nuxtConfig.app.head.script;
      const jquery = scripts.find((s) => s.src?.includes("jquery"));
      expect(jquery).toBeDefined();
      expect(jquery.defer).toBe(true);
    });
  });

  describe("Content module config", () => {
    it("has markdown configuration", () => {
      expect(nuxtConfig.content.markdown).toBeDefined();
    });

    it("MDC is enabled", () => {
      expect(nuxtConfig.content.markdown.mdc).toBe(true);
    });

    it("anchor links are disabled for all heading levels", () => {
      const exclude = nuxtConfig.content.markdown.anchorLinks.exclude;
      expect(exclude).toContain(1);
      expect(exclude).toContain(2);
      expect(exclude).toContain(3);
    });
  });
});
