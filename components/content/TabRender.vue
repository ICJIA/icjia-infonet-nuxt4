<template>
  <div>
    <div v-if="data">
      <ContentRenderer :value="data" :key="uuidv4" />
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
const props = defineProps({
  tabPath: {
    type: String,
  },
});

const { data } = await useAsyncData(`tab-${uuidv4()}`, () =>
  queryContent(props.tabPath).findOne()
);
</script>
