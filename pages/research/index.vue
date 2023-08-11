<template>
  <div>
    <pre v-if="tagFilter && tagFilter.length > 0">Filter: {{ tagFilter }}</pre>
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
const infonetTags = useState("tags");
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
