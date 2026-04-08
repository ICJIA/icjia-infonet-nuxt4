import { describe, it, expect } from "vitest";

describe("Server API endpoints", () => {
  describe("/api/routes", () => {
    it("returns content array with routes", async () => {
      const handler = (await import("../server/api/routes.js")).default;
      const result = handler({});
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
    });

    it("includes expected core routes", async () => {
      const handler = (await import("../server/api/routes.js")).default;
      const { content } = handler({});
      expect(content).toContain("/");
      expect(content).toContain("/about");
      expect(content).toContain("/faqs");
      expect(content).toContain("/news");
      expect(content).toContain("/contact");
      expect(content).toContain("/privacy");
    });

    it("all routes start with /", async () => {
      const handler = (await import("../server/api/routes.js")).default;
      const { content } = handler({});
      content.forEach((route) => {
        expect(route).toMatch(/^\//);
      });
    });
  });

  describe("/api/tabs", () => {
    it("returns content array with tab data", async () => {
      const handler = (await import("../server/api/tabs.js")).default;
      const result = handler({});
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
    });
  });

  describe("/api/search", () => {
    it("returns content array for search index", async () => {
      const handler = (await import("../server/api/search.js")).default;
      const result = handler({});
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
    });

    it("search items have required fields", async () => {
      const handler = (await import("../server/api/search.js")).default;
      const { content } = handler({});
      if (content.length > 0) {
        const item = content[0];
        expect(item).toHaveProperty("title");
      }
    });
  });
});
