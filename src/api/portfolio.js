const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function handleResponse(response, context) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `${context} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function postConnect(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the server — is the backend running?');
  }
  return handleResponse(response, path);
}

export async function fetchPortfolio() {
  const response = await fetch(`${API_URL}/api/portfolio`);
  return handleResponse(response, 'GET /api/portfolio');
}

export async function syncPortfolio() {
  const response = await fetch(`${API_URL}/api/sync`, { method: 'POST' });
  return handleResponse(response, 'POST /api/sync');
}

export async function uploadCsv(platform, file) {
  const formData = new FormData();
  formData.append('platform', platform);
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${API_URL}/api/import/csv`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Could not reach the server — is the backend running?');
  }

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
