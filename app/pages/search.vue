<template>
  <div data-aos="fade-in">
    <v-container class="mb-12"
      ><v-row
        ><v-col>
          <h1 class="brand-color">Search</h1>
          <div v-if="!pending">
            <div class="text-right" v-if="result.length > 0">
              Found: {{ result.length }}
            </div>

            <v-form class="pl-2 mt-4" style="margin-top: -15px">
              <v-text-field
                id="textfield"
                ref="textfield"
                v-model="query"
                clearable
                focused
                label="Search Infonet"
                placeholder="Enter search term"
                style="font-weight: 900"
                @input="instantSearch"
              />
            </v-form>

            <div class="text-center">
              <v-btn
                class="mr-3 brand-color"
                style="color: #fff !important"
                color="#391856"
                @click.prevent="clearAll"
                >Clear</v-btn
              >
            </div>
            <div v-if="result && query?.length" class="mt-10">
              <!-- <div class="text-center">
                <h2>Search results:</h2>
              </div> -->
              <div v-if="result.length">
                <v-card
                  v-for="(result, index) in result"
                  :key="`fuse-${index}`"
                  class="px-5 py-5 mx-5 my-10 hover text-left info-card"
                  elevation="2"
                  color="grey-lighten-4"
                  @click="navigateTo(result.item)"
                >
                  <div
                    class="text-right mb-8"
                    style="font-weight: 900; font-size: 11px; color: #0657a8"
                  >
                    {{ result.item.url }}
                  </div>
                  <h2 style="border-bottom: 0px">{{ result.item.title }}</h2>
                  <p class="mt-2">{{ result.item.summary }}</p>
                  <!-- <p>{{ result.item }}</p> -->
                  <!-- <p
                    style="
                      font-size: 11px;
                      font-weight: 900;
                      border: 1px solid #ccc;
                      display: inline-block;
                      float: right;
                      padding: 5px;
                      background: #ddd;
                      color: #000;
                    "
                    class="mt-2"
                  >
                    Score: {{ result.score }}
                  </p> -->
                </v-card>
              </div>
            </div>
          </div>
          <div v-else>Loading...</div>
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
/**
 * Search Page
 * Full-text search interface for InfoNet content using Fuse.js
 *
 * @component
 * @description
 * Provides a search interface that allows users to search across all InfoNet content.
 * Uses Fuse.js for client-side full-text search with fuzzy matching capabilities.
 * Search index is fetched from /api/search endpoint.
 *
 * @see {@link https://fusejs.io/|Fuse.js Documentation}
 */
import Fuse from "fuse.js";

const { pending, data: searchIdx } = await useFetch("/api/search");

useHead({
  title: "Search",
});

/**
 * Fuse.js search options configuration
 * @type {Object}
 * @constant
 */
const options = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  includeMatches: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  location: 0,
  threshold: 0.4,
  distance: 500,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  keys: [
    "title",
    "slug",
    "summary",
    "searchMeta",
    "rawText",
    "category",
    "question",
    "answer",
  ],
};

const router = useRouter();
const query = ref("");
const route = useRoute();

// Initialize query from URL params if present
if (route.query && route.query.q) {
  query.value = route.query.q;
} else {
  query.value = "";
}

const fuse = new Fuse(searchIdx.value.content, options);
const result = ref(fuse.search(query.value.toLowerCase));

/**
 * Perform instant search as user types
 * @function instantSearch
 */
const instantSearch = () => {
  result.value = fuse.search(query.value);
};

const showIndex = ref(false);

/**
 * Toggle search index visibility
 * @function toggleIndex
 */
const toggleIndex = () => {
  showIndex.value = !showIndex.value;
};

watch(query, (val) => {
  if (!val) {
    result.value = [];
  }
});

/**
 * Navigate to search result item
 * @function navigateTo
 * @param {Object} item - Search result item with path property
 */
const navigateTo = (item) => {
  router.push({ path: item.path });
};

/**
 * Clear all search results and reset form
 * @function clearAll
 */
const clearAll = () => {
  query.value = "";
  result.value = [];
  showIndex.value = false;

  if (pending.value === false) {
    const el = document.getElementById("textfield");
    el.focus();
  }
};

onMounted(() => {
  clearAll();
  instantSearch();
});
</script>

<style lang="scss" scoped></style>
