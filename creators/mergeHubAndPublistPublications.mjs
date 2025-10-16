import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const _ = require("lodash");

// Helper function to safely require JSON files
const safeRequire = (filePath) => {
  try {
    return require(filePath);
  } catch (err) {
    console.warn(
      `Warning: Could not load ${filePath}. File may not exist yet.`
    );
    return [];
  }
};

const tags = safeRequire("../app/data/tags.json");
let tagsArray = JSON.stringify(tags);
const publist = safeRequire("../app/data/publist.json");
const hub = safeRequire("../app/data/hub.json");

const publications = [...publist, ...hub];

const sortedPublications = _.orderBy(publications, ["date"], ["desc"]);

//console.log(JSON.stringify(sortedPublications));

console.log("data and publications items: ", sortedPublications.length);

// Ensure app/data directory exists
const dataDir = path.join(process.cwd(), "app/data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

jsonfile.writeFileSync(
  `./app/data/dataAndPublications.json`,
  sortedPublications,
  function (err) {
    if (err) {
      console.error(err);
    }
  }
);
