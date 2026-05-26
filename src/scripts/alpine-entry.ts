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
Alpine.start();
