# Wealth Butler — Roadmap

## Milestones

```
[Iteration 0]  Scaffolding + specs         ← current
[Iteration 1]  MVP: Dashboard + IBKR + Coinspot
[Iteration 2]  Complete net worth (manual/CSV assets)
[Iteration 3]  Goal setup (adviser chat)
[Iteration 4]  Briefing + allocation advisory
[Iteration 5]  DCA semi-auto module
[Iteration 6+] Product hardening (optional)
```

---

## Iteration 0 — Scaffolding (current)

**Goal:** Clean repo, blank running service, specs approved.

| Feature | Status |
|---------|--------|
| React + Vite blank app running | ✅ Done |
| Git repository initialised | ✅ Done |
| PROJECT.md + ROADMAP.md + STATE.md | ✅ Done |
| README | ✅ Done |
| MVP specs written and approved | ⏳ Pending |

---

## Iteration 1 — MVP: Dashboard & Visualisation

**Goal:** Replace the spreadsheet for IBKR + Coinspot. Daily use.

| Feature | Status |
|---------|--------|
| IBKR integration (business + personal) | TBD |
| Coinspot integration (API or CSV) | TBD |
| Net worth total (AUD) | TBD |
| Holdings table | TBD |
| Sector / allocation pie chart | TBD |
| Sync button + last updated timestamp | TBD |
| AI market update summary | TBD |

*Exit: stop updating the spreadsheet for IBKR + Coinspot.*

---

## Iteration 2 — Complete Net Worth

**Goal:** One honest net-worth number including all asset classes.

| Feature | Status |
|---------|--------|
| Manual asset entry (cash, super, property) | TBD |
| CSV import for banks/super | TBD |

*Exit: single accurate net-worth figure.*

---

## Iteration 3 — Goal Setup (Adviser Chat)

**Goal:** FIRE plan set in conversation; progress visible on dashboard.

| Feature | Status |
|---------|--------|
| Claude-backed onboarding chat | TBD |
| Goal card on dashboard | TBD |
| Local persistence (SQLite or JSON) | TBD |

*Exit: FIRE plan visible next to holdings.*

---

## Iteration 4 — Briefing & Allocation Advisory

**Goal:** Weekly review workflow fully inside the app.

| Feature | Status |
|---------|--------|
| On-demand portfolio briefing | TBD |
| Portfolio vs goal gap analysis | TBD |
| Rule templates (200 DMA, concentration, profit-take) | TBD |

*Exit: weekly review workflow in the app.*

---

## Iteration 5 — DCA Module

**Goal:** Less manual research when deploying cash.

| Feature | Status |
|---------|--------|
| DCA amount + period input | TBD |
| Allocation suggestions | TBD |
| IBKR order prep (semi-auto) | TBD |

*Exit: cash deployment workflow inside the app.*

---

## Iteration 6+ — Product Hardening (Optional)

Auth, Postgres, connector framework, cloud hosting, multi-broker support (Binance, Stake), billing. Spec when MVP is trusted in daily use.
