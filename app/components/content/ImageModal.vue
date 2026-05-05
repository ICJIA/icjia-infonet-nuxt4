<template>
  <div class="text-center">
    <div
      id="myModal"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="caption ? `Image: ${caption}` : 'Image viewer'"
      :inert="!url || null"
      @click="closeModal"
      @keydown.escape="closeModal"
    >
      <div class="modal-content" @click.stop>
        <button
          ref="closeBtn"
          class="close-button"
          aria-label="Close image viewer"
          @click="closeModal"
        >
          &times;
        </button>
        <v-img :src="url" :lazy-src="thumbnail" :alt="caption ? `Image: ${caption}` : 'Enlarged screenshot'"
          ><template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular
                color="grey-lighten-4"
                indeterminate
                aria-label="Loading image"
              ></v-progress-circular>
            </div> </template
        ></v-img>
        <div
          class="text-left mt-1 py-2"
          v-if="caption"
          style="font-size: 14px; font-weight: 700"
        >
          {{ caption }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
let url = ref("");
let caption = ref("");
let dialog = ref(false);
let thumbnail = ref();
let modal = ref(null);
const closeBtn = ref(null);
let previouslyFocusedElement = ref(null);

useListen("modal:gallery", (e) => {
  url.value = e.url;
  caption.value = e.caption || null;
  thumbnail.value = e.thumbnail;
  dialog.value = true;
  // Store the element that had focus before the modal opened
  previouslyFocusedElement.value = document.activeElement;
});

onUnmounted(() => {
  dialog.value = false;
  url = null;
  caption = null;
  document.removeEventListener("keydown", trapFocus);
});

onMounted(() => {
  dialog.value = true;
  modal = document.getElementById("myModal");
});

const closeModal = () => {
  modal.style.display = "none";
  dialog.value = false;
  url.value = "";
  document.removeEventListener("keydown", trapFocus);
  // Restore focus to the element that triggered the modal
  if (previouslyFocusedElement.value) {
    previouslyFocusedElement.value.focus();
    previouslyFocusedElement.value = null;
  }
};

const trapFocus = (e) => {
  if (e.key !== "Tab") return;
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstFocusable) {
      lastFocusable.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      firstFocusable.focus();
      e.preventDefault();
    }
  }
};

watchEffect(() => {
  if (url.value) {
    modal.style.display = "block";
    document.addEventListener("keydown", trapFocus);
    // Focus the close button when the modal opens
    nextTick(() => {
      if (closeBtn.value) {
        closeBtn.value.focus();
      }
    });
  }
});
</script>

<style scoped>
/* The Modal (background) */
.modal {
  display: none;
  position: fixed; /* Stay in place */
  z-index: 9999; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 2% auto;
  padding: 10px;
  border: 1px solid #888;
  width: 70%; /* Could be more or less, depending on screen size */
  position: relative;
}

.modal-content img {
  width: 100%;
  max-height: 600px;
}

/* Close button */
.close-button {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  font-size: 28px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  z-index: 1;
  line-height: 1;
  padding: 0 5px;
}

.close-button:hover,
.close-button:focus {
  color: #000;
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  .modal-content {
    width: 90%; /* Could be more or less, depending on screen size */
  }
}
</style>
