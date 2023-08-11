<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-chip-group
          v-model="selectedTag"
          column
          mandatory
          class="mb-10 justify-center"
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

        <v-container fluid
          ><v-row>
            <v-col cols="12">
              <!-- {{ selectedTag }}<br /> -->
              <div v-for="article in filteredArticles" :key="article._id">
                <div class="pl-5 mb-5">
                  {{ article.title }}<br />
                  <span
                    v-for="tag in getInfoNetSpecificTags(article.tags)"
                    :key="article._id"
                  >
                    <v-chip
                      size="x-small"
                      style="font-weight: 700"
                      @click="setTagFilter(tag)"
                    >
                      &nbsp;{{ tag.toUpperCase() }}&nbsp;</v-chip
                    >
                    &nbsp;
                  </span>
                </div>
              </div>
            </v-col></v-row
          ></v-container
        >

        <!-- <div v-for="article in filteredArticles" :key="article._id">
          <div class="pl-5 mb-5">
            {{ article.title }}<br />

            <span
              v-for="tag in getInfoNetSpecificTags(article.tags)"
              :key="article._id"
            >
              <v-chip size="x-small" style="font-weight: 700"
                >&nbsp;{{ tag.toUpperCase() }}&nbsp;</v-chip
              >
              &nbsp;
            </span>
          </div>
        </div> -->
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

let selectedTag = ref([]);

onMounted(() => {
  selectedTag.value = [0];
  filteredArticles = articles;
});

watch(selectedTag, (newSelectedTag) => {
  if (newSelectedTag) {
    console.log("new watch tag: ", convertIndexToTag(newSelectedTag));
    if (convertIndexToTag(newSelectedTag) === "all articles") {
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
