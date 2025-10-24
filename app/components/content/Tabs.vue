<template>
  <div>
    <v-container
      ><v-row
        ><v-col cols="12">
          <div v-if="isMounted">
            <!-- <div class="py-12"><strong>isMobile: </strong>{{ mobile }}</div> -->
            <div
              class="text-center mb-4 pr-2"
              style="font-size: 12px; font-weight: 900; color: #6b6b6b"
            >
              Click tab to view agency info.
            </div>

            <v-card
              v-if="props.sectionID && props.sectionID.length > 0"
              class="elevation-2"
            >
              <v-tabs v-model="tab" bg-color="grey-darken-3" grow center-active>
                <v-tab
                  :value="tab.attributes.slug"
                  v-for="tab in tabContent"
                  :key="`tabTitle-${tab.id}`"
                  style="font-size: 14px !important; font-weight: 900"
                >
                  {{ getTitle(tab.attributes) }}
                </v-tab>
              </v-tabs>

              <v-window v-model="tab" style="background: #fafafa" class="px-0">
                <v-window-item
                  v-for="tab in tabContent"
                  :key="`tabContent-${tab.id}`"
                  :value="tab.attributes.slug"
                  class="px-3"
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
                    v-if="tab.attributes.body && tab.attributes.body.length > 0"
                  >
                    <span
                      class="markdown-body"
                      v-html="renderer.render(tab.attributes.body)"
                    ></span>
                  </div>
                  <div
                    v-if="
                      tab.attributes &&
                      tab.attributes.images &&
                      tab.attributes.images.data.length > 0
                    "
                  ></div>

                  <div class="gallery mt-12" style="margin-left: 0px">
                    <div
                      class="gallery-panel hover my-5"
                      style=""
                      v-for="(image, index) in sortImagesByFilename(
                        tab.attributes.images.data
                      )"
                      :key="`images-${index}`"
                      @click="
                        image?.attributes?.formats?.large
                          ? openGalleryModal({
                              url: `${image.attributes.url}`,
                              caption: image.attributes?.caption || null,
                              thumbnail: image.attributes.formats.thumbnail.url,
                              filename: image.attributes.name,
                            })
                          : openGalleryModal({
                              url: `${image.attributes.url}`,
                              caption: image.attributes?.caption || null,
                              thumbnail: image.attributes.formats.thumbnail.url,
                              filename: image.attributes.name,
                            })
                      "
                    >
                      <!-- {{
                        `https://infonet.icjia-api.cloud${image.attributes.url}`
                      }} -->
                      <v-img
                        :src="getImageURL(image.attributes.formats.medium.url)"
                        :lazy-src="
                          getImageURL(image.attributes.formats.thumbnail.url)
                        "
                        :alt="
                          image.attributes?.caption ||
                          image.attributes?.alternativeText ||
                          'Screenshot image'
                        "
                        ><template v-slot:placeholder>
                          <div
                            class="d-flex align-center justify-center fill-height"
                          >
                            <v-progress-circular
                              color="grey-lighten-4"
                              indeterminate
                            ></v-progress-circular>
                          </div> </template
                      ></v-img>
                      <div
                        style="font-size: 11px; font-weight: 900"
                        class="text-center pl-1 pt-2"
                      >
                        {{ image.attributes?.caption }}<br />
                        <!-- Debug: {{ image.attributes.name }} -->
                      </div>
                    </div>
                  </div>
                </v-window-item>
              </v-window>
            </v-card>

            <div
              class="mt-12"
              v-if="props.sectionID && props.sectionID.length > 0"
            ></div>
          </div>
          <div v-else class="mt-12 text-center">
            <ThePageLoader />
          </div> </v-col></v-row
    ></v-container>
  </div>
</template>

<script setup>
import { useDisplay } from "vuetify";
import md from "markdown-it";
import attrs from "markdown-it-attrs";
const renderer = new md({
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
}).use(attrs);

/**
 * Tabs Component
 * Displays tabbed content for different agencies/sections
 *
 * @component
 * @prop {string} sectionID - Section identifier to filter tabs
 * @description
 * Renders a tabbed interface for displaying agency information.
 * Filters tab content by sectionID and displays responsive tabs.
 * Includes image gallery modal functionality.
 */
const props = defineProps({
  sectionID: {
    type: String,
    default: "",
  },
});

const tabs = useState("tabs");
const tab = ref(null);
const isMounted = ref(false);

const _tabContent = (tabs.value?.content || []).filter((tab) => {
  if (tab.attributes.sectionID === props.sectionID) {
    return tab;
  }
});

const tabContent = toRaw(_tabContent);
const { mobile } = useDisplay();

/**
 * Get appropriate title based on device type
 * @function getTitle
 * @param {Object} attributes - Tab attributes object
 * @returns {string} Agency name on mobile, full title on desktop
 */
const getTitle = (attributes) => {
  let title;
  if (mobile.value === true) {
    title = attributes.agency;
  } else {
    title = attributes.title;
  }
  return title;
};

/**
 * Construct full image URL from relative path
 * @function getImageURL
 * @param {string} url - Relative image URL
 * @returns {string} Full image URL with API base
 */
const getImageURL = (url) => {
  return `https://infonet.icjia-api.cloud${url}`;
};

/**
 * Generate HTML caption for image
 * @function getImageCaption
 * @param {string} caption - Image caption text
 * @returns {string} HTML formatted caption or undefined
 */
const getImageCaption = (caption) => {
  if (caption) {
    return `<div class="" style="font-size: 10px !important">${caption}</div>`;
  }
};

/**
 * Sort images by filename in ascending order
 * @function sortImagesByFilename
 * @param {Array<Object>} images - Array of image objects
 * @returns {Array<Object>} Sorted images array
 */
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

/**
 * Open image gallery modal with image details
 * @function openGalleryModal
 * @param {Object} options - Modal options
 * @param {string} options.url - Full image URL
 * @param {string} options.caption - Image caption
 * @param {string} options.thumbnail - Thumbnail URL
 * @param {string} options.filename - Image filename
 */
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

onMounted(() => {
  isMounted.value = true;
});
</script>

<style scoped>
/* CSS GRID */
</style>
