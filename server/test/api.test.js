import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('API Integration Endpoints', async (t) => {
  const app = createApp();
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  await t.test('GET /api/health returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'HEALTHY');
    assert.equal(data.currency, 'INR (₹)');
    assert.equal(data.database.connected, true);
    assert.equal(data.agent_mode, 'LOCAL');
  });

  await t.test('GET /api/dashboard/summary returns metrics', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.metrics.total_transactions_analyzed >= 0);
    assert.equal(data.agent_system.active_agents_count, 5);
  });

  await t.test('POST /api/advisory/calculate calculates INR figures', async () => {
    const res = await fetch(`${baseUrl}/api/advisory/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthly_income: 75000,
        monthly_expenses: 45000,
        current_savings: 180000
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.metrics.net_cash_flow, 30000);
  });

  await t.test('POST /api/fraud/evaluate scores transaction and persists', async () => {
    const res = await fetch(`${baseUrl}/api/fraud/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2500,
        historical_average: 2000,
        merchant_name: 'Test Swiggy Order',
        category: 'Food'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.risk_level, 'LOW');
    assert.ok(data.saved_record);
  });

  await t.test('POST /api/agent/run executes multi-agent scenario', async () => {
    const res = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Check whether this transaction looks suspicious.',
        workflowType: 'TRANSACTION_RISK',
        inputData: {
          amount: 85000,
          historical_average: 4000,
          is_unfamiliar_merchant: true
        }
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.run.status, 'SUCCESS');
    assert.ok(data.run.execution_trace.length >= 2);
  });

  await t.test('GET /api/knowledge/search performs keyword matching', async () => {
    const res = await fetch(`${baseUrl}/api/knowledge/search?q=50%2F30%2F20`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.count >= 1);
  });

  await t.test('POST /api/demo/reset resets demo data successfully', async () => {
    const res = await fetch(`${baseUrl}/api/demo/reset`, { method: 'POST' });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });
});
