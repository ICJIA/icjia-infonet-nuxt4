/**
 * JSDoc Documentation Generator
 * Generates API documentation from JSDoc comments in the codebase
 * @module creators/generateJsdoc
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const jsdocDir = path.join(__dirname, "../public/documentation/jsdoc");

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║          GENERATING JSDOC API DOCUMENTATION                    ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

try {
  // Check if jsdoc.config.json exists
  const configPath = path.join(__dirname, "../jsdoc.config.json");
  if (!fs.existsSync(configPath)) {
    console.error("❌ Error: jsdoc.config.json not found");
    process.exit(1);
  }
  console.log("✓ JSDoc configuration found");

  // Clean previous documentation
  if (fs.existsSync(jsdocDir)) {
    console.log("✓ Cleaning previous documentation...");
    fs.rmSync(jsdocDir, { recursive: true, force: true });
  }

  // Generate JSDoc
  console.log("✓ Generating JSDoc documentation...");
  execSync("jsdoc -c jsdoc.config.json", {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });

  // Verify output
  if (fs.existsSync(jsdocDir)) {
    const files = fs.readdirSync(jsdocDir);
    const htmlFiles = files.filter((f) => f.endsWith(".html"));
    console.log(`\n✓ Generated ${htmlFiles.length} HTML documentation pages`);
    console.log(`✓ Documentation output: public/documentation/jsdoc/`);
  } else {
    console.error("❌ Error: Documentation directory not created");
    process.exit(1);
  }

  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║          JSDOC GENERATION COMPLETE ✓                          ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
} catch (error) {
  console.error("\n❌ JSDoc generation failed:");
  console.error(error.message);
  process.exit(1);
}

