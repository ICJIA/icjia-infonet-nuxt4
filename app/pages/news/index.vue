<template>
  <div>
    <v-container fluid style="margin-top: -18px">
      <v-row>
        <v-col>
          <h1 class="brand-color">News & Updates</h1>

          <v-container fluid>
            <v-row align="stretch">
              <v-col
                v-for="item in query"
                :key="item._path"
                class="mb-8"
                cols="12"
                md="6"
                style="display: flex; flex-direction: column"
              >
                <NewsCard
                  :item="item"
                  background="#fafafa"
                  elevation="1"
                ></NewsCard
              ></v-col> </v-row
          ></v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import moment from "moment";
import _ from "lodash";
const { path } = useRoute();
const router = useRouter();

const { data: query } = await useAsyncData("news", () =>
  queryContent("/news/")
    .sort([{ postDate: -1 }])

    .find()
);

useHead({
  title: "News and Updates",
});
</script>

<style lang="scss" scoped>
.v-card-text {
  flex-grow: 1 !important;
}
</style>
