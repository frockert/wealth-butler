# Tasks: MVP Dashboard

> **Iteration 1** | Requires: [spec.md](./spec.md) · [design.md](./design.md)

---

## Execution Plan

```
Phase 1 ── T1: API client (serial prerequisite)
              │
Phase 2 ── T2: Dashboard shell (serial prerequisite)
              │
Phase 3 ── ┌─T3: NetWorthCard    ─┐
           ├─T4: HoldingsTable    ├─ [P] all parallel
           ├─T5: AllocationChart  ┤
           ├─T6: MarketSummaryCard┤
           └─T7: Header + Sync   ─┘
              │
Phase 4 ── T8: Wire App.jsx (serial)
           T9: Empty state + error banner (serial)
```

---

## Task Breakdown

### T1 — Create API client

- **What:** `fetchPortfolio()` and `syncPortfolio()` fetch wrappers
- **Where:** `src/api/portfolio.js`
- **Depends on:** none
- **Reuses:** native `fetch`; `import.meta.env.VITE_API_URL`
- **Requirement:** FEAT-01, FEAT-06
- **Done when:**
  - [x] `fetchPortfolio()` calls `GET {API_URL}/api/portfolio`, returns parsed JSON
  - [x] `syncPortfolio()` calls `POST {API_URL}/api/sync`, returns parsed JSON
  - [x] Both functions throw a descriptive `Error` on non-2xx responses
  - [x] `VITE_API_URL` defaults to `http://localhost:3001` when env var is absent
- **Tests:** none (exercised via integration with Dashboard)
- **Gate:** quick

---

### T2 — Scaffold Dashboard component

- **What:** Root layout shell; owns all portfolio state; calls `fetchPortfolio` on mount
- **Where:** `src/components/Dashboard.jsx`
- **Depends on:** T1
- **Reuses:** `fetchPortfolio` from T1
- **Requirement:** FEAT-01, FEAT-13
- **Done when:**
  - [x] Renders two-column layout (left: NetWorthCard + HoldingsTable; right: AllocationChart + MarketSummaryCard)
  - [x] `portfolio`, `loading`, `syncing`, `error` state initialised correctly
  - [x] Calls `fetchPortfolio()` on mount; sets `loading = true` before, `loading = false` after
  - [x] Passes data props down to child placeholders (can be `null` while children not yet created)
- **Tests:** none
- **Gate:** quick

---

### T3 — Create NetWorthCard `[P]`

- **What:** Card displaying formatted AUD total with loading skeleton
- **Where:** `src/components/NetWorthCard.jsx`
- **Depends on:** T2
- **Reuses:** `Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })`; Tailwind `animate-pulse`
- **Requirement:** FEAT-01, FEAT-02
- **Done when:**
  - [ ] Renders AUD total when `netWorth` is a number
  - [ ] Renders `animate-pulse` skeleton div when `loading` is `true`
  - [ ] Displays "A$0.00" (not blank) when `netWorth` is `0`
- **Tests:** none
- **Gate:** quick

---

### T4 — Create HoldingsTable `[P]`

- **What:** Table of all holdings sorted by valueAUD descending, with skeleton rows
- **Where:** `src/components/HoldingsTable.jsx`
- **Depends on:** T2
- **Reuses:** Tailwind table classes
- **Requirement:** FEAT-03, FEAT-04, FEAT-05
- **Done when:**
  - [ ] Renders columns: Ticker/Coin | Exchange | Qty | Price (AUD) | Value (AUD) | Allocation %
  - [ ] Rows sorted by `valueAUD` descending on render
  - [ ] Renders 5 skeleton rows when `loading` is `true`
  - [ ] Renders "No holdings — sync to load" empty state when `holdings` is empty and not loading
  - [ ] Price and value columns formatted as AUD currency
  - [ ] Allocation % formatted to 1 decimal place
- **Tests:** none
- **Gate:** quick

---

### T5 — Create AllocationChart `[P]`

- **What:** Recharts PieChart grouped by sector with hover tooltip
- **Where:** `src/components/AllocationChart.jsx`
- **Depends on:** T2
- **Reuses:** `recharts` — `PieChart`, `Pie`, `Cell`, `Tooltip`, `Legend`
- **Requirement:** FEAT-09, FEAT-10
- **Done when:**
  - [ ] Groups `holdings` by `sector`; uses "Other" as fallback when `sector` is absent
  - [ ] One slice per sector; slice size proportional to sum of `valueAUD` in that sector
  - [ ] Tooltip shows sector name + AUD value on hover
  - [ ] Renders skeleton placeholder when `loading` is `true`
  - [ ] Renders "No data" placeholder when `holdings` is empty and not loading
- **Tests:** none
- **Gate:** quick

---

### T6 — Create MarketSummaryCard `[P]`

- **What:** AI summary text card with skeleton and unavailable states
- **Where:** `src/components/MarketSummaryCard.jsx`
- **Depends on:** T2
- **Reuses:** Tailwind `animate-pulse`; Lucide React `AlertCircle`
- **Requirement:** FEAT-11, FEAT-12
- **Done when:**
  - [ ] Renders summary text when `aiSummary` is a non-empty string
  - [ ] Renders `animate-pulse` skeleton when `loading` is `true` or `aiSummary` is `null` (not yet loaded)
  - [ ] Renders "AI summary unavailable" message with `AlertCircle` icon when `apiKeyMissing` prop is `true`
  - [ ] Card container always renders — never a blank gap in the layout
- **Tests:** none
- **Gate:** quick

---

### T7 — Create Header with SyncButton and timestamp `[P]`

- **What:** App header with title, sync trigger, last-updated label, and per-source error badges
- **Where:** `src/components/Header.jsx`
- **Depends on:** T2
- **Reuses:** Lucide React `RefreshCw` (sync icon), `Clock` (timestamp), `AlertTriangle` (error badge)
- **Requirement:** FEAT-06, FEAT-07, FEAT-08, FEAT-14
- **Done when:**
  - [ ] "Wealth Butler" title renders on the left
  - [ ] Sync button is on the right; shows `RefreshCw` with `animate-spin` class when `syncing` is `true`
  - [ ] Sync button is `disabled` and visually muted when `syncing` is `true`
  - [ ] `lastUpdated` displayed as `Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(lastUpdated))` next to the button
  - [ ] "Never synced" shown when `lastUpdated` is `null`
  - [ ] One `AlertTriangle` badge per item in `errors[]` labelled with `source`
- **Tests:** none
- **Gate:** quick

---

### T8 — Wire Dashboard into App.jsx

- **What:** Replace placeholder content in `App.jsx` with `<Dashboard />`
- **Where:** `src/App.jsx`
- **Depends on:** T2, T3, T4, T5, T6, T7
- **Requirement:** FEAT-01
- **Done when:**
  - [ ] `npm run dev` renders the Dashboard (not the blank Vite template)
  - [ ] No React console errors on initial load
  - [ ] Page title in `index.html` updated to "Wealth Butler"
- **Tests:** none
- **Gate:** full (visual check in browser — confirm layout renders correctly)

---

### T9 — Add empty state and error banner to Dashboard

- **What:** Pre-sync empty state CTA; full-sync failure error banner
- **Where:** `src/components/Dashboard.jsx`
- **Depends on:** T2, T7, T8
- **Requirement:** FEAT-13, FEAT-08
- **Done when:**
  - [ ] When `portfolio === null` and `loading === false`: renders centred empty state card with "Sync to load your portfolio" button (calls `onSync`)
  - [ ] When `error` is non-null: renders a dismissible red banner at the top of the dashboard
  - [ ] Error banner does not replace existing portfolio data — both shown simultaneously
  - [ ] Dismissing the banner sets `error = null`
- **Tests:** none
- **Gate:** quick

---

## Parallel Execution Map

| Phase | Tasks | Parallelisable? |
|-------|-------|----------------|
| 1 | T1 | No — foundation |
| 2 | T2 | No — depends on T1; children need its props |
| 3 | T3, T4, T5, T6, T7 | **Yes `[P]`** — all depend only on T2 |
| 4 | T8, T9 | No — T8 needs all Phase 3 done; T9 needs T8 |

---

## Pre-approval Validation

### Granularity Check

| Task | Single deliverable? | Estimated size |
|------|---------------------|----------------|
| T1 | ✅ one module, two exports | ~30 lines |
| T2 | ✅ one component, state + layout | ~60 lines |
| T3 | ✅ one component | ~25 lines |
| T4 | ✅ one component | ~50 lines |
| T5 | ✅ one component | ~50 lines |
| T6 | ✅ one component | ~30 lines |
| T7 | ✅ one component | ~50 lines |
| T8 | ✅ one-line import change + title | ~5 lines |
| T9 | ✅ conditional blocks in Dashboard | ~30 lines |

### Diagram–Definition Cross-check

| Component in design.md | Task that creates it |
|------------------------|----------------------|
| `src/api/portfolio.js` | T1 ✅ |
| `Dashboard.jsx` | T2 ✅ |
| `NetWorthCard.jsx` | T3 ✅ |
| `HoldingsTable.jsx` | T4 ✅ |
| `AllocationChart.jsx` | T5 ✅ |
| `MarketSummaryCard.jsx` | T6 ✅ |
| `Header.jsx` | T7 ✅ |

### Test Co-location Validation

All components are pure render components driven by props. Unit tests would require a DOM testing library not yet in the project. Marked **none** consistently — acceptance testing is manual via `npm run dev` and confirmed via Gate checks. Add Vitest + React Testing Library in Iteration 2 if needed.
