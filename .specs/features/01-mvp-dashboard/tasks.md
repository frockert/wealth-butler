# Tasks: Iteration 1 — MVP

> **Iteration 1** | Requires: [spec.md](./spec.md) · [design.md](./design.md)

---

## Implementation Progress (~95% — T17/T18 live connections done)

| Done (T1–T18) | Remaining |
|---------------------|--------------------------------|
| API client, sync, error banner, empty state, navigation | Iteration 2 features |
| 5-card layout, chart tabs, GoalProgressCard, Goals page | |
| Assets page, +Asset modal, liabilities | |
| NetWorthCard (investable), AllocationChart tabs | |
| MarketSummaryCard, Header, Sidebar wired | |
| Backend CSV ingest + portfolio API (T16) | |
| **Live IBKR + Coinspot connections (T17/T18)** | |

---

## Execution Plan

```
Phase 1 ── T1: API client (serial prerequisite)                          ✅ Done
              │
Phase 2 ── T2: Dashboard shell (serial prerequisite)                     ✅ Done
              │
Phase 3 ── ┌─T3: NetWorthCard    ─┐
           ├─T4: HoldingsTable    ├─ [P] all parallel                    ✅ Done
           ├─T5: AllocationChart  ┤
           ├─T6: MarketSummaryCard┤
           └─T7: Header + Sync   ─┘
              │
Phase 4 ── T8: Wire App.jsx (serial)                                     ✅ Done
           T9: Empty state + error banner (serial)                       ✅ Done
              │
Phase 5 ── T10: Navigation + hoist portfolio state to App                    ✅ Done
              │
Phase 6 ── T11: Redesign Dashboard — summary cards + layout                ✅ Done
              │
Phase 7 ── ┌─T12: Configurable chart panel  ─┐
           └─T13: GoalProgressCard           ─┘ [P]                        ✅ Done
              │
Phase 8 ── ┌─T14: Assets page + +Asset modal ─┐                              ✅ T14 Done
           └─T15: Goals page                 ─┘ [P]
              │
Phase 9 ── T16: Backend — CSV ingest + AI parse + portfolio API          ✅ Done
              │
Phase 10 ─ ┌─T17: Backend — live IBKR connection ─┐
           └─T18: Backend — live Coinspot         ─┘ [P] after T16
```

**Note on T3/T4:** These components exist and are done. T11 supersedes the Dashboard layout (replaces the two-column layout with the new 5-card summary + chart row). `HoldingsTable.jsx` is reused in the Assets page (T14) with a + Asset button. T16 unblocks daily use via CSV before T17/T18 live connections ship.

---

## Completed Tasks (T1–T9)

### T1 — Create API client ✅

- **Where:** `src/api/portfolio.js`
- **Done when:**
  - [x] `fetchPortfolio()` calls `GET {API_URL}/api/portfolio`, returns parsed JSON
  - [x] `syncPortfolio()` calls `POST {API_URL}/api/sync`, returns parsed JSON
  - [x] Both functions throw a descriptive `Error` on non-2xx responses
  - [x] `VITE_API_URL` defaults to `http://localhost:3001` when env var is absent

---

### T2 — Scaffold Dashboard component ✅

- **Where:** `src/components/Dashboard.jsx`
- **Done when:**
  - [x] Renders two-column layout (left: NetWorthCard + HoldingsTable; right: AllocationChart + MarketSummaryCard)
  - [x] `portfolio`, `loading`, `syncing`, `error` state initialised correctly
  - [x] Calls `fetchPortfolio()` on mount; sets `loading = true` before, `loading = false` after
  - [x] Passes data props down to child placeholders

---

### T3 — Create NetWorthCard ✅

- **Where:** `src/components/NetWorthCard.jsx`
- **Done when:**
  - [x] Renders AUD total when `netWorth` is a number
  - [x] Renders `animate-pulse` skeleton when `loading` is `true`
  - [x] Displays "A$0.00" (not blank) when `netWorth` is `0`

---

### T4 — Create HoldingsTable ✅

- **Where:** `src/components/HoldingsTable.jsx`
- **Done when:**
  - [x] Renders columns: Ticker/Coin | Exchange | Qty | Price (AUD) | Value (AUD) | Allocation %
  - [x] Rows sorted by `valueAUD` descending on render
  - [x] Renders 5 skeleton rows when `loading` is `true`
  - [x] Renders empty state when `holdings` is empty and not loading

---

### T5 — Create AllocationChart ✅

- **Where:** `src/components/AllocationChart.jsx`
- **Done when:**
  - [x] Groups `holdings` by `sector`; uses "Other" as fallback
  - [x] One slice per sector; proportional to sum of `valueAUD`
  - [x] Tooltip shows sector name + AUD value on hover
  - [x] Renders skeleton when `loading` is `true`

---

### T6 — Create MarketSummaryCard ✅

- **Where:** `src/components/MarketSummaryCard.jsx`
- **Done when:**
  - [x] Renders summary text when `aiSummary` is a non-empty string
  - [x] Renders `animate-pulse` skeleton when loading or `aiSummary` is `null`
  - [x] Renders "AI summary unavailable" with `AlertCircle` when `apiKeyMissing` is `true`

---

### T7 — Create Header with SyncButton and timestamp ✅

- **Where:** `src/components/Header.jsx`
- **Done when:**
  - [x] Sync button shows `RefreshCw` with `animate-spin` when `syncing` is `true`
  - [x] Sync button `disabled` and visually muted when `syncing`
  - [x] `lastUpdated` formatted with `Intl.DateTimeFormat('en-AU')`
  - [x] "Never synced" when `lastUpdated` is `null`
  - [x] One `AlertTriangle` badge per item in `errors[]`

---

### T8 — Wire Dashboard into App.jsx ✅

- **Done when:**
  - [x] `npm run dev` renders the Dashboard
  - [x] No React console errors on initial load
  - [x] Page title in `index.html` updated to "Wealth Butler"

---

### T9 — Add empty state and error banner to Dashboard ✅

- **Done when:**
  - [x] When `portfolio === null` and `loading === false`: centred empty state CTA
  - [x] When `error` is non-null: dismissible red banner at the top
  - [x] Error banner does not replace existing portfolio data
  - [x] Dismissing the banner sets `error = null`

---

## Remaining Tasks (T10–T18)

### T10 — Wire navigation and hoist portfolio state (Sidebar + App.jsx)

- **What:** Connect `Sidebar.jsx` to `App.jsx`; track `activePage` state; **hoist** `portfolio`, `loading`, `syncing`, `error`, and `handleSync` from Dashboard to App so AssetsPage can access holdings without re-fetching
- **Where:** `src/App.jsx`, `src/components/Sidebar.jsx`, `src/components/Dashboard.jsx` (remove fetch/sync state)
- **Depends on:** T8
- **Reuses:** `Sidebar.jsx` (exists, currently static)
- **Requirement:** FEAT-30
- **Done when:**
  - [x] `App.jsx` holds `activePage` (default `'dashboard'`), `portfolio`, `loading`, `syncing`, `error` state
  - [x] `App.jsx` fetches portfolio on mount; `handleSync` calls sync + re-fetch (moved from Dashboard)
  - [x] `Sidebar` accepts `activePage` and `onNavigate` props; active item accent matches DESIGN-SYSTEM.md section mapping
  - [x] Clicking any nav item calls `onNavigate(page)` and updates `activePage`
  - [x] `activePage === 'dashboard'` → renders `<Dashboard portfolio={...} onNavigate={...} />`
  - [x] `activePage === 'assets'` → renders `<AssetsPage />` placeholder (empty div — T14 fills it)
  - [x] `activePage === 'goals'` → renders `<GoalsPage />` placeholder (empty div — T15 fills it)
  - [x] `activePage === 'ai-advisor'` or `'integrations'` → renders centred "Coming in the next iteration" card
  - [x] `Dashboard.jsx` no longer owns portfolio fetch/sync state
- **Tests:** none
- **Gate:** quick

---

### T11 — Redesign Dashboard layout and summary cards

- **What:** Replace the current two-column layout with the new layout: 5 summary cards → Goal Progress → (Chart panel | AI Summary). Refactor `NetWorthCard` to include Investable sub-value. Add 4 new summary card components: `TotalAssetsCard`, `CashOnHandCard`, `DebtsCard`, `TaxEstimateCard`. Remove `HoldingsTable` from Dashboard entirely.
- **Where:**
  - `src/components/Dashboard.jsx` — layout refactor
  - `src/components/NetWorthCard.jsx` — add Investable sub-value
  - `src/components/TotalAssetsCard.jsx` — new
  - `src/components/CashOnHandCard.jsx` — new
  - `src/components/DebtsCard.jsx` — new
  - `src/components/TaxEstimateCard.jsx` — new
- **Depends on:** T10
- **Reuses:** Existing `NetWorthCard`, `AllocationChart`, `MarketSummaryCard`, `Header`; `Intl.NumberFormat`; Tailwind `animate-pulse`
- **Requirement:** FEAT-01 through FEAT-08, FEAT-32

**New layout structure:**
```
Header (full width)
├── Row 1 — Summary cards (5 across, responsive wrap)
│   NetWorthCard | TotalAssetsCard | CashOnHandCard | DebtsCard | TaxEstimateCard
├── Row 2 — Goal Progress (full width)
│   GoalProgressCard (placeholder — T13 fills it)
└── Row 3 — Two-column
    AllocationChart (left, ~60%)  |  MarketSummaryCard (right, ~40%)
```

**TotalAssetsCard props:**
```js
{ assetsTotal: Number|null, delta1d: Number|null, delta1dPct: Number|null,
  delta1w: Number|null, delta1wPct: Number|null, loading: Boolean }
```

**CashOnHandCard props:**
```js
{ cashOnHand: Number|null, loading: Boolean }
```

**DebtsCard props:**
```js
{ debtsTotal: Number, delta1d: Number, delta1w: Number, loading: Boolean }
// debtsTotal read from localStorage 'wb-liabilities' by Dashboard
```

**TaxEstimateCard props:**
```js
{ taxEstimate: Number|null, adjustedNetWorth: Number|null, loading: Boolean }
```

- **Done when:**
  - [x] New layout renders without errors — 5 cards in Row 1, goal placeholder in Row 2, chart+AI in Row 3
  - [x] `HoldingsTable` is no longer rendered in `Dashboard.jsx`
  - [x] `NetWorthCard` shows main net worth value + "Investable" sub-value (assets total minus cash holdings)
  - [x] `TotalAssetsCard` shows assets total + 1-day and 1-week deltas with colour coding (red/green per sign)
  - [x] `CashOnHandCard` shows `cashOnHand` value (from `portfolio.cashOnHand` or derived from holdings)
  - [x] `DebtsCard` reads `wb-liabilities` from localStorage on render; shows sum as main value
  - [x] `TaxEstimateCard` shows `portfolio.taxEstimate` if present; "No cost basis data" state if null
  - [x] All 5 cards show `animate-pulse` skeleton when `loading` is `true`
  - [x] Dashboard reads `wb-liabilities` from localStorage to compute `debtsTotal` and derive `netWorth = assetsTotal − debtsTotal`
  - [x] Empty state (pre-sync) still renders as before (T9 behaviour preserved)
- **Tests:** none
- **Gate:** full (visual check — confirm all 5 cards render with correct values after a sync)

---

### T12 — Extend AllocationChart to configurable chart panel `[P]`

- **What:** Add a 4-tab chart type selector above the existing pie chart; each tab filters/groups holdings differently
- **Where:** `src/components/AllocationChart.jsx`
- **Depends on:** T5
- **Reuses:** existing Recharts pie chart logic
- **Requirement:** FEAT-15, FEAT-16
- **Chart types:**
  - **Stock sectors** — `holdings.filter(h => h.assetType === 'stock')`, grouped by `sector`
  - **All sectors** — all `holdings`, grouped by `sector`
  - **Crypto distribution** — `holdings.filter(h => h.assetType === 'crypto')`
  - **Investable ex-cash** — `holdings.filter(h => h.assetType !== 'cash')`
- **Done when:**
  - [x] 4 tab buttons rendered above the chart; "Stock sectors" active by default
  - [x] Active tab is visually differentiated
  - [x] Clicking a tab updates `chartType` state and re-renders with correct data
  - [x] "No data" empty state when filtered holdings is empty
  - [x] Tooltip continues to show sector name + AUD value on hover
  - [x] Skeleton renders when `loading` is `true` (tabs not shown during load)
- **Tests:** none
- **Gate:** quick

---

### T13 — Create GoalProgressCard `[P]`

- **What:** Dashboard card showing FIRE goal progress; CTA to Goals page when no goal configured
- **Where:** `src/components/GoalProgressCard.jsx`; update `src/components/Dashboard.jsx` to render it in Row 2
- **Depends on:** T11 (Dashboard layout has a Row 2 slot)
- **Reuses:** `localStorage` key `wb-goal-config`; Lucide `Target` icon; accent-purple tokens
- **Requirement:** FEAT-19, FEAT-20
- **Done when:**
  - [x] Reads goal config from `localStorage.getItem('wb-goal-config')` synchronously on render
  - [x] When no goal: accent-purple card with `Target` icon and "Set up your FIRE goal →" button; calls `onNavigate('goals')` prop
  - [x] When goal exists: accent-purple card showing FIRE target (AUD), current net worth, progress bar (`currentNetWorth / targetAUD × 100`), and target year
  - [x] Progress bar uses `#00c48c` fill; capped at 100%
  - [x] `onNavigate` prop passed from Dashboard to GoalProgressCard
  - [x] Card always renders — never a blank gap
- **Tests:** none
- **Gate:** quick

---

### T14 — Create Assets page + +Asset modal `[P]`

- **What:** Assets page with holdings table (+ Asset button), connected platforms row, +Asset modal (Connect broker / Upload CSV / Manual asset), and liabilities section
- **Where:**
  - `src/components/AssetsPage.jsx` — new
  - `src/components/AddAssetModal.jsx` — new
  - `src/api/portfolio.js` — add `uploadCsv(platform, file)` → `POST /api/import/csv`
- **Depends on:** T10
- **Reuses:** `HoldingsTable.jsx` (T4); Lucide `Plus`, `Trash2`, `Upload`, `Link` icons; `localStorage` keys `wb-manual-assets`, `wb-liabilities`
- **Requirement:** FEAT-09, FEAT-10, FEAT-11, FEAT-21, FEAT-22, FEAT-23, FEAT-24, FEAT-25

**Page layout (top to bottom):**
1. **Holdings table** — `<HoldingsTable />` with **+ Asset** button in header; opens `AddAssetModal`
2. **Connected platforms row** — IBKR Business, IBKR Personal, Coinspot: status badge (Connected / Not connected), last sync time
3. **Liabilities** — form + list; localStorage `wb-liabilities`

**+Asset modal tabs:**
- **Connect broker** — platform cards (IBKR Business, IBKR Personal, Coinspot); Connect button calls backend connect endpoint (stub until T17/T18); "Upload CSV instead" links to Upload tab
- **Upload CSV** — platform selector + file input; calls `uploadCsv()`; shows parsing spinner + success/error
- **Add manual asset** — name, type (Cash / Property / Super / Other), value (AUD); saves to `wb-manual-assets`

- **Done when:**
  - [x] `AssetsPage` receives `holdings`, `loading`, `connections` (from portfolio) props from `App.jsx`
  - [x] Holdings table renders with + Asset button; empty state CTA opens modal
  - [x] `AddAssetModal` opens/closes; three tabs render; modal can be opened before T16 backend exists (CSV tab shows error gracefully)
  - [x] Connected platforms row shows per-platform status from `portfolio.connections[]` or defaults to Not connected
  - [x] Manual asset tab validates and saves to `wb-manual-assets`; manual assets listed in modal or compact section
  - [x] Liabilities form: name, type (Mortgage / Loan / Credit Card / Other), value (AUD) — validates and saves to `wb-liabilities`
  - [x] Each liability shows name, type badge, AUD value, delete button
  - [x] Deleting an entry removes from localStorage
  - [x] Liabilities empty state (dashed border) when no entries
  - [x] `wb-liabilities` writes visible on Dashboard `DebtsCard` (localStorage read on render)
  - [x] CSV upload calls `POST /api/import/csv` when T16 backend is available
- **Tests:** none
- **Gate:** full (modal UX + liabilities; CSV works once T16 lands)

---

### T15 — Create Goals page `[P]`

- **What:** Goals page with AI-guided FIRE setup flow (3 steps) and editable goal config display
- **Where:** `src/components/GoalsPage.jsx`
- **Depends on:** T10
- **Reuses:** Lucide `Sparkles`, `Edit2`, `Target` icons; accent-purple tokens; `localStorage` key `wb-goal-config`
- **Requirement:** FEAT-26, FEAT-27, FEAT-28, FEAT-29

**Goal config shape:**
```js
{
  targetAUD: Number,              // e.g. 2000000
  targetYear: Number,             // e.g. 2040
  annualSavings: Number,          // e.g. 60000
  monthlySavingsRequired: Number, // AI-calculated or client-derived
  notes: String,                  // AI narrative or "Manually calculated"
}
```

- **Done when:**
  - [x] On mount: reads `wb-goal-config` from localStorage; shows setup flow if null, config view if set
  - [x] **Setup flow** (3 steps):
    - Step 1: "What's your FIRE target? (total AUD you need to retire)" — number input
    - Step 2: "By what year do you want to reach FIRE?" — number input
    - Step 3: "What are your current annual savings (AUD)?" — number input
    - "Calculate my FIRE plan" button on Step 3
    - If `VITE_ANTHROPIC_API_KEY` present: sends answers to Claude API; renders AI-generated narrative + goal config; shows loading state ("Crunching your numbers...")
    - If key absent: calculates `monthlySavingsRequired = (targetAUD / monthsUntilTargetYear) - (annualSavings / 12)` client-side; sets `notes: 'Manually calculated'`
    - Generated config saved to `localStorage.setItem('wb-goal-config', JSON.stringify(config))`
  - [x] **Config view**: accent-purple card showing all 4 fields; each field has pencil icon that turns value into an editable input; saving writes to localStorage
  - [x] "Reset goal" button clears `wb-goal-config` and returns to setup flow
  - [x] AI call loading state shown with spinner; error state shows inline message + retry button (answers preserved)
  - [x] Step progression: "Next" advances, "Back" returns, step counter shown (e.g. "Step 1 of 3")
- **Tests:** none
- **Gate:** full (complete setup flow end-to-end; confirm goal saves; confirm GoalProgressCard on Dashboard updates)

---

### T16 — Backend: CSV ingest, AI parse, portfolio API ✅

- **What:** Hono (or Express) backend service: accept IBKR + Coinspot CSV uploads, normalize to holdings schema (AI-assisted when `ANTHROPIC_API_KEY` set), merge sources, expose `GET /api/portfolio` and `POST /api/sync` with full data model
- **Where:** `server/` (new) or separate repo — `server/index.js`, `server/routes/import.js`, `server/routes/portfolio.js`, `server/parsers/ibkr.js`, `server/parsers/coinspot.js`, `server/parsers/ai-csv.js`
- **Depends on:** none (can start in parallel with T10–T15 frontend)
- **Requirement:** FEAT-33, FEAT-34; backend fields for T11
- **Endpoints:**
  - `POST /api/import/csv` — body: `{ platform, file }` multipart; stores parsed holdings per source
  - `GET /api/portfolio` — merged portfolio response (see data model below)
  - `POST /api/sync` — refreshes prices where possible; updates `lastUpdated`
- **Done when:**
  - [x] Backend runs on `localhost:3001` (matches `VITE_API_URL` default)
  - [x] IBKR business + personal CSV exports parse to normalized holdings
  - [x] Coinspot CSV export parses to normalized holdings
  - [x] AI fallback parser handles non-standard CSV when API key present
  - [x] Portfolio response includes `assetsTotal`, `cashOnHand`, `taxEstimate`, `delta`, `assetType` per holding
  - [x] `portfolio.connections[]` reports per-platform status and `lastSync`
  - [x] Multiple sources merge without duplicate tickers on same exchange
  - [x] Parse errors return 4xx with descriptive message; do not wipe existing data
- **Tests:** parser unit tests for known IBKR/Coinspot CSV samples ✅
- **Gate:** full (upload CSV → sync → frontend shows holdings)

---

### T17 — Backend: live IBKR connection `[P]` ✅

- **What:** Connect IBKR Business + Personal accounts via Client Portal Gateway (or Flex Query); pull holdings on sync
- **Where:** `server/integrations/ibkr.js`, `server/routes/connect.js`
- **Depends on:** T16
- **Requirement:** FEAT-35
- **Done when:**
  - [x] `POST /api/connect/ibkr-business` and `POST /api/connect/ibkr-personal` initiate connection
  - [x] Credentials stored server-side only (`.env` or secure config)
  - [x] Sync pulls live holdings for connected IBKR accounts
  - [x] Connection status reflected in `portfolio.connections[]`
  - [x] Connect flow callable from +Asset modal Connect broker tab
  - [x] CSV upload remains available as fallback when connection fails
- **Tests:** none (manual with gateway)
- **Gate:** full

---

### T18 — Backend: live Coinspot connection `[P]` ✅

- **What:** Connect Coinspot via API keys; pull balances on sync
- **Where:** `server/integrations/coinspot.js`, `server/routes/connect.js`
- **Depends on:** T16
- **Requirement:** FEAT-36
- **Done when:**
  - [x] `POST /api/connect/coinspot` accepts API key; validates and stores server-side
  - [x] Sync pulls live crypto balances for connected Coinspot account
  - [x] Connection status reflected in `portfolio.connections[]`
  - [x] Connect flow callable from +Asset modal Connect broker tab
  - [x] CSV upload remains available as fallback
- **Tests:** none (manual with API key)
- **Gate:** full

---

## Parallel Execution Map

| Phase | Tasks | Parallelisable? |
|-------|-------|----------------|
| 1 | T1 | No — foundation |
| 2 | T2 | No — depends on T1 |
| 3 | T3, T4, T5, T6, T7 | **Yes `[P]`** |
| 4 | T8, T9 | No — T8 needs Phase 3; T9 needs T8 |
| 5 | T10 | No — prerequisite for all remaining |
| 6 | T11 | No — establishes new layout before T12/T13 can slot in |
| 7 | T12, T13 | **Yes `[P]`** — both need T11's layout slots but don't share state |
| 8 | T14, T15 | **Yes `[P]`** — both need T10; no shared state |
| 9 | T16 | No — first data path; can run parallel to Phases 5–8 |
| 10 | T17, T18 | **Yes `[P]`** — both need T16 |

---

## Pre-approval Validation

### Granularity Check

| Task | Single deliverable? | Estimated size |
|------|---------------------|----------------|
| T10 | ✅ navigation + state hoist | ~60 lines |
| T11 | ✅ layout + 4 new card components | ~150 lines total |
| T12 | ✅ extend one component | ~40 lines |
| T13 | ✅ one new component + Dashboard update | ~50 lines |
| T14 | ✅ page + modal component | ~180 lines |
| T15 | ✅ one page component | ~140 lines |
| T16 | ✅ backend service + CSV parsers | ~300 lines |
| T17 | ✅ IBKR integration | ~150 lines |
| T18 | ✅ Coinspot integration | ~100 lines |

### Component Ownership Map

| Component | Status | Lives in |
|-----------|--------|----------|
| `src/api/portfolio.js` | ✅ T1 done | — |
| `Dashboard.jsx` | ✅ T2 done → layout updated in T11 | Dashboard page |
| `NetWorthCard.jsx` | ✅ T3 done → extended in T11 | Dashboard |
| `HoldingsTable.jsx` | ✅ T4 done → reused in T14 | Assets page |
| `AllocationChart.jsx` | ✅ T5 done → extended in T12 | Dashboard |
| `MarketSummaryCard.jsx` | ✅ T6 done | Dashboard |
| `Header.jsx` | ✅ T7 done | App shell |
| `Sidebar.jsx` | Exists (static) → wired in T10 | App shell |
| `TotalAssetsCard.jsx` | New — T11 | Dashboard |
| `CashOnHandCard.jsx` | New — T11 | Dashboard |
| `DebtsCard.jsx` | New — T11 | Dashboard |
| `TaxEstimateCard.jsx` | New — T11 | Dashboard |
| `GoalProgressCard.jsx` | New — T13 | Dashboard |
| `AssetsPage.jsx` | New — T14 | Assets page |
| `AddAssetModal.jsx` | New — T14 | Assets page (modal) |
| `GoalsPage.jsx` | New — T15 | Goals page |
| `server/` | New — T16–T18 | Backend |

### Persistence Strategy

| Data | Storage | Written by | Read by |
|------|---------|------------|---------|
| Portfolio (holdings, net worth, deltas) | In-memory (App state) + backend cache (T16) | Sync API / CSV import | Dashboard, AssetsPage |
| CSV uploads | Backend file/cache per platform | `POST /api/import/csv` | Sync API |
| Broker credentials | Server-side only (`.env` / secure store) | Connect endpoints (T17/T18) | Sync API |
| Goal config | `localStorage` `wb-goal-config` | GoalsPage | GoalProgressCard, GoalsPage |
| Manual assets | `localStorage` `wb-manual-assets` | AssetsPage | AssetsPage |
| Liabilities | `localStorage` `wb-liabilities` | AssetsPage | DebtsCard (via Dashboard), AssetsPage |

### Backend Data Model Requirements (for T11)

The portfolio API response must include these fields (or be extended to include them before T11 can be fully functional):

```js
{
  netWorth: Number,         // assetsTotal − debtsTotal (debts from API if available)
  assetsTotal: Number,      // sum of all holding values
  cashOnHand: Number,       // sum of holdings where assetType === 'cash'
  taxEstimate: Number|null, // CGT estimate; null if no cost basis data
  delta: {
    assets1d:    Number,    // AUD change vs yesterday
    assets1dPct: Number,    // % change vs yesterday
    assets1w:    Number,    // AUD change vs 7 days ago
    assets1wPct: Number,    // % change vs 7 days ago
  },
  holdings: [...],          // includes assetType field
  connections: [            // NEW — per-platform status for Assets page
    { platform: 'ibkr-business'|'ibkr-personal'|'coinspot', status: 'connected'|'disconnected', lastSync: String|null }
  ],
  aiSummary: String|null,
  apiKeyMissing: Boolean,
  errors: [...]
}
```

> **T11 fallback:** Until T16 ships, Dashboard can derive `assetsTotal` and `cashOnHand` from holdings client-side; show "–" for missing deltas/tax.
