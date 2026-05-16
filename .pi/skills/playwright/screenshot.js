#!/usr/bin/env node
const { chromium } = require("playwright");
const path = require("node:path");
const os = require("node:os");

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error("Usage: ./screenshot.js <url>");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const filePath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Screenshot saved to: ${filePath}`);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await browser.close();
  }
}

main();
