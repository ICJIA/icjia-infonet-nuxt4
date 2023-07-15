<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <DisplayFaqs
            strapi-agency="general"
            color="#fff"
            :show-heading="true"
          ></DisplayFaqs>
          <DisplayFaqs
            strapi-agency="dv"
            color="#fff"
            :show-heading="true"
          ></DisplayFaqs>
          <DisplayFaqs
            strapi-agency="sa"
            color="#fff"
            :show-heading="true"
          ></DisplayFaqs>
          <DisplayFaqs
            strapi-agency="cac"
            color="#fff"
            :show-heading="true"
          ></DisplayFaqs> </v-col></v-row
    ></v-container>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
