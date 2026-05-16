______________________________________________________________________

## name: playwright description: Web automation, scraping, and visual testing via Playwright. Use to evaluate JavaScript on web pages, automate interactions, or take full-page screenshots in a headless browser.

# Playwright Skill

Headless browser automation via Playwright.

## Setup

Run once before first use:

```bash
cd .pi/skills/playwright
npm install
npx playwright install chromium
```

## Evaluate JavaScript

```bash
.pi/skills/playwright/eval.js "https://example.com" "document.title"
```

Evaluates a JavaScript snippet on the page after it loads, returning the result
as JSON. Note: Code runs in the browser context.

## Take Screenshot

```bash
.pi/skills/playwright/screenshot.js "https://example.com"
```

Captures a full-page screenshot of the provided URL and prints the file path.
Use this to visually verify UI.

## Writing Custom Scripts

For more complex scenarios (like logging in, clicking buttons, waiting for
elements, extracting data after interactions), write a temporary Node.js script
in the workspace using the `playwright` library.

Example `test.js`:

```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // Interact with elements
  // await page.click('button#submit');
  const title = await page.title();
  console.log(title);
  await browser.close();
})();
```

Then run it:

```bash
node test.js
```
