// astro/src/lib/menu.ts
//
// Typed nav data extracted from legacy app/app.config.js (navMenu, sidebarMenu,
// footerMenu). This is the single source of truth for Phase 2+. Phase 3 will
// optionally wire Strapi-backed overrides; Phase 2 ships a static module.
//
// Keep verbatim label/href parity with legacy. Future content changes should
// happen here, not in app.config.js (which is removed in Phase 4).

// ── Types ────────────────────────────────────────────────────────────────────

export interface MenuChild {
  /** Display label (undefined when item is a divider or section header). */
  title?: string;
  /** Internal or external href. */
  link?: string;
  /** Non-interactive section header label. */
  section?: string;
  /** Renders a <hr> separator when true. */
  divider?: boolean;
  /** Opens in new tab if true. */
  external?: boolean;
}

export interface MenuItem {
  /** Display label shown in nav / sidebar. */
  main: string;
  /** Top-level href (omit for items that only have children). */
  link?: string;
  /** Dropdown / accordion children. */
  children?: MenuChild[];
  /** Opens in new tab if true. */
  external?: boolean;
}

// ── Desktop top nav (TheNav.vue / app.config.navMenu) ────────────────────────
//
// Structure: items with `children` show a dropdown; items without are plain links.
// The legacy nav also surfaces a "More" (⋮) button for Search + Contact on desktop —
// those utility routes are encoded in `utilityLinks` below.

export const topNav: MenuItem[] = [
  {
    main: 'About',
    link: '/about',
    children: [
      { title: 'About InfoNet',  link: '/about' },
      { title: 'User Agencies',  link: '/agencies' },
      { title: 'Partners',       link: '/partners' },
      { divider: true },
      { title: 'Screenshots',    link: '/screenshots' },
    ],
  },
  {
    main: 'Resources',
    children: [
      { title: 'Data & Publications',  link: '/data-and-publications' },
      { title: 'Upgrades',             link: '/upgrades' },
      { title: 'User Info & Resources', link: '/resources' },
    ],
  },
  {
    main: 'News & Updates',
    link: '/news',
  },
];

// Utility links shown in the desktop "⋮" overflow menu and in the sidebar.
export const utilityLinks: MenuItem[] = [
  { main: 'Search',    link: '/search' },
  { main: 'Translate', link: '/translate' },
  { main: 'Contact',   link: '/contact' },
];

// ── Mobile drawer / sidebar (TheSidebar.vue / app.config.sidebarMenu) ────────
//
// Same items as topNav + Home first; items with `children` render as native
// <details>/<summary> accordions.

export const sidebarMenu: MenuItem[] = [
  {
    main: 'Home',
    link: '/',
  },
  {
    main: 'About',
    link: '/about',
    children: [
      { title: 'About InfoNet',    link: '/about' },
      { title: 'Infonet Partners', link: '/partners' },
      { title: 'News & Updates',   link: '/news' },
      { title: 'Screenshots',      link: '/screenshots' },
    ],
  },
  {
    main: 'Resources',
    children: [
      { title: 'Data & Publications',   link: '/data-and-publications' },
      { title: 'Upgrades',              link: '/upgrades' },
      { title: 'User Info & Resources', link: '/resources' },
    ],
  },
];

// ── Footer nav (app.config.footerMenu) ───────────────────────────────────────
//
// Used by AppFooter for its "Privacy | Contact | Translate" inline link row.
// The legacy TheFooter.vue hardcodes only Privacy, Contact, Translate inline;
// the broader footerMenu below matches app.config.footerMenu for completeness.

export const footerLinks: MenuItem[] = [
  { main: 'About',             link: '/about' },
  { main: 'Contact',           link: '/contact' },
  { main: 'FAQs',              link: '/faqs' },
  { main: 'News & Updates',    link: '/news' },
  { main: 'Resources',         link: '/resources' },
  { main: 'Data & Publications', link: '/data-and-publications' },
  { main: 'Upgrades',          link: '/upgrades' },
  { main: 'Search',            link: '/search' },
];

// Inline footer utility links (matches what legacy TheFooter hardcodes).
export const footerUtility: MenuItem[] = [
  { main: 'Privacy',   link: '/privacy' },
  { main: 'Contact',   link: '/contact' },
  { main: 'Translate', link: '/translate' },
];
