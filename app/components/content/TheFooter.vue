<template>
  <footer>
    <v-footer
      dark
      class=""
      style="margin: 0; padding: 0; z-index: 1000 !important"
      role="presentation"
    >
      <v-card
        flat
        tile
        width="100%"
        class="text-center markdown-body pb-4"
        style="background: #0d4471"
      >
        <v-container class="mt-0" fill-height>
          <v-row align="center" justify="center">
            <v-col
              cols="12"
              md="12"
              class="text-center mt-2"
              style="color: white"
            >
              <div>
                <img
                  src="https://infonet.icjia.dev/icjia-logo.png"
                  alt="Footer logo"
                  width="150"
                  style="border: 0px solid #ddd; display: inline"
                  class="hover"
                />
              </div>

              <div class="pb-6" style="margin-top: -0px">
                <!-- <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  aria-label="Link to ICJIA on Twitter"
                  href="https://twitter.com/icjia_illinois"
                  target="_blank"
                  ><v-icon>mdi-twitter</v-icon>
                </v-btn> -->

                <v-btn
                  variant="text"
                  style="
                    color: #fff !important;
                    font-size: 20px;
                    margin-right: -10px;
                  "
                  target="_blank"
                  aria-label="Link to ICJIA on Facebook"
                  href="https://www.facebook.com/ICJIA/"
                  ><v-icon>mdi-facebook</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  aria-label="Link to ICJIA on YouTube"
                  href="https://www.youtube.com/c/illinoiscriminaljusticeinformationauthority"
                  ><v-icon> mdi-youtube</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  href="https://www.instagram.com/icjia_illinois/"
                  aria-label="ICJIA on Instagram"
                  ><v-icon>mdi-instagram</v-icon></v-btn
                >

                <v-btn
                  variant="text"
                  style="color: #fff !important; font-size: 20px"
                  target="_blank"
                  href="https://www.linkedin.com/company/icjia/"
                  aria-label="ICJIA on LinkedIn "
                  ><v-icon>mdi-linkedin</v-icon></v-btn
                >
              </div>

              <div style="font-size: 12px; font-weight: 400">
                <strong
                  >&#169; 2023
                  <a
                    href="https://icjia.illinois.gov"
                    target="_blank"
                    style="color: #fff"
                    >Illinois Criminal Justice Information Authority</a
                  >
                </strong>

                &nbsp;|&nbsp;
                <strong>
                  <nuxt-link to="/privacy" style="color: #fff"
                    >Privacy
                  </nuxt-link>
                </strong>
                &nbsp;|&nbsp;
                <nuxt-link to="/contact" style="color: #fff; background: none"
                  >Contact</nuxt-link
                >&nbsp;

                <span>
                  &nbsp;|&nbsp;
                  <nuxt-link
                    style="color: #fff; background: none; cursor: pointer"
                    class="hover-anchor"
                    to="/translate"
                  >
                    Translate
                  </nuxt-link>
                </span>
              </div>
              <!-- <p class="mt-3" style="font-size: 13px; font-weight: 400">
                Illinois Domestic Violence Crisis Hotline: 1-877-863-6338
              </p> -->
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-footer>
  </footer>
</template>

<script>
/**
 * TheFooter Component
 * Main application footer with site information, links, and contact details
 *
 * @component
 * @description
 * Renders the main footer for the ICJIA InfoNet application.
 * Includes ICJIA branding, footer navigation links, and contact information.
 * Styled with dark background (#0d4471) for visual separation from main content.
 *
 * @example
 * <template>
 *   <TheFooter />
 * </template>
 */
export default {
  setup() {
    const { isTranslationEnabled } = useAppConfig();

    /**
     * Scroll page to top
     * @function scrollTop
     */
    const scrollTop = () => {
      window.scrollTo(0, 0);
    };

    /**
     * Enable translation mode
     * @function translate
     */
    const translate = () => {
      const toggleState = useTranslateToggle();
      toggleState.value = true;
    };

    /**
     * Navigate to ICJIA main website in new tab
     * @function routeToSite
     */
    const routeToSite = () => {
      // open new site in new tab
      window.open("https://icjia.illinois.gov", "_blank");
    };
    return { routeToSite, scrollTop, translate, isTranslationEnabled };
  },
};
</script>

<style lang="scss" scoped>
.goToTop {
  margin: 0;
  font-size: 10px;
  color: #fff;
  text-decoration: none;
  background: none;
  cursor: pointer;
}

.goToTop:hover {
  text-decoration: underline;
  color: #aaa;
}
</style>
