/**
 * Markdown Publications Generator
 * Fetches publication data from Strapi API and generates markdown files
 * Creates publication content with metadata and search indexing
 * @module creators/createMarkdownPublications
 * @requires dotenv
 * @requires fs
 * @requires path
 * @requires axios
 * @requires jsonfile
 * @requires lodash
 * @requires yaml
 */

/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const jsonfile = require("jsonfile");
const _ = require("lodash");

const yaml = require("yaml");

const contentDir = path.join(__dirname, "../content");
// fsExtra.emptyDirSync(contentDir);
// console.log("Content directory cleared");

const SITE_URL = process.env.NUXT_PUBLIC_BASE_URL;
const API = process.env.NUXT_PUBLIC_API_BASE_URL;

const query = `query {
    publications{
    data {
      id
      attributes{
        title
        slug
        dateOverride
        category
        hideFromSearch
        hideFromSitemap
        showTableOfContents
        summary
        body
        section
        createdAt
        updatedAt
        publishedAt
        searchMeta
        link {
          id
          title
          url
          summary
        }
        attachments {
          data {
            attributes {
              createdAt
              updatedAt
              name
              alternativeText
              url
              ext
              size
            }
          }
        }
      }
    }
  }
  }`;

function formatMarkdown(content) {
  const { body } = content;
  delete content.body;
  return `---\n${yaml.stringify(content)}---\n\n${body}\n`;
}

axios
  .create({ baseURL: API })
  .post("/graphql", {
    query,
    validateStatus: (status) => status === 200,
    headers: {
      "Accept-Encoding": "application/json",
    },
  })
  .then((res) => {
    //console.log(res.data.data.publications.data);
    const items = res.data.data.publications.data;
    let section;
    const site = items.map((item) => {
      const obj = { ...item };
      obj.attributes.markdown = item.attributes.body;
      obj.attributes.postDate = obj.attributes.dateOverride
        ? new Date(obj.attributes.dateOverride)
        : obj.attributes.publishedAt;
      let rawText;
      if (obj.attributes.body) {
        rawText = obj.attributes?.body
          ?.replace(/<[^>]*>?/gm, "")
          .replace(/[^a-z0-9]/gi, " ");
        rawText = rawText.replace(/\s\s+/g, " ");
        obj.attributes.rawText = rawText.toLowerCase();
      } else {
        obj.attributes.rawText = "";
      }

      obj.attributes.draft = false;
      if (item.attributes.searchMeta) {
        obj.attributes.searchMeta = "publication " + item.attributes.searchMeta;
      } else {
        obj.attributes.searchMeta = "publication ";
      }
      // obj.attributes.description = item.attributes.summary;
      obj.attributes.navigation = true;
      if (item.attributes.section !== "root") {
        section = item.attributes.section.toLowerCase();
        obj.attributes.path = `/${section}/${item.attributes.slug}`;
        obj.attributes.url = `${SITE_URL}${obj.attributes.path}`;
      } else {
        obj.attributes.path = `/${item.attributes.slug}`;
        obj.attributes.url = `${SITE_URL}${obj.attributes.path}`;
      }
      if (item.attributes.slug === "index") {
        obj.attributes.path = `/`;
        obj.attributes.url = `${SITE_URL}`;
      }
      // console.log(
      //   "Markdown publications content created: ",
      //   obj.attributes.path
      // );
      return obj;
    });

    // sort result by category
    // const sorted = _.orderBy(site, ["attributes.category"]);
    // sorted.forEach((item) => {
    //   console.log(item.attributes.category);
    // });

    jsonfile.writeFileSync(`./public/publications.json`, site, function (err) {
      if (err) {
        console.error(err);
      }
      console.log("publications.json created in /public/");
    });
    const routes = site.map((item) => {
      return `/publications/${item.attributes.slug}`;
    });
    jsonfile.writeFileSync(
      `./public/routesPublications.json`,
      routes,
      function (err) {
        if (err) {
          console.error(err);
        }
      }
    );
    site.forEach((item) => {
      if (item.attributes.section === "root") {
        section = "";
      } else {
        section = item.attributes.section.toLowerCase();
      }
      const basename = item.attributes.slug;
      const filePath = path.join(contentDir, `${section}/${basename}.md`);
      const directoryPath = path.join(contentDir, `${section}`);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }
      const content = formatMarkdown(item.attributes);
      // console.log(content);
      fs.writeFileSync(filePath, content);
    });
  });
