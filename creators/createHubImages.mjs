import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");

const query = `query {
  articles(limit: 200, sort: "date:desc", where: { tags_contains: "infonet" }) {
    _id
    splash
  }
 
}`;

axios
  .create({ baseURL: "https://researchhub.icjia-api.cloud" })
  .post("/graphql", { query, validateStatus: (status) => status === 200 })
  .then((res) => {
    const articles = res.data.data.articles;
  })
  .catch((err) => console.error(err));
