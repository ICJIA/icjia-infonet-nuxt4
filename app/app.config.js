/**
 * Application configuration for ICJIA InfoNet
 * Defines global settings, API endpoints, navigation menus, and feature flags
 * @module app/app.config
 * @see {@link https://nuxt.com/docs/guide/directory-structure/app-config|Nuxt App Config}
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} title - Application title
 * @property {string} description - Application description
 * @property {string} api - Strapi API base URL
 * @property {string} root - Application root URL
 * @property {boolean} isTranslationEnabled - Whether translation feature is enabled
 * @property {number} homeNewsLimit - Number of news items to show on homepage
 * @property {Object} faqCategoryMap - Mapping of FAQ categories to display names
 * @property {Object} strapiEnumMap - Mapping of Strapi enum values to display names
 * @property {Array<Object>} footerMenu - Footer navigation menu items
 * @property {Array<Object>} sidebarMenu - Sidebar navigation menu items
 * @property {Array<Object>} navMenu - Main navigation menu items
 */

export default defineAppConfig({
  title: "InfoNet",
  description: "InfoNet",
  api: "https://infonet.icjia-api.cloud",
  root: "https://infonet.icjia.illinois.gov",
  isTranslationEnabled: true,
  homeNewsLimit: 2,
  faqCategoryMap: {
    default: {
      category: "default",
      heading: "General",
    },
    dv: {
      category: "dv",
      heading: "Domestic Violence (DV)",
    },
    sa: {
      category: "sa",
      heading: "Sexual Assault (SA)",
    },
    cac: {
      category: "cac",
      heading: "Children's Advocacy Center (CAC)",
    },
  },
  strapiEnumMap: {
    faqs: {
      general: {
        heading: "General",
        level: 0,
      },
      dv: {
        heading: "Domestic Violence (DV)",
        level: 0,
      },
      sa: {
        heading: "Sexual Assault (SA)",
        level: 0,
      },
      cac: {
        heading: "Children's Advocacy Center (CAC)",
        level: 0,
      },
      dvIntakeAndClient: { heading: "Intake/Client", level: 1 },
      dvServices: { heading: "Services", level: 1 },
      dvReporting: { heading: "Reporting", level: 1 },
      saVolunteerInformation: { heading: "Staff/Volunteer Information" },
      saAdministration: { heading: "Administration" },
      saClient: { heading: "Client" },
      saServices: { heading: "Services" },

      saReports: { heading: "Reports" },
      saMisc: { heading: "Miscellaneous" },
      saAgencyAdministration: {
        heading: "Agency Administration",
      },
      saOffenderCriminalCaseInformation: {
        heading: "Offender Criminal Case Information",
      },
      saCommunityAndInstitutionalServices: {
        heading: "Community and Institutional Services",
      },
      saAgencyInformation: { heading: "Agency Information" },
      saIntakeData: { heading: "Intake Data" },
      saGroupServices: { heading: "Group Services" },
      saNonClientCrisisIntervention: {
        heading: "Non-Client Crisis Intervention",
      },
    },
  },
  footerMenu: [
    // {
    //   main: "Debug",
    //   link: "/debug",
    // },

    {
      main: "About",
      link: "/about",
    },
    {
      main: "Contact",
      link: "/contact",
    },
    {
      main: "FAQs",
      link: "/faqs",
    },
    {
      main: "News & Updates",
      link: "/news",
    },
    {
      main: "Resources",
      link: "/resources",
    },
    {
      main: "Data & Publications",
      link: "/data-and-publications",
    },

    {
      main: "Upgrades",
      link: "/upgrades",
    },

    // {
    //   main: "Meetings",
    //   link: "/meetings",
    // },

    // {
    //   main: "Privacy",
    //   link: "/privacy",
    // },

    // {
    //   main: "Resources",
    //   link: "/resources",
    // },

    {
      main: "Search",
      link: "/search",
    },
  ],

  navMenu: [
    {
      main: "About",
      link: "/about",
      children: [
        // {
        //   "section": "Illinois Statistical Analysis Center (SAC)"
        // },
        {
          title: "About InfoNet",
          link: "/about",
        },

        {
          title: "User Agencies",
          link: "/agencies",
        },
        {
          title: "Partners",
          link: "/partners",
        },
        {
          divider: true,
        },
        // {
        //   title: "News & Updates",
        //   link: "/news",
        // },
        {
          title: "Screenshots",
          link: "/screenshots",
        },
        // {
        //   title: "Frequently Asked Questions (FAQs)",
        //   link: "/faqs",
        // },
      ],
    },
    {
      main: "Resources",
      children: [
        {
          title: "Data & Publications",
          link: "/data-and-publications",
        },

        {
          title: "Upgrades",
          link: "/upgrades",
        },
        {
          title: "User Info & Resources",
          link: "/resources",
        },
      ],
    },
    {
      main: "News & Updates",
      link: "/news",
    },
  ],
  sidebarMenu: [
    {
      main: "Home",
      link: "/",
    },

    {
      main: "About",
      link: "/about",
      children: [
        // {
        //   "section": "Illinois Statistical Analysis Center (SAC)"
        // },
        {
          title: "About InfoNet",
          link: "/about",
        },

        {
          title: "Infonet Partners",
          link: "/partners",
        },
        // {
        //   title: "FAQs",
        //   link: "/faqs",
        // },
        {
          title: "News & Updates",
          link: "/news",
        },
        {
          title: "Screenshots",
          link: "/screenshots",
        },
      ],
    },

    {
      main: "Resources",
      children: [
        {
          title: "Data & Publications",
          link: "/data-and-publications",
        },

        {
          title: "Upgrades",
          link: "/upgrades",
        },
        {
          title: "User Info & Resources",
          link: "/resources",
        },
      ],
    },
  ],
});
