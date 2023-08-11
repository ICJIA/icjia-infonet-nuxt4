<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>InfoNet Research</h1>
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

        <div class="text-center mb-12" style="font-size: 14px">
          <span v-if="selectedTag === 0">Displaying </span>
          {{ filteredArticles.length }} article<span
            v-if="filteredArticles.length > 1"
            >s</span
          >
          <span v-if="selectedTag !== 0"></span>
          tagged with
          <span style="font-weight: 700; text-transform: uppercase">{{
            convertIndexToTag(selectedTag)
          }}</span>
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
                class="px-5 py-5"
              >
                <div>
                  {{ formatDate(article.date) }}
                </div>
                <div class="my-6 hover" style="font-weight: 900">
                  {{ article.title }}
                </div>
                <v-img
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
                    size="small"
                    class="mt-5"
                    variant="text"
                    style="font-weight: 700"
                    @click="gotoArticle(article.slug)"
                  >
                    Read Article&nbsp;&raquo;
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
import hubArticles from "~/assets/json/hub.json";
let infonetTags = useState("tags");

const articles = ref(hubArticles);
let filteredArticles = ref([]);
const route = useRoute();
const tagFilter = route.query.tag;
if (tagFilter && tagFilter.length > 0) {
  filteredArticles = articles.value.filter(
    (article) => article.tags.includes(tagFilter) === true
  );
} else {
  filteredArticles = articles;
}

/**
 * Formats a given date string into a human-readable format.
 *
 * @param {string} dateString - The date string to be formatted.
 * @return {string} The formatted date string.
 */
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const truncateString = (str, num = 250) => {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str;
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + "...";
};

let selectedTag = ref([]);

onMounted(() => {
  selectedTag.value = [0];
  filteredArticles = articles;
});

watch(selectedTag, (newSelectedTag) => {
  if (newSelectedTag) {
    console.log("new watch tag: ", convertIndexToTag(newSelectedTag));
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
    console.log("watch tag: ", convertIndexToTag(selectedTag.value));
    filteredArticles = articles;
  }
});

const convertIndexToTag = (index) => {
  return infonetTags.value[index];
};

const setTagFilter = (tag) => {
  console.log("tag: ", tag, " index: ", infonetTags.value.indexOf(tag));
  selectedTag.value = [infonetTags.value.indexOf(tag)];
  window.scrollTo(0, 0);
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
