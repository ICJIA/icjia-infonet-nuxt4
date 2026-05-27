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
