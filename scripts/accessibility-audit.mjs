import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.AUDIT_BASE_URL || "http://localhost:8000";
const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "public",
  "documentation",
  "accessibility-reports"
);
const ROUTES_FILE = path.join(__dirname, "..", "app", "data", "appRoutes.json");

// Severity levels for sorting
const SEVERITY_ORDER = {
  critical: 1,
  serious: 2,
  moderate: 3,
  minor: 4,
};

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Escape HTML special characters for safe display
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Load all routes from the appRoutes.json file
 */
async function loadRoutes() {
  try {
    const routes = await fs.readJson(ROUTES_FILE);
    console.log(
      `${colors.cyan}📋 Loaded ${routes.length} routes from appRoutes.json${colors.reset}`
    );
    return routes;
  } catch (error) {
    console.error(
      `${colors.red}❌ Error loading routes:${colors.reset}`,
      error.message
    );
    throw error;
  }
}

/**
 * Run axe accessibility audit on a single page
 */
async function auditPage(page, url, route) {
  try {
    console.log(`${colors.blue}🔍 Auditing: ${route}${colors.reset}`);

    // Navigate to the page
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    if (!response || !response.ok()) {
      console.log(
        `${colors.yellow}⚠️  Warning: ${route} returned status ${
          response?.status() || "unknown"
        }${colors.reset}`
      );
    }

    // Wait for dynamic content and CSS to fully load
    // Increased to 2 seconds to ensure Vuetify theme styles are applied
    await page.waitForTimeout(2000);

    // Run axe accessibility scan with HTML snippets included
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .options({
        resultTypes: ["violations", "incomplete", "passes"],
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
        },
        // Ensure HTML snippets are included in results
        elementRef: true,
        selectors: true,
        ancestry: true,
        xpath: false,
      })
      .analyze();

    return {
      route,
      url,
      timestamp: new Date().toISOString(),
      violations: results.violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    };
  } catch (error) {
    console.error(
      `${colors.red}❌ Error auditing ${route}:${colors.reset}`,
      error.message
    );
    return {
      route,
      url,
      timestamp: new Date().toISOString(),
      error: error.message,
      violations: [],
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
    };
  }
}

/**
 * Generate summary statistics from all audit results
 */
function generateSummary(results) {
  const summary = {
    totalPages: results.length,
    totalViolations: 0,
    bySeverity: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
    byPage: [],
    topIssues: {},
  };

  results.forEach((result) => {
    if (result.error) return;

    const pageViolations = result.violations.length;
    summary.totalViolations += pageViolations;

    // Count by severity
    result.violations.forEach((violation) => {
      summary.bySeverity[violation.impact] =
        (summary.bySeverity[violation.impact] || 0) + 1;

      // Track top issues
      if (!summary.topIssues[violation.id]) {
        summary.topIssues[violation.id] = {
          id: violation.id,
          description: violation.description,
          impact: violation.impact,
          count: 0,
          pages: [],
        };
      }
      summary.topIssues[violation.id].count += violation.nodes.length;
      summary.topIssues[violation.id].pages.push(result.route);
    });

    // Track violations per page
    if (pageViolations > 0) {
      summary.byPage.push({
        route: result.route,
        violations: pageViolations,
        critical: result.violations.filter((v) => v.impact === "critical")
          .length,
        serious: result.violations.filter((v) => v.impact === "serious").length,
        moderate: result.violations.filter((v) => v.impact === "moderate")
          .length,
        minor: result.violations.filter((v) => v.impact === "minor").length,
      });
    }
  });

  // Sort pages by total violations
  summary.byPage.sort((a, b) => b.violations - a.violations);

  // Convert topIssues to array and sort by count
  summary.topIssues = Object.values(summary.topIssues).sort(
    (a, b) => b.count - a.count
  );

  return summary;
}

/**
 * Generate HTML report
 */
async function generateHTMLReport(results, summary, outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; margin-bottom: 10px; font-size: 2.5em; }
    h2 { color: #34495e; margin: 30px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #3498db; }
    h3 { color: #555; margin: 20px 0 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card.critical { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-card.serious { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .stat-card.moderate { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; }
    .stat-card.minor { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }
    .stat-number { font-size: 3em; font-weight: bold; }
    .stat-label { font-size: 0.9em; opacity: 0.9; margin-top: 5px; }
    .violation { background: #fff; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .violation.critical { border-left-color: #c0392b; background: #fef5f5; }
    .violation.serious { border-left-color: #e67e22; background: #fef9f5; }
    .violation.moderate { border-left-color: #f39c12; background: #fffbf5; }
    .violation.minor { border-left-color: #3498db; background: #f5f9ff; }
    .violation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .violation-title { font-weight: bold; color: #2c3e50; font-size: 1.1em; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: bold; text-transform: uppercase; }
    .badge.critical { background: #c0392b; color: white; }
    .badge.serious { background: #e67e22; color: white; }
    .badge.moderate { background: #f39c12; color: white; }
    .badge.minor { background: #3498db; color: white; }
    .violation-description { color: #555; margin: 10px 0; }
    .violation-help { color: #7f8c8d; font-size: 0.9em; margin: 10px 0; }
    .violation-help a { color: #3498db; text-decoration: none; }
    .violation-help a:hover { text-decoration: underline; }
    .nodes { margin-top: 15px; }
    .node { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.85em; }
    .node-target { color: #e74c3c; font-weight: bold; }
    .node-html {
      margin-top: 8px;
      padding: 10px;
      background: #2d2d2d;
      color: #f8f8f2;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .node-html-label {
      color: #95a5a6;
      font-size: 0.9em;
      margin-bottom: 5px;
      display: block;
    }
    .page-section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .page-title { font-size: 1.3em; color: #2c3e50; margin-bottom: 15px; }
    .no-violations { color: #27ae60; font-weight: bold; padding: 20px; text-align: center; background: #eafaf1; border-radius: 8px; }
    .timestamp { color: #7f8c8d; font-size: 0.9em; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #34495e; color: white; font-weight: bold; }
    tr:hover { background: #f5f5f5; }
    .top-issues { margin: 20px 0; }
    .issue-item { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Audit Report</h1>
    <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
    
    <h2>📊 Summary</h2>
    <div class="summary">
      <div class="stat-card">
        <div class="stat-number">${summary.totalPages}</div>
        <div class="stat-label">Pages Audited</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-number">${summary.bySeverity.critical || 0}</div>
        <div class="stat-label">Critical Issues</div>
      </div>
      <div class="stat-card serious">
        <div class="stat-number">${summary.bySeverity.serious || 0}</div>
        <div class="stat-label">Serious Issues</div>
      </div>
      <div class="stat-card moderate">
        <div class="stat-number">${summary.bySeverity.moderate || 0}</div>
        <div class="stat-label">Moderate Issues</div>
      </div>
      <div class="stat-card minor">
        <div class="stat-number">${summary.bySeverity.minor || 0}</div>
        <div class="stat-label">Minor Issues</div>
      </div>
    </div>
    
    ${
      summary.byPage.length > 0
        ? `
    <h2>📄 Pages with Most Issues</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Total</th>
          <th>Critical</th>
          <th>Serious</th>
          <th>Moderate</th>
          <th>Minor</th>
        </tr>
      </thead>
      <tbody>
        ${summary.byPage
          .slice(0, 20)
          .map(
            (page) => `
          <tr>
            <td><strong>${page.route}</strong></td>
            <td><strong>${page.violations}</strong></td>
            <td>${page.critical}</td>
            <td>${page.serious}</td>
            <td>${page.moderate}</td>
            <td>${page.minor}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    `
        : ""
    }
    
    ${
      summary.topIssues.length > 0
        ? `
    <h2>🔝 Top Issues Across All Pages</h2>
    <div class="top-issues">
      ${summary.topIssues
        .slice(0, 10)
        .map(
          (issue) => `
        <div class="issue-item">
          <div class="violation-header">
            <span class="violation-title">${issue.id}</span>
            <span class="badge ${issue.impact}">${issue.impact}</span>
          </div>
          <div class="violation-description">${issue.description}</div>
          <div style="margin-top: 10px; color: #7f8c8d;">
            <strong>Occurrences:</strong> ${issue.count} | 
            <strong>Affected pages:</strong> ${[...new Set(issue.pages)].length}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    `
        : ""
    }
    
    <h2>📋 Detailed Results by Page</h2>
    ${results
      .map((result) => {
        if (result.error) {
          return `
          <div class="page-section">
            <div class="page-title">❌ ${result.route}</div>
            <div style="color: #e74c3c;">Error: ${result.error}</div>
          </div>
        `;
        }

        if (result.violations.length === 0) {
          return `
          <div class="page-section">
            <div class="page-title">✅ ${result.route}</div>
            <div class="no-violations">No accessibility violations found!</div>
          </div>
        `;
        }

        // Sort violations by severity
        const sortedViolations = [...result.violations].sort(
          (a, b) => SEVERITY_ORDER[a.impact] - SEVERITY_ORDER[b.impact]
        );

        return `
        <div class="page-section">
          <div class="page-title">${result.route} (${
          result.violations.length
        } issue${result.violations.length !== 1 ? "s" : ""})</div>
          ${sortedViolations
            .map(
              (violation) => `
            <div class="violation ${violation.impact}">
              <div class="violation-header">
                <span class="violation-title">${violation.id}</span>
                <span class="badge ${violation.impact}">${
                violation.impact
              }</span>
              </div>
              <div class="violation-description">${violation.description}</div>
              <div class="violation-help">
                <strong>How to fix:</strong> ${violation.help}
                ${
                  violation.helpUrl
                    ? ` | <a href="${violation.helpUrl}" target="_blank">Learn more</a>`
                    : ""
                }
              </div>
              <div class="nodes">
                <strong>Affected elements (${violation.nodes.length}):</strong>
                ${violation.nodes
                  .slice(0, 5)
                  .map(
                    (node) => `
                  <div class="node">
                    <div class="node-target">Target: ${node.target.join(
                      ", "
                    )}</div>
                    ${
                      node.html
                        ? `<div class="node-html-label">HTML:</div>
                           <div class="node-html">${escapeHtml(
                             node.html
                           )}</div>`
                        : '<div style="margin-top: 5px; color: #95a5a6; font-style: italic;">HTML snippet not available</div>'
                    }
                  </div>
                `
                  )
                  .join("")}
                ${
                  violation.nodes.length > 5
                    ? `<div style="margin-top: 10px; color: #7f8c8d;">... and ${
                        violation.nodes.length - 5
                      } more</div>`
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      })
      .join("")}
  </div>
</body>
</html>`;

  await fs.writeFile(outputPath, html, "utf-8");
}

/**
 * Print summary to console
 */
function printSummary(summary) {
  console.log("\n" + "=".repeat(80));
  console.log(
    `${colors.bright}${colors.cyan}📊 ACCESSIBILITY AUDIT SUMMARY${colors.reset}`
  );
  console.log("=".repeat(80) + "\n");

  console.log(
    `${colors.bright}Total Pages Audited:${colors.reset} ${summary.totalPages}`
  );
  console.log(
    `${colors.bright}Total Violations:${colors.reset} ${summary.totalViolations}\n`
  );

  console.log(`${colors.bright}Violations by Severity:${colors.reset}`);
  console.log(
    `  ${colors.red}🔴 Critical:${colors.reset}  ${
      summary.bySeverity.critical || 0
    }`
  );
  console.log(
    `  ${colors.yellow}🟠 Serious:${colors.reset}   ${
      summary.bySeverity.serious || 0
    }`
  );
  console.log(
    `  ${colors.yellow}🟡 Moderate:${colors.reset}  ${
      summary.bySeverity.moderate || 0
    }`
  );
  console.log(
    `  ${colors.blue}🔵 Minor:${colors.reset}     ${
      summary.bySeverity.minor || 0
    }\n`
  );

  if (summary.byPage.length > 0) {
    console.log(
      `${colors.bright}Top 10 Pages with Most Issues:${colors.reset}`
    );
    summary.byPage.slice(0, 10).forEach((page, index) => {
      console.log(
        `  ${index + 1}. ${page.route} - ${colors.red}${
          page.violations
        } issues${colors.reset} (C:${page.critical} S:${page.serious} M:${
          page.moderate
        } m:${page.minor})`
      );
    });
    console.log("");
  }

  if (summary.topIssues.length > 0) {
    console.log(`${colors.bright}Top 5 Most Common Issues:${colors.reset}`);
    summary.topIssues.slice(0, 5).forEach((issue, index) => {
      const impactColor =
        issue.impact === "critical"
          ? colors.red
          : issue.impact === "serious"
          ? colors.yellow
          : issue.impact === "moderate"
          ? colors.yellow
          : colors.blue;
      console.log(
        `  ${index + 1}. ${impactColor}[${issue.impact.toUpperCase()}]${
          colors.reset
        } ${issue.id}`
      );
      console.log(`     ${issue.description}`);
      console.log(
        `     ${colors.cyan}${issue.count} occurrences across ${
          [...new Set(issue.pages)].length
        } pages${colors.reset}\n`
      );
    });
  }

  console.log("=".repeat(80) + "\n");
}

/**
 * Main audit function
 */
async function runAudit() {
  console.log(
    `${colors.bright}${colors.magenta}🚀 Starting Accessibility Audit${colors.reset}\n`
  );

  // Ensure output directory exists
  await fs.ensureDir(OUTPUT_DIR);

  // Load routes
  const routes = await loadRoutes();

  // Launch browser
  console.log(`${colors.cyan}🌐 Launching browser...${colors.reset}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Run audits
  const results = [];
  let completed = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    const result = await auditPage(page, url, route);
    results.push(result);

    completed++;
    const progress = ((completed / routes.length) * 100).toFixed(1);
    console.log(
      `${colors.green}✓${colors.reset} Progress: ${completed}/${routes.length} (${progress}%)`
    );
  }

  // Close browser
  await browser.close();
  console.log(`${colors.cyan}🔒 Browser closed${colors.reset}\n`);

  // Generate summary
  const summary = generateSummary(results);

  // Save JSON report
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(
    OUTPUT_DIR,
    `accessibility-report-${timestamp}.json`
  );
  const htmlPath = path.join(
    OUTPUT_DIR,
    `accessibility-report-${timestamp}.html`
  );
  const latestJsonPath = path.join(
    OUTPUT_DIR,
    "accessibility-report-latest.json"
  );
  const latestHtmlPath = path.join(
    OUTPUT_DIR,
    "accessibility-report-latest.html"
  );

  await fs.writeJson(jsonPath, { summary, results }, { spaces: 2 });
  await fs.writeJson(latestJsonPath, { summary, results }, { spaces: 2 });
  console.log(`${colors.green}✓ JSON report saved:${colors.reset} ${jsonPath}`);

  // Generate and save HTML report
  await generateHTMLReport(results, summary, htmlPath);
  await generateHTMLReport(results, summary, latestHtmlPath);
  console.log(`${colors.green}✓ HTML report saved:${colors.reset} ${htmlPath}`);

  // Print summary to console
  printSummary(summary);

  console.log(
    `${colors.bright}${colors.green}✅ Audit complete!${colors.reset}`
  );
  console.log(
    `${colors.cyan}📁 Reports saved to: ${OUTPUT_DIR}${colors.reset}\n`
  );

  // Exit with error code if critical or serious issues found
  if (summary.bySeverity.critical > 0 || summary.bySeverity.serious > 0) {
    process.exit(1);
  }
}

// Run the audit
runAudit().catch((error) => {
  console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
  process.exit(1);
});
