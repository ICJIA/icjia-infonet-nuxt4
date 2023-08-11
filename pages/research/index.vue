<template>
  <div>
    <pre>{{ query }}</pre>
  </div>
</template>

<script setup>
const route = useRoute();
const query = route.query.tag;
//console.log("tag value: ", route.query.tag);
</script>

<style lang="scss" scoped></style>
