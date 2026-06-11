---
name: live-agent-demo
description: Runs the application and executes a feature end-to-end as a live demo — real terminal output, Playwright screenshots, step-by-step narration. Call this from the validate skill after the code quality check.
---

# Live Agent Demo

The agent runs the application and executes the feature end-to-end, narrating each step as if demoing to a stakeholder. This is not a description of what *should* happen — it is proof of what *does* happen, captured with real terminal output and screenshots.

---

## Step 1: Ensure App is Running

```bash
lsof -i :5173 || npm run dev &
sleep 3
```

If the app fails to start, STOP and log the error. Do not proceed.

---

## Step 2: Setup Playwright

If not already installed:

```bash
npm install --save-dev playwright
npx playwright install chromium --with-deps
```

Create `scripts/screenshot.js` if it doesn't exist:

```js
// scripts/screenshot.js
// Usage: node scripts/screenshot.js <url> <outputPath> [clickSelector] [waitSelector]
import { chromium } from 'playwright';

const [,, url, outputPath, clickSelector, waitSelector] = process.argv;

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
```

```bash
mkdir -p .demo/screenshots
```

---

## Step 3: Run the Demo

For each step, follow this template exactly:

```
---
🎬 Demo Step [N]: [Step title]

Purpose: [What this proves — reference acceptance criterion if possible]

Input:
  Action: [navigate / click / type / submit / API call]
  Target: [URL / selector / endpoint]
  Data: [payload or form values, if any]

Terminal output:
  $ [command run]
  [exact stdout/stderr — never paraphrased]

Screenshot:
  $ node scripts/screenshot.js http://localhost:5173/[path] .demo/screenshots/step-[N]-[slug].png [clickSelector?] [waitSelector?]

Narration:
  ✅ [What the screenshot confirms is working]
  ⚠️  [Anything unexpected or worth noting]
---
```

**Minimum coverage required:**

- [ ] Happy path: feature works end-to-end with valid input
- [ ] Key UI state: loading, empty, or success state visible to the user
- [ ] One edge/error case: invalid input, empty data, or error boundary

---

## Step 4: Failure Protocol

If any step fails:

1. Log the failure verbatim
2. Classify severity: **Blocker** / **Major** / **Minor** / **Cosmetic**
3. Return to validate — create a fix task via Section: Generate Fix Plans
4. Do NOT mark the feature validated until Blocker and Major issues are resolved

---

## Step 5: Demo Report Block

Append this to the Validation Report:

```markdown
## Live Demo Results

| Step | Title        | Screenshot                          | Result  | Notes            |
| ---- | ------------ | ----------------------------------- | ------- | ---------------- |
| 1    | [Step title] | .demo/screenshots/step-1-[slug].png | ✅ Pass | -                |
| 2    | [Step title] | .demo/screenshots/step-2-[slug].png | ❌ Fail | [What was wrong] |

**Demo verdict**: ✅ Demoed successfully | ⚠️ Issues found — see Fix Plans
```