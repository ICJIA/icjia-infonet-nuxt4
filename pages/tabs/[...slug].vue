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
import appRoutes from "assets/json/appRoutes.json";
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
  const isValidRoute = appRoutes.includes(currentPath);
  if (!isValidRoute) {
    throw showError({ statusCode: 404, statusMessage: "Page Not Found" });
  }
});
onMounted(() => {
  isMounted.value = true;
});

const desc = data.value.summary ? data.value.summary : data.value.title;

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

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

useHead({
  meta: [
    {
      hid: "og-image",
      property: "og:image",
      content: "https://dvfr.icjia.dev/dvfr-splash-text-01.jpg",
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
      content: desc,
    },
    {
      hid: "og-desc",
      property: "og:description",
      content: desc,
    },
  ],
});
</script>

<style lang="scss" scoped></style>
