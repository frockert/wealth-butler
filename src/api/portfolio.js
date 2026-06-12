const API_URL = import.meta.env.VITE_API_URL ?? '';

async function handleResponse(response, context) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `${context} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function apiFetch(path, options) {
  try {
    return await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error('Could not reach the server — run `npm run dev:all` or `npm run server` in another terminal.');
  }
}

async function postConnect(path, body) {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response, path);
}

export async function fetchPortfolio() {
  const response = await apiFetch('/api/portfolio');
  return handleResponse(response, 'GET /api/portfolio');
}

export async function syncPortfolio() {
  const response = await apiFetch('/api/sync', { method: 'POST' });
  return handleResponse(response, 'POST /api/sync');
}

export async function uploadCsv(platform, file) {
  const formData = new FormData();
  formData.append('platform', platform);
  formData.append('file', file);

  const response = await apiFetch('/api/import/csv', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `CSV upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function connectIbkrBusiness() {
  return postConnect('/api/connect/ibkr-business');
}

export function connectIbkrPersonal() {
  return postConnect('/api/connect/ibkr-personal');
}

export function connectCoinspot(apiKey, apiSecret) {
  return postConnect('/api/connect/coinspot', { apiKey, apiSecret });
}
