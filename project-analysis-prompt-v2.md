This prompt extracts comprehensive information from legacy projects to create technical documentation for new developers. If the AI can't index all files, use GitHub's 'Open in Gitingest' button to create a text representation of the codebase.

Analyze the codebase and generate a detailed technical overview for new developers. Begin with the GitHub repository URL, noting this is the primary repository.

Structure the analysis with these sections, prioritizing depth for sections 3-7 and 10:

1. **Project Overview**: Name, purpose, core technologies with versions, architecture type, deployment platform/strategy.

2. **Technical Stack Analysis**: Frontend framework, content management approach, build tools, third-party integrations, state management, styling methodology, dependency management (emphasize cautious updates).

3. **Version Compatibility Matrix**: Key dependencies and their compatible versions, strict version requirements.

4. **Project Structure**: Directory map, configuration files, content organization, asset management, routing system.

5. **Build and Development**: Environment setup, comprehensive scripts reference, build process, content generation workflow, deployment pipeline, environment variables management.

6. **Key Features**: CMS integration, dynamic routing, SEO strategies, analytics, performance optimizations, internationalization.

7. **Data Flow & Component Architecture**: API integration patterns, content fetching, data transformation, caching, component relationships and communication patterns.

8. **Development Patterns**: Component organization, code reuse strategies, testing approach, error handling, performance considerations.

9. **Infrastructure & Security**: Hosting details, API endpoints, environment variables, security measures, caching strategies, monitoring.

10. **Getting Started & Troubleshooting**: Required dependencies, environment setup, first-time build, common tasks, error solutions.

11. **Legacy 'Gotchas'**: Content generation dependencies, environment configuration, build process complexity, framework-specific quirks.

12. **Technical Debt & Upgrade Paths**: Categorized technical debt with severity levels, potential upgrade paths with risk assessment.

Include specific file paths and code examples where helpful. Note any deviations from standard practices.