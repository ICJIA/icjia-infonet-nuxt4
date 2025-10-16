import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");
const tags = require("../app/data/tags.json");
let tagsArray = JSON.stringify(tags);
console.log("tags: ", tagsArray);
const _ = require("lodash");

const query = `query {
 publications(
    limit: 990
    sort: "publicationDate:desc"
    where: { tags_contains:  ["infonet"] }
  ) {
    _id: id
    title
    pubType
    published_at
    updated_at
    publicationDate
    tags
    date: publicationDate
    abstract: summary
    slug
    fileURL
    articleURL
    applicationURL
    datasetURL
  }
 
}`;

function get_url_extension(url) {
  return url.split(/[#?]/)[0].split(".").pop().trim();
}

axios
  .create({ baseURL: "https://agency.icjia-api.cloud" })
  .post("/graphql", { query, validateStatus: (status) => status === 200 })
  .then((res) => {
    const publications = res.data.data.publications;

    let filteredPubs = publications.map((item) => {
      const obj = { ...item };
      if (item.articleURL && item.articleURL.length > 0) {
        //console.log("has article");
        return null;
      } else {
        obj.tags = item.tags.map((tag) => tag.toLowerCase());
        obj.pubType = item.pubType;
        obj.source = "publist";
        obj.authors = null;
        obj.fileURL = item.fileURL;
        obj.ext = get_url_extension(item.fileURL);
        if (obj.tags.includes("infonet")) {
          obj.homePage = true;
        } else {
          obj.homePage = false;
        }
        return obj;
      }
    });

    // filter out null values
    filteredPubs = _.compact(filteredPubs);

    console.log("filteredPubs publications found: ", filteredPubs.length);
    jsonfile.writeFileSync(
      `./app/data/publist.json`,
      filteredPubs,
      function (err) {
        if (err) {
          console.error(err);
        }
      }
    );
  })
  .catch((err) => console.error(err));
