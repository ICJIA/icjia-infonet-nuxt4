<template>
  <div>
    <DisplayFaqs
      strapiAgency="general"
      key="general"
      color="#fff"
      :showHeading="true"
    ></DisplayFaqs>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
let tab = ref(null);
</script>

<style lang="scss" scoped></style>
