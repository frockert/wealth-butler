import { fetchIbkrHoldings, hasIbkrEnvCredentials } from '../integrations/ibkr.js';
import {
  fetchCoinspotHoldings,
  isCoinspotConfigured,
} from '../integrations/coinspot.js';
import { isIbkrLinked, isCoinspotLinked } from './credentials.js';
import { store } from '../store.js';

const IBKR_PLATFORMS = ['ibkr-business', 'ibkr-personal'];

/**
 * Pull live holdings for linked brokers; CSV data kept when sync fails.
 * Live data replaces platform holdings on success.
 */
export async function syncLiveHoldings() {
  const results = [];

  for (const platform of IBKR_PLATFORMS) {
    if (!isIbkrLinked(platform) && !hasIbkrEnvCredentials(platform)) continue;

    try {
      const holdings = await fetchIbkrHoldings(platform);
      store.sources[platform].holdings = holdings;
      store.sources[platform].lastSync = new Date().toISOString();
      store.sources[platform].error = null;
      store.sources[platform].linked = true;
      results.push({ platform, ok: true, holdingsCount: holdings.length });
    } catch (err) {
      store.sources[platform].error = err.message;
      results.push({ platform, ok: false, error: err.message });
    }
  }

  if (isCoinspotLinked() || isCoinspotConfigured()) {
    try {
      const holdings = await fetchCoinspotHoldings();
      store.sources.coinspot.holdings = holdings;
      store.sources.coinspot.lastSync = new Date().toISOString();
      store.sources.coinspot.error = null;
      store.sources.coinspot.linked = true;
      results.push({ platform: 'coinspot', ok: true, holdingsCount: holdings.length });
    } catch (err) {
      store.sources.coinspot.error = err.message;
      results.push({ platform: 'coinspot', ok: false, error: err.message });
    }
  }

  if (results.some((r) => r.ok)) {
    store.lastUpdated = new Date().toISOString();
  }

  return results;
}
