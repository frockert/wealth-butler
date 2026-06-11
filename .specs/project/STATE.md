# Wealth Butler — State

*Persistent memory: decisions, blockers, lessons, deferred ideas.*

---

## Current Status

**Phase:** Iteration 1 — MVP (in progress)
**Last updated:** 2026-06-10
**Completed:** T1–T9 (Dashboard shell, all dashboard components, App.jsx wiring, empty state + error banner)
**Next action:** T10 — Wire navigation (Sidebar + App.jsx), then T11/T12 in parallel, then T13/T14 in parallel

---

## Decisions

| ID | Decision | Reason | Date |
|----|----------|--------|------|
| D-001 | React + Vite + Tailwind | Fast iteration, familiar stack | 2026-05-29 |
| D-002 | No auth / no Postgres for MVP | Ship fast, solo use | 2026-05-29 |
| D-003 | Secrets via `.env` | Simple, no secrets manager needed for solo pet project | 2026-05-29 |
| D-004 | State-based page routing (no React Router) | MVP simplicity; no URL requirements; avoids extra dep | 2026-06-10 |
| D-005 | localStorage for goal config + manual assets | Client-only data; zero backend setup needed for MVP | 2026-06-10 |
| D-006 | Swiss Neo-Brutalism design system | Hard borders, accent fills, monospace numerics — matches editorial/precision aesthetic | 2026-06-10 |

---

## Open Decisions

| ID | Question | Options | Priority |
|----|----------|---------|----------|
| OD-001 | Coinspot: API vs CSV import? | API (real-time) vs CSV (simpler, no key mgmt) | High — needed for Iteration 1 backend |
| OD-002 | Thin backend vs all-frontend? | Express/Hono API vs Vite proxy vs CORS-friendly direct calls | High — needed for IBKR gateway |
| OD-003 | Market data source for stock fundamentals? | Yahoo Finance, Alpha Vantage, Polygon.io, FMP | Medium — needed for Iteration 2 |
| OD-004 | Goals AI call — direct client or Hono proxy? | Direct Claude API from browser vs proxy through backend to avoid CORS | Medium — needed for T14 |

---

## Blockers

*None.*

---

## Deferred Ideas

- Multi-tenant / auth / cloud deploy (Iteration 3)
- Binance, Stake, major exchanges integration (Iteration 3+)
- Notification / alerts system
- Mobile view / PWA
- Automated trade execution
- Goal adviser chat interface (continuous conversation, not just setup)

---

## Lessons Learned

- AllocationChart was spec'd as a single sector chart; PROJECT.md update expanded it to a 4-tab configurable panel — added `assetType` field requirement to portfolio data model
- Assets and Goals pages moved from Iterations 2/3 into Iteration 1 — scope increased but manageable since they are self-contained pages
- Dashboard holdings table removed — it moves entirely to the Assets page; Dashboard becomes a pure summary/metrics view (5 cards + goal + charts + AI summary)
- Dashboard now requires 4 new backend fields: `assetsTotal`, `cashOnHand`, `taxEstimate`, `delta` — these are net-new API requirements for T11

---

## Preferences

*None recorded yet.*
