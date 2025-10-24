/**
 * Content Directory Initialization Script
 * Cleans up generated content files before creating new ones
 * Removes all previously generated JSON and markdown files
 * @module creators/createContentDirectory
 * @requires dotenv
 * @requires fs
 * @requires path
 * @requires fs-extra
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const path = require("path");

const fsExtra = require("fs-extra");

const contentDir = path.join(__dirname, "../content");
fsExtra.emptyDirSync(contentDir);
console.log("Content directory cleared");

const publicDir = path.join(__dirname, "../public");
const assetsDir = path.join(__dirname, "../assets/json");
const srcDir = path.join(__dirname, "../src");
const appDataDir = path.join(__dirname, "../app/data");

/**
 * List of generated files to remove before content generation
 * Ensures clean state for new content creation
 * @type {Array<string>}
 */
const PUBLIC_FILES_TO_REMOVE = [
  "site.json",
  "sitemap.xml",
  "sitemeta.json",
  "routesPages.json",
  "routesFaqs.json",
  "routesPosts.json",
  "routesMeetings.json",
  "routesPublications.json",
  "pages.json",
  "posts.json",
  "hub.json",
  "biographies.json",
  "tabs.json",
  "appRoutes.json",
  "publications.json",
  "meetings.json",
  "searchIndex.json",
  "siteMeta.json",
  "publist.json",
  "research.json",
  "dataAndPublications.json",
];

PUBLIC_FILES_TO_REMOVE.forEach((fileName) => {
  fs.rmSync(`${publicDir}/${fileName}`, { force: true });
  fs.rmSync(`${assetsDir}/${fileName}`, { force: true });
  fs.rmSync(`${srcDir}/${fileName}`, { force: true });
  fs.rmSync(`${appDataDir}/${fileName}`, { force: true });
});

console.log("Files removed: ", PUBLIC_FILES_TO_REMOVE);
