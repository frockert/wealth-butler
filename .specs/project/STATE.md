# Wealth Butler — State

*Persistent memory: decisions, blockers, lessons, deferred ideas.*

---

## Current Status

**Phase:** Iteration 0 — Scaffolding
**Last updated:** 2026-05-29
**Next action:** Write MVP specs (Iteration 1) — `01-mvp-dashboard.md` and `02-mvp-integrations.md`

---

## Decisions

| ID | Decision | Reason | Date |
|----|----------|--------|------|
| D-001 | React + Vite + Tailwind | Fast iteration, familiar stack | 2026-05-29 |
| D-002 | No auth / no Postgres for MVP | Ship fast, solo use | 2026-05-29 |
| D-003 | Secrets via `.env` | Simple, no secrets manager needed for solo pet project | 2026-05-29 |

---

## Open Decisions

| ID | Question | Options | Priority |
|----|----------|---------|----------|
| OD-001 | Coinspot: API vs CSV import? | API (real-time) vs CSV (simpler, no key mgmt) | High — needed for Iteration 1 spec |
| OD-002 | Thin backend vs all-frontend? | Express/Hono API vs Vite proxy vs CORS-friendly direct calls | High — needed for IBKR gateway |
| OD-003 | Market data source for 200 DMA? | Yahoo Finance, Alpha Vantage, Polygon.io | Medium |

---

## Blockers

*None.*

---

## Deferred Ideas

- Multi-tenant / auth / cloud deploy (Iteration 6+)
- Binance, Stake, major exchanges integration (Iteration 6+)
- Notification / alerts system
- Mobile view / PWA

---

## Lessons Learned

*None yet.*

---

## Preferences

*None recorded yet.*
