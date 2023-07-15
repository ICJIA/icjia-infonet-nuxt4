<template>
  <div class="pb-12">
    <v-container fluid style="margin: 0; padding: 0"
      ><v-row>
        <v-col>
          <!-- <h1 class="mb-8">Frequently Asked Questions (FAQs)</h1> -->
          <h2 class="mb-10" v-if="props.showHeading">
            {{ getTitle(props.strapiCategory) }}
          </h2>

          <v-expansion-panels>
            <v-expansion-panel
              v-for="(item, index) in data"
              :key="item._path"
              class="mb-5"
            >
              <v-expansion-panel-title
                expand-icon="mdi-plus"
                collapse-icon="mdi-minus"
                :style="`font-weight: 700; background: ${props.color}; color: #000`"
              >
                {{ item.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span v-html="renderer.render(item.answer)"></span>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels> </v-col></v-row
    ></v-container>
  </div>
</template>
<script setup>
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
const { path } = useRoute();
const router = useRouter();

import md from "markdown-it";
import attrs from "markdown-it-attrs";
const renderer = new md({
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
}).use(attrs);

const props = defineProps({
  strapiCategory: {
    type: String,
    default: "sa",
  },
  color: {
    type: String,
    default: "#fafafa",
  },
  showHeading: {
    type: Boolean,
    default: true,
  },
});

// let strapiCategory = ref("sa");

//console.log("faq category: ", props.strapiCategory);

const { data } = await useAsyncData(`faqs-${props.strapiCategory}`, () =>
  queryContent("/faqs/")
    .where({ category: props.strapiCategory })
    .sort({ ranking: -1 })
    .find()
);

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const { faqCategoryMap } = useAppConfig();

const getTitle = (category) => {
  let heading;
  if (faqCategoryMap[category] === undefined) {
    heading = "Other";
  } else {
    heading = faqCategoryMap[category].heading;
  }

  return heading;
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

useHead({
  meta: [
    {
      hid: "og-image",
      property: "og:image",
      content: "https://infonet.icjia.dev/icjia-logo.png",
    },
    {
      hid: "og-image-width",
      property: "og:image:width",
      content: "1200",
    },
    {
      hid: "og-image-height",
      property: "og:image:height",
      content: "630",
    },
    {
      hid: "description",
      name: "description",
      content: "Infonet frequently asked questions (FAQs).",
    },
    {
      hid: "og-desc",
      property: "og:description",
      content: "Infonet frequently asked questions (FAQs).",
    },
  ],
});
</script>

<style scoped>
/* Summary/details */

summary {
  cursor: pointer;
  font-weight: 900;
  font-size: 16px;
}

details {
  margin-top: 15px !important;
  margin-bottom: 15px;
}

summary > * {
  display: inline;
}

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
</style>
