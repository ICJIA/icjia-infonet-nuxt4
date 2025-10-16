<script setup>
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
const { path } = useRoute();
const router = useRouter();

const { data } = await useAsyncData("meetings", () =>
  queryContent("/meetings/").sort({ start: -1 }).find()
);

const constructURL = (url) => {
  const myURL = "https://infonet.icjia-api.cloud/uploads/" + url;
  return myURL;
};

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

useHead({
  title: "Meetings",
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
      content: "Infonet meeting information and attachments.",
    },
    {
      hid: "og-desc",
      property: "og:description",
      content: "Infonet meeting information and attachments.",
    },
  ],
});
</script>

<template>
  <div class="pb-12" data-aos="fade-in" style="margin-top: 0px">
    <v-container fluid style="margin: 0; padding: 0">
      <v-row>
        <v-col cols="12" md="9" class="mt-6 px-8 markdown-body">
          <h1 class="brand-color">MEETINGS</h1>
          <p>
            The Statewide Domestic Violence Fatality Review Committee holds
            meetings on the third Tuesday of every other month and special topic
            meetings when applicable. All meetings are open to the public,
            however portions of meetings where it may be necessary to discuss
            confidential or identifying information may be closed for executive
            session.
          </p>
          <div class="mb-2">&nbsp;</div>

          <div v-for="meeting in query" :key="meeting._path">
            <h2
              :id="`year-${meeting.year}`"
              style="
                font-size: 24px;
                font-weight: 900;
                margin-bottom: 00px;
                margin-top: 10px;
                border: none;
              "
            >
              {{ displayYearHeading(meeting.start) }}
            </h2>

            <v-card
              class="markdown-body px-2 py-0 elevation-0 mb-0"
              style="background: #fff"
            >
              <details class="pl-5">
                <summary>
                  {{ formatDate(meeting.start) }} |
                  <span style="color: #666">
                    {{ meeting.title }}, {{ getTime(meeting.start) }} -
                    {{ getTime(meeting.end) }}</span
                  >
                </summary>
                <div>
                  <div class="mt-3 px-5 py-0" v-if="meeting.summary.length">
                    {{ meeting.summary }}
                  </div>
                  <div class="markdown-body mt-3">
                    <div
                      v-if="meeting.attachments.data.length"
                      style="background: #fff"
                      class="px-5 py-0"
                    >
                      <attachments
                        :attachments="meeting.attachments.data"
                        :showTableDisplay="false"
                        class="mt-2"
                      />
                    </div>

                    <div v-else class="pl-4">
                      <strong>Attachments forthcoming.</strong>
                    </div>
                    <div class="text-right px-5" style="margin-top: -15px">
                      <v-btn size="x-small" variant="text" :to="meeting.path"
                        >full meeting information&nbsp;&raquo;</v-btn
                      >
                    </div>
                  </div>
                </div>
              </details>
            </v-card>
          </div>
        </v-col>

        <v-col
          cols="12"
          md="3"
          style="
            min-height: 110vh !important;

            background: #fafafa;
            margin-top: 12px;
            margin-bottom: -105px;
            border: 1px solid #ddd;

            z-index: 1;
            margin-left: -1px;
            margin-right: 0px;
            padding-right: 0;
          "
          class="hidden-sm-and-down elevation-0"
        >
          <TheTableOfContents
            :data="myTocObj"
            class="toc"
            :debug="false"
            :key="uuidv4()"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

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
