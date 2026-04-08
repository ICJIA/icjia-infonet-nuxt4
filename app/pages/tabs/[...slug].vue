<template>
  <div>
    <v-container
      ><v-row>
        <v-col cols="12">
          <h1>{{ data.title }}</h1>
          <ContentDoc :key="data?.title" :value="data" class="markdown-body">
            <template #empty>Document not found</template>
            <template #not-found>Document not found</template>
          </ContentDoc>
          <h3
            v-if="
              data &&
              data.images &&
              data.images.data &&
              data.images.data.length > 0
            "
          >
            Images here. Total: {{ data.images.data.length }}
          </h3>
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
// import appRoutes from "assets/json/appRoutes.json";
const { pending, data: routes } = await useFetch("/api/routes");
const appRoutes = computed(() => routes.value?.content || []);
const { path } = useRoute();
const router = useRouter();
const isMounted = ref(false);

const showTOC = ref(false);
const cols = ref(12);

let sections = ref([]);
let myToc = [];

// const error = useError();
console.log("tab path", path);
const { data } = await useAsyncData(`content-${path}`, async () => {
  const item = await queryContent().where({ _path: path }).findOne();
  return item;
});
const redirect = () => {
  router.push("/404");
};

let myTocObj = {};

onBeforeMount(() => {
  const currentPath = router.currentRoute.value.path;
  if (appRoutes.value && appRoutes.value.length > 0) {
    const isValidRoute = appRoutes.value.includes(currentPath);
    if (!isValidRoute) {
      throw showError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
  }
});
onMounted(() => {
  isMounted.value = true;
});

const desc = data.value.summary ? data.value.summary : data.value.title;

useSeoMeta({
  description: desc,
  ogDescription: desc,
  ogImage: "https://infonet.icjia.illinois.gov/infonet-thumbnail-dark.jpg",
  twitterCard: "summary_large_image",
  twitterTitle: data.value.title,
  twitterDescription: desc,
});
</script>

<style lang="scss" scoped></style>
