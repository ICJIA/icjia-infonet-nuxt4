<template>
  <div class="pl-2">
    <!-- <div>Props</div>
    <div>{{ props.attachments }}</div>
    <div>links:</div>
    <div>{{ props.links }}</div> -->

    <div v-if="props.showTableDisplay">
      <h3 class="mt-10">{{ props.attachmentHeading }}</h3>
      <v-table
        class="markdown-body dataTable mt-3"
        density="compact"
        style="border: 1px solid #eee"
      >
        <thead>
          <tr>
            <th class="text-left" style="font-weight: 900">Filename</th>
            <th class="text-left" style="font-weight: 900">Last Updated</th>
            <th class="text-left" style="font-weight: 900">Size</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(attachment, index) in props.attachments"
            :key="attachment.attributes.url"
          >
            <td>
              <a
                :href="
                  'https://infonet.icjia-api.cloud' + attachment.attributes.url
                "
                target="_blank"
              >
                {{ attachment.attributes.name.replace(/\.[^/.]+$/, "")
                }}{{ attachment.attributes.ext }}
              </a>
            </td>
            <td>
              {{ formatDate(attachment.attributes.updatedAt) }}
            </td>
            <td>
              {{ niceBytes(attachment.attributes.size) }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-if="props.links.length">
        <strong>{{ props.linkHeading }}</strong>

        <ul class="mt-2">
          <li v-for="(link, index) in props.links" :key="link.url">
            <a :href="link.url" target="_blank">
              {{ link.title }}
            </a>
            <div v-if="link.summary">{{ link.summary }}</div>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <div v-if="props.attachments && props.attachments.length > 0">
        <strong v-if="attachmentHeading">{{ attachmentHeading }}</strong>
        <ul class="mt-2">
          <li
            v-for="(attachment, index) in props.attachments"
            :key="attachment.attributes.url"
          >
            <a
              :href="
                'https://infonet.icjia-api.cloud' + attachment.attributes.url
              "
              target="_blank"
            >
              {{ attachment.attributes.name }}
            </a>
          </li>
        </ul>
      </div>
      <div v-if="props.links.length">
        <strong>{{ props.linkHeading }}</strong>

        <ul class="mt-2">
          <li v-for="(link, index) in props.links" :key="link.url">
            <a :href="link.url" target="_blank"> {{ link.title }} </a>
            <div v-if="link.summary">{{ link.summary }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const navigation = ref(null);
const props = defineProps({
  attachments: {
    type: Array,
    default: [],
  },
  links: {
    type: Array,
    default: [],
  },
  attachmentHeading: {
    type: String,
    default: "ATTACHMENTS",
  },
  linkHeading: {
    type: String,
    default: "External Links:",
  },
  showTableDisplay: {
    type: Boolean,
    default: true,
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

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

<style>
.markdown-body.dataTable {
  width: 100%;
  font-size: 14px;
}

.markdown-body .dataTable th {
  font-weight: 700;
  text-align: left;
  font-size: 0.8rem;
}

.markdown-body.dataTable td {
  font-weight: 700;
  text-align: left;
  font-size: 0.65rem;
}
</style>
