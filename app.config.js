export default defineAppConfig({
  title: "InfoNet",
  description: "InfoNet",
  api: "https://infonet.icjia-api.cloud",
  root: "https://infonet.icjia.dev",
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
    {
      main: "Debug",
      link: "/debug",
    },
    {
      main: "Home",
      link: "/",
    },
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
      main: "Upgrades",
      link: "/upgrades",
    },
    {
      main: "Data & Publications",
      link: "/publications",
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
          title: "Infonet Partners",
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
        {
          title: "Frequently Asked Questions (FAQs)",
          link: "/faqs",
        },
      ],
    },
    {
      main: "Resources",
      children: [
        {
          title: "Data & Publications",
          link: "/publications",
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
      main: "News & Updates",
      link: "/news",
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
        {
          title: "FAQs",
          link: "/faqs",
        },
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
          link: "/publications",
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
