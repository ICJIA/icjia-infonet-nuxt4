<script setup>
// import appRoutes from "assets/json/appRoutes.json";
const { pending, data: routes } = await useFetch("/api/routes");
const appRoutes = computed(() => routes.value?.content || []);
const { path } = useRoute();
const router = useRouter();

const showTOC = ref(false);
const cols = ref(12);

let sections = ref([]);
let myToc = [];

// const error = useError();
const { data } = await useAsyncData(`content-${path}`, async () => {
  const post = await queryContent().where({ _path: path }).findOne();
  return post;
});
const redirect = () => {
  router.push("/404");
};

const myTocObj = ref({});

onBeforeMount(() => {
  const currentPath = router.currentRoute.value.path;
  const isValidRoute = appRoutes.value.includes(currentPath);
  if (!isValidRoute) {
    throw showError({ statusCode: 404, statusMessage: "Page Not Found" });
  }
}),
  onMounted(() => {
    if (data.value.showTableOfContents) {
      showTOC.value = true;
      cols.value = 9;
      console.log("showTOC", showTOC.value);
      sections = Array.from(
        document.querySelectorAll("h2[id]:not(#toc-sidebar-heading)")
      );
      myToc = sections.map((section) => {
        return {
          id: section.id,
          depth: 2,
          text: section.innerText,
        };
      });

      myTocObj.value = { title: "", searchDepth: 2, depth: 2, links: myToc };
    }
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

useHead({
  meta: [
    {
      hid: "og-image",
      property: "og:image",
      content: "https://infonet.icjia.illinois.gov/infonet-thumbnail-dark.jpg",
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

<template>
  <div class="pb-12" data-aos="fade-in">
    <v-container fluid style="margin: 0; padding: 0"
      ><v-row
        ><v-col cols="12" :md="cols">
          <div v-if="data" class="mt-6 px-5">
            <h1>{{ data.title.toUpperCase() }}</h1>
            <ContentDoc :key="data?.title" :value="data" class="markdown-body">
              <template #empty>Document not found</template>
              <template #not-found>Document not found</template>
            </ContentDoc>
            <attachments
              :attachments="data.attachments.data"
              attachmentHeading="Meeting Materials"
              class="mt-6"
            />
          </div>
        </v-col>

        <v-col
          v-if="showTOC"
          cols="12"
          md="3"
          style="
            min-height: 110vh !important;
            background: #fafafa;
            margin-top: 12px;
            margin-bottom: -105px;
            border: 1px solid #ddd;

            z-index: 1;
            margin-left: -20px;
            margin-right: 0;
            padding-right: 0;
          "
          class="hidden-sm-and-down elevation-0"
        >
          <!-- TOC HERE -->

          <TheTableOfContents :data="myTocObj" class="toc" />
        </v-col> </v-row
    ></v-container>
  </div>
</template>

<style scoped>
.markdown-body.dataTable {
  width: 100%;
  font-size: 14px;
}

.markdown-body .dataTable th {
  font-weight: 900;
  text-align: left;
  font-size: 0.8rem;
}

.markdown-body.dataTable td {
  font-weight: 400;
  text-align: left;
  font-size: 0.65rem;
}
</style>
