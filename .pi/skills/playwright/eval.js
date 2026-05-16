#!/usr/bin/env node
const { chromium } = require("playwright");

async function main() {
  const url = process.argv[2];
  let script = process.argv[3];

  if (!url || !script) {
    console.error("Usage: ./eval.js <url> <script>");
    process.exit(1);
  }

  // Basic check to see if script contains return statement, if not wrap it
  if (!script.includes("return") && !script.includes(";")) {
    script = `return ${script};`;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const result = await page.evaluate(new Function(script));
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await browser.close();
  }
}

main();
