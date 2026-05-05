<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <div v-if="isMounted">
            <div
              class="text-center mb-4 pr-2"
              style="font-size: 12px; font-weight: 900; color: #6b6b6b"
            >
              Click tab to view agency info.
            </div>

            <div
              v-if="props.sectionID && props.sectionID.length > 0"
              class="accessible-tabs-wrapper"
            >
              <div class="accessible-tabs-card elevation-2">
                <!-- Tab List -->
                <div
                  role="tablist"
                  class="accessible-tabs-list"
                  aria-label="Agency screenshots"
                >
                  <button
                    v-for="(tabItem, index) in tabContent"
                    :key="`tab-${tabItem.id}`"
                    :id="`tab-${index}`"
                    role="tab"
                    :aria-selected="activeTabIndex === index"
                    :aria-controls="`panel-${index}`"
                    :tabindex="activeTabIndex === index ? 0 : -1"
                    class="accessible-tab"
                    :class="{
                      'accessible-tab-active': activeTabIndex === index,
                    }"
                    @click="setActiveTab(index)"
                    @keydown="handleKeyDown($event, index)"
                  >
                    {{ getTitle(tabItem.attributes) }}
                  </button>
                </div>

                <!-- Tab Panels -->
                <div class="accessible-tabs-content">
                  <div
                    v-for="(tabItem, index) in tabContent"
                    :key="`panel-${tabItem.id}`"
                    :id="`panel-${index}`"
                    role="tabpanel"
                    :aria-labelledby="`tab-${index}`"
                    :hidden="activeTabIndex !== index"
                    :inert="activeTabIndex !== index || null"
                    :tabindex="activeTabIndex === index ? 0 : -1"
                    class="accessible-tab-panel"
                  >
                    <div
                      class="text-center mt-8 mb-5"
                      style="
                        font-weight: 700;
                        color: blue;
                        text-transform: uppercase;
                      "
                    >
                      Note: All displays contain mock data.
                    </div>

                    <div
                      class="px-5 py-5"
                      v-if="
                        tabItem.attributes.body &&
                        tabItem.attributes.body.length > 0
                      "
                    >
                      <span
                        class="markdown-body"
                        v-html="renderer.render(tabItem.attributes.body)"
                      ></span>
                    </div>

                    <div
                      v-if="tabItem.attributes.images && tabItem.attributes.images.data && tabItem.attributes.images.data.length > 0"
                      class="gallery mt-12"
                      style="margin-left: 0px"
                    >
                      <div
                        class="gallery-panel hover my-5"
                        v-for="(image, imgIndex) in sortImagesByFilename(
                          tabItem.attributes.images.data
                        )"
                        :key="`images-${imgIndex}`"
                        role="button"
                        tabindex="0"
                        :aria-label="`View screenshot: ${image.attributes?.caption || image.attributes?.name || 'Screenshot image'}`"
                        @click="
                          openGalleryModal({
                            url: `${image.attributes.url}`,
                            caption: image.attributes?.caption || null,
                            thumbnail:
                              image.attributes.formats.thumbnail.url,
                            filename: image.attributes.name,
                          })
                        "
                        @keydown.enter="
                          openGalleryModal({
                            url: `${image.attributes.url}`,
                            caption: image.attributes?.caption || null,
                            thumbnail:
                              image.attributes.formats.thumbnail.url,
                            filename: image.attributes.name,
                          })
                        "
                        @keydown.space.prevent="
                          openGalleryModal({
                            url: `${image.attributes.url}`,
                            caption: image.attributes?.caption || null,
                            thumbnail:
                              image.attributes.formats.thumbnail.url,
                            filename: image.attributes.name,
                          })
                        "
                      >
                        <v-img
                          :src="
                            getImageURL(image.attributes.formats.medium.url)
                          "
                          :lazy-src="
                            imgIndex === 0 && activeTabIndex === index
                              ? undefined
                              : getImageURL(image.attributes.formats.thumbnail.url)
                          "
                          :eager="imgIndex === 0 && activeTabIndex === index"
                          :aspect-ratio="
                            (image.attributes.formats.medium.width || 750) /
                            (image.attributes.formats.medium.height || 400)
                          "
                          :alt="
                            image.attributes?.alternativeText ||
                            `Screenshot: ${image.attributes?.caption || image.attributes?.name || 'application view'}`
                          "
                        >
                          <template v-slot:placeholder>
                            <div
                              class="d-flex align-center justify-center fill-height"
                            >
                              <v-progress-circular
                                color="grey-lighten-4"
                                indeterminate
                                aria-label="Loading image"
                              ></v-progress-circular>
                            </div>
                          </template>
                        </v-img>
                        <div
                          style="font-size: 11px; font-weight: 900"
                          class="text-center pl-1 pt-2"
                        >
                          {{ image.attributes?.caption }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="mt-12 text-center">
            <ThePageLoader />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import md from "markdown-it";
import attrs from "markdown-it-attrs";

const renderer = new md({
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "\u201c\u201d\u2018\u2019",
}).use(attrs);

const props = defineProps({
  sectionID: {
    type: String,
    default: "",
  },
});

const tabs = useState("tabs");
const activeTabIndex = ref(0);
const isMounted = ref(false);
const mobile = ref(false);

// Filter tab content by sectionID
const _tabContent = (tabs.value?.content || []).filter((tab) => {
  if (tab.attributes.sectionID === props.sectionID) {
    return tab;
  }
});

const tabContent = toRaw(_tabContent);

// Custom mobile detection (no Vuetify)
const checkMobile = () => {
  mobile.value = window.innerWidth < 600;
};

const getTitle = (attributes) => {
  let title;
  if (mobile.value === true) {
    title = attributes.agency;
  } else {
    title = attributes.title;
  }
  return title;
};

const getImageURL = (url) => {
  return `https://infonet.icjia-api.cloud${url}`;
};

const sortImagesByFilename = (images) => {
  return images.sort((a, b) => {
    if (a.attributes.name < b.attributes.name) {
      return -1;
    }
    if (a.attributes.name > b.attributes.name) {
      return 1;
    }
    return 0;
  });
};

const openGalleryModal = ({ url, caption, thumbnail, filename }) => {
  let myURL = `https://infonet.icjia-api.cloud${url}`;
  let thumbnailURL = `https://infonet.icjia-api.cloud${thumbnail}`;
  useEvent("modal:gallery", {
    url: myURL,
    caption: caption,
    thumbnail: thumbnailURL,
    filename: filename,
  });
};

// Custom tab activation with focus management
const setActiveTab = (index) => {
  activeTabIndex.value = index;
  nextTick(() => {
    const tabButton = document.getElementById(`tab-${index}`);
    if (tabButton) {
      tabButton.focus();
    }
  });
};

// Full keyboard navigation implementation
const handleKeyDown = (event, currentIndex) => {
  const totalTabs = tabContent.length;
  let newIndex = currentIndex;

  switch (event.key) {
    case "ArrowLeft":
    case "ArrowUp":
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalTabs - 1;
      break;
    case "ArrowRight":
    case "ArrowDown":
      event.preventDefault();
      newIndex = currentIndex < totalTabs - 1 ? currentIndex + 1 : 0;
      break;
    case "Home":
      event.preventDefault();
      newIndex = 0;
      break;
    case "End":
      event.preventDefault();
      newIndex = totalTabs - 1;
      break;
    default:
      return;
  }

  setActiveTab(newIndex);
};

// Lifecycle hooks with custom mobile detection
onMounted(() => {
  isMounted.value = true;
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style lang="scss" scoped>
.accessible-tabs-wrapper {
  width: 100%;
}

.accessible-tabs-card {
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
}

.accessible-tabs-list {
  display: flex;
  flex-direction: row;
  background-color: #424242;
}

.accessible-tab {
  flex: 1 1 auto;
  flex-shrink: 0;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: "Lato", sans-serif;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.0892857143em;
  padding: 12px 16px;
  min-height: 48px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* CRITICAL: Allow text to wrap - prevents clipping */
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  height: auto;
  max-height: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.5;

  /* CRITICAL: Explicit anti-clipping properties */
  overflow: visible;
}

.accessible-tab-active {
  color: #ffffff;
  background-color: #616161;
}

.accessible-tab:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.accessible-tab:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.accessible-tabs-content {
  background-color: #fafafa;
  padding: 0;
}

.accessible-tab-panel {
  overflow: visible;
  max-height: none;
}
</style>
