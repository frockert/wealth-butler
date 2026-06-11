/**
 * IBKR live holdings — Flex Query (recommended MVP) or Client Portal Gateway.
 *
 * ## Flex Query (env-based, no gateway process)
 *   IBKR_FLEX_TOKEN=your_flex_token
 *   IBKR_FLEX_QUERY_ID_BUSINESS=123456
 *   IBKR_FLEX_QUERY_ID_PERSONAL=789012
 *
 * Create queries in IBKR Account Management → Reports → Flex Queries
 * (Open Positions section, CSV output). Token from Flex Web Service.
 *
 * ## Client Portal Gateway (alternative)
 *   IBKR_GATEWAY_URL=http://localhost:5000/v1/api
 *   IBKR_ACCOUNT_ID_BUSINESS=U1234567
 *   IBKR_ACCOUNT_ID_PERSONAL=U7654321
 * Run IBKR Client Portal Gateway locally and authenticate in browser first.
 */

import { EXCHANGE_BY_PLATFORM } from '../store.js';
import { normalizeHolding, USD_TO_AUD } from '../lib/portfolio.js';
import { parseIbkrCsv } from '../parsers/ibkr.js';
import { isIbkrLinked, setIbkrLinked } from '../lib/credentials.js';

const FLEX_BASE =
  'https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService';

const ENV_KEYS = {
  'ibkr-business': {
    queryId: 'IBKR_FLEX_QUERY_ID_BUSINESS',
    accountId: 'IBKR_ACCOUNT_ID_BUSINESS',
  },
  'ibkr-personal': {
    queryId: 'IBKR_FLEX_QUERY_ID_PERSONAL',
    accountId: 'IBKR_ACCOUNT_ID_PERSONAL',
  },
};

function flexEnv(platform) {
  const keys = ENV_KEYS[platform];
  return {
    token: process.env.IBKR_FLEX_TOKEN?.trim(),
    queryId: process.env[keys.queryId]?.trim(),
    gatewayUrl: process.env.IBKR_GATEWAY_URL?.trim(),
    accountId: process.env[keys.accountId]?.trim(),
  };
}

export function hasIbkrEnvCredentials(platform) {
  const { token, queryId, gatewayUrl, accountId } = flexEnv(platform);
  return Boolean((token && queryId) || (gatewayUrl && accountId));
}

function parseFlexStatus(xml) {
  const statusMatch = xml.match(/<Status>([^<]+)<\/Status>/i);
  const codeMatch = xml.match(/<ReferenceCode>([^<]+)<\/ReferenceCode>/i);
  const errorMatch = xml.match(/<ErrorMessage>([^<]+)<\/ErrorMessage>/i);
  return {
    status: statusMatch?.[1]?.trim(),
    referenceCode: codeMatch?.[1]?.trim(),
    error: errorMatch?.[1]?.trim(),
  };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestFlexReport(token, queryId) {
  const sendUrl = `${FLEX_BASE}.SendRequest?t=${encodeURIComponent(token)}&q=${encodeURIComponent(queryId)}&v=3`;
  const sendRes = await fetch(sendUrl);
  const sendXml = await sendRes.text();
  const send = parseFlexStatus(sendXml);

  if (send.status !== 'Success' || !send.referenceCode) {
    throw new Error(send.error ?? send.status ?? 'IBKR Flex Query SendRequest failed');
  }

  const getUrl = (ref) =>
    `${FLEX_BASE}.GetStatement?t=${encodeURIComponent(token)}&q=${encodeURIComponent(ref)}&v=3`;

  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt > 0) await sleep(1500);

    const getRes = await fetch(getUrl(send.referenceCode));
    const body = await getRes.text();

    if (body.includes('<Status>Warn</Status>') && body.includes('Statement generation in progress')) {
      continue;
    }

    const get = parseFlexStatus(body);
    if (get.status === 'Fail') {
      throw new Error(get.error ?? 'IBKR Flex Query GetStatement failed');
    }

    if (body.includes('Open Positions') || body.includes('Symbol')) {
      return body;
    }
  }

  throw new Error('IBKR Flex Query timed out — report not ready');
}

async function fetchViaFlexQuery(platform) {
  const { token, queryId } = flexEnv(platform);
  if (!token || !queryId) {
    throw new Error(
      `IBKR Flex Query not configured for ${platform} — set IBKR_FLEX_TOKEN and ${ENV_KEYS[platform].queryId} in .env`,
    );
  }

  const csvText = await requestFlexReport(token, queryId);
  return parseIbkrCsv(csvText, platform);
}

async function gatewayFetch(path, gatewayUrl) {
  const res = await fetch(`${gatewayUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`IBKR Gateway ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchViaGateway(platform) {
  const { gatewayUrl, accountId } = flexEnv(platform);
  if (!gatewayUrl || !accountId) {
    throw new Error(
      `IBKR Gateway not configured for ${platform} — set IBKR_GATEWAY_URL and ${ENV_KEYS[platform].accountId} in .env`,
    );
  }

  const auth = await gatewayFetch('/iserver/auth/status', gatewayUrl);
  if (!auth.authenticated) {
    throw new Error(
      'IBKR Gateway not authenticated — open https://localhost:5000 and log in to Client Portal',
    );
  }

  const positions = await gatewayFetch(
    `/portfolio/${accountId}/positions/0`,
    gatewayUrl,
  );

  const exchange = EXCHANGE_BY_PLATFORM[platform];
  const list = Array.isArray(positions) ? positions : [];

  return list
    .filter((p) => Number(p.position ?? p.quantity ?? 0) !== 0)
    .map((p) => {
      const ticker = String(p.contractDesc ?? p.description ?? p.symbol ?? '').split(' ')[0].toUpperCase();
      const qty = Math.abs(Number(p.position ?? p.quantity ?? 0));
      const currency = (p.currency ?? p.currencyCode ?? 'USD').toUpperCase();
      const mktPrice = Number(p.mktPrice ?? p.marketPrice ?? 0);
      let value = Number(p.mktValue ?? p.marketValue ?? 0);
      if (!value && mktPrice && qty) value = mktPrice * qty;

      return normalizeHolding(
        { ticker, qty, price: mktPrice, value, currency },
        exchange,
        'stock',
      );
    });
}

export async function connectIbkr(platform) {
  if (!hasIbkrEnvCredentials(platform)) {
    throw new Error(
      `IBKR credentials not configured for ${platform}. Set Flex Query vars (IBKR_FLEX_TOKEN + query ID) or Gateway vars (IBKR_GATEWAY_URL + account ID) in server .env`,
    );
  }

  const holdings = await fetchIbkrHoldings(platform);
  setIbkrLinked(platform, true);
  return { ok: true, platform, status: 'connected', holdingsCount: holdings.length };
}

export function isIbkrConfigured(platform) {
  return isIbkrLinked(platform) || hasIbkrEnvCredentials(platform);
}

/** Pull live holdings for an IBKR account (Flex Query preferred, Gateway fallback). */
export async function fetchIbkrHoldings(platform) {
  const { token, queryId, gatewayUrl, accountId } = flexEnv(platform);

  if (token && queryId) {
    return fetchViaFlexQuery(platform);
  }
  if (gatewayUrl && accountId) {
    return fetchViaGateway(platform);
  }

  throw new Error(
    `IBKR not configured for ${platform} — set env vars (see server/integrations/ibkr.js header)`,
  );
}

export { USD_TO_AUD };
