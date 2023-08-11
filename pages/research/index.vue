<template>
  <div>
    <pre>{{ tagFilter }}</pre>
  </div>
</template>

<script setup>
const route = useRoute();
const tagFilter = route.query.tag;
if (tagFilter && tagFilter.length > 0) {
  console.log("tagFilter: ", tagFilter);
} else {
  console.log("no tagFilter");
}
//console.log("tag value: ", route.query.tag);
</script>

<style lang="scss" scoped></style>
