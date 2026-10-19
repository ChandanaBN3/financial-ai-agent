import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { Repository } from '../src/db/repository.js';
import { initSchema } from '../src/db/database.js';

test('Database Repository - In-Memory SQLite CRUD & Statistics', () => {
  const memDb = new DatabaseSync(':memory:');
  initSchema(memDb);
  const repo = new Repository(memDb);

  repo.seedSampleTransactions();
  repo.seedKnowledgeDocs();

  // Test Transaction stats
  const stats = repo.getTransactionStats();
  assert.ok(stats.totalCount >= 6);
  assert.ok(stats.totalAmount > 100000);
  assert.ok(stats.riskCounts.LOW >= 3);
  assert.ok(stats.riskCounts.HIGH >= 1);

  // Insert new transaction
  const newTx = repo.insertTransaction({
    transaction_id: 'TXN-TEST-999',
    timestamp: new Date().toISOString(),
    amount: 15000,
    merchant: 'Test Bangalore Electronics',
    category: 'Shopping',
    payment_method: 'UPI',
    historical_average: 2000,
    risk_score: 55,
    risk_level: 'MEDIUM',
    triggered_rules: [{ rule: 'HIGH_AMOUNT_SPIKE', points: 20 }],
    explanation: 'Test explanation',
    status: 'FLAGGED_REVIEW'
  });

  assert.equal(newTx.transaction_id, 'TXN-TEST-999');
  assert.equal(newTx.amount, 15000);
  assert.equal(newTx.risk_level, 'MEDIUM');
  assert.equal(newTx.triggered_rules.length, 1);

  // Filter transactions by risk level
  const mediumTxs = repo.getTransactions({ risk_level: 'MEDIUM' });
  assert.ok(mediumTxs.some(t => t.transaction_id === 'TXN-TEST-999'));

  // Test Agent Run insertion
  const run = repo.insertAgentRun({
    run_id: 'RUN-TEST-001',
    timestamp: new Date().toISOString(),
    task_prompt: 'Analyze my finances',
    workflow_type: 'FINANCIAL_ADVISORY',
    mode: 'LOCAL',
    status: 'SUCCESS',
    duration_ms: 120,
    steps_count: 3,
    execution_trace: [{ step: 1, status: 'COMPLETED' }],
    final_synthesis: { explanation: 'All looks healthy.' }
  });

  assert.equal(run.run_id, 'RUN-TEST-001');
  assert.equal(run.workflow_type, 'FINANCIAL_ADVISORY');
  assert.equal(run.execution_trace.length, 1);

  // Fetch recent agent runs
  const runs = repo.getAgentRuns(5);
  assert.ok(runs.some(r => r.run_id === 'RUN-TEST-001'));

  // Demo reset
  const resetResult = repo.resetDemoData();
  assert.equal(resetResult.success, true);
  assert.equal(repo.getTransactionById('TXN-TEST-999'), null);
});
