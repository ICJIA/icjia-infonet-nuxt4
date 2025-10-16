<template>
  <nav style="z-index: 1000 !important">
    <div class="nav-footer">
      <span v-for="(item, index) in navMenu" :key="index" class="nav-item">
        <NuxtLink :to="item.link" class="context-link">{{
          item.main
        }}</NuxtLink>
        <!-- <span v-if="menuLength - 1 !== index"> | </span> -->
        <span v-if="menuLength - 1 !== index">&nbsp;</span>
      </span>
    </div>
  </nav>
</template>
<script setup>
const appConfig = useAppConfig();
const navMenu = appConfig.footerMenu;
const menuLength = navMenu.length;
</script>
<style scoped>
.nav-footer {
  /* display: flex;
  justify-content: center;
  align-items: center; */
  background: #0d4e84 !important;
  min-width: 100%;
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  padding: 0.8rem 0.8rem;
  text-align: center;
}

.nav-item {
  display: inline-flex;
  align-items: center;
}

.context-link {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  padding: 0 0.5rem;
}

.context-link:hover {
  color: #aaa;
}
</style>
