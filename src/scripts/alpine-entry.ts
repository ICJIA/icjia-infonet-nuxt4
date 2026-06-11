import Alpine from 'alpinejs';
// @ts-expect-error — @alpinejs/focus ships no .d.ts; DefinitelyTyped has no entry
import focus from '@alpinejs/focus';

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}

window.Alpine = Alpine;
Alpine.plugin(focus);

// Global drawer state — the single source of truth shared by the AppNav
// hamburger (:aria-expanded / :aria-label / @click) and the AppSidebar panel
// (x-show / x-trap / backdrop). Previously the same boolean lived in three
// places (local x-data, the button's attributes, body.drawer-open) and
// drifted whenever the drawer closed via Escape / backdrop / nav-link click.
type DrawerStore = { open: boolean; toggle(): void; close(): void };
const drawerStore: DrawerStore = {
  open: false,
  toggle() {
    this.open = !this.open;
  },
  close() {
    this.open = false;
  },
};
Alpine.store('drawer', drawerStore);

// Theme state — the head script in BaseLayout applies .dark pre-paint;
// this store mirrors that state for the nav toggle and persists choices.
type ThemeStore = { dark: boolean; toggle(): void };
const themeStore: ThemeStore = {
  dark: document.documentElement.classList.contains('dark'),
  toggle() {
    this.dark = !this.dark;
    document.documentElement.classList.toggle('dark', this.dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', this.dark ? '#14171c' : '#ffffff');
    try {
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    } catch {
      // private-mode storage failures: theme still applies for this page
    }
  },
};
Alpine.store('theme', themeStore);

// Shared WAI-ARIA tabs behavior (roving tabindex + arrow keys) used by the
// TabsScreenshotsAccessible / TabsUserInfoAccessible MDC components — the
// two components previously carried near-identical inline x-data factories
// that had drifted apart (one hijacked ArrowUp/Down, which the APG reserves
// for vertical tablists; these are horizontal). Left/Right/Home/End only.
// `this.$el` is the component wrapper, so instances stay independent.
type TabsThis = {
  activeTab: number;
  $el: HTMLElement;
  $nextTick(cb: () => void): void;
  setTab(i: number): void;
};
Alpine.data('a11yTabs', (total = 0) => ({
  activeTab: 0,
  setTab(this: TabsThis, i: number) {
    this.activeTab = i;
    this.$nextTick(() => {
      const btn = this.$el.querySelector<HTMLElement>(`[role=tab][data-index="${i}"]`);
      btn?.focus();
    });
  },
  handleKey(this: TabsThis, e: KeyboardEvent, i: number) {
    const count = Number(total);
    let next = i;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); next = i > 0 ? i - 1 : count - 1; }
    if (e.key === 'ArrowRight') { e.preventDefault(); next = i < count - 1 ? i + 1 : 0; }
    if (e.key === 'Home') { e.preventDefault(); next = 0; }
    if (e.key === 'End')  { e.preventDefault(); next = count - 1; }
    if (next !== i) this.setTab(next);
  },
}));

// Defer Alpine.start() to DOMContentLoaded so per-page `alpine:init`
// listeners (registered in <script> blocks lower in the document) have
// a chance to attach BEFORE Alpine evaluates `x-data` expressions.
// Without this defer, `Alpine.data('foo', ...)` registrations in page
// scripts race with Alpine.start() and lose — Alpine reports
// "foo is not defined" when it tries to evaluate x-data.
// Hard-defer to next event loop tick so per-page `<script>` blocks that
// register `Alpine.data` via the `alpine:init` event run BEFORE Alpine
// boots. With same-tick start, the data factory in the page bundle
// races and loses.
setTimeout(() => Alpine.start(), 0);

// YouTube lite-facade swap. renderMarkdown() rewrites every CMS YouTube
// iframe to <div class="yt-facade" data-yt-id="…">. On click we replace
// the facade with a real autoplay iframe pointing at the no-cookie domain,
// so the YouTube player + cookies only load post-interaction (eliminates
// the Best Practices "third-party cookie" issue and saves ~500 KiB of
// player JS on initial page load).
function initYtFacades(): void {
  const facades = document.querySelectorAll<HTMLElement>('.yt-facade[data-yt-id]');
  facades.forEach((facade) => {
    const link = facade.querySelector<HTMLAnchorElement>('.yt-facade__link');
    if (!link) return;
    link.addEventListener('click', (event) => {
      const id = facade.getAttribute('data-yt-id');
      if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return;
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      facade.replaceWith(iframe);
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYtFacades);
} else {
  initYtFacades();
}
