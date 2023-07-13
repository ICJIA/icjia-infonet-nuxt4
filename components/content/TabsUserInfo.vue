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
          <v-window-item value="one" style="min-height: 25vh !important">
            <TabRender tabPath="/tabs/users-domestic-violence-dv"></TabRender>
          </v-window-item>

          <v-window-item value="two" style="min-height: 25vh !important">
            <TabRender tabPath="/tabs/users-sexual-assault-sa"></TabRender>
          </v-window-item>

          <v-window-item value="three" style="min-height: 25vh !important">
            <TabRender
              tabPath="/tabs/users-children-s-advocacy-centers-cac"
            ></TabRender>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
let tab = ref(null);
</script>

<style lang="scss" scoped>
.tabs {
  font-size: inherit;
}
</style>
