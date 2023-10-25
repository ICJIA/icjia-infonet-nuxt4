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

const { mobile } = useDisplay();

const { data: tabMeta } = await useFetch("/api/tabs");
const tabs = useState("tabs", () => tabMeta);
//console.log("useState: tabs.json loaded.");

// Load appRoutes into global state
const { data: routes } = await useFetch("/api/routes");
const appRoutes = useState("routes", () => routes);
//console.log("useState: appRoutes.json loaded.");

// Load tags into global state
import tagMeta from "~/src/tags.json";
const tags = useState("tags", () => tagMeta);
//console.log("useState: tags.json loaded:", tags.value);

const { isTranslationEnabled } = useAppConfig();
const hideBreadcrumbs = ref(true);
const isMounted = ref(false);
const route = useRoute();
const routePath = ref(route.path);
watchEffect(async () => {
  routePath.value = route.path;
  //console.log("routePath: ", routePath.value);

  if (route.path === "/" || route.path === "/debug") {
    hideBreadcrumbs.value = true;
  } else {
    hideBreadcrumbs.value = false;
  }
  await nextTick();
  await nextTick();
  if (!process.server) {
    // const links = document.querySelectorAll('a[href^="https://"]');
    // console.log("All https links:");
    // for (const link of links) {
    //   console.log(link.href);
    //   //TODO: Add window to notify users that they're being redirected
    // }
    const links = document.querySelectorAll('a[href^="https://"]');

    for (const link of links) {
      link.addEventListener("click", (event) => {
        // event.preventDefault();
        console.log("Click: external link");
      });
    }
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

onUnmounted(() => {
  isMounted.value = false;
  const links = document.querySelectorAll('a[href^="https://"]');

  for (const link of links) {
    link.removeEventListener("click", (e) => {
      // e.preventDefault();
    });
  }
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
