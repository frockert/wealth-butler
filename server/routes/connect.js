import { Hono } from 'hono';
import { connectIbkr, fetchIbkrHoldings } from '../integrations/ibkr.js';
import { connectCoinspot, fetchCoinspotHoldings } from '../integrations/coinspot.js';
import { store } from '../store.js';

const connectRouter = new Hono();

async function connectAndSeed(platform, connectFn, fetchFn) {
  const result = await connectFn();
  try {
    const holdings = await fetchFn();
    store.sources[platform].holdings = holdings;
    store.sources[platform].lastSync = new Date().toISOString();
    store.sources[platform].error = null;
    store.lastUpdated = new Date().toISOString();
    return { ...result, holdingsCount: holdings.length, lastSync: store.sources[platform].lastSync };
  } catch (err) {
    store.sources[platform].error = err.message;
    return { ...result, warning: err.message };
  }
}

connectRouter.post('/ibkr-business', async (c) => {
  try {
    const body = await connectAndSeed(
      'ibkr-business',
      () => connectIbkr('ibkr-business'),
      () => fetchIbkrHoldings('ibkr-business'),
    );
    return c.json(body);
  } catch (err) {
    return c.json({ error: err.message }, 422);
  }
});

connectRouter.post('/ibkr-personal', async (c) => {
  try {
    const body = await connectAndSeed(
      'ibkr-personal',
      () => connectIbkr('ibkr-personal'),
      () => fetchIbkrHoldings('ibkr-personal'),
    );
    return c.json(body);
  } catch (err) {
    return c.json({ error: err.message }, 422);
  }
});

connectRouter.post('/coinspot', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Expected JSON body with apiKey and apiSecret' }, 400);
  }

  const apiKey = body.apiKey ?? body.key;
  const apiSecret = body.apiSecret ?? body.secret;

  if (!apiKey || !apiSecret) {
    return c.json({ error: 'apiKey and apiSecret are required' }, 400);
  }

  try {
    const result = await connectAndSeed(
      'coinspot',
      () => connectCoinspot(apiKey, apiSecret),
      () => fetchCoinspotHoldings(),
    );
    return c.json(result);
  } catch (err) {
    return c.json({ error: err.message }, 422);
  }
});

export default connectRouter;
