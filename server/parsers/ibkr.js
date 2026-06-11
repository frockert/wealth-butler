import { EXCHANGE_BY_PLATFORM } from '../store.js';
import { normalizeHolding } from '../lib/portfolio.js';

const CASH_SYMBOLS = new Set(['AUD', 'USD', 'EUR', 'GBP', 'CASH']);

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

function rowsToObjects(header, dataRows) {
  return dataRows.map((row) => {
    const obj = {};
    header.forEach((col, i) => {
      obj[col] = row[i] ?? '';
    });
    return obj;
  });
}

function parseOpenPositionsSection(lines, exchange) {
  const holdings = [];
  let header = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols[0] !== 'Open Positions') continue;

    if (cols[1] === 'Header') {
      header = cols.slice(2);
      continue;
    }

    if (cols[1] !== 'Data' || !header) continue;

    const row = rowsToObjects(header, [cols.slice(2)])[0];
    const discriminator = row['DataDiscriminator'] ?? row['Data Discriminator'] ?? '';
    if (discriminator && discriminator !== 'Summary') continue;

    const symbol = (row.Symbol ?? row.symbol ?? '').trim();
    if (!symbol || symbol === 'Total') continue;

    const qty = parseNumber(row.Quantity ?? row.Qty);
    if (qty === 0) continue;

    const currency = (row.Currency ?? 'AUD').toUpperCase();
    const closePrice = parseNumber(row['Close Price'] ?? row['Mark Price'] ?? row.Price);
    let value = parseNumber(row.Value ?? row['Position Value'] ?? row['Market Value']);
    const costBasis = parseNumber(row['Cost Basis'] ?? row['Cost Price']);

    if (!value && closePrice && qty) value = closePrice * qty;

    const assetType = detectAssetType(symbol, row['Asset Category'] ?? row['AssetClass']);

    holdings.push(
      normalizeHolding(
        {
          ticker: symbol,
          qty,
          price: closePrice,
          value,
          currency,
          costBasisAUD: currency === 'USD' ? costBasis * 1.55 : costBasis,
        },
        exchange,
        assetType,
      ),
    );
  }

  return holdings;
}

function parseSimpleHeaderCsv(lines, exchange) {
  const nonEmpty = lines.filter((l) => l.trim());
  if (nonEmpty.length < 2) return null;

  const header = parseCsvLine(nonEmpty[0]).map(normalizeHeader);
  const symbolIdx = findCol(header, ['symbol', 'ticker']);
  const qtyIdx = findCol(header, ['quantity', 'qty', 'shares']);
  if (symbolIdx < 0 || qtyIdx < 0) return null;

  const priceIdx = findCol(header, ['mark price', 'close price', 'price', 'last price']);
  const valueIdx = findCol(header, ['value', 'position value', 'market value', 'aud value']);
  const currencyIdx = findCol(header, ['currency']);

  const holdings = [];
  for (const line of nonEmpty.slice(1)) {
    const cols = parseCsvLine(line);
    const symbol = cols[symbolIdx]?.trim();
    if (!symbol) continue;

    const qty = parseNumber(cols[qtyIdx]);
    if (qty === 0) continue;

    const price = priceIdx >= 0 ? parseNumber(cols[priceIdx]) : 0;
    let value = valueIdx >= 0 ? parseNumber(cols[valueIdx]) : 0;
    if (!value && price && qty) value = price * qty;

    const currency = currencyIdx >= 0 ? cols[currencyIdx]?.toUpperCase() : 'AUD';

    holdings.push(
      normalizeHolding(
        { ticker: symbol, qty, price, value, currency },
        exchange,
        detectAssetType(symbol),
      ),
    );
  }

  return holdings.length ? holdings : null;
}

function normalizeHeader(h) {
  return h.replace(/^"|"$/g, '').trim().toLowerCase();
}

function findCol(header, names) {
  for (const name of names) {
    const idx = header.indexOf(name);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseNumber(val) {
  if (val == null || val === '') return 0;
  const n = Number(String(val).replace(/,/g, '').replace(/"/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function detectAssetType(symbol, category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('cash') || CASH_SYMBOLS.has(symbol.toUpperCase())) return 'cash';
  if (cat.includes('crypto')) return 'crypto';
  return 'stock';
}

/**
 * Parse IBKR business or personal CSV export.
 * @param {string} csvText
 * @param {'ibkr-business'|'ibkr-personal'} platform
 */
export function parseIbkrCsv(csvText, platform) {
  if (!csvText?.trim()) {
    throw new Error('CSV file is empty');
  }

  const exchange = EXCHANGE_BY_PLATFORM[platform];
  if (!exchange) {
    throw new Error(`Unknown IBKR platform: ${platform}`);
  }

  const lines = csvText.replace(/\r\n/g, '\n').split('\n');

  if (lines.some((l) => l.startsWith('Open Positions'))) {
    const holdings = parseOpenPositionsSection(lines, exchange);
    if (holdings.length === 0) {
      throw new Error('No open positions found in IBKR statement CSV');
    }
    return holdings;
  }

  const simple = parseSimpleHeaderCsv(lines, exchange);
  if (simple?.length) return simple;

  throw new Error(
    'Unrecognised IBKR CSV format — expected Activity Statement "Open Positions" section or Symbol/Quantity header row',
  );
}
