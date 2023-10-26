<template>
  <div style="margin-top: -35px">
    <v-dialog width="500" v-model="dialog">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" text="Open Dialog"> </v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card title="Redirect to External Website">
          <v-card-text class="text-left">
            <div v-html="bodyText"></div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn size="small" text="Cancel" @click="close()"></v-btn>
            <v-btn
              color="#5865f2"
              size="small"
              variant="flat"
              text="Yes, Please redirect me"
              @click="redirect()"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<script setup>
let url = ref("");
let caption = ref("");
let bodyText = ref("");
let dialog = ref(false);
let thumbnail = ref();
let modal = ref(null);
//console.log("TextModal.vue loaded.");

const close = () => {
  console.log("close");
  dialog.value = false;
};

const redirect = () => {
  console.log("redirect");
  dialog.value = false;
  window.open(url.value, "_blank");
};

useListen("modal:text", (e) => {
  console.log(e.url, e);
  url.value = e.url || null;
  bodyText.value = e.bodyText || "No text specified";
  dialog.value = true;
});
onUnmounted(() => {
  console.log("Unmounted");
  dialog.value = false;
  bodyText.value = null;
  url = null;
});
onMounted(() => {
  //console.log("TextModal Mounted");
  dialog.value = false;
  //modal = document.getElementById("myModal");
  //modal.style.display = "block";
  //console.log("myModal: ", modal);
});
</script>

<style scoped>
/* The Modal (background) */
</style>
