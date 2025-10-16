<template>
  <v-card
    class="px-5 py-5 info-card"
    :style="cardStyle"
    :elevation="props.elevation"
    @click="navigateTo(props.item.path)"
  >
    <div style="font-size: 14px; margin-top: 0px">
      <span style="font-weight: 400"
        >{{ moment(props.item.postDate).utc().format("MMM DD, YYYY") }}
      </span>
    </div>
    <h2 style="border: 0; margin-top: 5px">{{ props.item.title }}</h2>

    <p class="mt-4">{{ truncateString(props.item.summary) }}</p>
    <div
      style="font-size: 12px; font-weight: 700"
      class="mt-5 text-right"
      v-if="props.displayFooter"
    >
      <nuxt-link
        :to="`/search?q=${props.item.category.toLowerCase()}`"
        class="search-link"
        >{{ props.item.category.toUpperCase() }}</nuxt-link
      >
      |
      <span>{{ readingTime(props.item) }}</span>
    </div>
  </v-card>
</template>

<script setup>
const navigation = ref(null);
import moment from "moment";
const props = defineProps({
  item: {
    type: Object,
    default: [],
  },
  background: {
    type: String,
    default: "#fff",
  },
  displayFooter: {
    type: Boolean,
    default: false,
  },
  elevation: {
    type: String,
    default: "0",
  },
});

// const sorted = _.orderBy(props.attachments, ["category"]);
// console.table(sorted);

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

const cardStyle = computed(() => {
  return (
    "width: 100%; flex-grow: 1 !important; background:" +
    props.background +
    " !important;"
  );
});

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const readingTime = (item) => {
  let text;
  if (item.description.length > 0) {
    text = item.description;
  } else {
    text = item.summary;
  }

  // console.log(text);
  const wordsPerMinute = 200;
  const noOfWords = text.split(/\s/g).length;
  const minutes = noOfWords / wordsPerMinute;
  const readTime = Math.ceil(minutes);
  return readTime + " min read";
};

function truncateString(str, num = 250) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str;
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + "...";
}
</script>

<style>
.search-link {
  color: #333 !important;
}
</style>
