/** In-memory portfolio store — one holdings list per platform source. */

export const PLATFORMS = ['ibkr-business', 'ibkr-personal', 'coinspot'];

export const EXCHANGE_BY_PLATFORM = {
  'ibkr-business': 'IBKR-BIZ',
  'ibkr-personal': 'IBKR-PERSONAL',
  coinspot: 'COINSPOT',
};

export function createEmptyStore() {
  return {
    sources: Object.fromEntries(
      PLATFORMS.map((p) => [
        p,
        { holdings: [], lastSync: null, error: null, linked: false },
      ]),
    ),
    credentials: {
      coinspot: { apiKey: null, apiSecret: null },
    },
    lastUpdated: null,
    aiSummary: null,
    snapshots: [],
  };
}

export const store = createEmptyStore();

export function resetStore() {
  const fresh = createEmptyStore();
  Object.assign(store, fresh);
  store.sources = fresh.sources;
}
