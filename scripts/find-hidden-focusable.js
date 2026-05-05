/**
 * Diagnostic: emulate Siteimprove's "Hidden element has focusable content" rule.
 * Loads pages headlessly with Playwright, walks rendered DOM (after hydration),
 * and reports any element matching:
 *   - aria-hidden="true" OR has [hidden] OR display:none OR visibility:hidden
 * that contains a focusable descendant (a[href], button, input, select,
 * textarea, [tabindex]:not([tabindex="-1"])).
 */
const { chromium } = require("playwright");

const ROUTES = [
  "/",
  "/about",
  "/screenshots",
  "/resources",
  "/contact",
  "/privacy",
  "/partners",
  "/upgrades",
  "/faqs",
  "/agencies",
  "/data-and-publications",
  "/meetings",
  "/search",
  "/translate",
];

async function findOnPage(page) {
  return await page.evaluate(() => {
    const FOCUSABLE =
      'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

    function isHidden(el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute("aria-hidden") === "true") return "aria-hidden";
      if (el.hasAttribute("hidden")) return "hidden-attr";
      if (el.hasAttribute("inert")) return null; // inert is fine
      const cs = window.getComputedStyle(el);
      if (cs.display === "none") return "display:none";
      if (cs.visibility === "hidden") return "visibility:hidden";
      return null;
    }

    function isFocusable(el) {
      if (!el || el.nodeType !== 1) return false;
      // Don't count if any ancestor has inert
      let p = el;
      while (p) {
        if (p.hasAttribute && p.hasAttribute("inert")) return false;
        p = p.parentElement;
      }
      return el.matches(FOCUSABLE);
    }

    const hits = [];
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const h = isHidden(el);
      if (!h) continue;
      // Skip if any ancestor is also hidden (we want OUTERMOST hidden ancestor)
      let ancestor = el.parentElement;
      let outer = true;
      while (ancestor) {
        if (isHidden(ancestor)) { outer = false; break; }
        ancestor = ancestor.parentElement;
      }
      if (!outer) continue;
      // Find focusable descendants
      const focs = el.querySelectorAll(FOCUSABLE);
      const focList = [];
      for (const f of focs) {
        if (isFocusable(f)) focList.push(f.outerHTML.substring(0, 160));
      }
      if (focList.length === 0) continue;
      hits.push({
        reason: h,
        outerHidden: el.outerHTML.substring(0, 220),
        tag: el.tagName.toLowerCase(),
        cls: el.className?.toString?.()?.substring(0, 120) || "",
        id: el.id || "",
        focusableCount: focList.length,
        focusableSamples: focList.slice(0, 3),
      });
    }
    return hits;
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  // Silence console noise
  page.on("pageerror", () => {});
  page.on("console", () => {});

  const baseUrl = process.env.BASE_URL || "http://localhost:8000";

  console.log(`Diagnostic: hidden-with-focusable on ${baseUrl}\n`);

  const aggregate = {};
  for (const route of ROUTES) {
    const url = `${baseUrl}${route}`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
      await page.waitForTimeout(1200); // hydration settle
      const hits = await findOnPage(page);
      console.log(`${route}: ${hits.length} hit(s)`);
      hits.forEach((h, i) => {
        console.log(
          `  [${i + 1}] reason=${h.reason} <${h.tag}${h.id ? "#" + h.id : ""}${h.cls ? " class='" + h.cls + "'" : ""}>`
        );
        console.log(`      hidden el: ${h.outerHidden}`);
        h.focusableSamples.forEach((s, j) =>
          console.log(`      focusable[${j}]: ${s}`)
        );
        const key = `${h.reason}|${h.tag}|${h.cls}`;
        aggregate[key] = (aggregate[key] || 0) + 1;
      });
    } catch (e) {
      console.log(`${route}: ERROR ${e.message.substring(0, 100)}`);
    }
  }

  console.log("\n=== Aggregate (reason|tag|class -> count) ===");
  for (const [k, v] of Object.entries(aggregate).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${v}\t${k}`);
  }

  await browser.close();
})();
