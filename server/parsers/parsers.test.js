import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseIbkrCsv } from './ibkr.js';
import { parseCoinspotCsv } from './coinspot.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

function loadFixture(name) {
  return readFileSync(join(fixturesDir, name), 'utf8');
}

describe('parseIbkrCsv', () => {
  it('parses IBKR business Activity Statement Open Positions', () => {
    const holdings = parseIbkrCsv(loadFixture('ibkr-business-sample.csv'), 'ibkr-business');

    expect(holdings).toHaveLength(3);
    expect(holdings[0]).toMatchObject({
      ticker: 'AAPL',
      exchange: 'IBKR-BIZ',
      qty: 50,
      assetType: 'stock',
    });
    expect(holdings[0].valueAUD).toBeGreaterThan(0);

    const cash = holdings.find((h) => h.ticker === 'AUD');
    expect(cash).toMatchObject({ assetType: 'cash', exchange: 'IBKR-BIZ' });
  });

  it('parses IBKR personal CSV with AUD and USD positions', () => {
    const holdings = parseIbkrCsv(loadFixture('ibkr-personal-sample.csv'), 'ibkr-personal');

    expect(holdings).toHaveLength(2);
    expect(holdings.map((h) => h.ticker)).toEqual(['NVDA', 'CBA']);
    expect(holdings.every((h) => h.exchange === 'IBKR-PERSONAL')).toBe(true);
  });

  it('throws on empty CSV without wiping caller state', () => {
    expect(() => parseIbkrCsv('', 'ibkr-business')).toThrow(/empty/i);
  });
});

describe('parseCoinspotCsv', () => {
  it('parses Coinspot balance export', () => {
    const holdings = parseCoinspotCsv(loadFixture('coinspot-sample.csv'));

    expect(holdings).toHaveLength(3);
    expect(holdings[0]).toMatchObject({
      ticker: 'BTC',
      exchange: 'COINSPOT',
      assetType: 'crypto',
      valueAUD: 25000,
    });
    expect(holdings[1].ticker).toBe('ETH');
    expect(holdings[2].ticker).toBe('SOL');
  });

  it('throws when no balances found', () => {
    expect(() =>
      parseCoinspotCsv('Coin,Balance,AUD Value\nBTC,0,0\n'),
    ).toThrow(/no coinspot balances/i);
  });
});
