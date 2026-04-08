<template>
  <div class="pb-12">
    <v-container
      fluid
      style="margin: 0; padding: 0"
      v-if="data && data.length !== 0"
      ><v-row>
        <v-col>
          <h2 class="mb-10" v-if="props.showHeading" :id="props.strapiAgency">
            {{ getStrapiEnum(props.strapiAgency) }} FAQs
          </h2>

          <div v-if="data && data.length === 0">
            <p class="pl-3">No FAQs found.</p>
          </div>

          <v-expansion-panels>
            <v-expansion-panel
              v-for="(item, index) in data"
              :key="item._path"
              class="mb-2"
            >
              <!-- <div class="pl-3">
                {{ getStrapiEnum(item.cat).toUpperCase() }}
              </div> -->
              <v-expansion-panel-title
                expand-icon="mdi-plus"
                collapse-icon="mdi-minus"
                :style="`font-weight: 700; background: ${props.color}; color: #000; font-size: ${props.fontQuestionSize} `"
                class=""
              >
                <div
                  class="px-2"
                  :style="`font-weight: 900; color: #555; font-size: ${props.fontQuestionSize}; line-height: 1.4`"
                >
                  <span v-if="!mobile && isMounted && showCategory"
                    >[{{ getStrapiEnum(item.cat).toUpperCase() }}]&nbsp</span
                  >
                  {{ item.question }}
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span
                  :style="`font-size: ${props.fontAnswerSize};`"
                  v-html="renderer.render(item.answer)"
                ></span>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels> </v-col></v-row
    ></v-container>
  </div>
</template>
<script setup>
const { path } = useRoute();
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
  strapiAgency: {
    type: String,
    default: "general",
  },

  fontQuestionSize: {
    type: String,
    default: "14px",
  },
  fontAnswerSize: {
    type: String,
    default: "14px",
  },
  color: {
    type: String,
    default: "#fafafa",
  },
  showHeading: {
    type: Boolean,
    default: true,
  },
  showAgencyPrefix: {
    type: Boolean,
    default: false,
  },
  showCategory: {
    type: Boolean,
    default: false,
  },
});

// let strapiCategory = ref("sa");

//console.log("faq category: ", props.strapiCategory);

const { data } = await useAsyncData(`faqs-${props.strapiAgency}`, () =>
  queryContent("/faqs/")
    .where({ agency: props.strapiAgency })

    .sort({ ranking: 1 })

    .sort({ subcat: 1 })
    .sort({ cat: 1 })
    // .sort({ id: 1 })

    .find()
);

// const { faqCategoryMap } = useAppConfig();
const { strapiEnumMap } = useAppConfig();

const getStrapiEnum = (strapiEnum) => {
  //console.log("strapiEnum: ", strapiEnum);
  let heading;
  if (strapiEnumMap["faqs"][strapiEnum] === undefined) {
    heading = "General";
  } else {
    heading = strapiEnumMap["faqs"][strapiEnum].heading;
  }
  //console.log(strapiEnum, heading);
  return heading;
};

const { mobile: _mobile, name: screenSize } = useDisplay();
const isMounted = ref(false);
const mobile = ref(_mobile);
onMounted(() => {
  console.log("Mobile: ", mobile.value, " ScreenSize: ", screenSize.value);
  isMounted.value = true;
});

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
      content: "Infonet frequently asked questions (FAQs).",
    },
    {
      hid: "og-desc",
      property: "og:description",
      content: "Infonet frequently asked questions (FAQs).",
    },
  ],
});
</script>

<style scoped>
/* Summary/details */

/* summary {
  cursor: pointer;
  font-weight: 900;
  font-size: 16px;
}

details {
  margin-top: 15px !important;
  margin-bottom: 15px;
}

summary > * {
  display: inline;
}

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
} */
</style>
