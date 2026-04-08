import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const contentDir = resolve(__dirname, "../content");

describe("Content files", () => {
  describe("Root content pages", () => {
    const expectedPages = [
      "index.md",
      "about.md",
      "contact.md",
      "privacy.md",
      "partners.md",
      "upgrades.md",
      "resources.md",
      "screenshots.md",
      "agencies.md",
    ];

    expectedPages.forEach((page) => {
      it(`${page} exists`, () => {
        expect(existsSync(join(contentDir, page))).toBe(true);
      });
    });

    it("root pages have required frontmatter fields", () => {
      const files = readdirSync(contentDir).filter((f) => f.endsWith(".md"));
      files.forEach((file) => {
        const content = readFileSync(join(contentDir, file), "utf-8");
        expect(content).toMatch(/^---/);
        expect(content).toMatch(/title:/);
      });
    });
  });

  describe("FAQ content", () => {
    const faqDir = join(contentDir, "faqs");

    it("faqs directory exists", () => {
      expect(existsSync(faqDir)).toBe(true);
    });

    it("has FAQ markdown files", () => {
      const files = readdirSync(faqDir).filter((f) => f.endsWith(".md"));
      expect(files.length).toBeGreaterThan(0);
    });

    it("FAQ files have required frontmatter", () => {
      const files = readdirSync(faqDir).filter((f) => f.endsWith(".md"));
      const sample = files.slice(0, 5);
      sample.forEach((file) => {
        const content = readFileSync(join(faqDir, file), "utf-8");
        expect(content).toMatch(/title:/);
        expect(content).toMatch(/question:/);
        expect(content).toMatch(/answer:/);
        expect(content).toMatch(/agency:/);
      });
    });
  });

  describe("News content", () => {
    const newsDir = join(contentDir, "news");

    it("news directory exists", () => {
      expect(existsSync(newsDir)).toBe(true);
    });

    it("has news markdown files", () => {
      const files = readdirSync(newsDir).filter((f) => f.endsWith(".md"));
      expect(files.length).toBeGreaterThan(0);
    });

    it("news files have required frontmatter", () => {
      const files = readdirSync(newsDir).filter((f) => f.endsWith(".md"));
      const sample = files.slice(0, 5);
      sample.forEach((file) => {
        const content = readFileSync(join(newsDir, file), "utf-8");
        expect(content).toMatch(/title:/);
        expect(content).toMatch(/category:/);
        expect(content).toMatch(/summary:/);
      });
    });

    it("news files have publication date", () => {
      const files = readdirSync(newsDir).filter((f) => f.endsWith(".md"));
      const sample = files.slice(0, 5);
      sample.forEach((file) => {
        const content = readFileSync(join(newsDir, file), "utf-8");
        expect(content).toMatch(/postDate:|publishedAt:|createdAt:/);
      });
    });
  });

  describe("Tab content", () => {
    const tabDir = join(contentDir, "tabs");

    it("tabs directory exists", () => {
      expect(existsSync(tabDir)).toBe(true);
    });

    it("has tab markdown files", () => {
      const files = readdirSync(tabDir).filter((f) => f.endsWith(".md"));
      expect(files.length).toBeGreaterThan(0);
    });
  });
});

describe("Sitemap", () => {
  const sitemapPath = resolve(__dirname, "../public/sitemap.xml");

  it("sitemap.xml exists", () => {
    expect(existsSync(sitemapPath)).toBe(true);
  });

  it("is valid XML with urlset", () => {
    const content = readFileSync(sitemapPath, "utf-8");
    expect(content).toMatch(/<\?xml/);
    expect(content).toMatch(/<urlset/);
    expect(content).toMatch(/<\/urlset>/);
  });

  it("contains loc elements", () => {
    const content = readFileSync(sitemapPath, "utf-8");
    const locCount = (content.match(/<loc>/g) || []).length;
    expect(locCount).toBeGreaterThan(10);
  });
});
