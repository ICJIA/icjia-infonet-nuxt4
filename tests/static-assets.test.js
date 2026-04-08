import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

const publicDir = resolve(__dirname, "../public");

describe("Static assets", () => {
  describe("Required public files", () => {
    const requiredFiles = [
      "favicon.ico",
      "robots.txt",
      "sitemap.xml",
      "llms.txt",
    ];

    requiredFiles.forEach((file) => {
      it(`${file} exists`, () => {
        expect(existsSync(resolve(publicDir, file))).toBe(true);
      });
    });
  });

  describe("OG image", () => {
    it("infonet-thumbnail-dark.jpg exists", () => {
      expect(
        existsSync(resolve(publicDir, "infonet-thumbnail-dark.jpg"))
      ).toBe(true);
    });
  });

  describe("Data files", () => {
    const dataDir = resolve(__dirname, "../app/data");

    it("appRoutes.json exists", () => {
      expect(existsSync(resolve(dataDir, "appRoutes.json"))).toBe(true);
    });

    it("searchIndex.json exists", () => {
      expect(existsSync(resolve(dataDir, "searchIndex.json"))).toBe(true);
    });

    it("tabs.json exists", () => {
      expect(existsSync(resolve(dataDir, "tabs.json"))).toBe(true);
    });

    it("tags.json exists", () => {
      expect(existsSync(resolve(dataDir, "tags.json"))).toBe(true);
    });
  });
});
