/**
 * Markdown Meetings Generator
 * Fetches meeting data from Strapi API and generates markdown files
 * Creates meeting content with date information and metadata
 * @module creators/createMarkdownMeetings
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
const SITE_URL = process.env.NUXT_PUBLIC_BASE_URL;
const API = process.env.NUXT_PUBLIC_API_BASE_URL;

const query = `query {
    meetings {
      data {
        id
        attributes {
          title
          slug
          start
          end
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
    const items = res.data.data.meetings.data;

    let section;
    const site = items.map((item) => {
      const obj = { ...item };
      let rawText;
      obj.attributes.markdown = item.attributes.body;
      rawText = obj.attributes?.body
        ?.replace(/<[^>]*>?/gm, "")
        .replace(/[^a-z0-9]/gi, " ");
      rawText = rawText.replace(/\s\s+/g, " ");
      obj.attributes.rawText = rawText.toLowerCase();
      obj.attributes.draft = false;
      obj.attributes.year = new Date(obj.attributes.start).getFullYear();

      obj.attributes.navigation = true;
      if (item.attributes.section !== "root") {
        section = item.attributes.section.toLowerCase();
        obj.attributes.path = `/${section}/${item.attributes.slug}`;
        obj.attributes.url = `${SITE_URL}${obj.attributes.path}`;
      } else {
        obj.attributes.path = `/${item.attributes.slug}`;
        obj.attributes.url = `${SITE_URL}${obj.attributes.path}`;
      }

      // if (page.attributes.slug === "index") {
      //   obj.attributes.path = `/`;
      //   obj.attributes.url = `${SITE_URL}`;
      // }

      console.log("Markdown content created: ", obj.attributes.path);
      return obj;
    });

    const routes = site.map((item) => {
      if (item.attributes.slug !== "index") {
        return `/meetings/${item.attributes.slug}`;
      } else {
        return `/`;
      }
    });

    jsonfile.writeFileSync(
      `./public/routesMeetings.json`,
      routes,
      function (err) {
        if (err) {
          console.error(err);
        }
      }
    );

    jsonfile.writeFileSync(`./public/meetings.json`, site, function (err) {
      if (err) {
        console.error(err);
      }
      console.log("meetings.json created in /public/");
    });

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
      fs.writeFileSync(filePath, content);
    });
  });
