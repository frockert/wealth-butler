// Usage: node scripts/screenshot.js <url> <outputPath> [clickSelector] [waitSelector]
import { chromium } from 'playwright';

const [, , url, outputPath, clickSelector, waitSelector] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto(url, { waitUntil: 'networkidle' });

if (clickSelector) {
  await page.click(clickSelector);
  await page.waitForTimeout(800);
}

if (waitSelector) {
  await page.waitForSelector(waitSelector, { timeout: 5000 });
}

await page.screenshot({ path: outputPath, fullPage: false });
await browser.close();
console.log(`Screenshot saved: ${outputPath}`);
