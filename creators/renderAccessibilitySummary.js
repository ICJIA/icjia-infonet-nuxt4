/**
 * Accessibility Summary Renderer
 * Converts ACCESSIBILITY_COMPLETE_SUMMARY.md to HTML with styling
 * @module creators/renderAccessibilitySummary
 * @requires fs
 * @requires path
 * @requires markdown-it
 */

const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");

// Initialize markdown-it with options
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
});

// Paths
const sourceFile = path.join(__dirname, "../ACCESSIBILITY_COMPLETE_SUMMARY.md");
const outputDir = path.join(__dirname, "../public/documentation");
const outputFile = path.join(outputDir, "accessibility-summary.html");

console.log("📋 Rendering Accessibility Summary...");

try {
  // Read the markdown file
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Error: ${sourceFile} not found`);
    process.exit(1);
  }

  const markdownContent = fs.readFileSync(sourceFile, "utf8");
  console.log("✓ Markdown file read successfully");

  // Convert markdown to HTML
  const htmlContent = md.render(markdownContent);
  console.log("✓ Markdown converted to HTML");

  // Get file stats for last modified date
  const stats = fs.statSync(sourceFile);
  const lastModified = new Date(stats.mtime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create full HTML document with styling
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Summary - ICJIA InfoNet</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .header .subtitle {
      font-size: 1.1rem;
      opacity: 0.95;
      margin-top: 0.5rem;
    }

    .header .last-updated {
      margin-top: 1rem;
      font-size: 0.95rem;
      opacity: 0.9;
      font-style: italic;
    }

    .content {
      padding: 3rem 2rem;
    }

    h1 {
      color: #1e3a8a;
      font-size: 2.25rem;
      margin: 2rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 3px solid #3b82f6;
    }

    h2 {
      color: #1e40af;
      font-size: 1.875rem;
      margin: 2rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #60a5fa;
    }

    h3 {
      color: #1e40af;
      font-size: 1.5rem;
      margin: 1.5rem 0 0.75rem;
    }

    h4 {
      color: #2563eb;
      font-size: 1.25rem;
      margin: 1.25rem 0 0.5rem;
    }

    p {
      margin: 1rem 0;
      line-height: 1.8;
    }

    ul, ol {
      margin: 1rem 0 1rem 2rem;
      line-height: 1.8;
    }

    li {
      margin: 0.5rem 0;
    }

    code {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      color: #dc2626;
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.95em;
    }

    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      color: #475569;
      font-style: italic;
      background: #f8fafc;
      padding: 1rem 1.5rem;
      border-radius: 0 8px 8px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border: 1px solid #e2e8f0;
    }

    th {
      background: #1e3a8a;
      color: white;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    tr:hover {
      background: #f1f5f9;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s;
    }

    a:hover {
      color: #1e40af;
      border-bottom-color: #1e40af;
    }

    .back-link {
      display: inline-block;
      margin: 2rem 0;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border-radius: 6px;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-link:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border-bottom: none;
    }

    hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 2rem 0;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem 0.5rem;
      }

      .header h1 {
        font-size: 1.75rem;
      }

      .content {
        padding: 2rem 1.5rem;
      }

      h1 {
        font-size: 1.75rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      h3 {
        font-size: 1.25rem;
      }

      pre {
        padding: 1rem;
        font-size: 0.85rem;
      }

      table {
        font-size: 0.9rem;
      }

      th, td {
        padding: 0.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>♿ Accessibility Audit Summary</h1>
      <div class="subtitle">Complete Accessibility Fixes & Compliance Report</div>
      <div class="last-updated">Last Updated: ${lastModified}</div>
    </div>
    <div class="content">
      <a href="/documentation/" class="back-link">← Back to Documentation Portal</a>
      ${htmlContent}
      <hr>
      <a href="/documentation/" class="back-link">← Back to Documentation Portal</a>
    </div>
  </div>
</body>
</html>`;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the HTML file
  fs.writeFileSync(outputFile, fullHtml, "utf8");
  console.log(`✓ HTML file created: ${outputFile}`);
  console.log(`✓ Last modified: ${lastModified}`);
  console.log("✅ Accessibility summary rendered successfully!");
} catch (error) {
  console.error("❌ Error rendering accessibility summary:", error);
  process.exit(1);
}

