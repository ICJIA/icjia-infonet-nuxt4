import { createRequire } from "module";

import { createWriteStream } from "fs";
import * as dotenv from "dotenv";

import { SitemapStream } from "sitemap";
const require = createRequire(import.meta.url);
dotenv.config();

const path = require("path");
const fs = require("fs");
const jsonfile = require("jsonfile");

const matter = require("gray-matter");

const globMd = require("glob-fs")({ gitignore: true });
const { v4: uuidv4 } = require("uuid");

const SITE_URL = process.env.NUXT_PUBLIC_BASE_URL;

const saveJson = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const walkSync = function (currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
};

// --------------------------------------------------  Search index

const content = [];

const markdown = globMd.readdirSync("./content/**/*.md");

// TODO: Get section from filepath
markdown.forEach((file) => {
  const f = fs.readFileSync(file, { encoding: "utf8", flag: "r" });
  const m = matter(f);
  const route = file.replace(".md", "").replace("content", "") + "";
  const obj = {};

  //   obj.headings = toc(m.content).json.map((t) => {
  //     return t.content;
  //   });

  if (route === "/index") {
    obj.route = "/";
  } else {
    obj.route = route;
  }
  console.log(obj.route);
  obj.title = m.data.title;
  obj.summary = m.data.summary;
  obj.type = "content";
  obj.file = false;
  obj.slug = m.data.slug;
  obj.hideFromSearch = m.data.hideFromSearch || false;
  obj.hideFromSitemap = m.data.hideFromSitemap || false;
  obj.showTableOfContents = m.data.showTableOfContents || false;
  obj.section = m.data.section || "root";
  obj.body = m.content;
  obj.searchMeta = m.data.searchMeta || "";
  obj.path = obj.route;
  obj.createdAt = m.data.createdAt || "";
  obj.updatedAt = m.data.updatedAt || "";
  obj.publishedAt = m.data.publishedAt || "";
  obj.draft = m.data.draft || false;
  obj.uuid = uuidv4();
  obj.id = obj.uuid;
  obj.url = `${SITE_URL}${obj.route}`;
  let rawText;
  rawText = m.content.replace(/<[^>]*>?/gm, "").replace(/[^a-z0-9]/gi, " ");
  rawText = rawText.replace(/\s\s+/g, " ");
  obj.rawText = rawText.toLowerCase();
  const pagePath = new URL(obj.url).pathname.split("/");

  if (pagePath.length > 2) {
    obj.section = pagePath[1];
  } else {
    obj.section = "root";
  }

  content.push(obj);
});

const searchIndex = [...content];
// console.log(searchIndex);

saveJson(searchIndex, "./src/siteMeta.json");
console.log(`Created: /src/siteMeta.json`);
saveJson(searchIndex, "./public/searchIndex.json");
console.log(`Created: /public/searchIndex.json`);

// --------------------------------------------------  App Routes

const myContent = [];
walkSync("content", function (filePath) {
  myContent.push(filePath);
});

const myContentRoutes = myContent.map((item) => {
  let _url = item.replace("content", "").replace(".md", "");
  if (_url === "/index") {
    _url = "/";
  }
  return _url;
});

// const myManualRoutes = ["/search", "/translate", "/contact"];
const myManualRoutes = JSON.parse(process.env.NUXT_MANUAL_ROUTES);
const appRoutes = Array.from(new Set([...myContentRoutes, ...myManualRoutes]));

jsonfile.writeFileSync(`public/appRoutes.json`, appRoutes, function (err) {
  if (err) {
    console.error(err);
  }
});

console.log("Created: /public/appRoutes.json");

jsonfile.writeFileSync(`assets/json/appRoutes.json`, appRoutes, function (err) {
  if (err) {
    console.error(err);
  }
});
console.log("Created: /assets/json/appRoutes.json");

// --------------------------------------------------  Sitemap

const sitemap = new SitemapStream({
  hostname: `${process.env.NUXT_PUBLIC_BASE_URL}`,
});
const writeStream = createWriteStream("public/sitemap.xml");

sitemap.pipe(writeStream);

searchIndex.forEach((item) => {
  if (item && !item.hideFromSitemap) {
    const url = `${process.env.NUXT_PUBLIC_BASE_URL}${item.path}`;
    // console.log(url);
    sitemap.write({ url, changefreq: "weekly", priority: 0.3 });
  }
});

myManualRoutes.forEach((item) => {
  const url = `${process.env.NUXT_PUBLIC_BASE_URL}${item}`;
  sitemap.write({ url, changefreq: "weekly", priority: 0.3 });
});

sitemap.end();

console.log("Created: /public/sitemap.xml");
