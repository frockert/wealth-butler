/**
 * In-memory broker credentials — never returned to the client.
 * Coinspot keys may come from .env or POST /api/connect/coinspot.
 * IBKR uses .env only (Flex Query token / Gateway URL).
 */

import { store } from '../store.js';

export function initCredentialsFromEnv() {
  if (process.env.COINSPOT_API_KEY && process.env.COINSPOT_API_SECRET) {
    store.credentials.coinspot = {
      apiKey: process.env.COINSPOT_API_KEY.trim(),
      apiSecret: process.env.COINSPOT_API_SECRET.trim(),
    };
    store.sources.coinspot.linked = true;
  }

  for (const platform of ['ibkr-business', 'ibkr-personal']) {
    if (hasIbkrEnvForPlatform(platform)) {
      store.sources[platform].linked = true;
    }
  }
}

function hasIbkrEnvForPlatform(platform) {
  const token = process.env.IBKR_FLEX_TOKEN?.trim();
  const queryKey =
    platform === 'ibkr-business'
      ? process.env.IBKR_FLEX_QUERY_ID_BUSINESS?.trim()
      : process.env.IBKR_FLEX_QUERY_ID_PERSONAL?.trim();
  const gateway = process.env.IBKR_GATEWAY_URL?.trim();
  const accountKey =
    platform === 'ibkr-business'
      ? process.env.IBKR_ACCOUNT_ID_BUSINESS?.trim()
      : process.env.IBKR_ACCOUNT_ID_PERSONAL?.trim();

  return Boolean((token && queryKey) || (gateway && accountKey));
}

export function getCoinspotCredentials() {
  return store.credentials.coinspot;
}

export function setCoinspotCredentials(apiKey, apiSecret) {
  store.credentials.coinspot = { apiKey, apiSecret };
  store.sources.coinspot.linked = true;
}

export function setIbkrLinked(platform, linked) {
  store.sources[platform].linked = linked;
}

export function isIbkrLinked(platform) {
  return Boolean(store.sources[platform]?.linked);
}

export function isCoinspotLinked() {
  return Boolean(store.sources.coinspot?.linked);
}
