<template>
  <div v-if="showCookiePolicy">
    <v-bottom-sheet v-model="cookie" persistent hide-overlay width="100%">
      <v-card
        class="px-12 pt-5 pb-10 text-left"
        style="font-weight: 900"
        color="blue-grey darken-3"
        role="alertdialog"
        aria-label="Cookie policy notice"
      >
        <h2 style="color: #fff">We Use Cookies and Related Technology</h2>
        <p style="font-size: 16px; color: #fff; font-weight: 300" class="mt-4">
          The Illinois Criminal Justice Information Authority uses cookies and
          related technology to personalize content and perform site analytics.
          For more information, see our&nbsp;
          <nuxt-link to="/privacy" style="color: #fff">privacy policy</nuxt-link>.
        </p>
        <v-card-actions>
          <v-btn
            dark
            large
            color="grey darken-1"
            class="mt-6"
            style="margin-left: -20px"
            @click="hideForGood"
            @keydown.escape="hideForGood"
            >GOT IT</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cookie: true,
    };
  },
  computed: {
    showCookiePolicy() {
      if (localStorage.getItem("showCookiePolicy")) {
        return false;
      } else {
        return true;
      }
    },
  },
  mounted() {
    if (this.showCookiePolicy) {
      this.$nextTick(() => {
        const btn = this.$el?.querySelector?.(".v-btn");
        if (btn) btn.focus();
      });
    }
  },
  methods: {
    hideForGood() {
      localStorage.setItem("showCookiePolicy", false);
      this.cookie = false;
    },
  },
};
</script>
