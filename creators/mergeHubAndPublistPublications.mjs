import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");
const tags = require("../src/tags.json");
let tagsArray = JSON.stringify(tags);
const publist = require("../src/publist.json");
const hub = require("../src/hub.json");
const _ = require("lodash");

const publications = [...publist, ...hub];

const sortedPublications = _.orderBy(publications, ["date"], ["desc"]);

//console.log(JSON.stringify(sortedPublications));

console.log("data and publications items: ", sortedPublications.length);
//TODO: Make this directory path

// jsonfile.writeFileSync(
//   `./src/research.json`,
//   sortedPublications,
//   function (err) {
//     if (err) {
//       console.error(err);
//     }
//   }
// );

jsonfile.writeFileSync(
  `./src/dataAndPublications.json`,
  sortedPublications,
  function (err) {
    if (err) {
      console.error(err);
    }
  }
);
