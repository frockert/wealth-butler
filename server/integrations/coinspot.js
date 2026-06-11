/**
 * Coinspot Read API — balances on sync.
 * Docs: https://www.coinspot.com.au/api
 *
 * Env fallback (optional): COINSPOT_API_KEY, COINSPOT_API_SECRET
 * Credentials from POST /api/connect/coinspot are stored in-memory only.
 */

import { createHmac } from 'node:crypto';
import { EXCHANGE_BY_PLATFORM } from '../store.js';
import { normalizeHolding } from '../lib/portfolio.js';
import { getCoinspotCredentials, setCoinspotCredentials } from '../lib/credentials.js';

const COINSPOT_API = 'https://www.coinspot.com.au/api';

function coinspotRequest(path, apiKey, apiSecret, body = {}) {
  const nonce = Date.now();
  const payload = { ...body, nonce };
  const bodyStr = JSON.stringify(payload);
  const sign = createHmac('sha512', apiSecret).update(bodyStr).digest('hex');

  return fetch(`${COINSPOT_API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      key: apiKey,
      sign,
    },
    body: bodyStr,
  });
}

/** Validate API key + secret by calling /my/balances. */
export async function validateCoinspotCredentials(apiKey, apiSecret) {
  if (!apiKey?.trim() || !apiSecret?.trim()) {
    throw new Error('Coinspot API key and secret are required');
  }

  const res = await coinspotRequest('/my/balances', apiKey.trim(), apiSecret.trim());
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.status !== 'ok') {
    const msg = data.message ?? data.error ?? `Coinspot API returned ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function connectCoinspot(apiKey, apiSecret) {
  await validateCoinspotCredentials(apiKey, apiSecret);
  setCoinspotCredentials(apiKey.trim(), apiSecret.trim());
  return { ok: true, platform: 'coinspot', status: 'connected' };
}

export function isCoinspotConfigured() {
  const creds = getCoinspotCredentials();
  return Boolean(creds?.apiKey && creds?.apiSecret);
}

/** Pull live crypto balances for connected Coinspot account. */
export async function fetchCoinspotHoldings() {
  const creds = getCoinspotCredentials();
  if (!creds?.apiKey || !creds?.apiSecret) {
    throw new Error('Coinspot not connected — add API key via Connect broker or COINSPOT_* env vars');
  }

  const data = await validateCoinspotCredentials(creds.apiKey, creds.apiSecret);
  const exchange = EXCHANGE_BY_PLATFORM.coinspot;
  const balance = data.balance ?? {};

  const holdings = [];
  for (const [coin, info] of Object.entries(balance)) {
    const ticker = coin.toUpperCase();
    const qty = Number(info.balance ?? 0);
    const valueAUD = Number(info.audbalance ?? 0);
    const rate = Number(info.rate ?? 0);

    if (qty === 0 && valueAUD === 0) continue;

    const priceAUD = rate || (qty ? valueAUD / qty : valueAUD);

    holdings.push(
      normalizeHolding(
        { ticker, qty: qty || 1, price: priceAUD, value: valueAUD },
        exchange,
        'crypto',
      ),
    );
  }

  return holdings;
}
