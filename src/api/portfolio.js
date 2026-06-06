const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function handleResponse(response, context) {
  if (!response.ok) {
    throw new Error(`${context} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPortfolio() {
  const response = await fetch(`${API_URL}/api/portfolio`);
  return handleResponse(response, 'GET /api/portfolio');
}

export async function syncPortfolio() {
  const response = await fetch(`${API_URL}/api/sync`, { method: 'POST' });
  return handleResponse(response, 'POST /api/sync');
}
