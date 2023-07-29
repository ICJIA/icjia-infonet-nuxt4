import { createRequire } from "module";
import * as dotenv from "dotenv";
const require = createRequire(import.meta.url);
const { v4: uuidv4 } = require("uuid");
const jsonfile = require("jsonfile");
const pageRoutes = require("../public/routesPages.json");
const faqRoutes = require("../public/routesFaqs.json");
const tabRoutes = require("../public/routesTabs.json");
// const meetingRoutes = require("../public/routesMeetings.json");
const postRoutes = require("../public/routesPosts.json");
// const publicationRoutes = require("../public/routesPublications.json");
dotenv.config();

// const myManualRoutes = ["/search", "/translate", "/contact"];
const myManualRoutes = JSON.parse(process.env.NUXT_MANUAL_ROUTES);

const appRoutes = Array.from(
  new Set([
    ...pageRoutes,
    ...faqRoutes,
    ...postRoutes,
    ...tabRoutes,
    ...myManualRoutes,
  ])
);

jsonfile.writeFileSync(`public/appRoutes.json`, appRoutes, function (err) {
  if (err) {
    console.error(err);
  }
});

jsonfile.writeFileSync(`assets/json/appRoutes.json`, appRoutes, function (err) {
  if (err) {
    console.error(err);
  }
});

console.log("public/appRoutes.json created:\n", appRoutes);

console.log("Total app routes: ", appRoutes.length);
