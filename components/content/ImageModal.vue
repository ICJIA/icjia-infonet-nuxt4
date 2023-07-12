<template>
  <div class="text-center">
    <div id="myModal" class="modal" @click="closeModal">
      <div class="modal-content">
        <v-img :src="url" :lazy-src="thumbnail" :alt="`Image: ${caption}`" cover
          ><template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular
                color="grey-lighten-4"
                indeterminate
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
//console.log("ImageModal.vue loaded.");
useListen("modal:gallery", (e) => {
  //console.log("Event data: ", e);
  //console.log(e.url, e.caption);
  url.value = e.url;
  caption.value = e.caption || null;
  thumbnail.value = e.thumbnail;
  dialog.value = true;
});
onUnmounted(() => {
  console.log("Unmounted");
  dialog.value = false;
  url = null;
  caption = null;
});
onMounted(() => {
  //console.log("ImageModal Mounted");
  dialog.value = true;
  modal = document.getElementById("myModal");
  //modal.style.display = "block";
  //console.log("myModal: ", modal);
});

const closeModal = () => {
  console.log("closeModal");
  modal.style.display = "none";
  dialog.value = false;
  url.value = "";
};

watchEffect(() => {
  //console.log("url: ", url.value);
  if (url.value) {
    modal.style.display = "block";
  }
});

const constructURL = (f) => {
  let temp = toRaw(f);
  console.log("temp: ", temp);
  return `https://infonet.icjia-api.cloud/uploads/medium_benjamin_rascoe_a_CF_Yb_Y_Tyji_Q_unsplash_589892737c.jpg`;
};
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
  width: 60%; /* Could be more or less, depending on screen size */
}

.modal-content img {
  width: 100%;
  max-height: 700px;
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  .modal-content {
    width: 90%; /* Could be more or less, depending on screen size */
  }
}
</style>
