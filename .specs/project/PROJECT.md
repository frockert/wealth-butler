# Wealth Butler

**Vision:** An always-on personal portfolio advisor that gives AU self-directed investors a single, honest picture of their wealth, per-holding stock analysis, and ongoing allocation guidance — replacing the spreadsheet and the financial adviser.

**For:** Solo AU self-directed investor (FIRE-minded). Multi-user release planned if the product proves out.

**Solves:** Wealth is split across brokers, crypto, banks, super, and spreadsheets that never stay current. No single view of net worth, no company-level analysis, no goal tracking, no ongoing allocation guidance.

## Goals

- Replace the manual spreadsheet with a live net-worth dashboard (broker + crypto + manual assets) — success = daily use instead of spreadsheet
- Provide FIRE goal progress visibility — success = can answer "am I on track?" in under 30 seconds
- Analyse every holding across 6 dimensions and use that to drive DCA and allocation guidance — success = weekly review workflow fully inside the app, no external research tools needed

## Tech Stack

**Core:**

- Framework: React 18 + Vite
- Language: JavaScript (JSX)
- Database: none for MVP; SQLite or JSON cache later

**Key dependencies:** Tailwind CSS, Recharts (charts), Lucide React (icons), Claude API (AI analyst + goal setup), market data API (Financial Modelling Prep or Polygon.io for fundamentals; yfinance + CoinGecko for prices)

## Scope

### Iteration 1 — MVP

**Pages:**

- **Dashboard** — net worth total (AUD), goal progress summary, AI market summary relevant to holdings, sync button + last-updated timestamp. Configurable chart panel — user can select which charts to display from:
  - Stock sectors distribution
  - All sectors distribution (stocks + crypto + other)
  - Crypto distribution
  - Investable assets ex-cash
- **Assets** — manual asset entry + platform connections. Two broker integrations supported at launch; architecture supports additional integrations. All other assets entered manually.
- **Goals** — AI-guided setup flow (prompted questions → generates goal config); goal page is fully editable after setup. Tracks FIRE target, timeline, and current progress.

**Out of scope:**

- Login / multi-user / auth
- Banks, super, property integrations (manual entry only for now)
- DCA module
- Stock research / grading
- Fast Forward projections

---

### Iteration 2 — AI Analyst + DCA + Fast Forward

**AI Analyst:**

- Per-holding Snowflake-style grade across 6 dimensions:
  1. Valuation
  2. Growth
  3. Financial Health
  4. Past Performance
  5. Dividends
  6. Tax Efficiency (AU franking credits, CGT discount eligibility)
- Coverage: ASX, US (NYSE/NASDAQ), and global markets
- Grades powered by market data API; narrative and synthesis via Claude API
- AI analyst briefing: butler-style analysis of each holding tied to actual positions, not generic market news
- DCA guidance at two levels:
  - **Per-holding:** e.g. "add to VGS this week" based on grade + current allocation
  - **Portfolio-level:** e.g. "underweight international equities — deploy $X here" based on target allocation vs actuals
- Grades drive all DCA recommendations — no advice without analytical basis

**Fast Forward:**

- Dedicated page projecting portfolio value at 1, 5, 10, 20+ year horizons
- Landing view: asset value per year (chart + table)
- Below the fold: assumption editor — growth rate per asset class, mix of AI-suggested defaults (pre-populated by Claude based on asset type and historical data) and manual overrides
- Scenarios: at minimum a base case; stretch goal is bull/base/bear toggle

**Out of scope:**

- Automated trade execution
- Goal adviser chat interface
- Multi-broker hardening beyond initial two integrations

---

### Iteration 3 — Public Release

**Includes:**

- Login via Google only (no username/password)
- Additional platform integrations (TBC)
- FIRE milestone visualisation enhancements
- Public launch hardening, performance, and polish
- TBC based on Iteration 1–2 learnings

## Constraints

- Timeline: solo pet project — ship something useful fast, iterate
- Technical: no Postgres or auth for MVP; secrets via `.env`
- Resources: single developer