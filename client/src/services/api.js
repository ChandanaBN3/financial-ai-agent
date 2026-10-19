const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  return res.json();
}

export async function calculateAdvisory(data) {
  const res = await fetch(`${API_BASE}/advisory/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function evaluateFraud(data) {
  const res = await fetch(`${API_BASE}/fraud/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function runAgentWorkflow(payload) {
  const res = await fetch(`${API_BASE}/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchAgentHistory(limit = 10) {
  const res = await fetch(`${API_BASE}/agent/history?limit=${limit}`);
  return res.json();
}

export async function fetchTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.limit) params.set('limit', filters.limit);
  if (filters.risk_level) params.set('risk_level', filters.risk_level);
  if (filters.search) params.set('search', filters.search);

  const res = await fetch(`${API_BASE}/transactions?${params.toString()}`);
  return res.json();
}

export async function searchKnowledge(query) {
  const res = await fetch(`${API_BASE}/knowledge/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchKnowledgeDocs() {
  const res = await fetch(`${API_BASE}/knowledge/docs`);
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  return res.json();
}
