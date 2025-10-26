# Accessibility Quick Fixes Guide

This guide provides quick solutions for the most common accessibility issues found in the InfoNet application.

---

## 🔴 Critical Issue #1: Button Names

### Problem

Buttons without discernible text are inaccessible to screen reader users.

### Quick Fix

```vue
<!-- ❌ WRONG: Icon button without label -->
<v-btn icon>
  <v-icon>mdi-menu</v-icon>
</v-btn>

<!-- ✅ CORRECT: Icon button with aria-label -->
<v-btn icon aria-label="Open navigation menu">
  <v-icon>mdi-menu</v-icon>
</v-btn>

<!-- ✅ CORRECT: Button with visible text -->
<v-btn>
  <v-icon left>mdi-menu</v-icon>
  Menu
</v-btn>
```

### Where to Apply

- All icon-only buttons
- All buttons with only visual indicators
- Navigation buttons
- Action buttons (edit, delete, close, etc.)

---

## 🔴 Critical Issue #2: Image Alt Text

### Problem

Images without alt text prevent screen reader users from understanding image content.

### Quick Fix

```vue
<!-- ❌ WRONG: Image without alt text -->
<v-img src="/images/chart.png" />

<!-- ✅ CORRECT: Informative image with descriptive alt -->
<v-img
  src="/images/chart.png"
  alt="Bar chart showing 45% increase in domestic violence cases from 2023 to 2024"
/>

<!-- ✅ CORRECT: Decorative image -->
<v-img src="/images/decorative-pattern.png" alt="" role="presentation" />

<!-- ✅ CORRECT: Logo -->
<v-img
  src="/infonet-thumbnail-dark.jpg"
  alt="InfoNet - Illinois Criminal Justice Information Authority"
/>
```

### Alt Text Guidelines

**DO:**

- Describe the content and function of the image
- Be concise but descriptive
- Include relevant data from charts/graphs
- Use empty alt (`alt=""`) for purely decorative images

**DON'T:**

- Start with "Image of..." or "Picture of..."
- Include file names or extensions
- Repeat information already in surrounding text
- Make it too long (aim for < 150 characters)

### Examples by Image Type

```vue
<!-- Chart/Graph -->
<v-img
  src="chart.png"
  alt="Line graph showing steady increase in service requests from 100 in January to 250 in December 2024"
/>

<!-- Photo of person -->
<v-img src="director.jpg" alt="Jane Smith, Executive Director" />

<!-- Screenshot -->
<v-img
  src="screenshot.png"
  alt="InfoNet dashboard showing client statistics and recent activity"
/>

<!-- Icon (functional) -->
<v-img src="pdf-icon.png" alt="PDF document" />

<!-- Background pattern (decorative) -->
<v-img src="pattern.png" alt="" role="presentation" />
```

---

## 🔴 Critical Issue #3: ARIA Required Children

### Problem

Vuetify tooltips and other ARIA components have incorrect role hierarchies.

### Quick Fix

```vue
<!-- ❌ WRONG: Tooltip without proper structure -->
<v-tooltip>
  <template v-slot:activator="{ props }">
    <v-btn icon v-bind="props">
      <v-icon>mdi-help</v-icon>
    </v-btn>
  </template>
  Help information
</v-tooltip>

<!-- ✅ CORRECT: Tooltip with accessible button -->
<v-tooltip location="top">
  <template v-slot:activator="{ props }">
    <v-btn 
      icon 
      v-bind="props"
      aria-label="Help information about data entry"
    >
      <v-icon>mdi-help</v-icon>
    </v-btn>
  </template>
  <span>Enter client data using the form below</span>
</v-tooltip>
```

### Alternative: Use title attribute for simple tooltips

```vue
<!-- Simple tooltip alternative -->
<v-btn icon aria-label="Help" title="Click for help information">
  <v-icon>mdi-help</v-icon>
</v-btn>
```

---

## 🟠 Serious Issue: ARIA Tooltip Names

### Problem

Tooltip elements don't have accessible names.

### Quick Fix

```vue
<!-- ✅ CORRECT: Tooltip with id and aria-describedby -->
<v-tooltip>
  <template v-slot:activator="{ props }">
    <v-btn 
      icon 
      v-bind="props"
      aria-label="More information"
      aria-describedby="tooltip-info"
    >
      <v-icon>mdi-information</v-icon>
    </v-btn>
  </template>
  <span id="tooltip-info">
    This data is updated monthly from partner agencies
  </span>
</v-tooltip>
```

---

## 🟡 Moderate Issue: Landmark Regions

### Problem

Page content is not contained within proper semantic landmarks.

### Quick Fix

Update your layout components to use semantic HTML5 elements:

```vue
<!-- ❌ WRONG: Generic divs -->
<template>
  <div class="app">
    <div class="header">
      <v-app-bar>...</v-app-bar>
    </div>
    <div class="content">
      <!-- page content -->
    </div>
    <div class="footer">
      <!-- footer -->
    </div>
  </div>
</template>

<!-- ✅ CORRECT: Semantic landmarks -->
<template>
  <div class="app">
    <header>
      <v-app-bar>...</v-app-bar>
    </header>

    <nav aria-label="Main navigation">
      <v-navigation-drawer>...</v-navigation-drawer>
    </nav>

    <main>
      <article v-if="isArticlePage">
        <!-- article content -->
      </article>
      <div v-else>
        <!-- other content -->
      </div>
    </main>

    <footer>
      <!-- footer content -->
    </footer>
  </div>
</template>
```

### Landmark Elements

- `<header>` - Site header
- `<nav>` - Navigation menus
- `<main>` - Main content (only one per page)
- `<article>` - Self-contained content
- `<aside>` - Sidebar content
- `<footer>` - Site footer
- `<section>` - Thematic grouping of content

---

## Common Patterns

### Accessible Forms

```vue
<template>
  <v-form>
    <!-- ✅ CORRECT: Label associated with input -->
    <v-text-field
      v-model="email"
      label="Email Address"
      type="email"
      required
      :rules="emailRules"
      aria-required="true"
    />

    <!-- ✅ CORRECT: Checkbox with label -->
    <v-checkbox
      v-model="agree"
      label="I agree to the terms and conditions"
      required
      aria-required="true"
    />

    <!-- ✅ CORRECT: Select with label -->
    <v-select
      v-model="county"
      :items="counties"
      label="Select County"
      required
      aria-required="true"
    />

    <!-- ✅ CORRECT: Submit button -->
    <v-btn type="submit" color="primary"> Submit Form </v-btn>
  </v-form>
</template>
```

### Accessible Links

```vue
<template>
  <!-- ✅ CORRECT: Descriptive link text -->
  <v-btn to="/contact" text> Contact Us </v-btn>

  <!-- ❌ WRONG: Generic link text -->
  <v-btn to="/report.pdf" text> Click here </v-btn>

  <!-- ✅ CORRECT: Link with context -->
  <v-btn to="/report.pdf" text>
    Download 2024 Annual Report (PDF, 2.5MB)
  </v-btn>

  <!-- ✅ CORRECT: External link -->
  <v-btn href="https://example.com" target="_blank" text>
    Visit External Site
    <v-icon right small>mdi-open-in-new</v-icon>
    <span class="sr-only">(opens in new window)</span>
  </v-btn>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

### Accessible Tables

```vue
<template>
  <v-table>
    <caption>
      Client Statistics by County for 2024
    </caption>
    <thead>
      <tr>
        <th scope="col">County</th>
        <th scope="col">Total Clients</th>
        <th scope="col">Services Provided</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in data" :key="row.county">
        <th scope="row">{{ row.county }}</th>
        <td>{{ row.clients }}</td>
        <td>{{ row.services }}</td>
      </tr>
    </tbody>
  </v-table>
</template>
```

### Accessible Dialogs

```vue
<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <v-card>
      <v-card-title id="dialog-title"> Confirm Delete </v-card-title>

      <v-card-text id="dialog-description">
        Are you sure you want to delete this record? This action cannot be
        undone.
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false"> Cancel </v-btn>
        <v-btn color="error" @click="confirmDelete"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

---

## Testing Your Fixes

### 1. Automated Testing

```bash
# Run accessibility audit
npm run audit:a11y

# View report
npm run audit:a11y:report
```

### 2. Keyboard Testing

Test that all interactive elements can be accessed via keyboard:

- **Tab** - Move forward through interactive elements
- **Shift + Tab** - Move backward
- **Enter** - Activate buttons/links
- **Space** - Toggle checkboxes, activate buttons
- **Arrow keys** - Navigate within components (menus, tabs, etc.)
- **Escape** - Close dialogs/menus

### 3. Screen Reader Testing

**macOS (VoiceOver):**

```bash
# Enable VoiceOver
Cmd + F5

# Navigate
Control + Option + Arrow keys
```

**Windows (NVDA - Free):**

- Download from https://www.nvaccess.org/
- Use arrow keys to navigate
- Use Tab to jump between interactive elements

### 4. Browser DevTools

**Chrome/Edge:**

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"

---

## Checklist for New Components

When creating new components, ensure:

- [ ] All buttons have accessible names (text or aria-label)
- [ ] All images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] Interactive elements are keyboard accessible
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast (4.5:1 for normal text)
- [ ] Headings are in logical order (h1, h2, h3, etc.)
- [ ] Links have descriptive text
- [ ] ARIA attributes are used correctly
- [ ] Content is contained in semantic landmarks

---

## Resources

- [Vuetify Accessibility](https://vuetifyjs.com/en/features/accessibility/)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

---

## Getting Help

If you're unsure about how to fix an accessibility issue:

1. Check the detailed HTML report: `npm run audit:a11y:report`
2. Review the axe-core documentation for the specific rule
3. Consult the WCAG guidelines
4. Ask the team in the accessibility channel
5. Test with actual assistive technology when possible
