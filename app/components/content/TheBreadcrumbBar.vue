<template>
  <div
    style="
      background: #2e618c;
      border-bottom: 1px solid #aaa;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      z-index: 99999;
    "
    class="text-left pr-5 pl-5 py-1 elevation-0"
  >
    <nuxt-link
      to="/"
      class="breadcrumb-link"
      style="color: white; font-family: 'Roboto', sans-serif !important"
      >HOME</nuxt-link
    >
    <span style="color: #fff; font-weight: 900"
      >&nbsp;&nbsp;&raquo;&nbsp;&nbsp;</span
    >
    <span style="color: white; font-weight: 400">{{
      truncateString(makeTitle(route.path.toUpperCase()))
    }}</span>
  </div>
</template>

<script setup>
//TODO: properly set up to divide URLs into breadcrumbs
const route = useRoute();
// put html entity in string
const htmlEntity = (entity) => {
  return String.fromCharCode(entity);
};

// const truncate = function (str, length = 25, ending = "...") {

//   if (str.length > length) {
//     return str.substring(0, length - ending.length) + ending;
//   } else {
//     return str;
//   }
// };

function truncateString(str, num = 30) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str;
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + "...";
}

const makeTitle = (slug) => {
  // remove initial slash
  slug = slug.replace(/^\/+/, "");
  const words = slug.split("-");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }
  let breadcrumbURL = words
    .join(" ")
    .replace(/\//g, " " + htmlEntity(187) + " ");
  return breadcrumbURL;
};
</script>
