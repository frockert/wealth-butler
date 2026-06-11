# Wealth Butler — Roadmap

## Milestones

```
[Iteration 0]  Scaffolding + specs         ✅ Done
[Iteration 1]  MVP: Dashboard + Assets + Goals + CSV + broker connect  ← current (~40% frontend)
[Iteration 2]  AI Analyst + DCA + Fast Forward
[Iteration 3]  Public Release (auth, hardening, multi-broker)
```

---

## Iteration 0 — Scaffolding ✅ Done

**Goal:** Clean repo, blank running service, specs approved.

| Feature | Status |
|---------|--------|
| React + Vite blank app running | ✅ Done |
| Git repository initialised | ✅ Done |
| PROJECT.md + ROADMAP.md + STATE.md | ✅ Done |
| README | ✅ Done |
| MVP specs written and approved | ✅ Done |

---

## Iteration 1 — MVP: Dashboard, Assets, Goals & Data (current)

**Goal:** Kubera-style portfolio hub. Replace the spreadsheet for IBKR + Coinspot. Daily use. FIRE goal visible. CSV-first data path, then live broker connections.

**Implementation progress:** T1–T9 done (~40% frontend). T10–T18 remaining.

### Frontend

| Feature | Task | Status |
|---------|------|--------|
| API client (`fetchPortfolio`, `syncPortfolio`) | T1 | ✅ Done |
| Dashboard shell + empty state + error banner | T2, T8, T9 | ✅ Done |
| Net worth card (basic value + skeleton) | T3 | ✅ Partial — Investable/CAGR in T11 |
| Holdings table component | T4 | ✅ Done — on Dashboard until T14 |
| Allocation chart (single sector pie) | T5 | ✅ Partial — 4 tabs in T12 |
| AI market summary card | T6 | ✅ Done |
| Sync button + last updated timestamp | T7 | ✅ Done |
| Sidebar navigation + portfolio state in App | T10 | ⏳ Not started |
| 5 summary cards + dashboard layout | T11 | ⏳ Not started |
| Configurable chart panel (4 chart types) | T12 | ⏳ Not started |
| Goal progress summary card (Dashboard) | T13 | ⏳ Not started |
| Assets page + +Asset modal (connect/CSV/manual) | T14 | ⏳ Not started |
| Goals page (AI-guided FIRE setup + editable) | T15 | ⏳ Not started |

### Backend & integrations

| Feature | Task | Status |
|---------|------|--------|
| Backend service scaffold | T16 | ⏳ Not started — no backend in repo |
| IBKR + Coinspot CSV upload + AI parse | T16 | ⏳ Not started — **first data path** |
| Portfolio API (`assetsTotal`, `delta`, `taxEstimate`, etc.) | T16 | ⏳ Not started |
| Live IBKR connection (business + personal) | T17 | ⏳ Not started — after T16 |
| Live Coinspot connection | T18 | ⏳ Not started — after T16 |

### Recommended build order

1. T10 — Navigation + hoist portfolio to App
2. T11 — 5-card dashboard layout
3. T12 + T13 — Charts tabs + goal card (parallel)
4. T14 + T15 — Assets page + Goals page (parallel)
5. **T16** — Backend CSV path (unblocks daily use)
6. T17 + T18 — Live broker connections (parallel)

*Exit: stop updating the spreadsheet for IBKR + Coinspot; FIRE goal progress visible daily; connect brokers via +Asset modal.*

---

## Iteration 2 — AI Analyst + DCA + Fast Forward

**Goal:** Per-holding analysis drives DCA and allocation guidance; Fast Forward projections.

| Feature | Status |
|---------|--------|
| Per-holding Snowflake-style grade (6 dimensions) | TBD |
| ASX, US, and global market coverage | TBD |
| AI analyst briefing (butler-style, tied to positions) | TBD |
| DCA guidance: per-holding and portfolio-level | TBD |
| Fast Forward projections (1, 5, 10, 20+ year) | TBD |
| Assumption editor (growth rates, AI defaults + manual overrides) | TBD |
| Manual assets reflected in Dashboard net worth | TBD |
| CSV import for banks / super | TBD |

*Exit: weekly review workflow fully inside the app; cash deployment guided.*

---

## Iteration 3 — Public Release

**Goal:** Multi-user ready; login; additional integrations; hardened for public use.

| Feature | Status |
|---------|--------|
| Login via Google only (no username/password) | TBD |
| Additional platform integrations (TBC) | TBD |
| FIRE milestone visualisation enhancements | TBD |
| Performance and polish pass | TBD |
| TBC based on Iteration 1–2 learnings | TBD |

*Exit: public launch.*
