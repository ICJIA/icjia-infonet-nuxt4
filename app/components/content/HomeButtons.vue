<template>
  <div class="mt-8"></div>
</template>

<script setup>
const click = ({ id, type }) => {
  const offset = 100;
  const el = document.getElementById(id);
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  console.log("scrollTo: ", y);
  if (type === "scrollIntoView") {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scroll({
      top: y,
      behavior: "smooth",
    });
  }
};
</script>
