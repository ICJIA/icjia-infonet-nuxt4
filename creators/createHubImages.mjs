import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");
const dirpath = "./public/images";

if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);
} else {
  fs.rmdir("public/images", { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
    console.log(`./public/images is deleted!`);
    fs.mkdirSync(dirpath);
    console.log(`./public/images is created!`);
  });
}

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
    writeImages(res.data.data.articles, ["splash"]);
  })
  .catch((err) => console.error(err));

const writeImages = (items, attrs) =>
  items.forEach((item) => attrs.forEach((attr) => writeImage(item, attr)));

const writeImage = (item, attr) => {
  const base64 = item[attr];
  const data = base64.split(";base64,").pop();
  const ext = base64.split("data:image/")[1].split(";")[0];
  const path = `${dirpath}/${item._id}-${attr}.${ext}`;

  fs.writeFile(path, data, "base64", (err) => {
    if (err) throw err;
  });
  console.log(path);
};
