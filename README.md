# Wealth Butler

An always-on personal portfolio advisor for AU self-directed investors.

## What it is now

A blank React + Vite app — scaffolding only. The service runs, nothing else is built yet.

## What it will be

A single-view wealth dashboard that replaces the spreadsheet: live net worth across IBKR (business + personal), Coinspot, and manual assets — with allocation charts, FIRE goal tracking, AI-powered briefings, and semi-auto DCA guidance.

### Planned features

| Feature | Status |
|---------|--------|
| Net worth dashboard (IBKR + Coinspot + manual) | TBD |
| Holdings table + sector/allocation chart | TBD |
| Sync button + last updated | TBD |
| AI market update summary | TBD |
| FIRE goal setup (adviser chat) | TBD |
| Weekly briefing + allocation advisory | TBD |
| DCA semi-auto module | TBD |
| Multi-broker support (Binance, Stake, etc.) | TBD |
| Auth / multi-user / cloud deploy | TBD |

## Tech stack

- React 18 + Vite
- Tailwind CSS
- Recharts *(TBD — added when charts are built)*
- Claude API *(TBD — added when AI features are built)*

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/          # App source
.specs/       # Specs and project memory (TLC-spec-driven)
  project/    # PROJECT.md, ROADMAP.md, STATE.md
  features/   # Feature specs (added per iteration)
.github/      # CI workflow
```

## Specs

See [.specs/project/PROJECT.md](.specs/project/PROJECT.md) for vision and goals.  
See [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) for the iteration plan.
