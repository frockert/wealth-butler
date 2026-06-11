import { Hono } from 'hono';
import { buildPortfolioResponse } from '../lib/portfolio.js';
import { syncLiveHoldings } from '../lib/sync.js';
import { store } from '../store.js';

const portfolioRouter = new Hono();

async function generateAiSummary(holdings) {
  if (!process.env.ANTHROPIC_API_KEY || holdings.length === 0) return null;

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const top = [...holdings]
      .sort((a, b) => b.valueAUD - a.valueAUD)
      .slice(0, 8)
      .map((h) => `${h.ticker} (${h.exchange}): A$${h.valueAUD.toFixed(0)}`)
      .join(', ');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Write a 2-sentence Australian investor market/portfolio summary for these top holdings: ${top}. Plain text, no bullet points.`,
        },
      ],
    });

    return message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();
  } catch {
    return null;
  }
}

portfolioRouter.get('/portfolio', (c) => {
  return c.json(buildPortfolioResponse());
});

portfolioRouter.post('/sync', async (c) => {
  await syncLiveHoldings();

  const portfolio = buildPortfolioResponse();

  if (process.env.ANTHROPIC_API_KEY) {
    store.aiSummary = await generateAiSummary(portfolio.holdings);
  }

  return c.json(buildPortfolioResponse());
});

export default portfolioRouter;
