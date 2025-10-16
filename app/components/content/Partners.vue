<template>
  <div class="" v-if="isMounted && data">
    <div><span v-html="renderer.render(data.markdown)"></span></div>
  </div>
</template>

<script setup>
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
const { data } = await useAsyncData(`content-partners`, async () => {
  const post = await queryContent().where({ _path: "/partners" }).findOne();
  return post;
});
// console.log(data.value);
const isMounted = ref(false);
onMounted(() => {
  if (data.value) {
    // console.log(data.value);
    isMounted.value = true;
  }
});
</script>

<style lang="scss" scoped></style>
