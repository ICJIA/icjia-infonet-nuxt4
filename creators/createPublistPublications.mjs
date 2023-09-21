import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");
const tags = require("../src/tags.json");
let tagsArray = JSON.stringify(tags);
console.log("tags: ", tagsArray);

const query = `query {
 publications(
    sort: "publicationDate:desc"
    where: { tags_contains:  ${tagsArray} }
  ) {
    _id: id
    title
    pubType
    published_at
    updated_at
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

axios
  .create({ baseURL: "https://agency.icjia-api.cloud" })
  .post("/graphql", { query, validateStatus: (status) => status === 200 })
  .then((res) => {
    const publications = res.data.data.publications;
    console.log("Publist publications found: ", publications.length);

    publications.forEach((item) => {
      item.tags = item.tags.map((tag) => tag.toLowerCase());
      item.pubType = "publist";
      item.source = "publist";
      item.authors = null;
    });

    jsonfile.writeFileSync(`./src/publist.json`, publications, function (err) {
      if (err) {
        console.error(err);
      }
    });
  })
  .catch((err) => console.error(err));
