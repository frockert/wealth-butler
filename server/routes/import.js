import { Hono } from 'hono';
import { parseIbkrCsv } from '../parsers/ibkr.js';
import { parseCoinspotCsv } from '../parsers/coinspot.js';
import { parseCsvWithAi } from '../parsers/ai-csv.js';
import { PLATFORMS, store } from '../store.js';

const importRouter = new Hono();

async function parseCsvForPlatform(platform, csvText) {
  const isIbkr = platform === 'ibkr-business' || platform === 'ibkr-personal';

  try {
    if (isIbkr) return parseIbkrCsv(csvText, platform);
    if (platform === 'coinspot') return parseCoinspotCsv(csvText);
    throw new Error(`Unknown platform: ${platform}`);
  } catch (primaryError) {
    if (!process.env.ANTHROPIC_API_KEY) throw primaryError;
    try {
      return await parseCsvWithAi(csvText, platform);
    } catch {
      throw primaryError;
    }
  }
}

importRouter.post('/csv', async (c) => {
  let body;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ error: 'Invalid multipart body — expected platform and file fields' }, 400);
  }

  const platform = String(body.platform ?? '').trim();
  const file = body.file;

  if (!PLATFORMS.includes(platform)) {
    return c.json(
      { error: `Invalid platform — expected one of: ${PLATFORMS.join(', ')}` },
      400,
    );
  }

  if (!file || typeof file === 'string') {
    return c.json({ error: 'Missing CSV file — send multipart field "file"' }, 400);
  }

  let csvText;
  try {
    csvText = await file.text();
  } catch {
    return c.json({ error: 'Could not read uploaded file' }, 400);
  }

  try {
    const holdings = await parseCsvForPlatform(platform, csvText);
    store.sources[platform].holdings = holdings;
    store.sources[platform].lastSync = new Date().toISOString();
    store.sources[platform].error = null;
    store.sources[platform].linked = true;
    store.lastUpdated = new Date().toISOString();

    return c.json({
      ok: true,
      platform,
      holdingsCount: holdings.length,
      lastSync: store.sources[platform].lastSync,
    });
  } catch (err) {
    return c.json(
      { error: err.message ?? 'Failed to parse CSV' },
      422,
    );
  }
});

export default importRouter;
