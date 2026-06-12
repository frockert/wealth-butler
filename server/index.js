import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initCredentialsFromEnv } from './lib/credentials.js';
import { seedDevDataIfEmpty } from './lib/seed-dev.js';
import importRouter from './routes/import.js';
import connectRouter from './routes/connect.js';
import portfolioRouter from './routes/portfolio.js';

initCredentialsFromEnv();
seedDevDataIfEmpty();

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/api/import', importRouter);
app.route('/api/connect', connectRouter);
app.route('/api', portfolioRouter);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Wealth Butler API listening on http://localhost:${info.port}`);
});

export default app;
