# ICJIA InfoNet Nuxt3 - Project Documentation

## 1. Project Overview

### Repository Information
- **Repository URL:** https://github.com/ICJIA/icjia-infonet-nuxt3
- **Live Site:** https://infonet.icjia.illinois.gov
- **Development Site:** https://infonet.icjia.dev
- **License:** MIT License
- **Deployment Status:** [![Netlify Status](https://api.netlify.com/api/v1/badges/f9b9ef26-d98b-4df5-8d10-77c1a2b72189/deploy-status)](https://app.netlify.com/sites/icjia-infonet/deploys)

### Project Purpose and Goals
InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois. The system is nationally recognized for facilitating standardized data collection and reporting at the statewide level. Initial development of InfoNet began in the mid-90s as a collaborative effort between the Illinois Criminal Justice Information Authority, the Illinois Coalition Against Sexual Assault, and the Illinois Coalition Against Domestic Violence.

**Primary Purposes:**
- Standardize data collection and reporting, thereby improving the ability to analyze information statewide and locally
- Provide a central repository for statewide victim service data
- Ease reporting for victim service providers that receive grants from multiple funding agencies, which often require different types of information
- Facilitate continuous strategic planning for improving services and system response to victims

### Target Audience
- **Primary Users:** Victim service providers in Illinois
- **Secondary Users:** Researchers, policymakers, and grant administrators
- **Content Categories:** 
  - Domestic Violence (DV)
  - Sexual Assault (SA)
  - Children's Advocacy Center (CAC)

### Key Features and Functionality
- **Content Management System:** Markdown-based content with YAML frontmatter
- **Data Visualization:** Interactive charts and graphs for victim service data using Chart.js
- **Search Functionality:** Full-text search using Fuse.js with pre-generated search index
- **Responsive Design:** Mobile-friendly interface using Vuetify Material Design components
- **Multilingual Support:** Translation functionality (configurable via `isTranslationEnabled`)
- **Static Site Generation:** JAMstack architecture for optimal performance
- **External API Integration:** Apollo GraphQL for research hub data and REST APIs for content management

### Project History and Version Information
- **Current Framework:** Nuxt 3.13.2
- **Architecture:** JAMstack (JavaScript, APIs, Markup) with static site generation
- **Package Manager:** Yarn 1.22.22
- **Node.js Version:** Managed via `.nvmrc` file
- **Deployment Platform:** Netlify with continuous deployment from master branch

## 2. Technology Stack

### Core Framework (with exact versions)
- **Nuxt 3:** ^3.13.2 - Vue.js framework for building server-side rendered and static applications
- **Vue.js:** ^3.5.5 - The underlying JavaScript framework (via Nuxt dependency)
- **Node.js:** Version managed via NVM (see `.nvmrc` file)

### UI Framework & Styling Tools
- **Vuetify:** ^3.7.1 - Material Design component framework for Vue
- **Sass:** ^1.78.0 - CSS preprocessor
- **@mdi/font:** ^7.4.47 - Material Design Icons
- **@fortawesome/fontawesome-free:** ^6.6.0 - Font Awesome icons
- **font-awesome:** 4.7.0 - Legacy Font Awesome support
- **material-design-icons-iconfont:** ^6.7.0 - Material Design Icons font
- **aos:** ^2.3.4 - Animate On Scroll library
- **vite-plugin-vuetify:** ^2.0.4 - Vuetify integration for Vite

### Content Management Systems
- **@nuxt/content:** ^2.13.2 - Content management system for Nuxt
- **markdown-it:** ^14.1.0 - Markdown parser
- **markdown-it-attrs:** ^4.2.0 - Markdown parser extension for attributes
- **dompurify:** ^3.1.6 - HTML sanitizer for security

### Build Tools & Development Environment
- **@nuxt/devtools:** 1.4.2 - Development tools for Nuxt
- **@vueuse/nuxt:** ^11.1.0 - VueUse integration for Nuxt
- **consola:** ^3.2.3 - Elegant console logger
- **kill-port:** ^2.0.1 - Development utility to kill processes on specific ports
- **loading-attribute-polyfill:** ^2.1.1 - Polyfill for loading attribute

### Search & Utility Libraries
- **fuse.js:** ^7.0.0 - Lightweight fuzzy-search library
- **moment:** ^2.30.1 - Date manipulation library
- **uuid:** ^10.0.0 - UUID generation
- **mitt:** ^3.0.1 - Event emitter/bus
- **yaml:** ^2.5.1 - YAML parser and serializer
- **@vueuse/core:** ^11.1.0 - Collection of Vue composition utilities
- **@vueuse/components:** ^11.1.0 - VueUse components
- **@vueuse/integrations:** ^11.1.0 - VueUse integrations
- **@vueuse/router:** ^11.1.0 - VueUse router utilities

### Analytics & Monitoring Tools
- **@nuxtjs/plausible:** ^1.0.2 - Plausible Analytics integration
- **Plausible Analytics:** Custom integration via script tags

### Deployment & Hosting Platform
- **Netlify:** Continuous deployment platform
- **Build Command:** `yarn generate`
- **Output Directory:** `dist`
- **Node.js Version:** Managed via `.nvmrc`

### Data Fetching and API Integration
- **@nuxtjs/apollo:** ^5.0.0-alpha.6 - Apollo GraphQL client for Nuxt
- **axios:** ^1.7.7 - HTTP client for API requests
- **request:** ^2.88.2 - Simplified HTTP request client

### Data Visualization
- **chart.js:** ^4.4.4 - JavaScript charting library
- **vue-chartjs:** ^5.3.1 - Chart.js wrapper for Vue

### Additional Dependencies
- **sitemap:** ^8.0.0 - Sitemap generation
- **@nuxtjs/google-fonts:** ^3.2.0 - Google Fonts integration (currently disabled)

## 3. Architecture Overview

### High-Level Architecture Description
The ICJIA InfoNet Nuxt3 project follows a JAMstack (JavaScript, APIs, Markup) architecture with static site generation. This approach provides the benefits of both dynamic content management and static site performance, ensuring fast load times and excellent SEO while maintaining the ability to integrate with external APIs and content management systems.

### Data Flow Diagrams and Patterns

```
External APIs → Creator Scripts → Markdown Files → Nuxt Content → Static Site
     ↓              ↓              ↓              ↓              ↓
Research Hub    Transform &     Content Store   Build Process   Deployed Site
Main API        Generate        (Git Repo)      (Netlify)      (CDN)
```

**Data Flow Process:**
1. **Build-Time Data Fetching:** Creator scripts fetch data from external APIs during the build process
2. **Content Transformation:** API data is transformed into Markdown files and JSON data structures
3. **Content Processing:** @nuxt/content processes Markdown files and makes them available to the application
4. **Static Generation:** Nuxt generates static HTML pages with pre-rendered content
5. **Deployment:** Static files are deployed to Netlify's CDN for global distribution

### Key Design Patterns and Principles

**1. Content-First Architecture:**
- Content is stored as Markdown files with YAML frontmatter
- Separation of content from presentation logic
- Version-controlled content management through Git

**2. Build-Time Data Generation:**
- External data fetched during build process, not runtime
- Pre-generated search indices and route configurations
- Optimized for performance and reliability

**3. Component-Based Design:**
- Modular Vue components with clear separation of concerns
- Reusable UI components following Vuetify design system
- Layout components for consistent page structure

**4. State Management Pattern:**
- Nuxt's built-in `useState` composable for global state
- Custom composables for specific functionality
- Event bus pattern using `mitt` for component communication

**5. Progressive Enhancement:**
- Static-first approach with JavaScript enhancement
- Lazy loading for non-critical components
- Graceful degradation for accessibility

### Integration Points and External Dependencies

**External APIs:**
- **Main Content API:** `https://infonet.icjia-api.cloud` - Primary content management system
- **Research Hub API:** `https://researchhub.icjia-api.cloud/graphql` - GraphQL API for research data
- **Mail Service:** `https://mail.icjia.cloud/internet/infonet` - Email service for contact forms

**Third-Party Services:**
- **Plausible Analytics:** `https://plausible.icjia.cloud/js/script.js` - Privacy-focused analytics
- **Google Fonts:** Font delivery and optimization
- **Netlify:** Hosting, CDN, and continuous deployment

**Build-Time Integrations:**
- Creator scripts integrate with external APIs to generate content
- Sitemap generation for SEO optimization
- Search index creation for client-side search functionality

## 4. Directory Structure

### Annotated Tree View of Project Structure

```
icjia-infonet-nuxt3/
├── .env.sample                    # Environment variables template
├── .nvmrc                         # Node.js version specification
├── LICENSE.md                     # MIT license file
├── README.md                      # Project overview and setup instructions
├── app.config.js                  # Application configuration
├── app.vue                        # Main application component
├── nuxt.config.js                 # Nuxt framework configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── yarn.lock                      # Yarn dependency lock file
├── netlify.toml                   # Netlify deployment configuration
│
├── app/                           # Nuxt app configuration
│   └── router.options.ts          # Vue Router configuration
│
├── assets/                        # Static assets processed by build tools
│   ├── css/                       # Stylesheets
│   │   ├── app.css               # Global application styles
│   │   ├── github-markdown.css   # Markdown content styling
│   │   └── variables.scss        # SCSS variables
│   └── img/                       # Images processed by build tools
│
├── components/                    # Vue components
│   └── content/                   # Content-specific components
│       ├── Attachments.vue        # File attachment display
│       ├── BasePropDisplay.vue    # Base property display component
│       ├── DisplayFaqs.vue        # FAQ display component
│       ├── HomeBarGraph.vue       # Homepage bar chart
│       ├── HomeBoxes.vue          # Homepage info boxes
│       ├── HomeButtons.vue        # Homepage navigation buttons
│       ├── HomeSplash.vue         # Homepage hero section
│       ├── HomeText.vue           # Homepage text content
│       ├── ImageModal.vue         # Image modal dialog
│       ├── News.vue               # News listing component
│       ├── NewsCard.vue           # Individual news card
│       ├── Partners.vue           # Partners display
│       ├── TabRender.vue          # Tab content renderer
│       ├── Tabs.vue               # Tab navigation
│       ├── TabsUserInfo.vue       # User information tabs
│       ├── Test.vue               # Testing component
│       ├── TextModal.vue          # Text modal dialog
│       ├── TheBreadcrumbBar.vue   # Breadcrumb navigation
│       ├── TheContextFooter.vue   # Context-aware footer
│       ├── TheCookieWarning.vue   # Cookie consent notice
│       ├── TheFooter.vue          # Main site footer
│       ├── TheLoader.vue          # Loading indicator
│       ├── TheNav.vue             # Main navigation
│       ├── ThePageLoader.vue      # Page loading indicator
│       ├── TheSidebar.vue         # Sidebar navigation
│       └── TheTableOfContents.vue # Table of contents
│
├── composables/                   # Vue composables for shared logic
│   ├── states.ts                  # Global state management
│   ├── useCurrentPage.js          # Current page utilities
│   └── useEventBus.js             # Event bus implementation
│
├── content/                       # Markdown content files (generated)
│   ├── about.md                   # About page content
│   ├── agencies.md                # Agencies information
│   ├── contact.md                 # Contact page content
│   ├── index.md                   # Homepage content
│   ├── partners.md                # Partners page content
│   ├── privacy.md                 # Privacy policy
│   ├── resources.md               # Resources page
│   ├── screenshots.md             # Screenshots page
│   ├── upgrades.md                # System upgrades information
│   ├── faqs/                      # FAQ content by category
│   │   ├── faqs.md               # FAQ index
│   │   ├── dv-*.md               # Domestic Violence FAQs
│   │   ├── sa-*.md               # Sexual Assault FAQs
│   │   ├── cac-*.md              # Children's Advocacy Center FAQs
│   │   └── general-*.md          # General FAQs
│   ├── news/                      # News articles
│   │   └── *.md                  # Individual news articles
│   └── tabs/                      # Tab content
│       ├── screenshots-*.md       # Screenshot tabs by category
│       └── users-*.md            # User guide tabs by category
│
├── creators/                      # Content generation scripts
│   ├── createBiographies.js       # Generate staff biographies
│   ├── createContentDirectory.js  # Initialize content directory
│   ├── createHubArticles.mjs      # Fetch research hub articles
│   ├── createHubImages.mjs        # Process research hub images
│   ├── createLocalMeta.mjs        # Generate local metadata
│   ├── createMarkdownFaqs.js      # Generate FAQ markdown files
│   ├── createMarkdownMeetings.js  # Generate meeting content
│   ├── createMarkdownNews.js      # Generate news articles
│   ├── createMarkdownPages.js     # Generate page content
│   ├── createMarkdownPublications.js # Generate publications
│   ├── createMarkdownTabs.js      # Generate tab content
│   ├── createPublistPublications.mjs # Fetch publication data
│   ├── createSearchIndex.mjs      # Generate search index
│   ├── createSiteRoutes.mjs       # Generate route configurations
│   ├── createSitemap.mjs          # Generate XML sitemap
│   ├── mergeHubAndPublistPublications.mjs # Merge publication sources
│   └── utils.js                   # Utility functions for creators
│
├── layouts/                       # Page layouts
│   └── error.vue                  # Error page layout
│
├── middleware/                    # Route middleware
│   ├── redirect-404.global.js     # 404 redirect handling
│   └── redirect-trailing-slash.global.js # URL normalization
│
├── pages/                         # Vue pages (defines routing structure)
│   ├── 404.vue                    # 404 error page
│   ├── [...slug].vue              # Catch-all dynamic route
│   ├── contact.vue                # Contact page
│   ├── debug.vue                  # Debug utilities page
│   ├── index.vue                  # Homepage
│   ├── sandbox.vue                # Development sandbox
│   ├── search.vue                 # Search results page
│   ├── translate.vue              # Translation page
│   ├── data-and-publications/     # Data and publications section
│   │   └── index.vue             # Publications listing
│   ├── faqs/                      # FAQ section
│   │   └── index.vue             # FAQ listing
│   ├── meetings/                  # Meetings section
│   │   ├── index.vue             # Meetings listing
│   │   └── [slug].vue            # Individual meeting pages
│   ├── news/                      # News section
│   │   ├── index.vue             # News listing
│   │   └── [slug].vue            # Individual news articles
│   └── tabs/                      # Tab content section
│       └── [...slug].vue         # Dynamic tab pages
│
├── plugins/                       # Vue plugins
│   ├── aos.ts                     # Animate On Scroll initialization
│   └── vuetify.js                 # Vuetify configuration
│
├── public/                        # Static files served directly
│   ├── favicon.ico                # Site favicon
│   ├── *.jpg, *.png              # Static images
│   ├── *.json                    # Generated data files
│   ├── sitemap.xml               # Generated XML sitemap
│   └── images/                   # Static image assets
│
├── server/                        # Server-side functionality
│   └── api/                      # API endpoints
│       └── *.js                  # Server API routes
│
└── src/                          # Generated source files and data
    ├── appRoutes.json            # Generated route configuration
    ├── dataAndPublications.json  # Publications data
    ├── hub.json                  # Research hub data
    ├── publist.json              # Publication list data
    ├── searchIndex.json          # Search index data
    ├── tabs.json                 # Tab configuration data
    └── tags.json                 # Content tags data
```

### Purpose of Each Major Directory

**Configuration Files:**
- Root-level configuration files manage framework settings, dependencies, and deployment
- Environment variables control API endpoints and feature flags

**Source Code Directories:**
- `components/` - Reusable Vue components organized by functionality
- `composables/` - Shared logic and state management using Vue Composition API
- `pages/` - File-based routing structure defining application URLs
- `layouts/` - Page layout templates for consistent structure
- `middleware/` - Route-level logic for redirects and URL handling

**Content and Data:**
- `content/` - Markdown files generated from external APIs during build
- `creators/` - Node.js scripts that fetch and transform external data
- `src/` - Generated JSON data files used by the application
- `public/` - Static assets served directly without processing

**Build and Deployment:**
- `assets/` - Source files processed by the build system
- `plugins/` - Vue plugin configurations and initializations
- `server/` - Server-side API routes for data access

### Key Configuration Files and Their Roles

**Framework Configuration:**
- `nuxt.config.js` - Main Nuxt framework configuration including modules, build settings, and runtime config
- `app.config.js` - Application-specific configuration like API endpoints and feature flags
- `tsconfig.json` - TypeScript configuration extending Nuxt's defaults

**Development and Build:**
- `package.json` - Dependencies, scripts, and project metadata
- `yarn.lock` - Dependency version lock file for consistent installs
- `.nvmrc` - Node.js version specification for development consistency

**Deployment:**
- `netlify.toml` - Netlify deployment configuration including headers and redirects
- `.env.sample` - Template for environment variables needed in production

### Generated vs. Source File Distinctions

**Generated Files (created by build scripts):**
- `content/` directory contents - Generated from external APIs
- `src/*.json` files - Data files created by creator scripts
- `public/sitemap.xml` - Generated XML sitemap
- `public/*.json` - Public data files for client-side access

**Source Files (version controlled):**
- All files in `components/`, `pages/`, `layouts/`, `composables/`
- Configuration files in project root
- Creator scripts in `creators/` directory
- Static assets in `assets/` and `public/images/`

## 5. Key Components

### Layout Components and Their Responsibilities

**TheNav.vue** - Main navigation component
- Responsive navigation bar with mobile hamburger menu
- Integration with Vuetify's v-app-bar component
- Navigation state management using `useNavToggle` composable
- Breadcrumb integration and search functionality

**TheSidebar.vue** - Sidebar navigation component
- Collapsible sidebar with category-based navigation
- Dynamic content based on current page context
- Mobile-responsive with overlay behavior
- Integration with global navigation state

**TheFooter.vue** - Main site footer
- Contact information and organizational links
- Social media integration
- Responsive layout with multi-column design
- Consistent branding and legal information

**TheBreadcrumbBar.vue** - Breadcrumb navigation
- Dynamic breadcrumb generation based on current route
- Integration with Nuxt's route metadata
- Accessible navigation with proper ARIA labels
- Responsive design for mobile devices

**TheTableOfContents.vue** - Table of contents component
- Automatic generation from page headings
- Smooth scrolling navigation
- Sticky positioning for long content pages
- Accessibility features for screen readers

### Content Components and Rendering Logic

**DisplayFaqs.vue** - FAQ display component
- Category-based FAQ organization (DV, SA, CAC, General)
- Search and filter functionality within FAQs
- Expandable/collapsible FAQ items
- Integration with Fuse.js for fuzzy search

**News.vue & NewsCard.vue** - News content components
- News listing with pagination and filtering
- Individual news card display with metadata
- Date formatting using Moment.js
- Responsive grid layout for news items

**TabRender.vue & Tabs.vue** - Tab content system
- Dynamic tab content rendering from Markdown
- Category-based tab organization
- State management for active tab selection
- Integration with @nuxt/content for content fetching

**HomeBarGraph.vue** - Data visualization component
- Chart.js integration for data visualization
- Responsive chart rendering
- Data fetching from generated JSON files
- Interactive chart features with tooltips

**Partners.vue** - Partner organization display
- Grid layout for partner logos and information
- Responsive design with mobile optimization
- Integration with content management system
- Lazy loading for performance optimization

### Page Components and Routing Structure

**index.vue** - Homepage component
- Hero section with splash image and call-to-action
- Featured content sections (news, statistics, quick links)
- Integration with multiple content components
- Performance optimized with lazy loading

**[...slug].vue** - Dynamic catch-all route
- Handles all dynamic content pages
- Integration with @nuxt/content for Markdown rendering
- SEO metadata generation from frontmatter
- Flexible layout system based on content type

**search.vue** - Search results page
- Client-side search using pre-generated search index
- Fuse.js integration for fuzzy search capabilities
- Result filtering and categorization
- Responsive results display with pagination

**contact.vue** - Contact form page
- Form validation and submission handling
- Integration with external mail service API
- Accessibility features and error handling
- Responsive form layout

### Utility Components and Shared Functionality

**TheLoader.vue & ThePageLoader.vue** - Loading indicators
- Global loading state management
- Smooth transitions between page loads
- Customizable loading animations
- Integration with Nuxt's loading system

**ImageModal.vue & TextModal.vue** - Modal dialogs
- Reusable modal components for content display
- Accessibility features with focus management
- Responsive design for mobile devices
- Event-driven modal state management

**TheCookieWarning.vue** - Cookie consent component
- GDPR compliance for cookie usage
- Persistent user preference storage
- Customizable consent options
- Integration with analytics systems

### State Management Components

**Composables (states.ts):**
```typescript
export const useNavToggle = () => useState<boolean>("nav", () => false);
export const useTranslateToggle = () => useState<boolean>("translate", () => false);
export const useCounter = () => useState<number>("counter", () => 0);
export const useColor = () => useState<string>("color", () => "pink");
```

**Event Bus (useEventBus.js):**
```javascript
import mitt from "mitt";
const emitter = mitt();
export const useEvent = emitter.emit;
export const useListen = emitter.on;
```

**State Management Patterns:**
- Global state using Nuxt's `useState` composable
- Event-driven communication between components
- Reactive state updates with Vue's reactivity system
- Persistent state for user preferences and navigation

## 6. API Documentation

### External API Integrations and Configurations

**Main Content API**
- **Endpoint:** `https://infonet.icjia-api.cloud`
- **Purpose:** Primary content management system for pages, news, FAQs, and publications
- **Authentication:** API key-based (configured via environment variables)
- **Data Format:** JSON responses transformed to Markdown during build
- **Rate Limiting:** Handled during build process, not runtime

**Research Hub GraphQL API**
- **Endpoint:** `https://researchhub.icjia-api.cloud/graphql`
- **Purpose:** Research publications and academic content
- **Client:** Apollo GraphQL client (@nuxtjs/apollo)
- **Authentication:** Public API with optional authentication
- **Schema:** GraphQL schema for publications, authors, and research data

**Mail Service API**
- **Endpoint:** `https://mail.icjia.cloud/internet/infonet`
- **Purpose:** Contact form submission handling
- **Method:** POST requests with form data
- **Authentication:** Service-to-service authentication
- **Response Format:** JSON with success/error status

### Endpoint Documentation with Request/Response Examples

**Content API Endpoints:**

```javascript
// Pages endpoint
GET https://infonet.icjia-api.cloud/pages
Response: {
  data: [
    {
      id: 1,
      title: "About InfoNet",
      slug: "about",
      content: "...",
      published: true,
      created_at: "2023-01-01T00:00:00Z"
    }
  ]
}

// News endpoint
GET https://infonet.icjia-api.cloud/news
Response: {
  data: [
    {
      id: 1,
      title: "InfoNet Data Now Available",
      slug: "2023-info-net-data-now-available",
      excerpt: "...",
      content: "...",
      published_at: "2023-12-01T00:00:00Z"
    }
  ]
}

// FAQs endpoint
GET https://infonet.icjia-api.cloud/faqs
Response: {
  data: [
    {
      id: 1,
      question: "How do I access InfoNet?",
      answer: "...",
      category: "general",
      order: 1
    }
  ]
}
```

**GraphQL Research Hub Queries:**

```graphql
query GetPublications {
  publications {
    id
    title
    abstract
    published_date
    authors {
      name
      affiliation
    }
    tags {
      name
    }
  }
}

query GetPublication($id: ID!) {
  publication(id: $id) {
    id
    title
    abstract
    content
    published_date
    pdf_url
    authors {
      name
      bio
      affiliation
    }
  }
}
```

### Authentication and Authorization Patterns

**API Key Authentication:**
- Environment variable: `NUXT_PUBLIC_API_BASE_URL`
- Header-based authentication for content API
- Build-time authentication only (no runtime API calls)

**GraphQL Authentication:**
- Optional authentication for enhanced access
- Public queries available without authentication
- Rate limiting based on IP address

**Security Considerations:**
- API keys stored as environment variables
- No sensitive data exposed to client-side
- CORS configuration in `netlify.toml`
- Content sanitization with DOMPurify

### Data Processing Workflows

**Build-Time Data Flow:**
1. Creator scripts execute during `yarn scripts` command
2. External APIs are queried for latest content
3. Data is transformed and validated
4. Markdown files are generated in `content/` directory
5. JSON data files are created in `src/` directory
6. Search index is built from all content
7. Sitemap is generated for SEO

**Content Transformation Process:**
```javascript
// Example from createMarkdownNews.js
const transformNewsItem = (apiData) => ({
  title: apiData.title,
  slug: apiData.slug,
  published: apiData.published_at,
  excerpt: apiData.excerpt,
  content: sanitizeHtml(apiData.content),
  category: apiData.category || 'general'
});
```

### Error Handling Strategies

**API Error Handling:**
- Graceful degradation when APIs are unavailable
- Retry logic with exponential backoff
- Fallback to cached content when possible
- Comprehensive error logging with Consola

**Build-Time Error Handling:**
- Validation of API responses before processing
- Rollback to previous content on build failures
- Error reporting to build logs
- Partial builds when some APIs fail

**Runtime Error Handling:**
- 404 handling with custom error pages
- Client-side error boundaries
- Graceful fallbacks for missing content
- User-friendly error messages

## 7. Database Schema

### Content Structure and Validation Rules

While InfoNet Nuxt3 doesn't use a traditional database, it manages structured content through Markdown files with YAML frontmatter and JSON data files. The content structure follows specific schemas for consistency and validation.

**Page Content Schema:**
```yaml
---
title: "Page Title"                 # Required: String, max 200 chars
slug: "page-slug"                   # Required: String, URL-safe
description: "Page description"     # Optional: String, max 300 chars
published: true                     # Required: Boolean
created_at: "2023-01-01"           # Required: Date (YYYY-MM-DD)
updated_at: "2023-01-01"           # Optional: Date (YYYY-MM-DD)
category: "general"                 # Optional: String (general|dv|sa|cac)
tags: ["tag1", "tag2"]             # Optional: Array of strings
author: "Author Name"               # Optional: String
featured: false                     # Optional: Boolean
order: 1                           # Optional: Number for sorting
---
# Content in Markdown format
```

**News Article Schema:**
```yaml
---
title: "News Article Title"        # Required: String, max 200 chars
slug: "article-slug"               # Required: String, URL-safe
excerpt: "Brief description"       # Required: String, max 500 chars
published_at: "2023-01-01"        # Required: Date (YYYY-MM-DD)
category: "announcement"           # Optional: String
featured: false                    # Optional: Boolean
image: "/images/article.jpg"       # Optional: String, image path
author: "Author Name"              # Optional: String
tags: ["news", "update"]          # Optional: Array of strings
---
# Article content in Markdown
```

**FAQ Schema:**
```yaml
---
question: "How do I...?"           # Required: String, max 300 chars
category: "general"                # Required: String (general|dv|sa|cac)
order: 1                          # Optional: Number for sorting
tags: ["help", "guide"]           # Optional: Array of strings
updated_at: "2023-01-01"          # Optional: Date (YYYY-MM-DD)
---
# Answer content in Markdown
```

**Tab Content Schema:**
```yaml
---
title: "Tab Title"                 # Required: String, max 100 chars
category: "dv"                     # Required: String (dv|sa|cac)
section: "users"                   # Required: String (users|screenshots)
order: 1                          # Required: Number for tab ordering
icon: "mdi-help"                   # Optional: String, Material Design icon
---
# Tab content in Markdown
```

### Data Models and Relationships

**Content Hierarchy:**
```
Site
├── Pages (Static content)
├── News (Time-based articles)
├── FAQs (Question/Answer pairs)
│   ├── General FAQs
│   ├── Domestic Violence (DV) FAQs
│   ├── Sexual Assault (SA) FAQs
│   └── Children's Advocacy Center (CAC) FAQs
├── Tabs (Categorized content)
│   ├── User Guides (by category)
│   └── Screenshots (by category)
└── Publications (Research data)
    ├── Hub Publications (GraphQL API)
    └── Publist Publications (REST API)
```

**Category Relationships:**
- **DV (Domestic Violence):** Content specific to domestic violence services
- **SA (Sexual Assault):** Content specific to sexual assault services
- **CAC (Children's Advocacy Center):** Content specific to children's advocacy
- **General:** Cross-cutting content applicable to all categories

**Content Linking:**
- Tags create many-to-many relationships between content items
- Categories create hierarchical organization
- Slugs provide unique identifiers for URL routing
- Order fields enable custom sorting within categories

### Migration and Seeding Strategies

**Content Migration Process:**
1. **API Data Fetching:** Creator scripts fetch latest content from external APIs
2. **Data Transformation:** Raw API data is transformed to match content schemas
3. **Validation:** Content is validated against schema requirements
4. **File Generation:** Markdown files are created with proper frontmatter
5. **Index Updates:** Search indices and route configurations are updated

**Seeding Strategy:**
```bash
# Full content regeneration
yarn scripts

# Individual content type seeding
yarn create:pages          # Regenerate page content
yarn create:news           # Regenerate news articles
yarn create:faqs           # Regenerate FAQ content
yarn create:tabs           # Regenerate tab content
yarn create:publications   # Regenerate publication data
```

**Data Validation Rules:**
- Required fields must be present and non-empty
- Dates must be in ISO format (YYYY-MM-DD)
- Slugs must be URL-safe (lowercase, hyphens only)
- Categories must match predefined values
- Content length limits enforced during generation
- Markdown syntax validation before file creation

## 8. Setup Instructions

### Prerequisites and System Requirements

⚠️ **IMPORTANT PLATFORM COMPATIBILITY WARNING** ⚠️

This project is **NOT compatible with vanilla Windows** (native Windows without WSL2). Development requires one of these supported platforms:

1. **Windows with WSL2** (Windows Subsystem for Linux 2) - **REQUIRED** for Windows users
2. **macOS** (Apple Silicon M1/M2/M3/M4 preferred over Intel for better performance)
3. **Linux** (Debian/Ubuntu distributions recommended, other distributions may work but are not supported)

**Technical Reasoning:** Node.js development tools, file system operations, and build processes work more reliably on Unix-like systems. Many npm packages, build tools, and file watchers have compatibility issues with native Windows environments.

**Required Software:**
- **Node.js:** Version specified in `.nvmrc` file (use NVM for version management)
- **Yarn:** Version 1.22.22 or compatible (specified in package.json)
- **Git:** For version control and repository cloning
- **NVM (Node Version Manager):** For Node.js version management

**Optional but Recommended:**
- **VS Code:** With Remote-WSL extension (for Windows WSL2 users)
- **Terminal:** Modern terminal with good Unicode support

### Step-by-Step Installation Process

**1. Platform-Specific Setup**

**For Windows Users (WSL2 MANDATORY):**
```bash
# Install WSL2 (run in PowerShell as Administrator)
wsl --install

# Install Ubuntu distribution
wsl --install -d Ubuntu

# Enter WSL2 environment
wsl

# Update package manager
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install build-essential curl git -y
```

**For macOS Users:**
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git (if not already installed)
brew install git
```

**For Linux Users (Debian/Ubuntu):**
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install build-essential curl git -y
```

**2. Node.js and Yarn Installation**

```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc for Zsh users

# Verify NVM installation
nvm --version

# Install and use the project's Node.js version
# (The .nvmrc file will specify the exact version)
nvm install
nvm use

# Install Yarn globally
npm install -g yarn@1.22.22

# Verify installations
node --version
yarn --version
```

**3. Project Setup**

```bash
# Clone the repository
git clone https://github.com/ICJIA/icjia-infonet-nuxt3.git

# Navigate to project directory
cd icjia-infonet-nuxt3

# Use the correct Node.js version
nvm use

# Copy environment variables template
cp .env.sample .env

# Install project dependencies
yarn install
```

### Environment Configuration

**Environment Variables Setup:**

Edit the `.env` file with appropriate values:

```bash
# API Configuration
NUXT_PUBLIC_API_BASE_URL=https://infonet.icjia-api.cloud
NUXT_PUBLIC_BASE_URL=https://infonet.icjia.dev

# Manual Routes (for static generation)
NUXT_MANUAL_ROUTES=["/search", "/translate", "/faqs", "/news", "/data-and-publications"]

# Analytics Configuration
PLAUSIBLE_DOMAIN=infonet.illinois.gov
PLAUSIBLE_API_HOST=https://analytics.icjia-api.cloud/js/plausible.js

# Base URL Configuration
NUXT_BASE_URL=/

# Active Sections
NUXT_ACTIVE_SECTIONS=['root', 'page', 'meetings', 'faqs']
```

**Development vs Production Configuration:**
- **Development:** Uses local API endpoints and debug features
- **Production:** Uses production API endpoints and optimized builds
- **Environment Detection:** Automatic based on NODE_ENV variable

### Verification Steps and Troubleshooting

**1. Verify Installation**

```bash
# Check Node.js version matches .nvmrc
node --version

# Check Yarn installation
yarn --version

# Verify project dependencies
yarn check

# Test development server startup
yarn dev
```

**2. Common Installation Issues**

**Windows Users Attempting Native Development:**
- **Error:** `ENOENT: no such file or directory, scandir`
  - **Solution:** Use WSL2, not native Windows
- **Error:** `gyp ERR! stack Error: Can't find Python executable`
  - **Solution:** Use WSL2 with proper Linux environment
- **Error:** File watchers not working or extremely slow
  - **Solution:** Use WSL2 file system, not Windows file system

**General Issues:**
- **Node Version Mismatch:** Run `nvm use` in project directory
- **Yarn Not Found:** Install Yarn globally with `npm install -g yarn`
- **Permission Errors:** Ensure proper file permissions in Unix environments
- **Build Failures:** Clear cache with `yarn clear:cache` and retry

**3. Verification Checklist**

- [ ] Correct Node.js version installed and active
- [ ] Yarn package manager installed and working
- [ ] Project dependencies installed successfully
- [ ] Environment variables configured
- [ ] Development server starts without errors
- [ ] Can access http://localhost:8000 in browser
- [ ] No console errors in browser developer tools

## 9. Development Workflow

### Git Workflow and Branching Strategy

**Branch Structure:**
- **master** - Production branch (auto-deploys to live site)
- **develop** - Development integration branch
- **feature/*** - Feature development branches
- **hotfix/*** - Emergency fixes for production issues

**Workflow Process:**
1. **Feature Development:**
   ```bash
   # Create feature branch from develop
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature-name

   # Make changes and commit
   git add .
   git commit -m "feat: add new feature description"

   # Push feature branch
   git push origin feature/new-feature-name
   ```

2. **Pull Request Process:**
   - Create PR from feature branch to develop
   - Ensure all tests pass and build succeeds
   - Request code review from team members
   - Address feedback and update PR
   - Merge to develop after approval

3. **Release Process:**
   ```bash
   # Merge develop to master for production release
   git checkout master
   git pull origin master
   git merge develop
   git push origin master
   ```

**Commit Message Conventions:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Standards and Formatting Rules

**JavaScript/TypeScript Standards:**
- **ESLint Configuration:** Extends Nuxt's recommended rules
- **Prettier Integration:** Automatic code formatting
- **File Naming:** kebab-case for components, camelCase for utilities
- **Component Structure:** Composition API preferred over Options API

**Vue Component Standards:**
```vue
<template>
  <!-- Use semantic HTML elements -->
  <!-- Follow accessibility guidelines -->
  <!-- Use Vuetify components consistently -->
</template>

<script setup>
// Use Composition API
// Import statements at top
// Define props and emits
// Implement component logic
</script>

<style scoped>
/* Use SCSS when needed */
/* Follow BEM methodology for custom classes */
/* Leverage Vuetify's design tokens */
</style>
```

**CSS/SCSS Standards:**
- **Vuetify First:** Use Vuetify components and utilities before custom CSS
- **SCSS Variables:** Defined in `assets/css/variables.scss`
- **Responsive Design:** Mobile-first approach with Vuetify breakpoints
- **Accessibility:** Ensure proper contrast ratios and focus states

**Markdown Content Standards:**
- **Frontmatter:** Required YAML metadata for all content files
- **Headings:** Proper hierarchy (H1 → H2 → H3)
- **Links:** Use relative paths for internal links
- **Images:** Include alt text for accessibility

### Testing Approach and Procedures

**Current Testing Strategy:**
- **Manual Testing:** Comprehensive manual testing across devices and browsers
- **Build Testing:** Automated build verification on each deployment
- **Content Validation:** Schema validation for generated content
- **Performance Testing:** Lighthouse audits for performance metrics

**Testing Checklist:**
- [ ] All pages load without errors
- [ ] Navigation works correctly across all sections
- [ ] Search functionality returns relevant results
- [ ] Forms submit successfully
- [ ] Mobile responsiveness verified
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Performance scores meet targets (Lighthouse)

**Browser Testing Matrix:**
- **Desktop:** Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile:** iOS Safari, Android Chrome (latest versions)
- **Accessibility:** Screen reader testing with NVDA/JAWS

### Common Development Tasks and Procedures

**Starting Development:**
```bash
# Start development server with remote API
yarn dev

# Start development server with local data
yarn dev:local

# Clear cache and restart (if experiencing issues)
yarn clear:cache && yarn dev
```

**Content Management:**
```bash
# Regenerate all content from APIs
yarn scripts

# Regenerate specific content types
yarn create:pages          # Update page content
yarn create:news           # Update news articles
yarn create:faqs           # Update FAQ content
yarn create:tabs           # Update tab content
yarn create:publications   # Update publication data

# Generate search index
yarn create:searchIndex

# Generate sitemap
yarn create:sitemap
```

**Build and Deployment:**
```bash
# Build for production
yarn generate

# Build and serve locally
yarn generate:serve

# Preview production build
yarn preview
```

**Debugging and Development:**
```bash
# Enable Nuxt DevTools
# DevTools are enabled by default in development

# Check for linting issues
yarn lint

# Clear all caches and generated files
yarn clear:cache
```

**Adding New Content:**
1. **Pages:** Add content via API or create Markdown file in `content/`
2. **Components:** Create Vue component in appropriate `components/` subdirectory
3. **Routes:** Add to `pages/` directory following Nuxt's file-based routing
4. **Styles:** Add to component or global styles in `assets/css/`

**Environment Management:**
```bash
# Switch Node.js versions
nvm use

# Update dependencies
yarn upgrade

# Check for security vulnerabilities
yarn audit

# Fix auto-fixable vulnerabilities
yarn audit fix
```

**Performance Optimization:**
- **Image Optimization:** Use appropriate formats and sizes
- **Lazy Loading:** Implement for non-critical components
- **Bundle Analysis:** Use Nuxt DevTools to analyze bundle size
- **Caching:** Leverage Netlify's CDN caching strategies

## 10. Build and Deployment

### Build Process Overview and Scripts

**Build Pipeline Architecture:**
```
Content Generation → Static Site Generation → Deployment
       ↓                      ↓                    ↓
   Creator Scripts      Nuxt Generate         Netlify CDN
   (yarn scripts)       (yarn generate)       (Auto-deploy)
```

**Primary Build Scripts:**

```bash
# Full production build
yarn generate
# Executes: yarn clear:cache && yarn scripts && nuxt generate

# Development build
yarn build
# Executes: yarn clear:cache && yarn scripts && nuxt build

# Local development build (no external APIs)
yarn generate:local
# Executes: yarn scripts:local && nuxt generate
```

**Individual Creator Scripts:**
```bash
yarn create:contentDirectory    # Initialize content directory
yarn create:pages              # Generate page content from API
yarn create:news               # Generate news articles
yarn create:faqs               # Generate FAQ content
yarn create:tabs               # Generate tab content
yarn create:publications       # Generate publication data
yarn create:hub                # Fetch research hub articles
yarn create:hubImages          # Process research hub images
yarn create:searchIndex        # Build search index
yarn create:sitemap           # Generate XML sitemap
yarn create:routes            # Generate route configurations
```

**Build Script Execution Order:**
1. `yarn clear:cache` - Remove previous build artifacts
2. `yarn create:contentDirectory` - Initialize content structure
3. Content generation scripts (pages, news, FAQs, tabs, publications)
4. Data processing scripts (hub articles, images, merged publications)
5. Index generation (search index, sitemap, routes)
6. `nuxt generate` - Static site generation

### Content Generation Workflows

**API-Driven Content Generation:**
```javascript
// Example workflow from createMarkdownNews.js
1. Fetch data from external API
2. Transform API response to content schema
3. Validate content structure
4. Generate Markdown files with frontmatter
5. Update content indices and routes
```

**Content Processing Pipeline:**
```
External APIs → Raw Data → Validation → Transformation → Markdown Files
     ↓             ↓          ↓             ↓              ↓
Research Hub   JSON Data   Schema Check   Format Data   Content Store
Main API       Arrays      Required Fields Frontmatter   Git Repository
```

**Error Handling in Content Generation:**
- **API Failures:** Graceful degradation with cached content
- **Data Validation:** Schema validation before file generation
- **Partial Failures:** Continue processing other content types
- **Rollback Strategy:** Maintain previous content on critical failures

### Deployment Configuration and Process

**Netlify Configuration (netlify.toml):**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    X-Greeting = "Hello from Chicago!"
```

**Deployment Settings:**
- **Build Command:** `yarn generate`
- **Publish Directory:** `dist`
- **Node Version:** Specified in `.nvmrc`
- **Environment Variables:** Configured in Netlify dashboard

**Automatic Deployment Process:**
1. **Trigger:** Push to master branch
2. **Build Environment:** Netlify's build servers
3. **Dependency Installation:** `yarn install`
4. **Content Generation:** `yarn scripts`
5. **Static Generation:** `nuxt generate`
6. **Asset Optimization:** Netlify's built-in optimization
7. **CDN Distribution:** Global CDN deployment
8. **DNS Update:** Automatic DNS propagation

**Manual Deployment Options:**
```bash
# Local build and manual upload
yarn generate
# Upload dist/ directory to hosting provider

# Netlify CLI deployment
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment-Specific Considerations

**Development Environment:**
- **Hot Reload:** Enabled for rapid development
- **Source Maps:** Full source maps for debugging
- **DevTools:** Nuxt DevTools enabled
- **API Endpoints:** Development API URLs
- **Cache:** Disabled for fresh content on each reload

**Production Environment:**
- **Optimization:** Minified and optimized assets
- **Caching:** Aggressive caching strategies
- **CDN:** Global content delivery network
- **Analytics:** Production analytics tracking
- **Error Handling:** User-friendly error pages

**Build Performance Optimization:**
- **Parallel Processing:** Creator scripts run independently when possible
- **Incremental Builds:** Only regenerate changed content (future enhancement)
- **Asset Optimization:** Image compression and format optimization
- **Bundle Splitting:** Automatic code splitting by Nuxt

**Monitoring and Alerts:**
- **Build Status:** Netlify build notifications
- **Performance Monitoring:** Lighthouse CI integration
- **Error Tracking:** Console error monitoring
- **Uptime Monitoring:** External uptime monitoring services

**Rollback Procedures:**
1. **Immediate Rollback:** Netlify dashboard rollback to previous deployment
2. **Git Rollback:** Revert commits and redeploy
3. **Content Rollback:** Restore previous content from Git history
4. **Emergency Procedures:** Manual content updates via Netlify CMS (if needed)

## 11. Configuration

### Environment Variables and Their Purposes

**API Configuration:**
```bash
# Primary content management API
NUXT_PUBLIC_API_BASE_URL=https://infonet.icjia-api.cloud
# Purpose: Base URL for fetching content, news, FAQs, and page data
# Used by: Creator scripts during build process
# Required: Yes

# Site base URL for absolute links and SEO
NUXT_PUBLIC_BASE_URL=https://infonet.icjia.illinois.gov
# Purpose: Canonical URL for the website, used in meta tags and sitemaps
# Used by: SEO meta generation, sitemap creation, social sharing
# Required: Yes

# Thumbor image processing service key
NUXT_THUMBOR_KEY=your-thumbor-key-here
# Purpose: Authentication for image processing and optimization
# Used by: Image transformation and optimization
# Required: No (if not using Thumbor)
```

**Routing and Navigation:**
```bash
# Manual routes for static generation
NUXT_MANUAL_ROUTES=["/search", "/translate", "/faqs", "/news", "/data-and-publications"]
# Purpose: Specify routes that should be pre-generated during build
# Used by: Static site generation process
# Required: Yes

# Base URL path (for subdirectory deployments)
NUXT_BASE_URL=/
# Purpose: Base path for the application (use "/" for root domain)
# Used by: Router configuration and asset paths
# Required: Yes

# Active content sections
NUXT_ACTIVE_SECTIONS=['root', 'page', 'meetings', 'faqs']
# Purpose: Control which content sections are active/visible
# Used by: Content filtering and navigation generation
# Required: Yes
```

**Analytics Configuration:**
```bash
# Plausible Analytics domain
PLAUSIBLE_DOMAIN=infonet.illinois.gov
# Purpose: Domain for analytics tracking
# Used by: Plausible Analytics script configuration
# Required: No (if not using analytics)

# Plausible Analytics API host
PLAUSIBLE_API_HOST=https://analytics.icjia-api.cloud/js/plausible.js
# Purpose: Custom Plausible Analytics script URL
# Used by: Analytics script loading
# Required: No (if using default Plausible)
```

### Application Configuration Options

**App Configuration (app.config.js):**
```javascript
export default defineAppConfig({
  // Basic site information
  title: "InfoNet",
  description: "InfoNet",

  // API endpoints
  api: "https://infonet.icjia-api.cloud",
  root: "https://infonet.icjia.illinois.gov",

  // Feature flags
  isTranslationEnabled: true,

  // Content limits
  homeNewsLimit: 2,

  // FAQ category mapping
  faqCategoryMap: {
    default: {
      category: "default",
      heading: "General",
    },
    dv: {
      category: "dv",
      heading: "Domestic Violence (DV)",
    },
    sa: {
      category: "sa",
      heading: "Sexual Assault (SA)",
    },
    cac: {
      category: "cac",
      heading: "Children's Advocacy Center (CAC)",
    },
  },
});
```

**Nuxt Configuration (nuxt.config.js):**
```javascript
export default defineNuxtConfig({
  // Development tools
  devtools: true,

  // Experimental features
  experimental: {
    viewTransition: true,
    payloadExtraction: true,
  },

  // Runtime configuration
  runtimeConfig: {
    private: {
      thumborKey: process.env.NUXT_THUMBOR_KEY || "ERROR: thumbor key not specified",
    },
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "ERROR: no api base url specified",
      siteBase: process.env.NUXT_PUBLIC_BASE_URL || "ERROR: no site base url specified",
    },
  },

  // Module configuration
  modules: [
    "@vueuse/nuxt",
    "@nuxt/content",
    "@nuxtjs/apollo",
  ],

  // Content module configuration
  content: {
    documentDriven: false,
    markdown: {
      mdc: true,
      remarkExternalLinks: {
        target: "_self",
        rel: "nofollow",
      },
      anchorLinks: {
        depth: 0,
        exclude: [1, 2, 3, 4, 5, 6],
      },
    },
  },

  // Apollo GraphQL configuration
  apollo: {
    clients: {
      default: {
        httpEndpoint: "https://researchhub.icjia-api.cloud/graphql",
      },
    },
  },
});
```

### Build and Deployment Configurations

**Package.json Scripts Configuration:**
```json
{
  "scripts": {
    "dev": "kill-port 8000 && yarn clear:cache && yarn scripts && nuxt dev --port=8000 -o",
    "build": "yarn clear:cache && yarn scripts && nuxt build",
    "generate": "yarn clear:cache && yarn scripts && nuxt generate",
    "scripts": "yarn create:contentDirectory && yarn create:pages && yarn create:publistPublications && yarn create:tabs && yarn create:faqs && yarn create:hub && yarn create:hubImages && yarn create:news && yarn create:mergedPublications && yarn create:searchIndex && yarn create:sitemap && yarn create:routes"
  }
}
```

**Netlify Configuration (netlify.toml):**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    X-Greeting = "Hello from Chicago!"
```

### SEO and Analytics Setup

**Meta Tag Configuration:**
```javascript
// In nuxt.config.js
app: {
  head: {
    title: "InfoNet",
    titleTemplate: "ICJIA | %s",
    meta: [
      {
        hid: "description",
        name: "description",
        content: "InfoNet",
      },
      {
        hid: "og-title",
        property: "og:title",
        content: "InfoNet",
      },
      {
        hid: "og-desc",
        property: "og:description",
        content: "InfoNet",
      },
      {
        hid: "og-image",
        property: "og:image",
        content: "https://infonet.icjia.dev/icjia-logo.png",
      },
    ],
  },
}
```

**Analytics Integration:**
```javascript
// Plausible Analytics script
{
  src: "https://plausible.icjia.cloud/js/script.js",
  "data-domain": "infonet.icjia.illinois.gov",
  defer: true,
}
```

**SEO Optimization:**
- **Sitemap Generation:** Automatic XML sitemap creation
- **Meta Tags:** Dynamic meta tag generation from content frontmatter
- **Structured Data:** JSON-LD structured data for rich snippets
- **Canonical URLs:** Proper canonical URL configuration
- **Open Graph:** Social media sharing optimization

## 12. Troubleshooting

### Common Issues and Solutions

**Platform-Specific Issues**

**Windows Users Attempting Native Development (Common Mistakes):**

❌ **Error:** `ENOENT: no such file or directory, scandir`
✅ **Solution:** Use WSL2, not native Windows. This error occurs because Windows file system operations differ from Unix systems.

❌ **Error:** `gyp ERR! stack Error: Can't find Python executable`
✅ **Solution:** Use WSL2 with proper Linux environment. Native Windows lacks the build tools required for native Node.js modules.

❌ **Error:** File watchers not working or extremely slow
✅ **Solution:** Use WSL2 file system (`/home/username/`) not Windows file system (`/mnt/c/`). Cross-filesystem watching is inefficient.

❌ **Error:** `EPERM: operation not permitted` on file operations
✅ **Solution:** Use WSL2 for proper Unix permissions. Windows permission model conflicts with Node.js expectations.

❌ **Error:** Build scripts failing with path resolution errors
✅ **Solution:** Use WSL2 for proper Unix path handling. Windows path separators cause issues in build scripts.

**WSL2-Specific Issues:**

🔧 **Performance Issues:**
- **Problem:** Slow file operations when project is on Windows filesystem
- **Solution:** Store projects in WSL2 file system (`/home/username/`) not Windows file system (`/mnt/c/`)

🔧 **VS Code Integration:**
- **Problem:** VS Code not recognizing WSL2 environment
- **Solution:** Install "Remote - WSL" extension and open project from within WSL2

🔧 **Memory Issues:**
- **Problem:** WSL2 consuming too much memory
- **Solution:** Configure WSL2 memory limits in `.wslconfig` file:
  ```ini
  [wsl2]
  memory=4GB
  processors=2
  ```

🔧 **Network Issues:**
- **Problem:** Cannot access development server from Windows browser
- **Solution:** Use WSL2 IP address or configure port forwarding

**General Development Issues**

**Build Failures:**
```bash
# Clear all caches and retry
yarn clear:cache
yarn install
yarn dev

# Check Node.js version
nvm use

# Verify environment variables
cat .env
```

**Development Server Issues:**
```bash
# Port already in use
yarn dev  # Automatically kills port 8000 and restarts

# Manual port killing
kill-port 8000
# or
lsof -ti:8000 | xargs kill -9
```

**Content Display Issues:**
- **Missing Content:** Run `yarn scripts` to regenerate content from APIs
- **Broken Images:** Check image paths and ensure images exist in `public/` directory
- **Search Not Working:** Regenerate search index with `yarn create:searchIndex`

**Deployment Issues:**
- **Build Failures on Netlify:** Check build logs for specific errors
- **404 Errors:** Verify routes are included in `NUXT_MANUAL_ROUTES`
- **Performance Issues:** Run Lighthouse audit and optimize assets

### Debug Strategies

**Development Debugging:**
```bash
# Enable verbose logging
DEBUG=nuxt:* yarn dev

# Check Nuxt DevTools
# Available at /_nuxt in development mode

# Inspect generated routes
cat src/appRoutes.json

# Check content generation
ls -la content/
```

**Build Process Debugging:**
```bash
# Debug individual creator scripts
node creators/createMarkdownNews.js
node creators/createSearchIndex.mjs

# Check generated data
cat src/searchIndex.json
cat public/sitemap.xml
```

**Browser Debugging:**
- **Console Errors:** Check browser developer tools console
- **Network Issues:** Monitor network tab for failed requests
- **Performance:** Use Lighthouse for performance analysis
- **Accessibility:** Use axe-core browser extension

### Performance Optimization Tips

**Build Performance:**
- **Parallel Processing:** Creator scripts run independently when possible
- **Incremental Builds:** Clear only necessary caches
- **Asset Optimization:** Optimize images before adding to repository

**Runtime Performance:**
- **Lazy Loading:** Use `Lazy` prefix for non-critical components
- **Image Optimization:** Use appropriate image formats and sizes
- **Bundle Analysis:** Use Nuxt DevTools to analyze bundle size
- **Caching:** Leverage browser and CDN caching

**Content Performance:**
- **Search Index Size:** Monitor search index size and optimize if needed
- **Content Chunking:** Break large content into smaller pages
- **API Response Caching:** Cache API responses during build process

### Maintenance Tasks and Schedules

**Daily Tasks:**
- Monitor build status and deployment success
- Check for console errors in production
- Review analytics for unusual traffic patterns

**Weekly Tasks:**
- Update content via `yarn scripts` if APIs have new data
- Review and merge pending pull requests
- Check for security vulnerabilities with `yarn audit`

**Monthly Tasks:**
- Update dependencies with `yarn upgrade`
- Review performance metrics and optimize if needed
- Backup important configuration and content

**Quarterly Tasks:**
- Review and update documentation
- Conduct security audit and penetration testing
- Evaluate new features and framework updates

**Emergency Procedures:**
1. **Site Down:** Check Netlify status and rollback if needed
2. **Build Failures:** Investigate logs and fix issues or rollback
3. **Content Issues:** Regenerate content or restore from backup
4. **Security Issues:** Immediately patch vulnerabilities and redeploy

## 13. Node.js Development Guide for New Developers

### Node.js Fundamentals and Ecosystem Overview

**What is Node.js?**
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine that allows you to run JavaScript on the server side. It's the foundation for modern web development tools and frameworks like Nuxt.js.

**Key Concepts:**
- **Runtime Environment:** Executes JavaScript outside of a browser
- **Event-Driven:** Non-blocking, asynchronous programming model
- **Package Manager:** npm/Yarn for managing dependencies
- **Module System:** CommonJS and ES Modules for code organization
- **Build Tools:** Webpack, Vite, and other bundlers for asset processing

**Node.js Ecosystem for This Project:**
- **Nuxt.js:** Vue.js framework for building web applications
- **Vue.js:** Progressive JavaScript framework for user interfaces
- **Yarn:** Package manager for dependency management
- **Vite:** Fast build tool and development server
- **TypeScript:** Typed superset of JavaScript (optional but recommended)

### Platform-Specific Setup Instructions

⚠️ **CRITICAL PLATFORM COMPATIBILITY WARNING** ⚠️

**Windows Users MUST Use WSL2 - Native Windows Development is NOT Supported**

**Why WSL2 is Required for Windows:**
- Native Windows lacks proper Unix-like file system operations
- Many Node.js packages have native dependencies that don't compile on Windows
- File watchers and build tools perform poorly on Windows file systems
- Path resolution and symlink handling differ significantly from Unix systems
- Cross-platform development tools expect Unix-like environments

#### **Windows with WSL2 Setup (MANDATORY for Windows Users)**

**Step 1: Install WSL2**
```powershell
# Run in PowerShell as Administrator
wsl --install

# Install Ubuntu distribution (recommended)
wsl --install -d Ubuntu

# Restart computer when prompted
```

**Step 2: Configure WSL2**
```bash
# Enter WSL2 environment
wsl

# Update package manager
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install build-essential curl git -y

# Install additional tools
sudo apt install wget unzip -y
```

**Step 3: Install Node.js in WSL2**
```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js (use project's version from .nvmrc)
nvm install node
nvm use node

# Install Yarn
npm install -g yarn
```

**Step 4: VS Code Integration**
```bash
# Install VS Code Remote-WSL extension
# Open VS Code and install "Remote - WSL" extension

# Open project in WSL2 from VS Code
# Use Ctrl+Shift+P → "Remote-WSL: New WSL Window"
```

**WSL2 Best Practices:**
- **File Location:** Store projects in WSL2 filesystem (`/home/username/`) NOT Windows filesystem (`/mnt/c/`)
- **Performance:** Use WSL2 terminal for all development commands
- **Memory Management:** Configure `.wslconfig` to limit memory usage
- **Backup:** Regularly backup WSL2 distributions

#### **macOS Setup (Fully Supported)**

**Step 1: Install Homebrew**
```bash
# Install Homebrew package manager
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Step 2: Install Development Tools**
```bash
# Install Git (if not already installed)
brew install git

# Install Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc  # or ~/.bash_profile

# Install Node.js and Yarn
nvm install node
npm install -g yarn
```

**macOS Advantages:**
- **Native Unix Environment:** Excellent compatibility with Node.js tools
- **Apple Silicon Performance:** M1/M2/M3/M4 processors offer superior performance
- **Developer Tools:** Excellent integration with development tools
- **No Compatibility Issues:** All Node.js packages work seamlessly

#### **Linux Setup (Fully Supported)**

**Debian/Ubuntu (Recommended):**
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install build-essential curl git -y

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js and Yarn
nvm install node
npm install -g yarn
```

**Other Distributions:**
- **Fedora/RHEL:** Use `dnf` package manager
- **Arch Linux:** Use `pacman` package manager
- **Note:** Other distributions may work but are not officially supported

### Essential Command Line Skills

**Basic Terminal Navigation:**
```bash
# Navigate directories
cd /path/to/directory    # Change directory
pwd                      # Print working directory
ls -la                   # List files with details
mkdir new-folder         # Create directory
rm -rf folder-name       # Remove directory (be careful!)

# File operations
cp source destination    # Copy files
mv source destination    # Move/rename files
cat filename            # Display file contents
nano filename           # Edit file (beginner-friendly editor)
```

**Git Version Control:**
```bash
# Basic Git commands
git clone <repository-url>    # Clone repository
git status                    # Check repository status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch-name   # Push to remote
git pull origin branch-name   # Pull from remote

# Branch management
git checkout -b new-branch    # Create and switch to new branch
git checkout branch-name      # Switch to existing branch
git merge branch-name         # Merge branch
```

**Node.js and Yarn Commands:**
```bash
# Node.js version management
nvm list                 # List installed Node.js versions
nvm use 18.17.0         # Use specific Node.js version
nvm use                 # Use version from .nvmrc file

# Package management
yarn install            # Install all dependencies
yarn add package-name   # Add new dependency
yarn remove package-name # Remove dependency
yarn upgrade            # Update all dependencies

# Project commands
yarn dev                # Start development server
yarn build              # Build for production
yarn test               # Run tests (if configured)
```

### Development Workflow Best Practices

**Daily Development Routine:**
1. **Start Development Session:**
   ```bash
   cd project-directory
   nvm use                    # Ensure correct Node.js version
   git pull origin develop    # Get latest changes
   yarn install              # Update dependencies if needed
   yarn dev                  # Start development server
   ```

2. **Making Changes:**
   ```bash
   git checkout -b feature/my-new-feature  # Create feature branch
   # Make your changes
   yarn lint                              # Check code style
   git add .                             # Stage changes
   git commit -m "feat: add new feature" # Commit with descriptive message
   ```

3. **End Development Session:**
   ```bash
   git push origin feature/my-new-feature  # Push changes
   # Create pull request on GitHub
   ```

**Code Quality Practices:**
- **Consistent Formatting:** Use Prettier and ESLint
- **Meaningful Commits:** Write descriptive commit messages
- **Small Changes:** Make small, focused commits
- **Testing:** Test changes thoroughly before committing
- **Documentation:** Update documentation when needed

### Project-Specific Quick Start Guide

**First-Time Setup:**
```bash
# 1. Clone the repository
git clone https://github.com/ICJIA/icjia-infonet-nuxt3.git
cd icjia-infonet-nuxt3

# 2. Use correct Node.js version
nvm use

# 3. Install dependencies
yarn install

# 4. Set up environment variables
cp .env.sample .env
# Edit .env file with appropriate values

# 5. Generate content and start development
yarn dev
```

**Understanding the Project Structure:**
- **`pages/`** - Define website routes (file-based routing)
- **`components/`** - Reusable Vue components
- **`content/`** - Markdown content files (generated from APIs)
- **`creators/`** - Scripts that fetch and transform external data
- **`assets/`** - Stylesheets and images processed by build tools
- **`public/`** - Static files served directly

**Common Development Tasks:**
```bash
# Update content from external APIs
yarn scripts

# Clear cache and restart (if experiencing issues)
yarn clear:cache && yarn dev

# Build for production
yarn generate

# Check for code style issues
yarn lint
```

### Useful Tools and Extensions

**VS Code Extensions (Recommended):**
- **Remote - WSL:** Essential for Windows WSL2 development
- **Vue Language Features (Volar):** Vue.js support
- **TypeScript Vue Plugin (Volar):** TypeScript support for Vue
- **ESLint:** Code linting and formatting
- **Prettier:** Code formatting
- **GitLens:** Enhanced Git integration
- **Auto Rename Tag:** Automatically rename paired HTML/XML tags
- **Bracket Pair Colorizer:** Color-code matching brackets

**Browser Developer Tools:**
- **Vue DevTools:** Browser extension for Vue.js debugging
- **Lighthouse:** Performance and accessibility auditing
- **axe DevTools:** Accessibility testing

**Command Line Tools:**
```bash
# Install useful global tools
npm install -g @vue/cli          # Vue CLI for Vue projects
npm install -g serve             # Simple static file server
npm install -g lighthouse        # Performance auditing
npm install -g npm-check-updates  # Check for dependency updates
```

**Learning Resources:**
- **Node.js Official Documentation:** https://nodejs.org/docs/
- **Vue.js Guide:** https://vuejs.org/guide/
- **Nuxt.js Documentation:** https://nuxt.com/docs
- **Yarn Documentation:** https://yarnpkg.com/getting-started
- **Git Tutorial:** https://git-scm.com/docs/gittutorial

**Getting Help:**
- **Project Issues:** Create GitHub issues for bugs or feature requests
- **Vue.js Community:** Vue.js Discord server and forums
- **Stack Overflow:** Tag questions with `vue.js`, `nuxt.js`, `node.js`
- **Documentation:** Always check official documentation first

**Next Steps for New Developers:**
1. **Complete the setup process** following this guide
2. **Explore the codebase** by examining existing components and pages
3. **Make a small change** to understand the development workflow
4. **Read the Vue.js and Nuxt.js documentation** to understand the frameworks
5. **Practice Git workflows** with feature branches and pull requests
6. **Ask questions** when you encounter issues or need clarification

This comprehensive guide should provide new developers with everything needed to successfully contribute to the ICJIA InfoNet Nuxt3 project while following modern web development best practices.
