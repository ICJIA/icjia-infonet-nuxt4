<template>
  <!-- Modal is triggered programmatically via events, no visible activator needed -->
  <v-dialog width="500" v-model="dialog">
    <template v-slot:default="{ isActive }">
      <v-card
        title="Redirect to External Website"
        role="alertdialog"
        aria-label="External website redirect confirmation"
      >
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
</template>

<script setup>
let url = ref("");
let caption = ref("");
let bodyText = ref("");
let dialog = ref(false);
let thumbnail = ref();
let modal = ref(null);
let previouslyFocusedElement = ref(null);

const close = () => {
  dialog.value = false;
  // Restore focus to the element that triggered the modal
  if (previouslyFocusedElement.value) {
    nextTick(() => {
      previouslyFocusedElement.value.focus();
      previouslyFocusedElement.value = null;
    });
  }
};

const redirect = () => {
  dialog.value = false;
  window.open(url.value, "_blank", "noopener,noreferrer");
};

useListen("modal:text", (e) => {
  url.value = e.url || null;
  bodyText.value = e.bodyText || "No text specified";
  // Store the element that had focus before the modal opened
  previouslyFocusedElement.value = document.activeElement;
  dialog.value = true;
});

onUnmounted(() => {
  dialog.value = false;
  bodyText.value = null;
  url = null;
});

onMounted(() => {
  dialog.value = false;
});
</script>

<style scoped>
/* The Modal (background) */
</style>
