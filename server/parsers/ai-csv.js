import Anthropic from '@anthropic-ai/sdk';
import { EXCHANGE_BY_PLATFORM } from '../store.js';
import { normalizeHolding } from '../lib/portfolio.js';

const HOLDING_SCHEMA = `[
  {
    "ticker": "string",
    "qty": number,
    "priceAUD": number,
    "valueAUD": number,
    "assetType": "stock" | "crypto" | "cash" | "other",
    "sector": "string optional"
  }
]`;

/**
 * Use Claude to parse a non-standard CSV when ANTHROPIC_API_KEY is set.
 * @param {string} csvText
 * @param {string} platform
 */
export async function parseCsvWithAi(csvText, platform) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured — cannot parse non-standard CSV');
  }

  const exchange = EXCHANGE_BY_PLATFORM[platform] ?? platform.toUpperCase();
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Parse this brokerage CSV export into a JSON array of holdings for platform "${platform}" (exchange label "${exchange}").

Return ONLY valid JSON matching this schema (no markdown):
${HOLDING_SCHEMA}

Rules:
- Skip zero-balance rows
- Values must be in AUD
- assetType: crypto for coins, cash for fiat balances, stock for equities
- CSV content:
${csvText.slice(0, 12000)}`,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('AI parser did not return a JSON holdings array');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('AI parser returned invalid JSON');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI parser found no holdings in CSV');
  }

  return parsed.map((row) =>
    normalizeHolding(
      row,
      exchange,
      row.assetType ?? 'other',
    ),
  );
}
