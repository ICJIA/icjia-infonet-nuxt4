<template>
  <div class="d-flex">
    <v-navigation-drawer
      v-if="isMounted"
      v-model="drawer"
      temporary
      style="background: #fff"
    >
      <nav aria-label="Main navigation" class="sidebar-nav">
        <!-- Main menu items with accordion functionality -->
        <div
          v-for="(menu, index) in navMenu"
          :key="`sidebar-accordion-${index}`"
          class="sidebar-menu-item"
        >
          <!-- Menu item with children (accordion) -->
          <!-- Changed from h3 to div to fix Siteimprove "Page does not start with a level 1 heading" warning -->
          <!-- Navigation labels should not use heading elements that interfere with page heading hierarchy -->
          <div v-if="menu && menu.children">
            <div class="sidebar-heading">
              <button
                :id="`accordion-header-${index}`"
                type="button"
                class="sidebar-accordion-button"
                :aria-expanded="expandedItems[index] ? 'true' : 'false'"
                :aria-controls="`accordion-panel-${index}`"
                @click="toggleAccordion(index)"
                @keydown.enter="toggleAccordion(index)"
                @keydown.space.prevent="toggleAccordion(index)"
              >
                <span class="sidebar-accordion-title">{{ menu.main }}</span>
                <v-icon
                  :class="{ rotated: expandedItems[index] }"
                  class="sidebar-accordion-icon"
                  size="small"
                >
                  mdi-chevron-down
                </v-icon>
              </button>
            </div>
            <div
              :id="`accordion-panel-${index}`"
              role="region"
              :aria-labelledby="`accordion-header-${index}`"
              :hidden="!expandedItems[index]"
              class="sidebar-accordion-panel"
            >
              <nav aria-label="Submenu">
                <div
                  v-for="(child, i) in menu.children"
                  :key="`child-${index}-${i}`"
                >
                  <!-- Section heading (non-interactive) -->
                  <div
                    v-if="child.section"
                    class="sidebar-section-heading"
                    role="heading"
                    aria-level="4"
                  >
                    {{ child.section }}
                  </div>

                  <!-- Divider -->
                  <hr v-if="child.divider" class="sidebar-divider" />

                  <!-- Child link -->
                  <NuxtLink
                    v-if="child.title"
                    :to="child.link"
                    class="sidebar-child-link"
                    @click="closeDrawer"
                  >
                    {{ child.title }}
                  </NuxtLink>
                </div>
              </nav>
            </div>
          </div>

          <!-- Menu item without children (simple link) -->
          <div v-else>
            <NuxtLink
              :to="menu.link"
              class="sidebar-main-link"
              @click="closeDrawer"
            >
              {{ menu.main }}
            </NuxtLink>
          </div>
        </div>

        <!-- Separator -->
        <hr class="sidebar-separator" />

        <!-- Utility links -->
        <nav aria-label="Utility links" class="sidebar-utility-links">
          <NuxtLink
            to="/search"
            class="sidebar-utility-link"
            @click="closeDrawer"
          >
            <v-icon class="sidebar-utility-icon" size="x-small"
              >mdi-magnify</v-icon
            >
            <span class="sidebar-utility-text">Search</span>
          </NuxtLink>

          <NuxtLink
            to="/translate"
            class="sidebar-utility-link"
            @click="closeDrawer"
          >
            <v-icon class="sidebar-utility-icon" size="x-small">mdi-web</v-icon>
            <span class="sidebar-utility-text">Translate</span>
          </NuxtLink>

          <NuxtLink
            to="/contact"
            class="sidebar-utility-link"
            @click="closeDrawer"
          >
            <v-icon class="sidebar-utility-icon" size="x-small"
              >mdi-mail</v-icon
            >
            <span class="sidebar-utility-text">Contact</span>
          </NuxtLink>
        </nav>
      </nav>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
const { isTranslationEnabled } = useAppConfig();
const appConfig = useAppConfig();
const navMenu = JSON.parse(JSON.stringify(appConfig.sidebarMenu));
const isMounted = ref(false);
const drawer = ref(false);
const altState = useNavToggle();

// Track which accordion items are expanded
const expandedItems = ref({});

// Initialize expanded state for items with children
onMounted(() => {
  isMounted.value = true;

  // Initialize all accordion items as collapsed
  navMenu.forEach((menu, index) => {
    if (menu && menu.children) {
      expandedItems.value[index] = false;
    }
  });
});

// Sync drawer state with global nav toggle
watch(drawer, (val) => {
  altState.value = drawer.value;
});

watchEffect(() => {
  drawer.value = altState.value;
});

// Toggle accordion panel
const toggleAccordion = (index) => {
  expandedItems.value[index] = !expandedItems.value[index];
};

// Close drawer when navigating
const closeDrawer = () => {
  altState.value = false;
};

const router = useRouter();
const routeTo = (url) => {
  altState.value = false;
  router.push({ path: url });
};

const translationToggle = () => {
  const translationState = useTranslateToggle();
  translationState.value = !translationState.value;
};
</script>

<style lang="scss" scoped>
.sidebar-nav {
  padding: 0;
  margin: 0;
}

.sidebar-menu-item {
  margin: 0;
}

/* Accordion heading */
.sidebar-heading {
  margin: 0;
  padding: 0;
  font-size: 1rem;
}

/* Accordion button */
.sidebar-accordion-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  transition: background-color 0.2s;
  min-height: 40px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:focus {
    outline: 2px solid #1976d2;
    outline-offset: -2px;
  }
}

.sidebar-accordion-title {
  flex: 1;
}

.sidebar-accordion-icon {
  transition: transform 0.2s;
  margin-left: 8px;

  &.rotated {
    transform: rotate(180deg);
  }
}

/* Accordion panel */
.sidebar-accordion-panel {
  padding: 0;

  &[hidden] {
    display: none;
  }
}

/* Section heading (non-interactive) */
.sidebar-section-heading {
  margin-top: 0;
  padding: 8px 16px;
  font-weight: 900;
  font-size: 0.875rem;
  color: #555;
}

/* Divider */
.sidebar-divider {
  margin: 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Child link */
.sidebar-child-link {
  display: block;
  padding: 8px 16px 8px 46px; /* Indented to match original -30px margin-left */
  font-weight: 400;
  font-size: 0.875rem;
  color: #555;
  text-decoration: none;
  transition: background-color 0.2s;
  min-height: 40px;
  line-height: 1.5;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:focus {
    outline: 2px solid #1976d2;
    outline-offset: -2px;
  }

  &.router-link-active,
  &.router-link-exact-active {
    background-color: rgba(25, 118, 210, 0.12);
    color: #1976d2;
  }
}

/* Main link (no children) */
.sidebar-main-link {
  display: block;
  padding: 8px 16px;
  font-weight: 900;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  text-decoration: none;
  transition: background-color 0.2s;
  min-height: 40px;
  line-height: 1.5;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:focus {
    outline: 2px solid #1976d2;
    outline-offset: -2px;
  }

  &.router-link-active,
  &.router-link-exact-active {
    background-color: rgba(25, 118, 210, 0.12);
    color: #1976d2;
  }
}

/* Separator */
.sidebar-separator {
  margin: 12px 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Utility links section */
.sidebar-utility-links {
  padding: 0;
  margin: 0;
}

.sidebar-utility-link {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-weight: 400;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  text-decoration: none;
  transition: background-color 0.2s;
  min-height: 40px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:focus {
    outline: 2px solid #1976d2;
    outline-offset: -2px;
  }

  &.router-link-active,
  &.router-link-exact-active {
    background-color: rgba(25, 118, 210, 0.12);
    color: #1976d2;
  }
}

.sidebar-utility-icon {
  margin-right: 8px;
}

.sidebar-utility-text {
  line-height: 1.5;
}

/* Legacy class for compatibility */
.sidebar-item {
  font-weight: 700;
  font-family: "Roboto", sans-serif;
}
</style>
