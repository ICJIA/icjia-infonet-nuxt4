import { describe, it, expect } from "vitest";

const appConfig = (await import("../app/app.config.js")).default;

describe("App configuration", () => {
  it("has a title", () => {
    expect(appConfig.title).toBe("InfoNet");
  });

  it("has an API URL", () => {
    expect(appConfig.api).toMatch(/^https:\/\//);
  });

  it("has a root URL", () => {
    expect(appConfig.root).toMatch(/^https:\/\//);
  });

  describe("Navigation menus", () => {
    it("navMenu is defined and non-empty", () => {
      expect(Array.isArray(appConfig.navMenu)).toBe(true);
      expect(appConfig.navMenu.length).toBeGreaterThan(0);
    });

    it("navMenu items have main property", () => {
      appConfig.navMenu.forEach((item) => {
        expect(item).toHaveProperty("main");
      });
    });

    it("sidebarMenu is defined and non-empty", () => {
      expect(Array.isArray(appConfig.sidebarMenu)).toBe(true);
      expect(appConfig.sidebarMenu.length).toBeGreaterThan(0);
    });

    it("footerMenu is defined and non-empty", () => {
      expect(Array.isArray(appConfig.footerMenu)).toBe(true);
      expect(appConfig.footerMenu.length).toBeGreaterThan(0);
    });

    it("footerMenu items have main and link", () => {
      appConfig.footerMenu.forEach((item) => {
        expect(item).toHaveProperty("main");
        expect(item).toHaveProperty("link");
        expect(item.link).toMatch(/^\//);
      });
    });
  });

  describe("Strapi enum map", () => {
    it("has faqs enum mapping", () => {
      expect(appConfig.strapiEnumMap).toHaveProperty("faqs");
    });

    it("maps general, dv, sa, cac categories", () => {
      const faqs = appConfig.strapiEnumMap.faqs;
      expect(faqs.general).toHaveProperty("heading");
      expect(faqs.dv).toHaveProperty("heading");
      expect(faqs.sa).toHaveProperty("heading");
      expect(faqs.cac).toHaveProperty("heading");
    });

    it("enum headings are non-empty strings", () => {
      const faqs = appConfig.strapiEnumMap.faqs;
      Object.values(faqs).forEach((entry) => {
        expect(typeof entry.heading).toBe("string");
        expect(entry.heading.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Feature flags", () => {
    it("isTranslationEnabled is boolean", () => {
      expect(typeof appConfig.isTranslationEnabled).toBe("boolean");
    });

    it("homeNewsLimit is a positive number", () => {
      expect(typeof appConfig.homeNewsLimit).toBe("number");
      expect(appConfig.homeNewsLimit).toBeGreaterThan(0);
    });
  });
});
