# Wealth Butler — State

*Persistent memory: decisions, blockers, lessons, deferred ideas.*

---

## Current Status

**Phase:** Iteration 1 — MVP (T1–T18 complete)
**Last updated:** 2026-06-11
**Completed:** T1–T18 (full MVP frontend + backend: CSV ingest, live IBKR Flex Query/Gateway + Coinspot API connections, sync merge)
**Next action:** Iteration 2 planning (market data fundamentals, bank CSV)

---

## Decisions

| ID | Decision | Reason | Date |
|----|----------|--------|------|
| D-001 | React + Vite + Tailwind | Fast iteration, familiar stack | 2026-05-29 |
| D-002 | No auth / no Postgres for MVP | Ship fast, solo use | 2026-05-29 |
| D-003 | Secrets via `.env` | Simple, no secrets manager needed for solo pet project | 2026-05-29 |
| D-004 | State-based page routing (no React Router) | MVP simplicity; no URL requirements; avoids extra dep | 2026-06-10 |
| D-005 | localStorage for goal config + manual assets | Client-only data; zero backend setup needed for MVP | 2026-06-10 |
| D-006 | Swiss Neo-Brutalism design system | Hard borders, accent fills, Space Grotesk + Space Mono typography | 2026-06-10 |
| D-010 | Space Grotesk (`font-sans`) + Space Mono (`.label-mono`) | Grotesk for body/headings/hero numbers; Mono for uppercase labels and table data | 2026-06-11 |
| D-007 | CSV-first data path for IBKR + Coinspot | Ship daily-use MVP before live broker APIs; AI-assisted parsing | 2026-06-11 |
| D-008 | + Asset modal for connect/manage UX | Kubera-style popup from Assets table; replaces static platform list section | 2026-06-11 |
| D-009 | Live broker connections after CSV (T17/T18) | Same modal; CSV remains fallback | 2026-06-11 |
| D-011 | IBKR live via Flex Query (primary) + Client Portal Gateway (alt) | Flex Query is env-only MVP; no Java gateway required; reuses IBKR CSV parser | 2026-06-11 |

---

## Open Decisions

| ID | Question | Options | Priority |
|----|----------|---------|----------|
| OD-002 | Thin backend vs all-frontend? | ~~Hono API (planned T16)~~ **Resolved: Hono on :3001 (T16)** | — |
| OD-003 | Market data source for stock fundamentals? | Yahoo Finance, Alpha Vantage, Polygon.io, FMP | Medium — needed for Iteration 2 |
| OD-004 | Goals AI call — direct client or Hono proxy? | ~~Direct Claude API from browser~~ **Resolved: direct client via `VITE_ANTHROPIC_API_KEY` (T15)** | — |
| OD-005 | IBKR live connection method? | ~~Flex Query vs Gateway~~ **Resolved: Flex Query primary (D-011), Gateway fallback** | — |

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
- Dashboard now requires 4 new backend fields: `assetsTotal`, `cashOnHand`, `taxEstimate`, `delta` — these are net-new API requirements for T11 (T16 backend)
- CSV import moved from Iteration 2 into Iteration 1 (T16) — IBKR + Coinspot first; banks/super CSV stays Iteration 2
- Assets page UX changed from static platform list to +Asset modal (Connect broker / Upload CSV / Manual asset) per Kubera-style connect flow
- T17/T18 live connections: IBKR Flex Query + Gateway env vars; Coinspot API key via modal or `.env`; sync merges live + CSV; credentials never sent to client

---

## Preferences

*None recorded yet.*
