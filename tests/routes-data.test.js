import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const appRoutes = (
  await import("../app/data/appRoutes.json", { assert: { type: "json" } })
).default;

describe("Application routes data", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(appRoutes)).toBe(true);
    expect(appRoutes.length).toBeGreaterThan(0);
  });

  it("all routes start with /", () => {
    appRoutes.forEach((route) => {
      expect(route).toMatch(/^\//);
    });
  });

  it("contains no duplicate routes", () => {
    const unique = new Set(appRoutes);
    expect(unique.size).toBe(appRoutes.length);
  });

  it("includes core pages", () => {
    const corePaths = ["/", "/about", "/contact", "/privacy", "/faqs", "/news"];
    corePaths.forEach((path) => {
      expect(appRoutes).toContain(path);
    });
  });

  it("news routes match existing content files", () => {
    const newsRoutes = appRoutes.filter((r) => r.startsWith("/news/"));
    const newsDir = resolve(__dirname, "../content/news");
    newsRoutes.forEach((route) => {
      const slug = route.replace("/news/", "");
      const filePath = resolve(newsDir, `${slug}.md`);
      expect(existsSync(filePath)).toBe(true);
    });
  });

  it("FAQ routes match existing content files", () => {
    const faqRoutes = appRoutes.filter((r) =>
      r.startsWith("/faqs/") && r !== "/faqs"
    );
    const faqDir = resolve(__dirname, "../content/faqs");
    faqRoutes.forEach((route) => {
      const slug = route.replace("/faqs/", "");
      const filePath = resolve(faqDir, `${slug}.md`);
      expect(existsSync(filePath)).toBe(true);
    });
  });

  it("routes are consistent with sitemap", () => {
    const sitemapPath = resolve(__dirname, "../public/sitemap.xml");
    const sitemap = readFileSync(sitemapPath, "utf-8");
    const corePaths = ["/about", "/contact", "/faqs", "/news"];
    corePaths.forEach((path) => {
      expect(sitemap).toContain(path);
    });
  });
});
