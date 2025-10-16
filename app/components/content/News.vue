<template>
  <div>
    {{ data }}
  </div>
</template>

<script>
export default {};
</script>

<script setup>
import md from "markdown-it";
import attrs from "markdown-it-attrs";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
const { path } = useRoute();
const router = useRouter();

const renderer = new md({
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
}).use(attrs);

const { data } = await useAsyncData("faqs", () =>
  queryContent("/faqs/").sort({ ranking: -1 }).find()
);

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const niceBytes = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
};

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const getTime = (date) => {
  return moment(date).format("hh:mm A");
};

const getYear = (date) => {
  return moment(date).format("YYYY");
};

let displayYear = ref("");
let isYearDisplayed = ref(true);

const displayYearHeading = (date) => {
  const year = moment(date).format("YYYY");
  if (year !== displayYear) {
    displayYear = year;
    isYearDisplayed = true;
    return `${year} Meetings`;
  } else {
    isYearDisplayed = false;
    return null;
  }
};

let testData = ref(
  JSON.parse(
    '{ "title": "", "searchDepth": 2, "depth": 2, "links": [ { "id": "year-2023", "depth": 2, "text": "2023 Meetings" }, { "id": "year-2022", "depth": 2, "text": "2022 Meetings" }] }'
  )
);

let years = ["2023", "2022"];
let myTocLinks = years.map((year) => {
  return {
    id: `year-${year}`,
    depth: 2,
    text: `${year} Meetings`,
  };
});

let myTocObj = ref({ title: "", searchDepth: 2, depth: 2, links: myTocLinks });

console.log("links: ", myTocLinks);
</script>

<style scoped>
.markdown-body.dataTable {
  width: 100%;
  font-size: 14px;
}

.markdown-body .dataTable th {
  font-weight: 900;
  text-align: left;
  font-size: 0.8rem;
}

.markdown-body.dataTable td {
  font-weight: 400;
  text-align: left;
  font-size: 0.65rem;
}

.v-icon--size-default {
  font-size: calc(var(--v-icon-size-multiplier) * 1em) !important;
}
</style>
