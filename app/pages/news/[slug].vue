<script setup>
// import appRoutes from "assets/json/appRoutes.json";
import moment from "moment";
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
console.log("news path", path);
const { data } = await useAsyncData(`content-${path}`, async () => {
  const item = await queryContent().where({ _path: path }).findOne();
  return item;
});
const redirect = () => {
  router.push("/404");
};

const myTocObj = ref({});

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
  if (data.value?.showTableOfContents) {
    showTOC.value = true;
    cols.value = 9;
    nextTick(() => {
      sections = Array.from(document.querySelectorAll("h2[id]"));
      myToc = sections.map((section) => {
        return {
          id: section.id,
          depth: 2,
          text: section.innerText,
        };
      });

      myTocObj.value = { title: "", searchDepth: 2, depth: 2, links: myToc };
    });
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

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const publishedDate = data.value.postDate || data.value.publishedAt || data.value.createdAt;
const modifiedDate = data.value.updatedAt || publishedDate;
const splashImage = data.value.splash?.data?.attributes?.formats?.medium?.url
  ? `https://infonet.icjia-api.cloud${data.value.splash.data.attributes.formats.medium.url}`
  : "https://infonet.icjia.illinois.gov/infonet-thumbnail-dark.jpg";

useSeoMeta({
  description: desc,
  ogTitle: data.value.title,
  ogDescription: desc,
  ogType: "article",
  ogImage: splashImage,
  ogImageWidth: "1200",
  ogImageHeight: "630",
  articlePublishedTime: publishedDate,
  articleModifiedTime: modifiedDate,
  twitterCard: "summary_large_image",
  twitterTitle: data.value.title,
  twitterDescription: desc,
  twitterImage: splashImage,
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.value.title,
        description: desc,
        image: splashImage,
        datePublished: publishedDate,
        dateModified: modifiedDate,
        author: {
          "@type": "Organization",
          name: "Illinois Criminal Justice Information Authority",
          url: "https://icjia.illinois.gov",
        },
        publisher: {
          "@type": "Organization",
          name: "Illinois Criminal Justice Information Authority",
          url: "https://icjia.illinois.gov",
        },
      }),
    },
  ],
});
</script>

<template>
  <div class="pb-12">
    <v-container fluid style="margin: 0; padding: 0"
      ><v-row
        ><v-col cols="12" :md="cols">
          <div v-if="data" class="mt-6 px-5">
            <h1 style="line-height: 45px">{{ data.title.toUpperCase() }}</h1>
            <div style="margin-top: -15px; margin-bottom: 45px">
              <span style="font-weight: 900">{{
                moment(data.postDate).utc().format("MMM DD, YYYY")
              }}</span>
              |
              <nuxt-link
                :to="`/search?q=${data.category.toLowerCase()}`"
                style="
                  color: #000 !important;
                  font-weight: 400;
                  font-family: 'Lato', sans-serif !important;
                "
                >{{ data.category.toUpperCase() }}</nuxt-link
              >
            </div>

            <div
              v-if="data && data.splash && data.splash.data"
              class="mb-10"
              style="margin-top: -20px"
            >
              <v-img
                cover
                :src="`https://infonet.icjia-api.cloud${data.splash.data.attributes.formats.medium.url}`"
                :lazy-src="`https://infonet.icjia-api.cloud${data.splash.data.attributes.formats.thumbnail.url}`"
                :alt="
                  data.splash.data.attributes.caption ||
                  data.splash.data.attributes.alternativeText ||
                  `${data.title} - Article splash image`
                "
                height="550"
                ><template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                      color="grey-lighten-4"
                      indeterminate
                    ></v-progress-circular>
                  </div> </template
              ></v-img>
              <div
                style="font-size: 12px; color: #666; font-weight: 700"
                class="mt-2 pl-1 mb-12"
              >
                {{ data.splash.data.attributes.caption }}
              </div>
            </div>

            <ContentDoc :key="data?.title" :value="data" class="markdown-body">
              <template #empty>Document not found</template>
              <template #not-found>Document not found</template>
            </ContentDoc>

            <attachments
              :attachments="data.attachments.data"
              :showTableDisplay="true"
              class="mt-6"
              style="font-size: 14px"
              v-if="data.attachments.data && data.attachments.data.length > 0"
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
