<template>
  <header>
    <v-app-bar
      fixed
      app
      color="white"
      density="default"
      style="z-index: 50; width: 100%"
      size="150px"
      elevation="3"
      class="pl-5 pr-5"
      tag="div"
    >
      <div
        v-if="!nav"
        class="hover hamburger text-center hidden-md-and-up"
        role="button"
        tabindex="0"
        aria-label="Open navigation menu"
        @click="toggleNav"
        @keydown.enter="toggleNav"
        @keydown.space.prevent="toggleNav"
      >
        <v-icon icon="mdi-menu" size="large"></v-icon>
        <div style="font-size: 10px; font-weight: 900">MENU</div>
      </div>
      <div
        v-else
        class="hover hamburger text-center hidden-md-and-up"
        role="button"
        tabindex="0"
        aria-label="Close navigation menu"
        @click="toggleNav"
        @keydown.enter="toggleNav"
        @keydown.space.prevent="toggleNav"
      >
        <v-icon icon="mdi-window-close" size="large"></v-icon>
        <div style="font-size: 10px; font-weight: 900">CLOSE</div>
      </div>
      <v-spacer class="hidden-md-and-up"></v-spacer>
      <!-- <img
        alt="ICJIA Logo"
        class="hover ml-4 mr-4 hidden-sm-and-down"
        src="/icjia-logo.png"
        width="75"
        @click="$router.push('/')"
      /> -->
      <div class="hover hidden-sm-and-down">
        <span
          style="
            font-weight: 900 !important;
            font-size: 26px;
            font-family: 'Roboto', sans-serif !important;
            letter-spacing: 0.004em;
          "
          class="agency app-title"
          @click="$router.push('/')"
          ><span v-if="isHome" class="headerTitleHome"
            ><span
              style="
                color: #0d4270;
                font-family: 'Raleway', sans-serif;
                letter-spacing: 0em;
              "
              >INFONET</span
            >
            |

            <span
              style="
                font-weight: 300;
                color: #000;
                font-size: 26px;
                letter-spacing: 0px;
                font-family: 'Raleway', sans-serif;
              "
              class="mb-12 hidden-sm-and-down"
              >DATA COLLECTION & REPORTING SYSTEM</span
            ></span
          >

          <span
            v-else
            class="headerTitle"
            style="
              color: #0d4270;
              font-family: 'Raleway', sans-serif;
              letter-spacing: 0em;
            "
            >INFONET |
            <span
              style="
                font-weight: 300;
                color: #000;
                font-size: 26px;
                letter-spacing: 0px;
                font-family: 'Raleway', sans-serif;
              "
              class="mb-12"
              >Data Collection & Reporting System</span
            ></span
          >
        </span>
      </div>
      <div class="hover hidden-md-and-up">
        <span
          style="
            font-weight: 900 !important;
            font-size: 28px;
            font-family: 'Roboto', sans-serif !important;
            letter-spacing: 0.004em;
          "
          class="agency app-title"
          @click="$router.push('/')"
          >INFONET <span class="hidden-md-and-down"> </span
        ></span>
      </div>

      <v-spacer></v-spacer>
      <span v-if="isMounted">
        <span
          v-for="(menu, index) in navMenu"
          :key="`main-${index}`"
          style="
            display: inline-block;
            font-weight: 900 !important;
            font-size: 18px;
            font-family: 'Roboto', sans-serif !important;
            font-weight: 900;
          "
        >
          <span v-if="menu && menu?.children">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="text"
                  size="default"
                  class="hidden-md-and-down navItem"
                  v-bind="props"
                  :aria-label="menu.main"
                >
                  {{ menu.main }}
                  <v-icon right small>mdi-menu-down</v-icon></v-btn
                >
              </template>
              <v-list nav density="compact" elevation="2">
                <span
                  v-for="(child, index) in menu.children"
                  :key="`child-${index}`"
                >
                  <v-divider v-if="child.divider"></v-divider>
                  <v-list-item-title
                    v-if="child.section"
                    style="
                      margin-top: 10px;
                      font-weight: 900;
                      color: #555;
                      font-family: 'Roboto', sans-serif !important;
                    "
                    class="pr-5"
                    >{{ child.section }}</v-list-item-title
                  >
                  <v-list-item
                    v-if="child?.link"
                    class="appNav hover"
                    :to="child?.external ? null : child?.link"
                    :href="child?.external ? child?.link : null"
                    :target="child?.external ? '_blank' : null"
                    style="font-weight: 900"
                  >
                    <v-list-item-title
                      style="
                        font-size: 12px !important;
                        font-weight: 700 !important;
                      "
                      >{{ child.title }}
                      <span v-if="child?.external">External</span>
                      <v-icon v-if="child.icon" small right color="black">{{
                        child.icon
                      }}</v-icon></v-list-item-title
                    >
                  </v-list-item>
                </span>
              </v-list>
            </v-menu>
          </span>
          <span v-else class="d-flex">
            <v-btn
              :to="menu?.external ? null : menu?.link"
              :href="menu?.external ? menu.link : null"
              :target="menu?.external ? '_blank' : null"
              :aria-label="menu.main"
              variant="text"
              size="default"
              class="hidden-sm-and-down navItem"
              style="
                font-weight: 900 !important;
                font-size: 16px;
                font-family: 'Roboto', sans-serif !important;
              "
              >{{ menu.main }}&nbsp;
              <v-icon v-if="menu.icon" right small color="black">{{
                menu.icon
              }}</v-icon>
            </v-btn>
          </span>
        </span>

        <span class="hidden-sm-and-down">
          <v-menu transition="scale-transition">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                aria-label="More options"
                title="More options"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item exact to="/search">
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  ><v-icon size="x-small" icon="mdi-magnify" left></v-icon
                  >&nbsp;&nbsp;Search</v-list-item-title
                >
              </v-list-item>
              <v-list-item
                v-if="isTranslationEnabled"
                exact
                style="cursor: pointer"
                to="/translate"
              >
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  ><v-icon size="x-small" icon="mdi-web" left></v-icon
                  >&nbsp;&nbsp;Translate</v-list-item-title
                >
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item exact to="/contact">
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  ><v-icon size="x-small" icon="mdi-mail" left></v-icon
                  >&nbsp;&nbsp;Contact</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </span>
        <span
          class="hover hamburger text-center hidden-md-and-up"
          role="button"
          tabindex="0"
          aria-label="Search"
          @click="goToSearch"
          @keydown.enter="goToSearch"
          @keydown.space.prevent="goToSearch"
        >
          <v-icon icon="mdi-magnify" size="large"></v-icon>
          <div style="font-size: 10px; font-weight: 900">SEARCH</div>
        </span>
      </span>

      <span v-else class="text center ml-12"><TheLoader></TheLoader> </span>
    </v-app-bar>
  </header>
</template>

<script setup>
const { isTranslationEnabled } = useAppConfig();
const isMounted = ref(false);
const nav = useNavToggle();
const toggleNav = () => {
  nav.value = !nav.value;
};
const isHome = ref(true);
const route = useRoute();
watchEffect(() => {
  //console.log("route.path: ", route.path);
  if (route.path === "/") {
    isHome.value = true;
  } else {
    isHome.value = false;
  }
});

const appConfig = useAppConfig();
const navMenu = JSON.parse(JSON.stringify(appConfig.navMenu));

const isExternalUrl = (url) => {
  return true;
};

onMounted(() => {
  isMounted.value = true;
});

const router = useRouter();

const goToSearch = () => {
  router.push({ path: "/search" });
};

const goToTranslate = () => {
  router.push({ path: "/translate" });
};

const items = ref([
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me 2" },
]);
</script>

<style lang="scss" scoped>
.headerTitleHome {
  font-size: 28px;
}
.headerTitle {
  font-size: 28px;
  text-transform: uppercase;
}
.navItem {
  color: #333 !important;
  font-weight: 900;
}
</style>
