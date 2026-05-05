<template>
  <div>
    <div v-if="props.debug">{{ props.data }}</div>

    <v-card
      elevation="0"
      class="toc px-5 py-5 markdown-body"
      style="background: #fafafa"
    >
      <h2
        id="navigation"
        ref="navigation"
        class="hover pb-4 navigation-anchor"
        style="
          border: 0px;
          font-size: 20px;
          font-weight: bold;
          font-family: 'Roboto', sans-serif !important;
          cursor: pointer;
        "
        tabindex="0"
        @click="scrollToTop"
        @keydown.enter="scrollToTop"
        @keydown.space.prevent="scrollToTop"
      >
        {{ props.title }}
      </h2>
      <div v-if="props && props.data && props.data.links">
        <div
          v-for="(item, index) in props.data.links"
          :key="index"
          class="pl-3"
        >
          <div
            :id="`toc-${item.id}`"
            class="mb-4 hover tocItem"
            role="button"
            tabindex="0"
            @click="scrollTo(item.id)"
            @keydown.enter="scrollTo(item.id)"
            @keydown.space.prevent="scrollTo(item.id)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      <br /><br />
    </v-card>
  </div>
</template>

<script setup>
const navigation = ref(null);
const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: "Navigation",
  },
  debug: {
    type: Boolean,
    default: false,
  },
});

const scrollTo = (id) => {
  // console.log("scrolling to", id);
  try {
    const el = document.querySelector(`#${id}`);
    // console.log("el: ", el);
    window.scrollTo({
      behavior: "smooth",
      top:
        el.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        80,
    });
  } catch (e) {
    console.log("Table of Contents error: ", e.message);
  }
};

const scrollToTop = () => {
  window.scrollTo({
    behavior: "smooth",
    top: 0,
  });
};

onMounted(() => {
  const scrollOffset = 100;
  const sections = Array.from(document.querySelectorAll("h2"));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      let scrollPosition =
        document.documentElement.scrollTop || document.body.scrollTop;
      scrollPosition = scrollPosition + scrollOffset + 35;
      const tocItems = document.querySelectorAll(".tocItem");

      if (scrollPosition < 150) {
        tocItems.forEach((toc) => {
          toc.classList.remove("visible");
        });
        if (navigation.value) navigation.value.classList.add("visible-anchor");
      } else {
        if (navigation.value) navigation.value.classList.remove("visible-anchor");
      }

      sections.forEach((section) => {
        if (section.offsetTop <= scrollPosition) {
          if (tocItems) {
            tocItems.forEach((toc) => {
              toc.classList.remove("visible");
            });
          }
          const sectionItem = document.getElementById(`toc-${section.id}`);
          if (sectionItem) sectionItem.classList.add("visible");
        }
      });
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  // Store reference for cleanup
  window.__tocScrollHandler = onScroll;
});

onUnmounted(() => {
  if (window.__tocScrollHandler) {
    window.removeEventListener("scroll", window.__tocScrollHandler);
    delete window.__tocScrollHandler;
  }
});
</script>

<style>
/* TOC Styles */

.divider {
  border-left: 1px solid #ccc;
}

.visible {
  color: rgb(34, 18, 104);
  font-weight: 900;
  margin-left: 2px;
  border-left: 5px solid #aaa;
  padding-left: 10px;
  transition: visibility 0s, opacity 0.5s linear;
}

.anchor {
  padding: 2px 5px 2px 5px;
}

.visible-anchor {
  color: rgb(34, 18, 104);
  font-weight: 900;
}

.navigation-anchor:hover {
  text-decoration: underline;
}

.anchor:hover {
  color: #0d4474;
  background: #eee;
}

.shaded {
  background: #eee;
  padding: 15px;
  margin-bottom: 25px;
}

.toc {
  position: -webkit-sticky !important;
  position: sticky !important;
  top: 115px !important;
  font-size: 14px !important;
}

.tocItem {
  margin-bottom: 3px;
  font-size: 14px;
}

.tocItem:hover {
  text-decoration: underline;
}
</style>
