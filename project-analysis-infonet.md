# Project Analysis: ICJIA InfoNet Nuxt3

## 1. Project Overview

**Project Name:** ICJIA InfoNet
**Repository:** https://github.com/ICJIA/icjia-infonet-nuxt3
**Purpose:** A web-based data collection and reporting system used by victim service providers in Illinois, designed to standardize data collection, provide a central repository for victim service data, and ease reporting for service providers.

**Core Technologies:**

- **Frontend Framework:** Nuxt 3 (Vue.js)
- **UI Framework:** Vuetify 3
- **Content Management:** @nuxt/content (v2.13.2)
- **API Integration:** Apollo GraphQL client
- **Styling:** SCSS/Sass
- **Data Visualization:** Chart.js and Vue-ChartJS

**Architecture Type:** JAMstack (JavaScript, APIs, Markup) with static site generation

**Deployment Platform:** Netlify (with automatic deployment from the master branch)

## 2. Project Structure

The project follows a standard Nuxt 3 directory structure with some custom directories:

```
icjia-infonet-nuxt3/
├── assets/            # Static assets (CSS, images)
├── components/        # Vue components
│   └── content/       # Content-specific components
├── composables/       # Vue composables for shared logic
├── content/           # Markdown content files
├── creators/          # Custom scripts for content generation
├── layouts/           # Page layouts
├── pages/             # Vue pages (route structure)
├── plugins/           # Vue plugins
├── public/            # Public static files
├── server/            # Server API routes
│   └── api/           # API endpoints
├── src/               # Source files and generated JSON data
├── app.vue            # Main app component
├── app.config.js      # App configuration
├── nuxt.config.js     # Nuxt configuration
└── package.json       # Project dependencies
```

## 3. Core Dependencies and Technologies

### Frontend Framework

- **Nuxt 3 (v3.13.2)**: A Vue.js framework for building server-side rendered and static applications
- **Vue.js**: The underlying JavaScript framework

### UI and Styling

- **Vuetify (v3.7.1)**: Material Design component framework for Vue
- **Sass (v1.78.0)**: CSS preprocessor
- **@mdi/font (v7.4.47)**: Material Design Icons
- **@fortawesome/fontawesome-free (v6.6.0)**: Font Awesome icons

### Content Management

- **@nuxt/content (v2.13.2)**: Content management system for Nuxt
- **markdown-it (v14.1.0)** and **markdown-it-attrs (v4.2.0)**: Markdown parser and extension

### Data Fetching and API

- **@nuxtjs/apollo (v5.0.0-alpha.6)**: Apollo GraphQL client for Nuxt
- **axios (v1.7.7)**: HTTP client for API requests

### Data Visualization

- **chart.js (v4.4.4)**: JavaScript charting library
- **vue-chartjs (v5.3.1)**: Chart.js wrapper for Vue

### Utilities

- **moment (v2.30.1)**: Date manipulation library
- **fuse.js (v7.0.0)**: Lightweight fuzzy-search library
- **uuid (v10.0.0)**: UUID generation
- **dompurify (v3.1.6)**: HTML sanitizer
- **@vueuse/core (v11.1.0)**: Collection of Vue composition utilities
- **mitt (v3.0.1)**: Event emitter/bus
- **yaml (v2.5.1)**: YAML parser and serializer

## 4. Application Architecture

The InfoNet application follows a JAMstack architecture with static site generation:

1. **Content Management:**

   - Content is stored as Markdown files in the `/content` directory
   - Custom scripts in the `/creators` directory fetch data from external APIs and generate Markdown files
   - The @nuxt/content module processes these files and makes them available to the application

2. **Data Flow:**

   - External data is fetched from APIs during the build process:
     - Main API: `https://infonet.icjia-api.cloud`
     - Research Hub API: `https://researchhub.icjia-api.cloud/graphql`
   - Data is transformed into Markdown files and JSON data
   - The application serves this pre-generated content to users

3. **Routing:**

   - Uses Nuxt's file-based routing system in the `/pages` directory
   - Dynamic routes are generated from content files
   - Routes are collected in `appRoutes.json` for static site generation

4. **State Management:**

   - Uses Nuxt's `useState` composable for shared state
   - Custom composables in the `/composables` directory for specific functionality
   - Event bus using `mitt` for component communication

5. **Server API:**
   - Server API routes in `/server/api` provide access to JSON data
   - These endpoints are statically generated during the build process

## 5. Key Features and Functionality

1. **Content Management System:**

   - Markdown-based content with YAML frontmatter
   - Content types include pages, news, FAQs, tabs, and publications
   - Content is organized by sections and categories

2. **User Interface:**

   - Responsive design using Vuetify components
   - Navigation system with sidebar and breadcrumbs
   - Lazy-loaded components for performance optimization

3. **Data Visualization:**

   - Charts and graphs using Chart.js
   - Visualization of victim service data

4. **Search Functionality:**

   - Full-text search using Fuse.js
   - Search index generated during build process

5. **Multilingual Support:**

   - Translation functionality (configurable via `isTranslationEnabled`)

6. **Content Categories:**

   - Domestic Violence (DV)
   - Sexual Assault (SA)
   - Children's Advocacy Center (CAC)

7. **External Integrations:**
   - Apollo GraphQL for research hub data
   - Contact form submission to external API
   - Plausible Analytics for website analytics

## 6. Build and Deployment Process

### Development Workflow

1. **Local Development:**

   ```bash
   yarn dev           # Start development server with remote API
   yarn dev:local     # Start development server with local data
   ```

2. **Content Generation:**

   ```bash
   yarn scripts       # Run all content generation scripts for remote API
   yarn scripts:local # Run content generation for local development
   ```

3. **Build Process:**
   ```bash
   yarn generate      # Generate static site for production
   yarn generate:local # Generate static site with local data
   ```

### Content Generation Scripts

The project uses custom Node.js scripts in the `/creators` directory to:

1. Create Markdown files from API data
2. Generate JSON data files
3. Create site routes
4. Build search index
5. Generate sitemap

### Deployment

- **Platform:** Netlify
- **Strategy:** Continuous Deployment from the master branch
- **Build Command:** `yarn generate`
- **Output Directory:** `dist`

### Environment Configuration

Key environment variables (from `.env.sample`):

- `NUXT_PUBLIC_API_BASE_URL`: API endpoint (https://infonet.icjia-api.cloud)
- `NUXT_PUBLIC_BASE_URL`: Site URL (https://infonet.icjia.dev)
- `NUXT_MANUAL_ROUTES`: Manual routes to include in generation
- `PLAUSIBLE_DOMAIN`: Analytics domain

## 7. Code Organization and Patterns

### Component Structure

- **Layout Components:** In `/components/content/The*.vue` (TheNav, TheSidebar, etc.)
- **Content Display Components:** In `/components/content/` for specific content types
- **Page Components:** In `/pages/` directory following Nuxt's routing convention

### Data Fetching Patterns

1. **Build-time Data Fetching:**

   - Creator scripts fetch data from APIs during build process
   - Data is transformed into Markdown and JSON files

2. **Client-side Data Fetching:**
   - `useAsyncData` and `useFetch` composables for data fetching
   - GraphQL queries using Apollo client

### State Management

- **Global State:** Using Nuxt's `useState` composable
- **Custom States:**
  ```javascript
  export const useNavToggle = () => useState("nav", () => false);
  export const useTranslateToggle = () => useState("translate", () => false);
  ```

### Routing Patterns

- **Dynamic Routes:**
  - `[...slug].vue` for catch-all routes
  - `/tabs/[slug].vue`, `/news/[slug].vue` for specific content types

### Event Handling

- **Event Bus:**
  ```javascript
  import mitt from "mitt";
  const emitter = mitt();
  export const useEvent = emitter.emit;
  export const useListen = emitter.on;
  ```

## 8. External Integrations

1. **APIs:**

   - **Main API:** `https://infonet.icjia-api.cloud` - Content management API
   - **Research Hub:** `https://researchhub.icjia-api.cloud/graphql` - GraphQL API for research data
   - **Mail Service:** `https://mail.icjia.cloud/internet/infonet` - Email service for contact form

2. **Analytics:**

   - **Plausible Analytics:** `https://plausible.icjia.cloud/js/script.js`

3. **External Resources:**
   - CDN for jQuery: `https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.slim.min.js`
   - Google Fonts: `https://fonts.googleapis.com/css?family=Material+Icons`

## 9. Performance Considerations

1. **Static Site Generation:**

   - Pre-renders pages at build time for optimal performance
   - Reduces server load and improves page load times

2. **Lazy Loading:**

   - Components with `Lazy` prefix are loaded on demand
   - `v-lazy` directive for lazy loading content

3. **Image Optimization:**

   - Image placeholders during loading
   - Progress indicators for large content

4. **Bundle Optimization:**

   - Vite's dependency optimization
   - Specific dependencies included in optimization list

5. **Caching:**
   - Cache clearing during build process: `yarn clear:cache`
   - Netlify's CDN for content delivery
