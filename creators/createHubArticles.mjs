import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");
const tags = require("../src/tags.json");
let tagsArray = JSON.stringify(tags);
console.log("tags: ", tagsArray);
const query = `query {
  articles(limit: 100, sort: "date:desc", where: { status: "published", tags_contains: ${tagsArray} }) {
    _id
    title
    date
    tags
    authors
    abstract
    slug
    
  }
 
}`;

axios
  .create({ baseURL: "https://researchhub.icjia-api.cloud" })
  .post("/graphql", { query, validateStatus: (status) => status === 200 })
  .then((res) => {
    const articles = res.data.data.articles;

    // jsonfile.writeFileSync(`public/hub.json`, articles, function (err) {
    //   if (err) {
    //     console.error(err);
    //   }
    // });
    jsonfile.writeFileSync(`assets/json/hub.json`, articles, function (err) {
      if (err) {
        console.error(err);
      }
    });

    console.log("hub.json created in /assets/json/");
    console.log("Hub articles found: ", articles.length);
  })
  .catch((err) => console.error(err));
