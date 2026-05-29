# Wealth Butler

**Vision:** An always-on personal portfolio advisor that gives AU self-directed investors a single, honest picture of their wealth and ongoing allocation guidance — starting with a simple dashboard that replaces the spreadsheet.

**For:** Solo AU self-directed investor (IBKR + Coinspot, FIRE-minded). Multi-user optional later.

**Solves:** Wealth is split across IBKR, crypto, banks, super, and spreadsheets that never stay current. No single view of net worth, no goal tracking, no ongoing allocation guidance.

## Goals

- Replace the manual spreadsheet with a live net-worth dashboard (IBKR + Coinspot + manual assets) — success = daily use instead of spreadsheet
- Provide FIRE goal progress visibility — success = can answer "am I on track?" in under 30 seconds
- Surface allocation guidance and weekly briefings tied to the individual portfolio — success = weekly review workflow fully inside the app

## Tech Stack

**Core:**

- Framework: React 18 + Vite
- Language: JavaScript (JSX)
- Database: none for MVP; SQLite or JSON cache later

**Key dependencies:** Tailwind CSS, Recharts (charts), Lucide React (icons), Claude API (AI features — post-MVP)

## Scope

**MVP includes:**

- Net worth dashboard: combined AUD total across IBKR (business + personal) + Coinspot + manual assets
- Holdings table + sector/allocation pie chart
- Sync button with last-updated timestamp
- AI market update summary relevant to the portfolio
- Local/simple hosting — no accounts system

**Explicitly out of scope (MVP):**

- Login / multi-user / auth
- Banks, super, property integrations (manual CSV only)
- Goal adviser chat
- DCA semi-auto module
- Multi-broker product hardening (Binance, Stake, etc.)

## Constraints

- Timeline: solo pet project — ship something useful fast, iterate
- Technical: no Postgres or auth for MVP; secrets via `.env`
- Resources: single developer
