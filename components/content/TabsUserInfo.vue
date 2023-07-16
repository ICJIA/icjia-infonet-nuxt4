<template>
  <div>
    <v-card v-if="isMounted">
      <v-tabs v-model="tab" bg-color="grey-darken-3" grow center-active>
        <v-tab value="one" class="tabs" v-if="dv"> {{ getTitle(dv) }}</v-tab>
        <v-tab value="two" class="tabs" v-if="sa"> {{ getTitle(sa) }}</v-tab>

        <v-tab value="three" class="tabs" v-if="cac">
          {{ getTitle(cac) }}</v-tab
        >
      </v-tabs>

      <v-card-text class="tab-window">
        <v-window v-model="tab">
          <v-window-item value="one">
            <div v-if="dv">
              <ContentRenderer
                :value="dv"
                key="dv"
                class="markdown-body tab-body"
              />
            </div>
            <div v-else>Loading...</div>
          </v-window-item>

          <v-window-item value="two">
            <div v-if="sa">
              <ContentRenderer
                :value="sa"
                key="sa"
                class="markdown-body tab-body"
              />
            </div>
            <div v-else>Loading...</div>
          </v-window-item>

          <v-window-item value="three">
            <div v-if="cac">
              <ContentRenderer
                :value="cac"
                key="cac"
                class="markdown-body tab-body"
              />
            </div>
            <div v-else>Loading...</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
    <v-card v-else style="min-height: 30vh" class="mt-12"
      ><TheLoader></TheLoader
    ></v-card>
  </div>
</template>

<script setup>
import { useDisplay } from "vuetify";
import { v4 as uuidv4 } from "uuid";
let tab = ref(null);
let isMounted = ref(false);

const { data: dv } = await useAsyncData(`tab-dv-${uuidv4()}`, () =>
  queryContent(`/tabs/users-domestic-violence-dv`).findOne()
);

const { data: sa } = await useAsyncData(`tab-sa-${uuidv4()}`, () =>
  queryContent(`/tabs/users-sexual-assault-sa`).findOne()
);

const { data: cac } = await useAsyncData(`tab-cac-${uuidv4()}`, () =>
  queryContent(`/tabs/users-children-s-advocacy-centers-cac`).findOne()
);

const { mobile } = useDisplay();

const getTitle = (item) => {
  let title;
  if (item?.title && !mobile.value) {
    return item.title;
  } else {
    return item.agency;
  }
};

onMounted(() => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped>
// .tabs {
//   //font-size: inherit;
// }
.tab-window {
  min-height: 20vh !important;
}

.tab-body {
  font-size: 14px;
}
</style>
