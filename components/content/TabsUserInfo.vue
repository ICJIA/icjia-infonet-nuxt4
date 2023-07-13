<template>
  <div>
    <v-card>
      <v-tabs v-model="tab" bg-color="grey-darken-3" grow center-active>
        <v-tab value="one" class="tabs">Domestic Violence (DV)</v-tab>
        <v-tab value="two" class="tabs">Sexual Assault (SA)</v-tab>
        <v-tab value="three" class="tabs"
          >Children's Advocacy Centers (CAC)</v-tab
        >
      </v-tabs>

      <v-card-text class="tab-window">
        <v-window v-model="tab">
          <v-window-item value="one">
            <div v-if="dv">
              <ContentRenderer :value="dv" key="dv" class="markdown-body" />
            </div>
            <div v-else>Loading...</div>
          </v-window-item>

          <v-window-item value="two">
            <div v-if="sa">
              <ContentRenderer :value="sa" key="sa" class="markdown-body" />
            </div>
            <div v-else>Loading...</div>
          </v-window-item>

          <v-window-item value="three">
            <div v-if="cac">
              <ContentRenderer :value="cac" key="cac" class="markdown-body" />
            </div>
            <div v-else>Loading...</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
let tab = ref(null);

const { data: dv } = await useAsyncData(`tab-${uuidv4()}`, () =>
  queryContent(`/tabs/users-domestic-violence-dv`).findOne()
);

const { data: sa } = await useAsyncData(`tab-${uuidv4()}`, () =>
  queryContent(`/tabs/users-sexual-assault-sa`).findOne()
);

const { data: cac } = await useAsyncData(`tab-${uuidv4()}`, () =>
  queryContent(`/tabs/users-children-s-advocacy-centers-cac`).findOne()
);
</script>

<style lang="scss" scoped>
.tabs {
  font-size: inherit;
}
.tab-window {
  min-height: 20vh !important;
}
</style>
