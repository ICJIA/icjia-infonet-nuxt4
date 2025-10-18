# Siteimprove ARIA Landmark Fix

**Date:** 2025-10-18  
**Issue:** Text not included in an ARIA landmark  
**Tool:** Siteimprove  
**Status:** ✅ FIXED

---

## Issue Description

Siteimprove reported an accessibility violation on the home page:

**Error Message:**
> Text not included in an ARIA landmark
> 
> All perceivable text content should be included in an ARIA landmark.
> 
> Perceivable text content refers to text that can be perceived by users of assistive technology — some of which may be invisible to sighted users.

**Affected HTML:**
```html
<span class="v-btn__content" data-no-activator=""><!--[-->Open Dialog<!--]--></span>
```

**Location:** Home page (`/`)

**WCAG Reference:** WAI-ARIA authoring practices

---

## Root Cause Analysis

The issue was caused by the `TextModal.vue` component, which rendered a visible "Open Dialog" button as an activator for a Vuetify dialog. This button was:

1. **Positioned outside any ARIA landmark** - The component was loaded in `app.vue` before the `<TheNav>` component (which contains the `<header>` landmark)
2. **Not functionally necessary** - The modal dialog is triggered programmatically via events (`useListen("modal:text", ...)`), not by user clicks on this button
3. **Violating WCAG guidelines** - All perceivable text content must be inside an ARIA landmark (header, nav, main, footer, etc.)

**Component Structure in app.vue (BEFORE):**
```vue
<template>
  <v-app id="appTop">
    <SkipLinks></SkipLinks>
    <LazyImageModal></LazyImageModal>
    <LazyTextModal></LazyTextModal>  <!-- "Open Dialog" button rendered here -->
    <TheNav></TheNav>                <!-- <header> landmark starts here -->
    ...
  </v-app>
</template>
```

The `LazyTextModal` component rendered a visible button **before** the `<header>` landmark, causing the Siteimprove violation.

---

## Solution

Removed the unnecessary activator button from the `TextModal.vue` component since the modal is triggered programmatically via events, not by user interaction with the button.

### Changes Made

**File:** `app/components/content/TextModal.vue`

**BEFORE (Lines 1-30):**
```vue
<template>
  <div style="margin-top: -35px">
    <v-dialog width="500" v-model="dialog">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" text="Open Dialog"> </v-btn>  <!-- REMOVED -->
      </template>

      <template v-slot:default="{ isActive }">
        <v-card title="Redirect to External Website">
          <v-card-text class="text-left">
            <div v-html="bodyText"></div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn size="small" text="Cancel" @click="close()"></v-btn>
            <v-btn
              color="#5865f2"
              size="small"
              variant="flat"
              text="Yes, Please redirect me"
              @click="redirect()"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>
```

**AFTER (Lines 1-25):**
```vue
<template>
  <!-- Modal is triggered programmatically via events, no visible activator needed -->
  <v-dialog width="500" v-model="dialog">
    <template v-slot:default="{ isActive }">
      <v-card title="Redirect to External Website">
        <v-card-text class="text-left">
          <div v-html="bodyText"></div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn size="small" text="Cancel" @click="close()"></v-btn>
          <v-btn
            color="#5865f2"
            size="small"
            variant="flat"
            text="Yes, Please redirect me"
            @click="redirect()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
```

**Key Changes:**
1. ✅ Removed the `v-slot:activator` template and the "Open Dialog" button
2. ✅ Removed the wrapping `<div style="margin-top: -35px">` (no longer needed)
3. ✅ Added explanatory comment about programmatic triggering
4. ✅ Kept the modal dialog functionality intact (triggered via `useListen("modal:text", ...)`)

---

## Verification

### Tab Order Test

**BEFORE Fix:**
1. Skip to main content
2. **Open Dialog** ❌ (outside landmark)
3. MENU (hamburger menu)
4. Navigation elements...

**AFTER Fix:**
1. Skip to main content ✅
2. MENU (hamburger menu) ✅
3. Navigation elements... ✅

The "Open Dialog" button is **completely removed** from the DOM and tab order.

### Functional Testing

**Modal Trigger Mechanism:**
- ✅ Modal is still triggered programmatically via `useListen("modal:text", ...)`
- ✅ Modal displays correctly when triggered
- ✅ Modal buttons (Cancel, Yes) work as expected
- ✅ No user-facing functionality lost

**Pages Tested:**
- ✅ Home page (`/`) - No "Open Dialog" button visible
- ✅ Tab order is correct and logical
- ✅ All navigation elements are accessible

---

## WCAG Compliance

### Success Criteria Met

#### ✅ ARIA Landmarks (WAI-ARIA Authoring Practices)
**Requirement:** All perceivable text content should be included in an ARIA landmark.

**Implementation:** 
- Removed the "Open Dialog" button that was outside landmarks
- All remaining text content is within proper landmarks:
  - `<header>` - Navigation and branding
  - `<main>` - Main content
  - `<nav>` - Navigation menus
  - `<footer>` - Footer content

#### ✅ 2.4.3 Focus Order (Level A)
**Requirement:** Focusable components receive focus in an order that preserves meaning and operability.

**Implementation:** 
- Tab order now follows logical reading order
- Skip link is first, followed by navigation, then main content
- No unexpected elements in tab order

---

## Impact Assessment

### User Impact
- ✅ **No negative impact** - The removed button was not used by users
- ✅ **Improved accessibility** - All text content now within landmarks
- ✅ **Better screen reader experience** - Cleaner landmark structure

### Developer Impact
- ✅ **No code changes required elsewhere** - Modal triggering mechanism unchanged
- ✅ **Simpler component structure** - Removed unnecessary activator template
- ✅ **Better code clarity** - Added comment explaining programmatic triggering

### Siteimprove Impact
- ✅ **Violation resolved** - "Text not included in an ARIA landmark" error eliminated
- ✅ **Improved accessibility score** - One less violation on home page

---

## Related Components

### TextModal.vue
**Purpose:** Displays a confirmation dialog when users click external links

**Trigger Mechanism:**
```javascript
useListen("modal:text", (e) => {
  url.value = e.url || null;
  bodyText.value = e.bodyText || "No text specified";
  dialog.value = true;
});
```

**Usage Example:**
```javascript
useEvent("modal:text", {
  url: "https://example.com",
  bodyText: "You're about to leave this site. Continue?"
});
```

### ImageModal.vue
**Purpose:** Displays image gallery modal

**Note:** This component uses a similar pattern (programmatic triggering via events) and does not have a visible activator button.

---

## Testing Checklist

- [x] "Open Dialog" button removed from DOM
- [x] Tab order verified (skip link → navigation → main content)
- [x] Modal still triggers programmatically
- [x] Modal displays correctly
- [x] Modal buttons work (Cancel, Yes)
- [x] No console errors
- [x] No visual regressions
- [x] All text content within ARIA landmarks

---

## Recommendations

### Future Enhancements

1. **Consistent Modal Pattern:**
   - Document the programmatic modal triggering pattern
   - Ensure all modals follow this pattern (no visible activators)
   - Consider creating a composable for modal management

2. **Landmark Structure Review:**
   - Periodically audit all components to ensure text content is within landmarks
   - Use automated tools (Siteimprove, axe DevTools) to catch violations early
   - Add landmark structure to component documentation

3. **Code Comments:**
   - Add comments to components that use programmatic triggering
   - Document event-based patterns in developer documentation
   - Create examples for common patterns

---

## Conclusion

The Siteimprove ARIA landmark violation has been successfully resolved by removing the unnecessary "Open Dialog" button from the `TextModal.vue` component. The modal continues to function correctly via programmatic triggering, and all text content is now properly contained within ARIA landmarks.

**Status:** ✅ READY FOR PRODUCTION

**Files Modified:**
- `app/components/content/TextModal.vue` (Lines 1-30 → Lines 1-25)

**Testing:** Complete and verified

**WCAG Compliance:** Meets WAI-ARIA authoring practices for landmark usage

