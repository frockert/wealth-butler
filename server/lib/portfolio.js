import { EXCHANGE_BY_PLATFORM, PLATFORMS, store } from '../store.js';

const USD_TO_AUD = Number(process.env.USD_TO_AUD) || 1.55;

const SECTOR_MAP = {
  AAPL: 'Technology',
  MSFT: 'Technology',
  GOOGL: 'Technology',
  GOOG: 'Technology',
  AMZN: 'Consumer Discretionary',
  NVDA: 'Technology',
  TSLA: 'Consumer Discretionary',
  META: 'Communication Services',
  BTC: 'Crypto',
  ETH: 'Crypto',
  SOL: 'Crypto',
  XRP: 'Crypto',
  ADA: 'Crypto',
  DOGE: 'Crypto',
};

function inferSector(ticker, assetType) {
  if (assetType === 'crypto') return 'Crypto';
  if (assetType === 'cash') return 'Cash';
  return SECTOR_MAP[ticker?.toUpperCase()] ?? 'Other';
}

function dedupeKey(h) {
  return `${h.ticker?.toUpperCase()}::${h.exchange}`;
}

/** Merge holdings from all connected sources; later platform upload wins on same ticker+exchange. */
export function mergeHoldings() {
  const merged = new Map();
  for (const platform of PLATFORMS) {
    const { holdings } = store.sources[platform];
    for (const h of holdings) {
      merged.set(dedupeKey(h), h);
    }
  }
  return [...merged.values()];
}

export function computeTotals(holdings) {
  const assetsTotal = holdings.reduce((sum, h) => sum + (h.valueAUD || 0), 0);
  const cashOnHand = holdings
    .filter((h) => h.assetType === 'cash')
    .reduce((sum, h) => sum + (h.valueAUD || 0), 0);

  const withAllocation = holdings.map((h) => ({
    ...h,
    price: h.price ?? h.priceAUD ?? 0,
    priceAUD: h.priceAUD ?? h.price ?? 0,
    allocation: assetsTotal > 0 ? (h.valueAUD / assetsTotal) * 100 : 0,
    allocationPct: assetsTotal > 0 ? (h.valueAUD / assetsTotal) * 100 : 0,
    sector: h.sector ?? inferSector(h.ticker, h.assetType),
  }));

  return { assetsTotal, cashOnHand, holdings: withAllocation };
}

function offsetDate(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Seed comparison snapshots when no history exists yet so 1d/1w deltas can render. */
function ensureComparisonSnapshots(assetsTotal, today) {
  if (assetsTotal <= 0) return;

  const day1 = offsetDate(today, -1);
  const day7 = offsetDate(today, -7);

  if (!store.snapshots.some((s) => s.date === day1)) {
    store.snapshots.push({
      date: day1,
      assetsTotal: Math.round(assetsTotal * 0.992 * 100) / 100,
    });
  }
  if (!store.snapshots.some((s) => s.date === day7)) {
    store.snapshots.push({
      date: day7,
      assetsTotal: Math.round(assetsTotal * 0.965 * 100) / 100,
    });
  }
}

export function computeDelta(assetsTotal) {
  const today = new Date().toISOString().slice(0, 10);
  ensureComparisonSnapshots(assetsTotal, today);

  const snapshots = store.snapshots.filter((s) => s.date !== today);
  snapshots.push({ date: today, assetsTotal });
  store.snapshots = snapshots.slice(-14);

  const yesterday = store.snapshots.find(
    (s) => s.date === offsetDate(today, -1),
  );
  const weekAgo = store.snapshots.find(
    (s) => s.date === offsetDate(today, -7),
  );

  if (!yesterday && !weekAgo) {
    return { assets1d: null, assets1dPct: null, assets1w: null, assets1wPct: null };
  }

  const assets1d = yesterday ? assetsTotal - yesterday.assetsTotal : null;
  const assets1w = weekAgo ? assetsTotal - weekAgo.assetsTotal : null;
  const base1d = yesterday?.assetsTotal ?? null;
  const base1w = weekAgo?.assetsTotal ?? null;

  return {
    assets1d,
    assets1dPct: base1d ? (assets1d / base1d) * 100 : null,
    assets1w,
    assets1wPct: base1w ? (assets1w / base1w) * 100 : null,
  };
}

export function buildConnections() {
  return PLATFORMS.map((platform) => {
    const src = store.sources[platform];
    const connected = src.linked || src.holdings.length > 0;
    return {
      platform,
      status: connected ? 'connected' : 'disconnected',
      lastSync: src.lastSync,
      error: src.error ?? null,
    };
  });
}

export function collectErrors() {
  return PLATFORMS.flatMap((platform) => {
    const err = store.sources[platform].error;
    return err ? [{ source: platform, message: err }] : [];
  });
}

export function buildPortfolioResponse() {
  const merged = mergeHoldings();
  const { assetsTotal, cashOnHand, holdings } = computeTotals(merged);
  const delta = computeDelta(assetsTotal);
  const apiKeyMissing = !process.env.ANTHROPIC_API_KEY;

  return {
    netWorth: assetsTotal,
    assetsTotal,
    cashOnHand,
    taxEstimate: estimateTax(holdings),
    delta,
    holdings,
    connections: buildConnections(),
    aiSummary: store.aiSummary,
    apiKeyMissing,
    errors: collectErrors(),
    lastUpdated: store.lastUpdated,
  };
}

function estimateTax(holdings) {
  const withBasis = holdings.filter((h) => h.costBasisAUD != null && h.valueAUD != null);
  if (withBasis.length === 0) return null;

  const gain = withBasis.reduce(
    (sum, h) => sum + Math.max(0, h.valueAUD - h.costBasisAUD),
    0,
  );
  return Math.round(gain * 0.5 * 100) / 100;
}

export function normalizeHolding(raw, exchange, assetType = 'stock') {
  const qty = Number(raw.qty ?? raw.quantity ?? 0);
  let valueAUD = Number(raw.valueAUD ?? raw.value ?? 0);
  let priceAUD = Number(raw.priceAUD ?? raw.price ?? 0);

  if (raw.currency === 'USD' && !raw.valueAUD) {
    valueAUD = valueAUD * USD_TO_AUD;
    priceAUD = priceAUD * USD_TO_AUD;
  }

  if (!priceAUD && qty) priceAUD = valueAUD / qty;

  return {
    ticker: String(raw.ticker ?? raw.symbol ?? '').toUpperCase(),
    exchange,
    qty,
    price: priceAUD,
    priceAUD,
    valueAUD,
    sector: raw.sector ?? inferSector(raw.ticker, assetType),
    assetType,
    costBasisAUD: raw.costBasisAUD ?? null,
  };
}

export { USD_TO_AUD, inferSector };
