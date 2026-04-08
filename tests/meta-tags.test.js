import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const nuxtConfig = (
  await import("../nuxt.config.js")
).default;

describe("Global meta tags (nuxt.config.js)", () => {
  const head = nuxtConfig.app.head;
  const meta = head.meta;
  const links = head.link;
  const scripts = head.script;

  describe("Meta description", () => {
    it("exists", () => {
      const desc = meta.find((m) => m.name === "description");
      expect(desc).toBeDefined();
    });

    it("is at least 80 characters", () => {
      const desc = meta.find((m) => m.name === "description");
      expect(desc.content.length).toBeGreaterThanOrEqual(80);
    });
  });

  describe("Open Graph tags", () => {
    it("has og:title", () => {
      const tag = meta.find((m) => m.property === "og:title");
      expect(tag).toBeDefined();
      expect(tag.content).toBeTruthy();
    });

    it("has og:description", () => {
      const tag = meta.find((m) => m.property === "og:description");
      expect(tag).toBeDefined();
      expect(tag.content.length).toBeGreaterThanOrEqual(80);
    });

    it("has og:type", () => {
      const tag = meta.find((m) => m.property === "og:type");
      expect(tag).toBeDefined();
      expect(tag.content).toBe("website");
    });

    it("has og:image with absolute URL", () => {
      const tag = meta.find((m) => m.property === "og:image");
      expect(tag).toBeDefined();
      expect(tag.content).toMatch(/^https:\/\//);
    });
  });

  describe("Author meta", () => {
    it("has meta author tag", () => {
      const tag = meta.find((m) => m.name === "author");
      expect(tag).toBeDefined();
      expect(tag.content).toContain("Illinois Criminal Justice");
    });
  });

  describe("Canonical URL", () => {
    it("has canonical link tag", () => {
      const canonical = links.find((l) => l.rel === "canonical");
      expect(canonical).toBeDefined();
      expect(canonical.href).toMatch(/^https:\/\//);
    });
  });

  describe("JSON-LD structured data", () => {
    it("has JSON-LD script", () => {
      const jsonLd = scripts.find((s) => s.type === "application/ld+json");
      expect(jsonLd).toBeDefined();
    });

    it("contains WebSite schema", () => {
      const jsonLd = scripts.find((s) => s.type === "application/ld+json");
      const data = JSON.parse(jsonLd.innerHTML);
      expect(data["@context"]).toBe("https://schema.org");
      expect(data["@type"]).toBe("WebSite");
    });

    it("has publisher organization", () => {
      const jsonLd = scripts.find((s) => s.type === "application/ld+json");
      const data = JSON.parse(jsonLd.innerHTML);
      expect(data.publisher).toBeDefined();
      expect(data.publisher["@type"]).toBe("Organization");
      expect(data.publisher.name).toContain("Illinois Criminal Justice");
    });

    it("has name and description", () => {
      const jsonLd = scripts.find((s) => s.type === "application/ld+json");
      const data = JSON.parse(jsonLd.innerHTML);
      expect(data.name).toBe("InfoNet");
      expect(data.description.length).toBeGreaterThanOrEqual(80);
    });
  });

  describe("Preconnect hints", () => {
    it("preconnects to Google Fonts", () => {
      const tag = links.find(
        (l) => l.rel === "preconnect" && l.href.includes("fonts.googleapis")
      );
      expect(tag).toBeDefined();
    });

    it("preconnects to image CDN", () => {
      const tag = links.find(
        (l) => l.rel === "preconnect" && l.href.includes("infonet.icjia-api")
      );
      expect(tag).toBeDefined();
    });

    it("dns-prefetches image CDN", () => {
      const tag = links.find(
        (l) => l.rel === "dns-prefetch" && l.href.includes("infonet.icjia-api")
      );
      expect(tag).toBeDefined();
    });
  });
});

describe("llms.txt", () => {
  const llmsTxt = readFileSync(
    resolve(__dirname, "../public/llms.txt"),
    "utf-8"
  );

  it("exists and is not empty", () => {
    expect(llmsTxt.length).toBeGreaterThan(0);
  });

  it("starts with # heading", () => {
    expect(llmsTxt).toMatch(/^# /);
  });

  it("contains key page links", () => {
    expect(llmsTxt).toContain("/about");
    expect(llmsTxt).toContain("/faqs");
    expect(llmsTxt).toContain("/news");
    expect(llmsTxt).toContain("/contact");
  });

  it("mentions InfoNet", () => {
    expect(llmsTxt).toContain("InfoNet");
  });

  it("mentions ICJIA", () => {
    expect(llmsTxt).toContain("Illinois Criminal Justice Information Authority");
  });
});

describe("robots.txt", () => {
  const robotsTxt = readFileSync(
    resolve(__dirname, "../public/robots.txt"),
    "utf-8"
  );

  it("allows all user agents", () => {
    expect(robotsTxt).toContain("User-agent: *");
    expect(robotsTxt).toContain("Allow: /");
  });

  it("includes sitemap reference", () => {
    expect(robotsTxt).toMatch(/Sitemap: https:\/\//);
  });
});
