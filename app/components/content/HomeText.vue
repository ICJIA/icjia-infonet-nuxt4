<template>
  <div>
    <div
      style="
        background: #f8f8f8;
        border-top: 1px solid #aaa;
        border-bottom: 1px solid #ddd;
      "
    >
      <v-container fluid style="min-height: 350px">
        <v-row class="py-5">
          <v-col cols="12" md="4" class="rule home-about-main px-8 py-12">
            <!-- TODO: Make these classes dynamic -->
            <h2 class="no-rule text-right brand-color hidden-sm-and-down">
              About the DVFR
            </h2>
            <h2 class="no-rule text-center brand-color hidden-md-and-up">
              About the DVFR
            </h2>
            <h3 class="home-about-sub text-right hidden-sm-and-down">
              The Domestic Violence Fatality Review Committee is as an Ad Hoc
              Committee of the Illinois Criminal Justice Information Authority
              Board.
            </h3>
            <h3 class="home-about-sub text-center hidden-md-and-up">
              The Domestic Violence Fatality Review Committee is as an Ad Hoc
              Committee of the Illinois Criminal Justice Information Authority
              Board.
            </h3>
          </v-col>
          <v-col cols="12" md="8">
            <v-container fluid class="fill-height">
              <v-row>
                <v-col class="px-2 text-center">
                  <p>
                    The
                    <a
                      target="_blank"
                      href="https://www.ilga.gov/ftp/Public%20Acts/102/102-0520.htm"
                      >Domestic Violence Fatality Review Act (Public Act
                      102-0520)</a
                    >
                    was signed into law in August 2021. The Committee was
                    established to serve as a statewide resource for addressing
                    domestic violence-related fatalities and near-fatalities,
                    establish regional domestic violence fatality review teams,
                    and issue annual recommendations for systems change. The
                    Statewide Fatality Review Committee began meeting in January
                    2022 and continues to meet every other month to carry out
                    its mission. All
                    <nuxt-link to="/meetings">meetings</nuxt-link> are open to
                    the public.
                  </p>
                  <div class="mt-8">
                    <v-btn
                      size="small"
                      variant="text"
                      style="font-weight: 900 !important"
                      to="/about"
                      >Read More&nbsp;&raquo;</v-btn
                    >
                  </div>
                </v-col>
              </v-row>
            </v-container></v-col
          >
        </v-row></v-container
      >
    </div>
    <v-container fluid style="border-top: 1px solid #fff" class="mt-10">
      <v-row class="py-2 text-center">
        <v-col>
          <h2
            style="font-size: 50px; font-weight: 900"
            class="no-rule brand-color"
          >
            Illinois Domestic Violence Crisis Hotline
          </h2>
          <p>
            The 24-Hour Illinois Domestic Violence Crisis Hotline can provide
            support, information, and referral for a wide range of services. You
            do not need to leave your abuser or your home to receive help. All
            services are both free and confidential.
          </p>
          <h3
            style="
              font-size: 48px;
              font-weight: 900;
              font-family: 'Lato', sans-serif !important;
            "
            class="mb-0 brand-color"
          >
            <div class="py-8">1-877-TO END DV</div>
            <div style="font-size: 18px; color: #555" class="mt-0">
              1-877-863-6338 (Voice)
            </div>
            <div style="font-size: 14px" class="mt-4">
              To find a local Domestic Violence Service, please
              <a
                target="_blank"
                href="https://www.dhs.state.il.us/page.aspx?module=12&officetype=17&county="
                >click here</a
              >.
            </div>
          </h3>
        </v-col>
      </v-row></v-container
    >
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.no-rule {
  border: none;
  padding: 0;
  margin: 0;
}

.rule {
  border-right: 1px solid #aaa;
  min-height: 350px;
}

.rule-left {
  border-left: 1px solid #aaa;
  min-height: 350px;
}

.home-about-main {
  font-size: 36px;
}

.home-about-sub {
  font-size: 18px;
  font-family: "Lato", sans-serif;
}

@media screen and (max-width: 1024px) {
  .rule {
    border: none;
  }
}
</style>
