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

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="one" class="tab-window">
            <ContentRenderer
              :value="dv"
              :key="uuidv4()"
              class="markdown-body"
            />
          </v-window-item>

          <v-window-item value="two" class="tab-window">
            <ContentRenderer
              :value="sa"
              :key="uuidv4()"
              class="markdown-body"
            />
          </v-window-item>

          <v-window-item value="three" class="tab-window">
            <ContentRenderer
              :value="cac"
              :key="uuidv4()"
              class="markdown-body"
            />
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
