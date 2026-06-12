import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCoinspotCsv } from '../parsers/coinspot.js';
import { parseIbkrCsv } from '../parsers/ibkr.js';
import { store } from '../store.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

/** Load sample CSV fixtures when the store is empty (local dev convenience). */
export function seedDevDataIfEmpty() {
  const hasHoldings = Object.values(store.sources).some((s) => s.holdings.length > 0);
  if (hasHoldings) return false;

  const now = new Date().toISOString();
  const loads = [
    ['ibkr-business', 'ibkr-business-sample.csv'],
    ['ibkr-personal', 'ibkr-personal-sample.csv'],
    ['coinspot', 'coinspot-sample.csv'],
  ];

  for (const [platform, file] of loads) {
    const csv = readFileSync(join(fixturesDir, file), 'utf8');
    const holdings =
      platform === 'coinspot'
        ? parseCoinspotCsv(csv)
        : parseIbkrCsv(csv, platform);
    store.sources[platform].holdings = holdings;
    store.sources[platform].lastSync = now;
  }

  store.lastUpdated = now;
  console.log('Loaded sample portfolio from server/fixtures/');
  return true;
}
