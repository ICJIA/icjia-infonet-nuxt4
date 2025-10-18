<template>
  <div class="skip-links">
    <a href="#main-content" class="skip-link">Skip to main content</a>
  </div>
</template>

<script setup>
// Skip links component for WCAG 2.1 Level AA compliance
// Provides keyboard users a way to bypass repetitive navigation
</script>

<style scoped>
/* Skip links - hidden by default, visible on keyboard focus */
.skip-links {
  position: relative;
  z-index: 9999;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: #0d4270;
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  border-radius: 0 0 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: top 0.2s ease-in-out;
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #ffd700;
  outline-offset: 2px;
}

.skip-link:hover {
  background: #1565c0;
  text-decoration: underline;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skip-link {
    border: 2px solid #ffffff;
  }
  
  .skip-link:focus {
    outline: 4px solid #ffd700;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
</style>

