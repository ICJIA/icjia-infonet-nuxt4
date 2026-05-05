<template>
  <div class="accessible-tabs-wrapper">
    <div v-if="isMounted" class="accessible-tabs-card">
      <!-- Tab List -->
      <div
        role="tablist"
        class="accessible-tabs-list"
        aria-label="Agency-specific resources"
      >
        <button
          v-if="dv"
          :id="`tab-one`"
          role="tab"
          :aria-selected="activeTab === 'one'"
          :aria-controls="`panel-one`"
          :tabindex="activeTab === 'one' ? 0 : -1"
          class="accessible-tab"
          :class="{ 'accessible-tab-active': activeTab === 'one' }"
          @click="setActiveTab('one')"
          @keydown="handleKeyDown($event, 'one')"
        >
          {{ getTitle(dv) }}
        </button>

        <button
          v-if="sa"
          :id="`tab-two`"
          role="tab"
          :aria-selected="activeTab === 'two'"
          :aria-controls="`panel-two`"
          :tabindex="activeTab === 'two' ? 0 : -1"
          class="accessible-tab"
          :class="{ 'accessible-tab-active': activeTab === 'two' }"
          @click="setActiveTab('two')"
          @keydown="handleKeyDown($event, 'two')"
        >
          {{ getTitle(sa) }}
        </button>

        <button
          v-if="cac"
          :id="`tab-three`"
          role="tab"
          :aria-selected="activeTab === 'three'"
          :aria-controls="`panel-three`"
          :tabindex="activeTab === 'three' ? 0 : -1"
          class="accessible-tab"
          :class="{ 'accessible-tab-active': activeTab === 'three' }"
          @click="setActiveTab('three')"
          @keydown="handleKeyDown($event, 'three')"
        >
          {{ getTitle(cac) }}
        </button>
      </div>

      <!-- Tab Panels -->
      <div class="accessible-tabs-content">
        <div
          v-if="dv"
          :id="`panel-one`"
          role="tabpanel"
          :aria-labelledby="`tab-one`"
          :hidden="activeTab !== 'one'"
          :inert="activeTab !== 'one' || null"
          :tabindex="activeTab === 'one' ? 0 : -1"
          class="accessible-tab-panel"
        >
          <ContentRenderer
            :value="dv"
            key="dv"
            class="markdown-body tab-body"
          />
        </div>

        <div
          v-if="sa"
          :id="`panel-two`"
          role="tabpanel"
          :aria-labelledby="`tab-two`"
          :hidden="activeTab !== 'two'"
          :inert="activeTab !== 'two' || null"
          :tabindex="activeTab === 'two' ? 0 : -1"
          class="accessible-tab-panel"
        >
          <ContentRenderer
            :value="sa"
            key="sa"
            class="markdown-body tab-body"
          />
        </div>

        <div
          v-if="cac"
          :id="`panel-three`"
          role="tabpanel"
          :aria-labelledby="`tab-three`"
          :hidden="activeTab !== 'three'"
          :inert="activeTab !== 'three' || null"
          :tabindex="activeTab === 'three' ? 0 : -1"
          class="accessible-tab-panel"
        >
          <ContentRenderer
            :value="cac"
            key="cac"
            class="markdown-body tab-body"
          />
        </div>
      </div>
    </div>

    <div v-else class="accessible-tabs-loading">
      <TheLoader></TheLoader>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";

const activeTab = ref("one");
const isMounted = ref(false);
const mobile = ref(false);

const { data: dv } = await useAsyncData(`tab-dv-${uuidv4()}`, () =>
  queryContent(`/tabs/users-domestic-violence-dv`).findOne()
);

const { data: sa } = await useAsyncData(`tab-sa-${uuidv4()}`, () =>
  queryContent(`/tabs/users-sexual-assault-sa`).findOne()
);

const { data: cac } = await useAsyncData(`tab-cac-${uuidv4()}`, () =>
  queryContent(`/tabs/users-children-s-advocacy-centers-cac`).findOne()
);

const checkMobile = () => {
  mobile.value = window.innerWidth < 600;
};

const getTitle = (item) => {
  if (item?.title && !mobile.value) {
    return item.title;
  } else {
    return item.agency;
  }
};

const setActiveTab = (tabId) => {
  activeTab.value = tabId;
  // Focus the newly activated tab for accessibility
  nextTick(() => {
    const tabButton = document.getElementById(`tab-${tabId}`);
    if (tabButton) {
      tabButton.focus();
    }
  });
};

const handleKeyDown = (event, currentTab) => {
  // Get available tabs dynamically based on loaded data
  const availableTabs = [];
  if (dv.value) availableTabs.push("one");
  if (sa.value) availableTabs.push("two");
  if (cac.value) availableTabs.push("three");

  const currentIndex = availableTabs.indexOf(currentTab);

  let newIndex = currentIndex;

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : availableTabs.length - 1;
      break;
    case "ArrowRight":
      event.preventDefault();
      newIndex = currentIndex < availableTabs.length - 1 ? currentIndex + 1 : 0;
      break;
    case "Home":
      event.preventDefault();
      newIndex = 0;
      break;
    case "End":
      event.preventDefault();
      newIndex = availableTabs.length - 1;
      break;
    default:
      return;
  }

  // Automatic activation: arrow keys both move focus AND activate the tab
  setActiveTab(availableTabs[newIndex]);
};

onMounted(() => {
  isMounted.value = true;
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style lang="scss" scoped>
.accessible-tabs-wrapper {
  width: 100%;
}

.accessible-tabs-card {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.accessible-tabs-list {
  display: flex;
  background-color: #424242; /* Vuetify grey-darken-3 */
  margin: 0;
  padding: 0;
  border-bottom: none;
}

.accessible-tab {
  flex: 1 1 auto;
  flex-shrink: 0;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: "Lato", sans-serif;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.0892857143em;
  padding: 12px 16px;
  min-height: 48px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Allow text to wrap - prevents clipping */
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  height: auto;
  max-height: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.5;

  /* Explicit anti-clipping properties for accessibility scanners */
  overflow: visible;
}

.accessible-tab:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.accessible-tab:focus {
  outline: 2px solid #ffffff;
  outline-offset: -2px;
  z-index: 1;
}

.accessible-tab:focus:not(:focus-visible) {
  outline: none;
}

.accessible-tab:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: -2px;
  z-index: 1;
}

.accessible-tab-active {
  color: #ffffff;
  /* Slightly lighter background for active tab - maintains AA contrast */
  background-color: #616161; /* grey-darken-2 - lighter than base #424242 */
}

.accessible-tab-active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ffffff;
  animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.accessible-tabs-content {
  background: #fbfbfb;
  min-height: 20vh;
}

.accessible-tab-panel {
  padding: 16px;
  animation: fadeIn 0.2s ease-in;
}

.accessible-tab-panel[hidden] {
  display: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tab-body {
  font-size: 14px;
}

.accessible-tabs-loading {
  min-height: 30vh;
  margin-top: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .accessible-tab {
    font-size: 12px;
    padding: 10px 12px;
  }
}
</style>
