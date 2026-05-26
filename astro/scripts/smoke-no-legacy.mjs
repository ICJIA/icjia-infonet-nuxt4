#!/usr/bin/env node
// Guard: no legacy stack refs in astro/src/.
import { execSync } from 'child_process';

const patterns = [
  'GatedPage', 'vuex-persistedstate', 'vue-gtag', 'fuse\\.js', 'thumbor',
  '@nuxt', '@vue/', 'vuetify', 'image\\.icjia\\.cloud',
];
const pattern = patterns.join('|');

let stdout = '';
try {
  // Exclude this guard script itself (it intentionally contains the pattern strings).
  stdout = execSync(
    `grep -rn -E '${pattern}' src/ scripts/ --exclude=smoke-no-legacy.mjs`,
    { encoding: 'utf-8' },
  );
} catch (e) {
  // grep exit 1 = no matches; success
  if (e.status === 1) {
    console.log('✓ no legacy stack refs in astro/src/');
    process.exit(0);
  }
  throw e;
}

// Filter: exclude commented lines (// ... or /* ... */ or <!-- ... -->)
const lines = stdout.split('\n').filter(l => {
  if (!l) return false;
  const code = l.split(/:\d+:/, 2)[1] || '';
  return !code.match(/^\s*(\/\/|\*|<!--)/);
});

if (lines.length === 0) {
  console.log('✓ no legacy stack refs in astro/src/');
  process.exit(0);
}

console.error('LEGACY REFS FOUND:');
lines.forEach(l => console.error(' ', l));
process.exit(1);
