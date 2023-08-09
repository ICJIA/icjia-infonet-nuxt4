<template>
  <v-app id="appTop">
    <LazyImageModal></LazyImageModal>
    <TheNav></TheNav>

    <ThePageLoader v-if="!isMounted && hideBreadcrumbs"> </ThePageLoader>
    <TheSidebar></TheSidebar>

    <NuxtLoadingIndicator color="blue" />

    <v-main class="markdown-body" style="min-height: 90vh !important">
      <TheBreadcrumbBar v-if="!hideBreadcrumbs"></TheBreadcrumbBar>
      <NuxtPage></NuxtPage>
    </v-main>
    <!-- <div style="height: 75px"></div> -->

    <the-context-footer v-if="isMounted && !mobile"></the-context-footer>

    <TheFooter></TheFooter>
  </v-app>
</template>

<script setup>
import { useDisplay } from "vuetify";
import { is } from "@babel/types";
import tabMeta from "~/src/tabs.json";
const { mobile } = useDisplay();
const tabs = useState("tabs", () => tabMeta);
console.log("Tabs loaded.");
const { isTranslationEnabled } = useAppConfig();
const hideBreadcrumbs = ref(true);
const isMounted = ref(false);
const route = useRoute();
const routePath = ref(route.path);
watchEffect(() => {
  routePath.value = route.path;
  console.log("routePath: ", routePath.value);

  if (route.path === "/" || route.path === "/debug") {
    hideBreadcrumbs.value = true;
  } else {
    hideBreadcrumbs.value = false;
  }
});
useHead({
  meta: [{ name: "og:url", content: routePath }],
  htmlAttrs: {
    lang: "en",
  },
});

onMounted(() => {
  isMounted.value = true;
});

const handleMounted = () => {
  console.log("mounted");
  isMounted.value = true;
};

//const page = useCurrentPage({ slug: "slug-here" });
// console.log(page);
</script>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
