<template>
  <div>
    <div v-if="data">
      {{ data }}
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch("/api/test");
</script>

<style lang="scss" scoped></style>
