# Feature: MVP Dashboard

> **Iteration 1** | **Size: Large** | **Priority: P1**

---

## Problem Statement

The investor currently tracks IBKR (business + personal) and Coinspot holdings across two separate platforms and a manual spreadsheet that quickly falls out of date. There is no single view of combined net worth, no allocation breakdown, and no way to answer "where do I stand?" without opening multiple apps. This feature replaces the spreadsheet with a live, single-screen dashboard.

---

## Goals

| Goal | Measure of Success |
|------|--------------------|
| Combined AUD net worth visible | Displayed within 5s of sync completing |
| All holdings in one table | Every IBKR + Coinspot position shown, no manual cross-referencing |
| Allocation at a glance | Sector breakdown visible without leaving the dashboard |
| Replace spreadsheet | Investor stops opening the spreadsheet for daily portfolio checks |

---

## Out of Scope

| Item | Reason / Deferred To |
|------|----------------------|
| Manual asset entry (cash, super, property) | Iteration 2 |
| CSV import | Iteration 2 |
| FIRE goal progress card | Iteration 3 |
| Allocation rule alerts (200 DMA, concentration) | Iteration 4 |
| Mobile / responsive layout | Post-MVP |
| Authentication / login screen | Iteration 6+ |
| Historical net worth chart | Post-MVP |

---

## User Stories

### US-01 — View Combined Net Worth `[P1]`

> As a self-directed investor, I want to see my total wealth in AUD across all connected accounts in a single prominent card, so that I instantly know my overall financial position when I open the app.

**Why P1:** Core reason to open the app at all. Without this, the dashboard has no value.

**Acceptance Criteria:**
- WHEN the dashboard loads AND portfolio data exists THEN the net worth card SHALL display a single AUD total combining IBKR business + IBKR personal + Coinspot
- WHEN the dashboard loads AND portfolio data exists THEN the net worth card SHALL be visible above the fold on a 1280px wide screen without scrolling
- WHEN portfolio data is loading THEN the net worth card SHALL display a loading skeleton instead of an empty state

**Test:** Load the app after a sync. Confirm the displayed total equals the sum of all `valueAUD` fields from the API response.

---

### US-02 — View All Holdings in a Table `[P1]`

> As a self-directed investor, I want to see every position across IBKR and Coinspot in a single table, so that I can review individual holdings without switching between platforms.

**Why P1:** Second core reason to open the app. Required for the spreadsheet replacement exit criterion.

**Acceptance Criteria:**
- WHEN the dashboard loads AND holdings exist THEN the holdings table SHALL display every position across IBKR (business + personal) and Coinspot
- WHEN the holdings table renders THEN each row SHALL show: ticker/coin, exchange, quantity, current price (AUD), total value (AUD), and allocation %
- WHEN the holdings table first renders THEN rows SHALL be sorted by value (AUD) descending by default
- WHEN holdings are loading THEN the table SHALL show skeleton rows instead of an empty table

**Test:** Sync the portfolio. Confirm every IBKR position and every non-zero Coinspot balance appears as a distinct table row, and the first row has the highest `valueAUD`.

---

### US-03 — Sync Portfolio Data `[P1]`

> As a self-directed investor, I want to trigger a full data refresh with a single click, so that I always know how current my view is and can pull the latest prices on demand.

**Why P1:** Without sync, the dashboard shows stale data. Required for the "live" aspect of the tool.

**Acceptance Criteria:**
- WHEN I click the Sync button THEN the app SHALL call POST /api/sync and re-fetch all data
- WHEN a sync is in progress THEN the Sync button SHALL show a spinner and be disabled
- WHEN a sync completes successfully THEN the last-updated timestamp SHALL update to the current UTC time
- WHEN a sync fails THEN the Sync button SHALL return to its default state and an error banner SHALL appear

**Test:** Click Sync. Confirm the button shows a spinner during the request and the timestamp changes to the current time after success.

---

### US-04 — View Sector Allocation Chart `[P2]`

> As a self-directed investor, I want to see my portfolio broken down by sector in a pie chart, so that I can spot concentration risks at a glance without calculating percentages manually.

**Why P2:** High value for portfolio review, but the holdings table alone satisfies the spreadsheet-replacement goal. Chart is additive.

**Acceptance Criteria:**
- WHEN the dashboard loads AND holdings exist THEN the allocation chart SHALL display one slice per sector
- WHEN the allocation chart renders THEN each slice SHALL show the sector name and its percentage of total portfolio value
- WHEN the user hovers a slice THEN a tooltip SHALL show the exact AUD value for that sector
- WHEN a holding has no sector data THEN it SHALL be grouped under "Other"

**Test:** Sync portfolio. Confirm pie chart renders, slice percentages sum to 100%, and hovering a slice shows an AUD value matching the sum of `valueAUD` for holdings in that sector.

---

### US-05 — View AI Market Summary `[P2]`

> As a self-directed investor, I want to see a brief AI-generated market update relevant to my actual holdings, so that I can stay informed about market context without leaving the app.

**Why P2:** Valuable for the weekly review workflow, but not required for the spreadsheet replacement exit criterion.

**Acceptance Criteria:**
- WHEN the dashboard loads AND an AI summary is available THEN the market summary card SHALL display a 2–3 sentence market update
- WHEN no AI summary exists yet (before first sync or during load) THEN the card SHALL show a loading skeleton — never an empty or missing card
- WHEN ANTHROPIC_API_KEY is not configured THEN the card SHALL show a "AI summary unavailable" message

**Test:** After a sync with a valid API key, confirm the summary card shows non-empty text. Remove the key and re-sync — confirm the card shows the unavailable message.

---

## Edge Cases

| Scenario | Expected Behaviour |
|----------|--------------------|
| First load before any sync | Empty state card with "Sync to load your portfolio" CTA — no broken layout |
| Sync fails completely | Error banner shown; last known data preserved in UI; timestamp NOT updated |
| One source fails (e.g. IBKR offline) | Partial data displayed; warning badge next to the affected source name |
| All holdings have same sector | Single-slice pie chart renders without error |
| Holdings with missing sector | Grouped under "Other" automatically |
| Net worth is zero | Card shows "A$0.00" — not blank or broken |

---

## Requirement Traceability

| ID | Requirement | User Story | Priority |
|----|-------------|------------|----------|
| FEAT-01 | Combined AUD net worth card | US-01 | P1 |
| FEAT-02 | Loading skeleton on net worth card | US-01 | P1 |
| FEAT-03 | Holdings table with all positions | US-02 | P1 |
| FEAT-04 | Holdings table columns: ticker, exchange, qty, price, valueAUD, allocation% | US-02 | P1 |
| FEAT-05 | Holdings sorted by valueAUD descending | US-02 | P1 |
| FEAT-06 | Sync button with loading state | US-03 | P1 |
| FEAT-07 | Last-updated timestamp | US-03 | P1 |
| FEAT-08 | Sync error banner | US-03 | P1 |
| FEAT-09 | Sector allocation pie chart | US-04 | P2 |
| FEAT-10 | Pie chart hover tooltip with AUD value | US-04 | P2 |
| FEAT-11 | AI market summary card | US-05 | P2 |
| FEAT-12 | AI summary loading skeleton | US-05 | P2 |
| FEAT-13 | Empty state before first sync | Edge Case | P1 |
| FEAT-14 | Partial source failure warning badge | Edge Case | P2 |

---

## Success Criteria

- [ ] Dashboard renders without console errors from `npm run dev`
- [ ] Net worth card shows AUD formatted total after sync
- [ ] Holdings table shows all synced positions sorted by value descending
- [ ] Sync button shows spinner during fetch; timestamp updates on success
- [ ] Sync failure shows error banner without losing last known data
- [ ] Pie chart renders with sector labels; hover tooltip shows AUD value
- [ ] AI summary card shows content after sync; skeleton shown before sync
- [ ] Empty state shown before first sync (not a broken/blank screen)
- [ ] Investor stops using the spreadsheet for daily IBKR + Coinspot checks
