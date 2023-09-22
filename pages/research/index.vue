<template>
  <v-container fluid>
    <v-snackbar
      v-model="snackbar"
      :timeout="timeout"
      location="top"
      elevation="6"
      class="mt-3"
    >
      <div class="text-left" style="font-size: 12px">
        <div class="mb-3">Selected filter:</div>
        <div style="font-weight: 700; text-transform: uppercase; color: #fff">
          {{ snackbarText }}
        </div>
      </div>

      <template v-slot:actions>
        <v-btn
          color="blue"
          variant="text"
          @click="snackbar = false"
          style="font-size: 12px"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-row>
      <v-col>
        <h1>InfoNet Research</h1>
        <h2 class="text-center" style="border: none; font-size: 22px">
          Filter by tag:
        </h2>
        <v-chip-group
          v-model="selectedTag"
          column
          mandatory
          class="mt-3 mb-2 justify-center"
          selected-class="chip-text"
        >
          <v-chip
            style="font-weight: 700; text-transform: uppercase"
            filter
            size="small"
            v-for="index in infonetTags.length"
            :key="index"
          >
            {{ infonetTags[index - 1] }}
          </v-chip>
        </v-chip-group>

        <div
          class="text-center mb-12"
          style="font-size: 14px; margin-top: 15px"
        >
          <span v-if="filteredArticles.length === articles.length"
            >Displaying
          </span>
          {{ filteredArticles.length }} item<span
            v-if="filteredArticles.length > 1"
            >s</span
          >
          <span v-if="filteredArticles.length !== articles.length">
            tagged with
            <span style="font-weight: 700; text-transform: uppercase">{{
              convertIndexToTag(selectedTag)
            }}</span></span
          >
        </div>

        <v-container fluid
          ><v-row>
            <v-col
              v-for="article in filteredArticles"
              :key="article._id"
              class="mb-8"
              cols="12"
              md="6"
              style="display: flex; flex-direction: column"
            >
              <v-card
                height="100%"
                style="position: relative"
                class="px-5 py-5 elevation-5"
              >
                <div>
                  <span
                    style="
                      font-weight: 700;
                      color: #000;
                      text-transform: uppercase;
                    "
                  >
                    {{ formatDate(article.date) }}</span
                  >
                  |
                  <span
                    style="
                      font-weight: 400;
                      color: #555;
                      text-transform: uppercase;
                    "
                  >
                    {{ getPublicationType(article.pubType) }}</span
                  >
                </div>
                <div class="mt-6 mb-3 hover" style="font-weight: 900">
                  {{ article.title }}
                </div>
                <!-- <div class="text-right mt-1 mb-5">{{ article.pubType }}</div> -->

                <v-img
                  :src="`/images/${article._id}-splash.jpeg`"
                  :lazy-src="`/images/${article._id}-thumbnail.jpeg`"
                  cover
                  height="200"
                  class="mb-5"
                  :ref="'img_' + article._id"
                  style="border: 1px solid #fafafa"
                  alt="InfoNet article splash image"
                  v-if="article.source === 'hub'"
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
                  {{ truncateString(article.abstract, 850) }}
                </div>
                <div class="mt-5">
                  <!-- {{ getInfoNetSpecificTags(article.tags) }} -->
                  <span
                    v-for="tag in getInfoNetSpecificTags(article.tags)"
                    :key="article._id"
                  >
                    <v-chip
                      size="x-small"
                      style="font-weight: 700"
                      @click="setTagFilter(tag)"
                      >&nbsp;{{ tag.toUpperCase() }}&nbsp;</v-chip
                    >
                    &nbsp;
                  </span>
                </div>
                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    v-if="article.source === 'hub'"
                    size="small"
                    class="mt-5"
                    variant="text"
                    style="font-weight: 700"
                    @click="gotoArticle(article.slug)"
                  >
                    Read Article (Web)&nbsp;&raquo;
                  </v-btn>

                  <v-btn
                    v-if="article.source === 'publist'"
                    size="small"
                    class="mt-5"
                    variant="text"
                    style="font-weight: 700"
                    @click="gotoPublication(article.fileURL)"
                  >
                    Read {{ getPublicationType(article.pubType) }} ({{
                      article.ext
                    }})&nbsp;&raquo;
                  </v-btn>
                </v-card-actions>
              </v-card></v-col
            >
          </v-row></v-container
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
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

// import hubArticles from "~/assets/json/hub.json";
const { pending, data: hubArticles } = await useFetch("/api/research");
// console.log("hub pending: ", pending.value);
console.log("hub.json loaded from api.");
let infonetTags = useState("tags");
let isMounted = ref(false);
const articles = ref(hubArticles.value.content);
let filteredArticles = ref([]);
const route = useRoute();
const tagFilter = route.query.tag;
const tagIndex = route.query.tagIndex;
if (tagFilter && tagFilter.length > 0) {
  filteredArticles = articles.value.filter(
    (article) => article.tags.includes(tagFilter) === true
  );
} else {
  filteredArticles = articles;
}

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const truncateString = (str, num = 250) => {
  if (str.length <= num) {
    return str;
  }

  return str.slice(0, num) + "...";
};

let selectedTag = ref([]);
let snackbar = ref(false);
let snackbarText = ref("");
let timeout = 2000;

onMounted(() => {
  if (tagIndex && tagIndex.length > 0) {
    selectedTag.value = [tagIndex];
    snackbarText.value = infonetTags.value[tagIndex];
    // snackbar.value = true;
  } else {
    selectedTag.value = [0];
    // snackbar.value = true;
    // snackbarText.value = "Test from default";
  }

  isMounted.value = true;
  filteredArticles = articles;
  //console.log(tagFilter, tagIndex);
});

watch(selectedTag, (newSelectedTag) => {
  if (newSelectedTag) {
    //console.log("new watch tag: ", convertIndexToTag(newSelectedTag));
    if (convertIndexToTag(newSelectedTag) === "all research") {
      filteredArticles = articles.value;
    } else {
      filteredArticles = articles.value.filter(
        (article) =>
          article.tags.includes(convertIndexToTag(newSelectedTag)) === true
      );
    }

    // filteredArticles = articles;
  } else {
    //console.log("watch tag: ", convertIndexToTag(selectedTag.value));
    filteredArticles = articles;
  }
});

const convertIndexToTag = (index) => {
  return infonetTags.value[index];
};

const convertTagToIndex = (tag) => {
  return infonetTags.value.indexOf(tag);
};

const setTagFilter = (tag) => {
  //console.log("tag: ", tag, " index: ", infonetTags.value.indexOf(tag));
  selectedTag.value = [infonetTags.value.indexOf(tag)];
  window.scrollTo(0, 0);
  snackbarText = tag;
  snackbar.value = true;
};

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

const gotoArticle = (slug) => {
  let hubArticle = `https://icjia.illinois.gov/researchhub/articles/${slug}`;
  return window.open(hubArticle, "_blank");
};

const gotoPublication = (url) => {
  return window.open(url, "_blank");
};

const openSnackbar = (str = "All Research") => {
  snackbarText.value = str;
  snackbar.value = true;
};
</script>

<style lang="scss">
.chip-text {
  color: rgb(8, 8, 171);
}

.mdi-check {
  font-size: 20px !important;
}

// .v-icon--size-default {
//   font-size: calc(var(--v-icon-size-multiplier) * 1.5em) !important;
// }
</style>
