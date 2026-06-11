# Feature: Iteration 1 — MVP

> **Iteration 1** | **Size: Large** | **Priority: P1**

---

## Problem Statement

The investor currently tracks IBKR (business + personal) and Coinspot holdings across two separate platforms and a manual spreadsheet that quickly falls out of date. There is no single view of combined net worth, no allocation breakdown, no goal tracking, and no way to answer "where do I stand?" without opening multiple apps.

Iteration 1 delivers a Kubera-style three-page MVP that replaces the spreadsheet: a Dashboard with 5 summary metric cards, configurable allocation charts, a FIRE goal progress section, and an AI market summary; an Assets page with full holdings table, a **+ Asset** connect modal (broker login + CSV upload + manual entry), and liability management; and a Goals page for setting and tracking FIRE goals. Data enters the app via **CSV upload first** (IBKR + Coinspot, AI-assisted parsing), then **live broker connections** as soon as possible.

---

## Goals

| Goal | Measure of Success |
|------|--------------------|
| Financial snapshot at a glance | Net Worth, Total Assets, Cash on Hand, Debts, and Tax Estimate all visible without scrolling |
| Asset changes tracked | 1-day and 1-week portfolio delta visible on Assets card |
| Allocation at a glance | Configurable chart panel with 4 chart types on Dashboard |
| Goal progress visible | FIRE goal progress summary visible on Dashboard without navigating away |
| All holdings in one place | Full holdings table available on Assets page with every IBKR + Coinspot position |
| Manual assets and liabilities tracked | Non-broker assets and debts enterable on Assets page |
| Replace spreadsheet | Investor stops opening the spreadsheet for daily portfolio checks |
| Connect brokers Kubera-style | + Asset modal on Assets page: connect IBKR/Coinspot or upload CSV; live OAuth/API flows ship after CSV path works |

---

## Implementation Status (as of 2026-06-11)

| Area | Status | Notes |
|------|--------|-------|
| API client + sync + error handling | **Done** (T1, T3, T7, T9) | `src/api/portfolio.js`, Header, empty state |
| Net Worth card (basic) | **Partial** (T3) | Value + skeleton only; Investable/CAGR in T11 |
| Holdings table component | **Done** (T4) | Still on Dashboard; moves to Assets in T14 |
| Allocation chart (single sector) | **Partial** (T5) | 4-tab panel in T12 |
| AI market summary | **Done** (T6) | |
| Sidebar navigation | **Not started** (T10) | Visual shell only |
| 5 summary cards + dashboard layout | **Not started** (T11) | |
| Goal progress card | **Not started** (T13) | |
| Assets page + connect modal | **Done** (T14) | |
| Goals page | **Done** (T15) | |
| Backend (CSV + live brokers) | **Not started** (T16–T18) | No backend in repo yet |

---

## Out of Scope

| Item | Reason / Deferred To |
|------|----------------------|
| CSV import for banks / super | Iteration 2 — IBKR + Coinspot CSV in Iteration 1 |
| CAGR on Net Worth card | Requires 1+ month of stored snapshots — shows "available after 1 month" placeholder |
| 1-month delta on Assets card | Requires stored snapshots — 1-day and 1-week only for MVP |
| Allocation rule alerts (200 DMA, concentration) | Iteration 2+ |
| Mobile / responsive layout | Post-MVP |
| Authentication / login screen | Iteration 3 |
| Historical net worth chart | Iteration 2 |
| Banks, super, property integrations (automated) | Manual entry only in Iteration 1; integration deferred |
| DCA module | Iteration 2 |
| Stock research / grading | Iteration 2 |
| Fast Forward projections | Iteration 2 |
| Manual assets reflected in Dashboard net worth | Iteration 2 — Assets page scope only in Iteration 1 |

---

## User Stories

### US-01 — View Dashboard Summary Cards `[P1]`

> As a self-directed investor, I want to see five key financial metrics on the Dashboard in dedicated cards, so that I get an immediate snapshot of my financial health without needing to navigate anywhere.

**Why P1:** These are the first things a user sees. Without them the dashboard has no value.

**Card definitions:**

**1. Net Worth card (accent-mint / hero)**
- Main value: `netWorth` (AUD) = assets total − debts total
- Sub-value: "Investable" = all holdings excluding cash (`assetType !== 'cash'`)
- CAGR row: shows placeholder "Will show after a month" until 30+ days of data is available

**2. Total Assets card**
- Main value: total AUD value of all holdings (IBKR + Coinspot)
- Below: 1-day delta (amount + %) and 1-week delta (amount + %) with colour coding — red for negative, green for positive

**3. Cash on Hand card**
- Main value: sum of `valueAUD` for all holdings where `assetType === 'cash'`

**4. Debts card**
- Main value: total of manually entered liabilities (from localStorage `wb-liabilities`)
- Below: 1-day delta (amount), 1-week delta (amount)
- Shows `A$0.00` with zero deltas if no liabilities entered

**5. Tax Estimate card**
- Main value: estimated CGT liability if all assets were liquidated today
- Calculation: `taxEstimate` provided by backend (based on unrealised gains from broker cost basis data)
- Sub-value: "Adjusted Net Worth" = `netWorth − taxEstimate`
- Shows "No cost basis data" state if backend cannot calculate

**Acceptance Criteria:**
- WHEN the dashboard loads AND portfolio data exists THEN all 5 cards SHALL be visible above the fold on a 1280px wide screen
- WHEN portfolio data is loading THEN all 5 cards SHALL display loading skeletons
- WHEN delta is negative THEN the value SHALL be displayed in red (`#e63946`)
- WHEN delta is positive THEN the value SHALL be displayed in green (`#00c48c`)
- WHEN delta is zero THEN the value SHALL be displayed in muted grey

**Test:** Sync portfolio. Confirm all 5 cards render with non-null values. Confirm 1-day delta on Assets card shows correct colour.

---

### US-02 — View All Holdings on Assets Page `[P1]`

> As a self-directed investor, I want to see every position across IBKR and Coinspot in a full-page holdings table on the Assets page, so that I can review individual positions in detail without cluttering the Dashboard.

**Why P1:** Required for the spreadsheet replacement exit criterion; moved off Dashboard to keep it a summary view.

**Acceptance Criteria:**
- WHEN I navigate to the Assets page THEN a holdings table SHALL display every position across IBKR (business + personal) and Coinspot
- WHEN the holdings table renders THEN each row SHALL show: ticker/coin, exchange, quantity, current price (AUD), total value (AUD), and allocation %
- WHEN the holdings table first renders THEN rows SHALL be sorted by value (AUD) descending by default
- WHEN holdings are loading THEN the table SHALL show skeleton rows

**Test:** Navigate to Assets. Sync portfolio. Confirm every IBKR position and every non-zero Coinspot balance appears as a distinct table row sorted by value descending.

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

### US-04 — View Configurable Allocation Charts `[P2]`

> As a self-directed investor, I want to choose which portfolio chart to display from four preset views, so that I can quickly inspect whichever allocation breakdown is most relevant to my current review.

**Why P2:** Four chart views provide more insight than a single chart; holdings table alone satisfies the spreadsheet-replacement goal.

**Acceptance Criteria:**
- WHEN the dashboard loads AND holdings exist THEN the chart panel SHALL offer 4 chart type tabs: Stock sectors | All sectors | Crypto distribution | Investable ex-cash
- WHEN the chart panel renders THEN "Stock sectors" SHALL be the default selected chart type
- WHEN the user selects a different chart type THEN the pie chart SHALL update immediately
- WHEN the user hovers a slice THEN a tooltip SHALL show the sector/group name and its AUD value
- WHEN a holding has no sector data THEN it SHALL be grouped under "Other"
- WHEN a chart type has no matching holdings THEN it SHALL show a "No data" empty state

Chart type definitions:
- **Stock sectors** — `holdings.filter(h => h.assetType === 'stock')`, grouped by `sector`
- **All sectors** — all `holdings`, grouped by `sector`
- **Crypto distribution** — `holdings.filter(h => h.assetType === 'crypto')`
- **Investable ex-cash** — `holdings.filter(h => h.assetType !== 'cash')`

**Test:** Sync portfolio. Confirm each tab updates the chart, percentages sum to 100%, and hovering shows an AUD value.

---

### US-05 — View AI Market Summary `[P2]`

> As a self-directed investor, I want to see a brief AI-generated market update relevant to my actual holdings, so that I can stay informed about market context without leaving the app.

**Why P2:** Valuable for the weekly review workflow, but not required for the spreadsheet replacement exit criterion.

**Acceptance Criteria:**
- WHEN the dashboard loads AND an AI summary is available THEN the market summary card SHALL display a 2–3 sentence market update
- WHEN no AI summary exists yet THEN the card SHALL show a loading skeleton — never an empty or missing card
- WHEN ANTHROPIC_API_KEY is not configured THEN the card SHALL show an "AI summary unavailable" message

**Test:** After a sync with a valid API key, confirm the summary card shows non-empty text. Remove the key and re-sync — confirm the unavailable message.

---

### US-06 — View FIRE Goal Progress on Dashboard `[P2]`

> As a self-directed investor, I want to see my FIRE goal progress summarised on the Dashboard, so that I can check whether I'm on track without navigating to the Goals page.

**Why P2:** Surfaces goal progress during daily portfolio checks — core to the "am I on track?" value proposition.

**Acceptance Criteria:**
- WHEN the dashboard loads AND a goal has been configured THEN a goal progress card SHALL show: FIRE target (AUD), current net worth, progress %, and target year
- WHEN no goal has been configured THEN the goal card SHALL show a "Set up your FIRE goal →" CTA that navigates to the Goals page
- Goal card SHALL use accent-purple background per DESIGN-SYSTEM.md

**Test:** Configure a goal on Goals page. Return to Dashboard — confirm progress card shows configured values. Clear localStorage — confirm CTA appears.

---

### US-07 — Manage Assets via + Asset Modal and Liabilities `[P1]`

> As a self-directed investor, I want a dedicated Assets page where I can see all my holdings and open a **+ Asset** modal to connect brokers, upload CSV exports, or add manual assets — plus record liabilities — so that I have a Kubera-style balance sheet in one place.

**Why P1:** Required for spreadsheet replacement and broker connection UX; debts feed the Debts card on Dashboard.

**Assets page layout:**
1. **Holdings table** (US-02) with a **+ Asset** button in the table header
2. **Connected platforms row** — compact status for IBKR Business, IBKR Personal, Coinspot (source, last sync, Connected / Not connected)
3. **Liabilities section** — form + list below the table

**+ Asset modal** (opens from + Asset button):
- **Connect broker** tab — IBKR Business, IBKR Personal, Coinspot; each shows connect flow (live OAuth/API when T18 ready) or "Upload CSV instead"
- **Upload CSV** tab — file picker per platform; sends file to backend `POST /api/import/csv`; shows parsing progress
- **Add manual asset** tab — name, type (Cash / Property / Super / Other), value (AUD)

**Acceptance Criteria:**
- WHEN I click **+ Asset** on the Assets page THEN a modal SHALL open with Connect broker | Upload CSV | Add manual asset options
- WHEN I upload an IBKR or Coinspot CSV THEN the backend SHALL parse it (AI-assisted when configured) and holdings SHALL appear in the table after sync
- WHEN I add a manual asset via the modal THEN it SHALL persist to `localStorage` `wb-manual-assets`
- WHEN I add a liability (name, type, AUD amount) THEN it SHALL appear in the liabilities list, persist to `localStorage`, and the Dashboard Debts card SHALL reflect the updated total
- Form validation: name not empty, value > 0; inline error if invalid
- Previously added entries SHALL persist across page refreshes
- WHEN a platform is connected (live or via CSV) THEN the connected platforms row SHALL show Connected status and last-updated time

**Test:** Open + Asset modal. Upload Coinspot CSV. Sync. Confirm holdings appear. Add a liability. Confirm Debts card updates on Dashboard.

---

### US-09 — Import Portfolio Data via CSV (AI-assisted) `[P1]`

> As a self-directed investor, I want to upload IBKR and Coinspot CSV exports and have them parsed into holdings automatically, so that I can use the app immediately without waiting for live broker APIs.

**Why P1:** First working data path; unblocks daily use before live broker connections (US-10).

**Acceptance Criteria:**
- WHEN I upload a CSV via the + Asset modal THEN the app SHALL send it to `POST /api/import/csv` with `platform` (`ibkr-business` | `ibkr-personal` | `coinspot`)
- WHEN parsing succeeds THEN normalized holdings SHALL match the portfolio schema (`ticker`, `exchange`, `qty`, `price`, `valueAUD`, `sector`, `assetType`)
- WHEN `ANTHROPIC_API_KEY` is configured THEN the backend SHALL use Claude to normalize non-standard CSV layouts; otherwise a deterministic parser SHALL handle known IBKR/Coinspot export formats
- WHEN parsing fails THEN an inline error SHALL describe the failure; the previous portfolio data SHALL be preserved
- WHEN sync runs after a successful import THEN holdings from all uploaded sources SHALL be merged in the portfolio response

**Test:** Upload IBKR business CSV and Coinspot CSV. Sync. Confirm merged holdings in Assets table with correct exchange labels.

---

### US-10 — Connect Live Broker Accounts `[P2]`

> As a self-directed investor, I want to connect IBKR and Coinspot accounts through the same + Asset modal (Kubera-style), so that holdings update automatically without manual CSV uploads.

**Why P2:** Target UX after CSV path works; more complex than CSV but avoids repeated manual exports.

**Acceptance Criteria:**
- WHEN I select Connect broker → IBKR Business / IBKR Personal in the + Asset modal THEN a connect flow SHALL initiate (Client Portal Gateway or credentials form per backend implementation)
- WHEN I select Connect broker → Coinspot THEN an API key / OAuth flow SHALL initiate
- WHEN connection succeeds THEN the platform row SHALL show Connected and sync SHALL pull live holdings
- WHEN connection fails THEN an inline error SHALL appear with retry; CSV upload remains available as fallback
- Credentials SHALL be stored server-side only (`.env` or secure store — never in localStorage)

**Test:** Connect Coinspot via API. Sync. Confirm holdings update without CSV upload. Disconnect and confirm status returns to Not connected.

---

### US-08 — Set Up and Track FIRE Goals `[P1]`

> As a self-directed investor, I want to set up my FIRE goal through an AI-guided flow and then review and edit it on a Goals page, so that I can track my progress toward financial independence.

**Why P1:** Without goal context, the investor cannot answer "am I on track?" — a core promise of the app.

**Acceptance Criteria:**
- WHEN I navigate to Goals and no goal exists THEN an AI-guided setup flow SHALL present 3 prompted questions: FIRE target amount, target year, and current annual savings
- WHEN I complete the questions THEN the AI SHALL generate a goal config suggestion (target AUD, timeline, required monthly savings)
- WHEN ANTHROPIC_API_KEY is missing THEN setup SHALL fall back to a manual entry form with the same 3 fields
- WHEN a goal is configured THEN the Goals page SHALL display: FIRE target, target year, progress %, and estimated monthly savings required
- WHEN I edit any goal field THEN the change SHALL be saved to localStorage immediately
- Goal data SHALL persist across page refreshes and navigation

**Test:** Complete AI-guided setup. Confirm goal persists on refresh. Edit target — confirm update. Remove API key — confirm manual fallback shows.

---

## Edge Cases

| Scenario | Expected Behaviour |
|----------|--------------------|
| First load before any sync | Empty state on Dashboard with "Sync to load your portfolio" CTA |
| Sync fails completely | Error banner shown; last known data preserved; timestamp NOT updated |
| One source fails (e.g. IBKR offline) | Partial data displayed; warning badge next to affected source |
| Net worth is zero | Card shows "A$0.00" — not blank or broken |
| No liabilities entered | Debts card shows "A$0.00" with zero deltas |
| Tax estimate unavailable (no cost basis) | Tax Estimate card shows "No cost basis data" state |
| Chart type has no matching holdings | "No data" empty state inside chart panel |
| Goals page — API key missing | Manual fallback form shown; AI guidance skipped gracefully |
| Assets page — no holdings | Holdings table empty state with "+ Asset" CTA |
| Assets page — no liabilities | Empty state with dashed-border "Add your first liability" prompt |
| CSV upload — unrecognised format | Inline error in modal; file not stored; previous data preserved |
| CSV upload — partial parse | Warning badge on platform row; successfully parsed rows shown |
| Broker connect — credentials invalid | Inline error in modal; CSV fallback still available |
| Goal not yet configured — Dashboard | Goal card shows CTA to Goals page, not broken/empty |

---

## Requirement Traceability

| ID | Requirement | User Story | Priority |
|----|-------------|------------|----------|
| FEAT-01 | Net Worth card (hero, accent-mint) | US-01 | P1 |
| FEAT-02 | Loading skeleton on all 5 summary cards | US-01 | P1 |
| FEAT-03 | Total Assets card with 1-day and 1-week delta | US-01 | P1 |
| FEAT-04 | Cash on Hand card | US-01 | P1 |
| FEAT-05 | Debts card (reads localStorage liabilities) | US-01 | P1 |
| FEAT-06 | Tax Estimate card with Adjusted Net Worth | US-01 | P2 |
| FEAT-07 | Net Worth = Assets − Debts | US-01 | P1 |
| FEAT-08 | Investable sub-value on Net Worth card | US-01 | P2 |
| FEAT-09 | Holdings table on Assets page (all IBKR + Coinspot) | US-02 | P1 |
| FEAT-10 | Holdings columns: ticker, exchange, qty, price, valueAUD, allocation% | US-02 | P1 |
| FEAT-11 | Holdings sorted by valueAUD descending | US-02 | P1 |
| FEAT-12 | Sync button with loading state | US-03 | P1 |
| FEAT-13 | Last-updated timestamp | US-03 | P1 |
| FEAT-14 | Sync error banner | US-03 | P1 |
| FEAT-15 | Configurable chart panel with 4 chart type tabs | US-04 | P2 |
| FEAT-16 | Chart updates on tab select; hover tooltip with AUD value | US-04 | P2 |
| FEAT-17 | AI market summary card | US-05 | P2 |
| FEAT-18 | AI summary loading skeleton | US-05 | P2 |
| FEAT-19 | Goal progress summary card on Dashboard | US-06 | P2 |
| FEAT-20 | Goal card CTA → Goals page when no goal configured | US-06 | P2 |
| FEAT-21 | Assets page — connected platform status row | US-07 | P1 |
| FEAT-22 | + Asset modal — Connect broker / Upload CSV / Manual asset tabs | US-07 | P1 |
| FEAT-23 | Assets page — liabilities section with form + list | US-07 | P1 |
| FEAT-24 | Manual assets + liabilities persisted to localStorage | US-07 | P1 |
| FEAT-25 | Debts card updates when liabilities change | US-07 | P1 |
| FEAT-33 | CSV upload endpoint + AI-assisted parsing (IBKR + Coinspot) | US-09 | P1 |
| FEAT-34 | Merged holdings from multiple sources in portfolio API | US-09 | P1 |
| FEAT-35 | Live IBKR connection (business + personal) | US-10 | P2 |
| FEAT-36 | Live Coinspot connection | US-10 | P2 |
| FEAT-26 | Goals page — AI-guided setup flow (3-step) | US-08 | P1 |
| FEAT-27 | Goals page — manual fallback when API key missing | US-08 | P1 |
| FEAT-28 | Goals page — goal config display and inline edit | US-08 | P1 |
| FEAT-29 | Goal data persisted to localStorage | US-08 | P1 |
| FEAT-30 | Sidebar navigation wired to page state | All pages | P1 |
| FEAT-31 | Partial source failure warning badge | Edge Case | P2 |
| FEAT-32 | Empty state before first sync | Edge Case | P1 |

---

## Success Criteria

### Frontend (T1–T15)

- [x] Dashboard renders without console errors from `npm run dev` (T8)
- [ ] All 5 summary cards display after sync with correct values (T11)
- [ ] Net Worth = Total Assets − Debts (T11)
- [ ] Total Assets card shows 1-day and 1-week deltas with correct colour coding (T11)
- [ ] Cash on Hand matches sum of cash-type holdings (T11)
- [x] Debts card updates when liabilities are added/removed on Assets page (T11 + T14)
- [ ] Tax Estimate card shows value or graceful unavailable state (T11)
- [x] Sync button shows spinner during fetch; timestamp updates on success (T7)
- [x] Sync failure shows error banner without losing last known data (T9)
- [ ] Configurable chart panel renders all 4 chart types correctly (T12)
- [x] AI summary card shows content after sync; skeleton shown before sync (T6)
- [x] Empty state shown before first sync (T9)
- [ ] Goal progress card shows FIRE progress when goal is configured (T13)
- [ ] Goal card shows "Set up FIRE goal" CTA when no goal exists (T13)
- [ ] Sidebar navigation switches between Dashboard, Assets, and Goals pages (T10)
- [x] Holdings table component works (sorted by value, all columns) — on Dashboard until T14 moves it (T4)
- [x] Assets page shows full holdings table sorted by value descending (T14)
- [x] + Asset modal opens with Connect / CSV / Manual tabs (T14)
- [x] Connected platform status row shows per-source status (T14)
- [x] Manual asset and liability entry validates and persists to localStorage (T14)
- [x] Goals AI-guided setup flow completes and saves a goal config (T15)
- [x] Goals manual fallback works when API key is absent (T15)
- [x] Goal fields editable on Goals page; changes persist (T15)

### Backend (T16–T18)

- [ ] IBKR + Coinspot CSV upload parses into normalized holdings (T16)
- [ ] Sync merges holdings from all connected/uploaded sources (T16)
- [ ] Portfolio API returns `assetsTotal`, `cashOnHand`, `taxEstimate`, `delta`, `assetType` (T16)
- [x] Live IBKR connection pulls holdings on sync (T17)
- [x] Live Coinspot connection pulls holdings on sync (T18)

### Exit criterion

- [ ] Investor stops using the spreadsheet for daily IBKR + Coinspot checks (requires T16 CSV path minimum)
