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
