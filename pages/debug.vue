<template>
  <div>
    <FaqsDisplay
      strapiAgency="sa"
      key="myKey"
      color="#fff"
      :showHeading="true"
    ></FaqsDisplay>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
let tab = ref(null);
</script>

<style lang="scss" scoped></style>
