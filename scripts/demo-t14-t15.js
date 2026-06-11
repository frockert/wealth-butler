// Demo script for T14-T15 validation screenshots
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.demo/screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

// Clear localStorage for clean goals demo
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  localStorage.removeItem('wb-goal-config');
  localStorage.removeItem('wb-liabilities');
});

// T14: Assets page with holdings
await page.click('button:has-text("Assets")');
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/t14-assets-page.png` });
console.log('Saved t14-assets-page.png');

// T14: + Asset modal — Connect broker tab
await page.click('button:has-text("Asset")');
await page.waitForSelector('[aria-labelledby="add-asset-title"]');
await page.screenshot({ path: `${OUT}/t14-modal-connect.png` });
console.log('Saved t14-modal-connect.png');

// T14: Upload CSV tab
await page.click('button:has-text("Upload CSV")');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/t14-modal-csv.png` });
console.log('Saved t14-modal-csv.png');

// T14: Manual asset tab
await page.click('button:has-text("Add manual asset")');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/t14-modal-manual.png` });
console.log('Saved t14-modal-manual.png');
await page.click('button[aria-label="Close"]');

// T14: Add liability
await page.fill('#liability-name', 'Home loan');
await page.selectOption('#liability-type', 'Mortgage');
await page.fill('#liability-value', '500000');
await page.press('#liability-value', 'Enter');
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/t14-liabilities.png` });
console.log('Saved t14-liabilities.png');

// T14: DebtsCard reflects liability — navigate to Dashboard
await page.click('button:has-text("Dashboard")');
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/t14-debts-on-dashboard.png` });
console.log('Saved t14-debts-on-dashboard.png');

// T15: Goals setup flow step 1
await page.click('button:has-text("Goals")');
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/t15-goals-step1.png` });
console.log('Saved t15-goals-step1.png');

// T15: Complete setup flow (manual calc — no API key)
await page.fill('input[type="number"]', '2000000');
await page.click('button:has-text("Next")');
await page.fill('input[type="number"]', '2040');
await page.click('button:has-text("Next")');
await page.fill('input[type="number"]', '60000');
await page.click('button:has-text("Calculate my FIRE plan")');
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/t15-goals-config.png` });
console.log('Saved t15-goals-config.png');

// T15: GoalProgressCard on Dashboard updates
await page.click('button:has-text("Dashboard")');
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/t15-goal-progress-card.png` });
console.log('Saved t15-goal-progress-card.png');

await browser.close();
console.log('Demo complete');
