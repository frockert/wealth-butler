import { EXCHANGE_BY_PLATFORM } from '../store.js';
import { normalizeHolding } from '../lib/portfolio.js';

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(h) {
  return h.replace(/^"|"$/g, '').trim().toLowerCase();
}

function findCol(header, names) {
  for (const name of names) {
    const idx = header.findIndex((h) => h.includes(name));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseNumber(val) {
  if (val == null || val === '') return 0;
  const n = Number(String(val).replace(/,/g, '').replace(/\$/g, '').replace(/"/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parse Coinspot portfolio/balance CSV export.
 * @param {string} csvText
 */
export function parseCoinspotCsv(csvText) {
  if (!csvText?.trim()) {
    throw new Error('CSV file is empty');
  }

  const exchange = EXCHANGE_BY_PLATFORM.coinspot;
  const lines = csvText.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim());
  if (lines.length < 2) {
    throw new Error('Coinspot CSV must include a header row and at least one data row');
  }

  const header = parseCsvLine(lines[0]).map(normalizeHeader);
  const coinIdx = findCol(header, ['coin', 'symbol', 'ticker', 'asset']);
  const qtyIdx = findCol(header, ['balance', 'amount', 'qty', 'quantity', 'holdings']);
  const valueIdx = findCol(header, ['aud', 'value', 'aud value', 'audbalance', 'total']);

  if (coinIdx < 0) {
    throw new Error('Coinspot CSV missing Coin/Symbol column');
  }

  const holdings = [];

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const coin = cols[coinIdx]?.trim().toUpperCase();
    if (!coin || coin === 'TOTAL') continue;

    const qty = qtyIdx >= 0 ? parseNumber(cols[qtyIdx]) : 0;
    let valueAUD = valueIdx >= 0 ? parseNumber(cols[valueIdx]) : 0;

    if (qty === 0 && valueAUD === 0) continue;

    const priceAUD = qty ? valueAUD / qty : valueAUD;

    holdings.push(
      normalizeHolding(
        { ticker: coin, qty: qty || 1, price: priceAUD, value: valueAUD },
        exchange,
        'crypto',
      ),
    );
  }

  if (holdings.length === 0) {
    throw new Error('No Coinspot balances found in CSV');
  }

  return holdings;
}
