<template>
  <div>
    <v-container
      ><v-row
        ><v-col cols="12">
          <div v-if="isMounted">
            <!-- <div class="py-12"><strong>isMobile: </strong>{{ mobile }}</div> -->
            <div
              class="text-center mb-4 pr-2"
              style="font-size: 12px; font-weight: 900; color: #777"
            >
              Click tab to view agency info
            </div>

            <v-card
              v-if="props.sectionID && props.sectionID.length > 0"
              class="elevation-0"
            >
              <v-tabs v-model="tab" bg-color="grey-darken-2" grow center-active>
                <v-tab
                  :value="tab.attributes.slug"
                  v-for="tab in tabContent"
                  :key="`tabTitle-${tab.id}`"
                  style="font-size: 14px !important; font-weight: 900"
                >
                  {{ getTitle(tab.attributes) }}
                </v-tab>
              </v-tabs>

              <v-window v-model="tab" style="background: #eee">
                <v-window-item
                  v-for="tab in tabContent"
                  :key="`tabContent-${tab.id}`"
                  :value="tab.attributes.slug"
                  class=""
                >
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
                      class="gallery-panel hover"
                      v-for="(image, index) in tab.attributes.images.data"
                      :key="`images-${index}`"
                      @click="
                        image?.attributes?.formats?.medium
                          ? openGalleryModal({
                              url: image.attributes.formats.medium.url,
                              caption: image.attributes?.caption || null,
                              thumbnail: image.attributes.formats.thumbnail.url,
                            })
                          : openGalleryModal({
                              url: image.attributes.formats.small.url,
                              caption: image.attributes?.caption || null,
                              thumbnail: image.attributes.formats.thumbnail.url,
                            })
                      "
                    >
                      <v-img
                        :src="
                          getImageURL(image.attributes.formats.thumbnail.url)
                        "
                        :lazy-src="
                          getImageURL(image.attributes.formats.thumbnail.url)
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
                      <div style="font-size: 11px" class="text-left pl-1">
                        {{ image.attributes?.caption }}
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

const props = defineProps({
  sectionID: {
    type: String,
    default: "",
  },
});
//console.log(props.sectionID);
const tabs = useState("tabs");
const tab = ref(null);
const isMounted = ref(false);
const _tabContent = tabs.value.filter((tab) => {
  if (tab.attributes.sectionID === props.sectionID) {
    return tab;
  }
});

const tabContent = toRaw(_tabContent);

const { mobile } = useDisplay();

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

const getImageCaption = (caption) => {
  if (caption) {
    return `<div class="" style="font-size: 10px !important">${caption}</div>`;
  }
};

const openGalleryModal = ({ url, caption, thumbnail }) => {
  let myURL = `https://infonet.icjia-api.cloud${url}`;
  let thumbnailURL = `https://infonet.icjia-api.cloud${thumbnail}`;
  console.log("Modal: ", myURL, caption);
  useEvent("modal:gallery", {
    url: myURL,
    caption: caption,
    thumbnail: thumbnailURL,
  });
};

onMounted(() => {
  isMounted.value = true;
});
</script>

<style scoped>
/* CSS GRID */

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  grid-gap: 1rem;
  max-width: 100rem;
  margin: 3rem auto;
  padding: 0 3rem;
}

.gallery-panel img {
  width: 300px;
  height: 200px;
  object-fit: cover !important;
  border-radius: 0.35rem;
}
</style>
