<template>
  <div class="dv-awareness-month">
    <!-- Header Section -->
    <section class="header-section mb-8">
      <p class="body-text">
        October is
        <a href="#" class="text-link">Domestic Violence Awareness Month</a>.
        InfoNet data show that in state fiscal year 2025, domestic violence
        agencies statewide provided over half a million (501,130) direct service
        hours to 52,191 domestic violence survivors.
      </p>
    </section>

    <!-- Cards Grid with Responsive Padding -->
    <v-container class="cards-container">
      <v-row class="ga-4">
        <!-- Domestic Violence Client Demographics Card -->
        <v-col cols="12" class="mb-4">
          <v-card class="highlight-card demographics-card" elevation="2">
            <v-row class="ma-0 h-100">
              <!-- Icon Section - 15% width -->
              <v-col
                cols="12"
                sm="2"
                class="icon-section demographics-bg d-flex align-center justify-center pa-4"
              >
                <v-icon
                  icon="mdi-account-multiple"
                  size="120"
                  class="icon-white"
                ></v-icon>
              </v-col>

              <!-- Content Section - 85% width -->
              <v-col
                cols="12"
                sm="10"
                class="content-section demographics-content pa-6"
              >
                <h2 class="text-h6 font-weight-bold mb-3">
                  Domestic Violence Client Demographics
                </h2>
                <ul class="bullet-list">
                  <li>
                    Most clients identified as female (83%). Other clients
                    identified as male (16%) and transgender, gender
                    non-conforming, or another gender identity (<1%).
                  </li>
                  <li>
                    Over half of clients (55%) identified as people of color.
                  </li>
                  <li>
                    Among adult clients who disclosed their sexual orientation,
                    nearly 7% identified as gay/lesbian, bisexual, queer, or a
                    different identity not listed.
                  </li>
                  <li>
                    Forty percent of adult clients had annual incomes of $12,000
                    or less.
                  </li>
                </ul>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Direct Services Card -->
        <v-col cols="12" class="mb-4">
          <v-card class="highlight-card direct-services-card" elevation="2">
            <v-row class="ma-0 h-100">
              <!-- Icon Section - 15% width -->
              <v-col
                cols="12"
                sm="2"
                class="icon-section direct-services-bg d-flex align-center justify-center pa-4"
              >
                <v-icon
                  icon="mdi-handshake"
                  size="120"
                  class="icon-white"
                ></v-icon>
              </v-col>

              <!-- Content Section - 85% width -->
              <v-col
                cols="12"
                sm="10"
                class="content-section direct-services-content pa-6"
              >
                <h2 class="text-h6 font-weight-bold mb-3">Direct Services</h2>
                <ul class="bullet-list">
                  <li>
                    Agencies provided almost a million (970,426) direct service
                    contacts.
                  </li>
                  <li>
                    Domestic violence clients most commonly received in-person
                    counseling services (70%) and civil legal assistance (65%).
                  </li>
                  <li>
                    Nearly 1 in 5 clients (9,324) received emergency shelter or
                    transitional housing services.
                  </li>
                </ul>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Training & Public Awareness Card -->
        <v-col cols="12" class="mb-4">
          <v-card class="highlight-card training-card" elevation="2">
            <v-row class="ma-0 h-100">
              <!-- Icon Section - 15% width -->
              <v-col
                cols="12"
                sm="2"
                class="icon-section training-bg d-flex align-center justify-center pa-4"
              >
                <v-icon
                  icon="mdi-presentation-play"
                  size="120"
                  class="icon-white"
                ></v-icon>
              </v-col>

              <!-- Content Section - 85% width -->
              <v-col
                cols="12"
                sm="10"
                class="content-section training-content pa-6"
              >
                <h2 class="text-h6 font-weight-bold mb-3">
                  Training & Public Awareness
                </h2>
                <ul class="bullet-list">
                  <li>
                    Agencies provided professional training to 29,125
                    individuals from community partner organizations.
                  </li>
                  <li>
                    Agencies reached 286,634 individuals through public
                    awareness efforts among community organizations, including
                    civic and faith-based organizations, companies, and schools.
                  </li>
                </ul>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Turnaways Card -->
        <v-col cols="12" class="mb-4">
          <v-card class="highlight-card turnaways-card" elevation="2">
            <v-row class="ma-0 h-100">
              <!-- Icon Section - 15% width -->
              <v-col
                cols="12"
                sm="2"
                class="icon-section turnaways-bg d-flex align-center justify-center pa-4"
              >
                <v-icon
                  icon="mdi-door-closed"
                  size="120"
                  class="icon-white"
                ></v-icon>
              </v-col>

              <!-- Content Section - 85% width -->
              <v-col
                cols="12"
                sm="10"
                class="content-section turnaways-content pa-6"
              >
                <h2 class="text-h6 font-weight-bold mb-3">Turnaways</h2>
                <ul class="bullet-list">
                  <li>
                    11,092 individuals, including 4,829 children, were turned
                    away from domestic violence emergency shelters due to lack
                    of bed spaces.
                  </li>
                  <li>
                    This represents a 25% increase in shelter turnaways compared
                    to SFY 2024.
                  </li>
                </ul>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
// Component uses Vuetify components and Material Design Icons
// No additional script logic needed for this display component
</script>

<style lang="scss" scoped>
.dv-awareness-month {
  padding: 2rem 0;

  .header-section {
    // Responsive padding for header
    padding: 0 1rem;

    @media (min-width: 600px) {
      padding: 0 2rem;
    }

    @media (min-width: 960px) {
      padding: 0 4rem;
    }

    @media (min-width: 1280px) {
      padding: 0 6rem;
    }

    p.text-italic {
      font-style: italic;
      font-size: 0.95rem;
      color: #666;
    }

    .text-link {
      color: #1976d2;
      text-decoration: underline;

      &:hover {
        color: #1565c0;
      }

      &:focus {
        outline: 2px solid #1976d2;
        outline-offset: 2px;
      }
    }

    .body-text {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
    }
  }

  .cards-container {
    // Responsive padding for cards container
    padding-left: 1rem !important;
    padding-right: 1rem !important;

    @media (min-width: 600px) {
      padding-left: 2rem !important;
      padding-right: 2rem !important;
    }

    @media (min-width: 960px) {
      padding-left: 4rem !important;
      padding-right: 4rem !important;
    }

    @media (min-width: 1280px) {
      padding-left: 6rem !important;
      padding-right: 6rem !important;
    }
  }

  .highlight-card {
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
    background-color: transparent !important;

    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
    }

    &:focus-within {
      outline: 2px solid #1976d2;
      outline-offset: 2px;
    }

    .icon-section {
      min-height: 160px;
      border-radius: 12px 0 0 12px;
      flex: 0 0 15%;

      @media (max-width: 600px) {
        min-height: 100px;
        border-radius: 12px 12px 0 0;
        flex: 0 0 100%;
      }

      .icon-white {
        color: white;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
    }

    h2 {
      color: #1a237e;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .bullet-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.75rem;
        padding-left: 1.5rem;
        position: relative;
        font-size: 0.95rem;
        line-height: 1.5;
        color: #333;

        &:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #1a237e;
          font-weight: bold;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  // Card-specific background colors with alternating content backgrounds
  .demographics-card {
    background-color: #f3e5f5 !important;

    .demographics-bg {
      background: linear-gradient(135deg, #7b68a6 0%, #8b78b6 100%);
    }

    .demographics-content {
      background-color: #f3e5f5;
    }
  }

  .direct-services-card {
    background-color: #f5f5f5 !important;

    .direct-services-bg {
      background: linear-gradient(135deg, #4a5f8f 0%, #5a6fa0 100%);
    }

    .direct-services-content {
      background-color: #f5f5f5;
    }
  }

  .training-card {
    background-color: #f3e5f5 !important;

    .training-bg {
      background: linear-gradient(135deg, #7b68a6 0%, #8b78b6 100%);
    }

    .training-content {
      background-color: #f3e5f5;
    }
  }

  .turnaways-card {
    background-color: #f5f5f5 !important;

    .turnaways-bg {
      background: linear-gradient(135deg, #4a5f8f 0%, #5a6fa0 100%);
    }

    .turnaways-content {
      background-color: #f5f5f5;
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .highlight-card {
    transition: none;
  }
}

// High contrast mode support
@media (prefers-contrast: more) {
  .dv-awareness-month {
    .highlight-card {
      border: 2px solid #000;
    }

    .text-link {
      text-decoration: underline;
      font-weight: bold;
    }
  }
}
</style>
