<template>
  <div class="sandbox-page">
    <v-container>
      <v-row>
        <v-col>
          <h1 class="mb-4">TabsUserInfoAccessible Test Page</h1>
          
          <v-alert type="info" class="mb-6">
            <strong>Purpose:</strong> Test the custom TabsUserInfoAccessible component (vanilla HTML/CSS/JS, no Vuetify)
          </v-alert>

          <h2 class="mb-4">Live Component Test</h2>
          
          <TabsUserInfoAccessible />

          <v-card class="mt-8">
            <v-card-title>Verification: No Vuetify Components</v-card-title>
            <v-card-text>
              <p><strong>Inspect the rendered HTML above and verify:</strong></p>
              <ul>
                <li>✅ Uses &lt;div&gt; NOT &lt;v-card&gt;</li>
                <li>✅ Uses &lt;button role="tab"&gt; NOT &lt;v-tab&gt;</li>
                <li>✅ Uses &lt;div role="tablist"&gt; NOT &lt;v-tabs&gt;</li>
                <li>✅ Uses &lt;div role="tabpanel"&gt; NOT &lt;v-window-item&gt;</li>
                <li>✅ No Vuetify classes (no elevation-*, pa-*, etc.)</li>
                <li>✅ Custom CSS with overflow: visible</li>
              </ul>
            </v-card-text>
          </v-card>

        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
// Test page uses Vuetify for layout
// TabsUserInfoAccessible component does NOT use Vuetify
</script>

<style scoped>
.sandbox-page {
  padding: 20px 0;
}
</style>
