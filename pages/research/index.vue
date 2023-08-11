<template>
  <div>
    <pre v-if="tagFilter && tagFilter.length > 0">Filter: {{ tagFilter }}</pre>
    <h2 class="text-h6 mb-2">Filter InfoNet Research:</h2>
    <div class="text-center">
      <v-chip-group v-model="selectedTag" column mandatory>
        <v-chip
          filter
          variant="outlined"
          v-for="index in infonetTags.length"
          :key="index"
        >
          {{ infonetTags[index - 1] }}
        </v-chip>
      </v-chip-group>
    </div>
    <div v-if="articles">
      <div v-for="article in filteredArticles" :key="article._id">
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
      </div>
    </div>
  </div>
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
    // filteredArticles = articles.value.filter(
    //   (article) => article.tags.includes(newSelectedTag.value) === true
    // );
  } else {
    console.log("watch tag: ", convertIndexToTag(selectedTag.value));
    filteredArticles = articles;
  }
});

const convertIndexToTag = (index) => {
  return infonetTags.value[index];
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

<style lang="scss" scoped></style>
