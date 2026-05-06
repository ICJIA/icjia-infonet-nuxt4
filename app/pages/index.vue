<template>
  <div style="background: #f2f2f2">
    <v-container
      fluid
      style="
        margin-top: -10px;
        margin-bottom: 30px;
        background: #f2f2f2;
        z-index: 1000;
      "
    >
      <v-row style="" v-if="data">
        <v-col cols="12" md="6" class="text-center">
          <div
            class="hidden-md-and-up"
            style="
              font-weight: 900;
              color: #fff;
              background: #0d4474;
              display: inline-block;
              padding: 5px 10px;
              border-radius: 5px;
              font-size: 0.8em;
              margin-bottom: 5px;
              margin-top: 35px;
            "
          >
            Illinois Criminal Justice Information Authority
          </div>
          <h1
            class="text-center mt-2 hidden-md-and-up headingHomeMainMobile"
            style="border: 0px; margin: 0; padding: 0"
          >
            INFONET
          </h1>
          <h2
            style="
              border: none;
              margin-top: -10px;
              font-size: 18px;
              color: #222;
              font-weight: 400;
            "
            class="mb-8 hidden-md-and-up"
          >
            Illinois’ victim service data resource for over 25 years
          </h2>
          <div class="text-left">
            <div
              class="hidden-sm-and-down mt-8"
              style="
                font-weight: 900;
                color: #fff;
                background: #0d4474;
                display: inline-block;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 0.8em;
                margin-bottom: 5px;
              "
            >
              Illinois Criminal Justice Information Authority
            </div>
            <h1
              class="text-left hidden-sm-and-down headingHomeMain mt-1"
              style="border: 0px; margin: 0; padding: 0"
            >
              INFONET
            </h1>
            <h2
              style="
                border: none;
                margin-top: -5px;
                font-size: 18px;
                color: #222;
                font-weight: 400;
              "
              class="mb-8 hidden-sm-and-down pl-2"
            >
              Illinois’ victim service data resource for over 25 years
            </h2>
          </div>
          <div style="margin-top: -25px" class="py-5 pl-2 pr-5 text-left">
            <ContentRenderer :value="data" class="markdown-body" />
            <div class="text-center mt-4">
              <v-btn
                size="small"
                variant="text"
                to="/partners"
                style="font-weight: 700; color: #000 !important"
                ><span style="color: #000 !important"
                  >List of Partners&nbsp;&raquo;</span
                ></v-btn
              >
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="mb-8">
          <v-container fluid
            ><v-row
              ><v-col cols="12" class="mt-5">
                <LazyHomeBarGraph v-if="isMounted" /> </v-col></v-row
          ></v-container> </v-col
      ></v-row>
    </v-container>

    <HomeBoxes></HomeBoxes>

    <!-- ---------------------------------------- start text section -->

    <v-container
      fluid
      style="background: #f2f2f2; z-index: 1000"
    >
      <v-row
        ><v-col cols="12" md="6" style="margin-top: -20px">
          <v-container
            ><v-row>
              <v-col cols="12" md="8"
                ><h2 style="border: none">News & Updates</h2>
              </v-col>
              <v-col cols="12" md="4" class="text-right hidden-sm-and-down"
                ><div style="border: none" class="pt-8 pr-3">
                  <v-btn
                    color="#0D4474"
                    to="/news"
                    size="x-small"
                    style="font-weight: 700; color: #fff"
                    >All News&nbsp;&raquo;</v-btn
                  >
                </div>
              </v-col>
            </v-row></v-container
          >
          <div
            style="
              margin-top: -20px;
              border-top: 1px solid #222;
              padding-bottom: 30px;
            "
          ></div>

          <div v-for="post in posts" :key="post._path" class="mb-5">
            <NewsCard :item="post" background="#fff"></NewsCard></div></v-col
        ><v-col cols="12" md="6">
          <v-container style="margin-top: -20px"
            ><v-row>
              <v-col cols="12" md="8"
                ><h2 style="border: none">Frequently Asked Questions</h2>
              </v-col>
              <v-col cols="12" md="4" class="text-right hidden-sm-and-down"
                ><div style="border: none" class="pt-8 pr-3">
                  <v-btn
                    color="#0D4474"
                    to="/faqs"
                    size="x-small"
                    style="font-weight: 700; color: #fff"
                    >All FAQs&nbsp;&raquo;</v-btn
                  >
                </div>
              </v-col>
            </v-row></v-container
          >
          <div
            style="
              margin-top: -20px;
              border-top: 1px solid #222;
              padding-bottom: 30px;
            "
          ></div>

          <!-- <h2>Frequently Asked Questions (FAQs)</h2> -->
          <DisplayFaqs
            strapiAgency="general"
            key="general"
            color="#fff"
            :showHeading="false"
          ></DisplayFaqs>
        </v-col>
      </v-row>
    </v-container>

    <!-- ---------------------------------------- end text section -->

    <div style="margin-top: 0px !important; background: #fff" class="py-10">
      <v-lazy
        :min-height="200"
        :options="{ threshold: 0.5 }"
        transition="fade-transition"
      >
        <v-container fluid style="margin-top: -50px !important">
          <v-row
            ><v-col>
              <div v-if="!isMobile && isMounted">
                <v-no-ssr>
                  <v-sheet class="mx-auto mt-12" elevation="0" v-if="!mobile">
                    <v-container fluid
                      ><v-row>
                        <v-col cols="12" md="8"
                          ><h2
                            style="
                              border: none;
                              margin: 0;
                              padding: 0;
                              margin-top: -35px;
                            "
                          >
                            InfoNet Research
                          </h2>
                        </v-col>
                        <v-col
                          cols="12"
                          md="4"
                          class="text-right hidden-sm-and-down"
                          ><div
                            style="border: none; margin-top: -45px"
                            class="pt-4 pr-3"
                          >
                            <v-btn
                              color="#0D4474"
                              to="/data-and-publications"
                              size="x-small"
                              style="font-weight: 700; color: #fff"
                              >All InfoNet Research&nbsp;&raquo;</v-btn
                            >
                          </div>
                        </v-col>
                      </v-row></v-container
                    >
                    <v-container fluid
                      ><v-row
                        ><v-col
                          style="border-top: 1px solid #bbb; margin-top: -10px"
                          >&nbsp;</v-col
                        ></v-row
                      ></v-container
                    >
                    <v-slide-group
                      v-model="model"
                      class="pa-4"
                      selected-class="bg-primary"
                      show-arrows
                    >
                      <v-slide-group-item
                        v-for="(article, index) in filteredArticles()"
                        :key="article._id"
                        v-slot="{ isSelected, toggle, selectedClass }"
                      >
                        <v-card
                          elevation="5"
                          class="px-5 py-5 mb-5 mt-4 mr-2"
                          outlined
                          min-height="200"
                          style="max-width: 700px"
                          role="link"
                          tabindex="0"
                          :aria-label="`Read: ${article.title}`"
                          @click.prevent.stop="
                            article.source === 'hub'
                              ? gotoArticle(article.slug)
                              : gotoPublication(article.fileURL)
                          "
                          @keydown.enter="
                            article.source === 'hub'
                              ? gotoArticle(article.slug)
                              : gotoPublication(article.fileURL)
                          "
                        >
                          <!-- Test: {{ article.homePage }} -->
                          <div>
                            {{ formatDate(article.date) }}
                          </div>
                          <div
                            class="my-6 hover"
                            style="font-weight: 900"
                            @click.prevent.stop="
                              article.source === 'hub'
                                ? gotoArticle(article.slug)
                                : gotoPublication(article.fileURL)
                            "
                          >
                            {{ article.title }}
                          </div>
                          <v-img
                            v-if="article.source === 'hub'"
                            :src="`/images/${article._id}-splash.jpeg`"
                            :lazy-src="`/images/${article._id}-thumbnail.jpeg`"
                            cover
                            height="200"
                            class="mb-5"
                            :ref="'img_' + article._id"
                            style="border: 1px solid #fafafa"
                            alt="InfoNet article splash image"
                          >
                            <template #placeholder>
                              <v-row
                                class="fill-height ma-0"
                                align="center"
                                justify="center"
                              >
                                <v-progress-circular
                                  indeterminate
                                  color="blue darken-3"
                                  aria-label="progress"
                                ></v-progress-circular>
                              </v-row>
                            </template>
                            <template v-slot:error>
                              <!-- TODO: Fix this hacky fallback to PNG if error on image -->
                              <v-img
                                v-if="article.source === 'hub'"
                                :src="`/images/${article._id}-splash.png`"
                                :lazy-src="`/images/${article._id}-thumbnail.png`"
                                cover
                                height="200"
                                class="mb-5"
                                :ref="'img_' + article._id"
                                style="border: 1px solid #fafafa"
                                alt="InfoNet article splash image"
                              ></v-img>
                            </template>
                          </v-img>
                          <div>
                            {{ truncateString(article.abstract, 350) }}
                          </div>
                          <div class="mt-5">
                            <!-- {{ getInfoNetSpecificTags(article.tags) }} -->
                            <!-- <span
                              v-for="tag in getInfoNetSpecificTags(
                                article.tags
                              )"
                              :key="article._id"
                            >
                              <v-chip
                                size="x-small"
                                style="font-weight: 700"
                                @click.prevent.stop="
                                  gotoInfoNetResearchPage(tag)
                                "
                                >&nbsp;{{ tag.toUpperCase() }}&nbsp;</v-chip
                              >
                              &nbsp;
                            </span> -->
                          </div>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                              v-if="article.source === 'hub'"
                              size="small"
                              class="mt-5"
                              variant="text"
                              style="font-weight: 900; font-size: 11px"
                              @click.stop.prevent="gotoArticle(article.slug)"
                            >
                              Read Article (Web)&nbsp;&raquo;
                            </v-btn>

                            <v-btn
                              v-if="article.source === 'publist'"
                              size="small"
                              class="mt-5"
                              variant="text"
                              style="font-weight: 900; font-size: 11px"
                              @click.stop.prevent="
                                gotoPublication(article.fileURL)
                              "
                            >
                              Read {{ getPublicationType(article.pubType) }} ({{
                                article.ext
                              }})&nbsp;&raquo;
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-slide-group-item>
                    </v-slide-group>
                  </v-sheet>
                </v-no-ssr>
              </div>
              <div v-if="isMobile && isMounted">
                <h2 class="px-5 py-5 mb-10">InfoNet Research</h2>

                <div v-for="article in articles" :key="article._id">
                  <v-card
                    elevation="2"
                    class="px-3 py-5 info-card mt-2"
                    outlined
                    style="width: 100%"
                    role="link"
                    tabindex="0"
                    :aria-label="`Read: ${article.title}`"
                    @click="gotoArticle(article.slug)"
                    @keydown.enter="gotoArticle(article.slug)"
                  >
                    <div>
                      {{ formatDate(article.date) }}
                    </div>
                    <div class="my-6" style="font-weight: 900">
                      {{ article.title }}
                    </div>
                    <v-img
                      :src="`/images/${article._id}-splash.jpeg`"
                      cover
                      height="250"
                      class="mb-5"
                      :ref="'img_' + article._id"
                      style="border: 1px solid #fafafa"
                      alt="ICJIA News image"
                      ><template #placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="blue darken-3"
                            aria-label="progress"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                    <div>{{ truncateString(article.abstract, 350) }}</div>
                  </v-card>
                </div>
              </div>
            </v-col></v-row
          ></v-container
        >
      </v-lazy>
    </div>
  </div>
</template>

<script setup>
import _ from "lodash";
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
// import hubArticles from "~/assets/json/hub.json";
const { pending, data: hubArticles } = await useFetch(
  "/api/dataAndPublications"
);
//console.log("hub articles: ", hubArticles);
// console.log("hub pending: ", pending.value);
// console.log("hub.json loaded from api.");
import { useDisplay } from "vuetify";
import { get } from "@vueuse/core";
const { mobile } = useDisplay();
const isMobile = ref(mobile);
const infonetTags = useState("tags");
// console.log(infonetTags.value);
// const router = useRouter();
const isMounted = ref(false);
const articles = computed(() => hubArticles.value?.content || []);
//filter out homepage only
// filter articles marked with homePage: true key

const filteredArticles = () => {
  return articles.value.filter((article) => {
    return article.homePage === true;
  });
};
// console.log("filtered: ", filteredArticles());

// console.log("articles.length: ", articles.length);
// console.log("filteredArticles.length: ", filteredArticles.length);

// console.log(JSON.stringify(hubArticles.value.content));
const limit = ref(2);
let model = ref(null);
const router = useRouter();
const displayAuthors = (arr) => {
  console.log(arr);
};

let isServer = ref(process.server);

const getPublicationType = function (type) {
  let cleanType;
  switch (type) {
    case "researchReport":
      cleanType = "Research Report";
      break;
    case "researchBulletin":
      cleanType = "Research Bulletin";
      break;
    case "researchAtAGlance":
      cleanType = "Research At A Glance";
      break;
    case "trendsAndIssuesUpdate":
      cleanType = "Trends and Issues Update";
      break;
    case "motorVehicleTheftPublications":
      cleanType = "Motor Vehicle Theft Publication";
      break;
    case "barj":
      cleanType = "BARJ";
      break;
    case "compiler":
      cleanType = "Compiler";
      break;
    case "dataset":
      cleanType = "Dataset";
      break;
    case "getTheFacts":
      cleanType = "GET THE FACTS";
      break;
    case "programEvaluationSummary":
      cleanType = "Program Evaluation Summary";
      break;
    case "megProfiles":
      cleanType = "MEG Profiles";
      break;
    case "annualReport":
      cleanType = "Annual Report";
      break;
    case "article":
      cleanType = "Article";
      break;
    case "report":
      cleanType = "Report";
      break;
    case "evaluation":
      cleanType = "Evaluation";
      break;
    case "toolkit":
      cleanType = "Toolkit";
      break;
    case "onGoodAuthority":
      cleanType = "On Good Authority";
      break;
    case "application":
      cleanType = "Application";
      break;

    default:
      cleanType = "Publication";
  }
  return cleanType;
};

// const error = useError();
const { data: posts } = await useAsyncData("content-news", () =>
  queryContent("/news/").limit(limit.value).sort({ postDate: -1 }).find()
);
const { data } = await useAsyncData(`content-home`, async () => {
  const post = await queryContent().where({ _path: "/" }).findOne();
  return post;
});

/**
 * Navigate to InfoNet research page with tag filter
 * @function gotoInfoNetResearchPage
 * @param {string} tag - Research tag to filter by
 */
const gotoInfoNetResearchPage = (tag) => {
  const url = `/research/?tag=${tag}`;
  const tagIndex = infonetTags.value.indexOf(tag);
  router.push({ path: url, query: { tag, tagIndex } });
};

const { data: faqs } = await useAsyncData("content-faqs", () =>
  queryContent("/faqs/").find()
);

/**
 * Filter tags to only include those in InfoNet's tag list
 * @function getInfoNetSpecificTags
 * @param {Array<string>} tagArr - Array of tags to filter
 * @returns {Array<string>} Filtered tags that exist in InfoNet
 */
const getInfoNetSpecificTags = (tagArr) => {
  let tagArrFiltered = [];
  for (let i = 0; i < tagArr.length; i++) {
    for (let j = 0; j < infonetTags.value.length; j++) {
      if (tagArr[i].toLowerCase() === infonetTags.value[j].toLowerCase()) {
        tagArrFiltered.push(tagArr[i].toLowerCase());
        break;
      }
    }
  }
  return tagArrFiltered;
};

onMounted(() => {
  isMounted.value = true;
});

/**
 * Open ICJIA Research Hub article in new tab
 * @function gotoArticle
 * @param {string} slug - Article slug identifier
 */
const gotoArticle = (slug) => {
  let hubArticle = `https://icjia.illinois.gov/researchhub/articles/${slug}`;
  return window.open(hubArticle, "_blank");
};

/**
 * Open publication URL in new tab
 * @function gotoPublication
 * @param {string} url - Publication URL
 */
const gotoPublication = (url) => {
  return window.open(url, "_blank");
};

/**
 * Format date string to locale-specific format
 * @function formatDate
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "January 15, 2024")
 */
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Extract file extension from filename
 * @function getFileExtension
 * @param {string} filename - Filename with extension
 * @returns {string} File extension (e.g., "pdf", "docx")
 */
const getFileExtension = (filename) => {
  const extension = filename.split(".").pop();
  return extension;
};

/**
 * Truncate string to specified length with ellipsis
 * @function truncateString
 * @param {string} str - String to truncate
 * @param {number} [num=250] - Maximum length before truncation
 * @returns {string} Truncated string with "..." appended if needed
 */
const truncateString = (str, num = 250) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};
</script>

<style>
.white-heading {
  color: #fff !important;
}
.dark-rule {
  border-bottom: 1px solid #000 !important;
}

.headingHomeMain {
  font-size: 100px !important;
  font-weight: 700;
  line-height: 1.1em !important;

  color: #0b3a62;
}

.headingHomeMainMobile {
  font-size: 75px !important;
  font-weight: 700;
  line-height: 0.5em;
  border: none;

  color: #0b3a62 !important;
}

.homeContainer {
  display: flex;
  justify-content: space-around;
}
.splash {
  margin-top: 45px;
}
@media (max-width: 1024px) {
  .splash {
    margin-top: 5px;
  }
}

.v-icon--size-default {
  font-size: calc(var(--v-icon-size-multiplier) * 2.5em);
}

/* .chart-container {
  max-width: 900px;
} */
</style>
