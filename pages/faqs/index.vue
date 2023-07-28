<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" :md="cols">
          <div v-if="data">
            <h1 class="brand-color">
              {{ data.title.toUpperCase() }}
            </h1>
            <ContentDoc
              :key="data?.title"
              :value="data"
              class="markdown-body"
              style="margin-top: -10px"
            >
              <template #empty>Document not found</template>
              <template #not-found>Document not found</template>
            </ContentDoc>
          </div>
          <DisplayFaqs
            strapi-agency="general"
            color="#fff"
            :show-heading="true"
            :showCategory="true"
            key="general"
            class="mt-12"
          ></DisplayFaqs>
          <DisplayFaqs
            strapi-agency="dv"
            color="#fff"
            :show-heading="true"
            :showCategory="true"
          ></DisplayFaqs>
          <DisplayFaqs
            strapi-agency="sa"
            color="#fff"
            :show-heading="true"
            :showCategory="true"
            key="sa"
          ></DisplayFaqs>
          <DisplayFaqs
            strapi-agency="cac"
            color="#fff"
            :show-heading="true"
            :showCategory="true"
            key="cac"
          ></DisplayFaqs>
        </v-col>

        <v-col
          cols="12"
          md="3"
          style="
            min-height: 110vh !important;

            background: #fafafa;
            margin-top: -4px;
            margin-bottom: -105px;
            border: 1px solid #ddd;

            z-index: 1;
            margin-left: -1px;
            margin-right: 0px;
            padding-right: 0;
          "
          class="hidden-sm-and-down elevation-0"
        >
          <TheTableOfContents :data="myTocObj" class="toc" />
        </v-col> </v-row
    ></v-container>
  </div>
</template>

<script setup>
const showTOC = ref(true);
const cols = ref(12);
let sections = ref([]);
let myToc = [];
let myTocObj = {};

const { path } = useRoute();

const { data } = await useAsyncData(`faqs-${path}`, async () => {
  const post = await queryContent().where({ _path: path }).findOne();
  return post;
});

onMounted(() => {
  showTOC.value = true;
  cols.value = 9;
  //console.log("showTOC", showTOC.value);
  sections = Array.from(document.querySelectorAll("h2"));
  myToc = sections.map((section) => {
    return {
      id: section.id,
      depth: 2,
      text: section.innerText,
    };
  });

  myTocObj = { title: "", searchDepth: 2, depth: 2, links: myToc };
});
</script>

<style lang="scss" scoped></style>
