import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { OrchestratorAgent } from '../src/agents/orchestrator.js';
import { Repository } from '../src/db/repository.js';
import { initSchema } from '../src/db/database.js';

function createTestOrchestrator() {
  const memDb = new DatabaseSync(':memory:');
  initSchema(memDb);
  const repo = new Repository(memDb);
  repo.seedSampleTransactions();
  repo.seedKnowledgeDocs();
  return new OrchestratorAgent(repo);
}

test('Orchestrator - Task Classification', () => {
  const orch = createTestOrchestrator();

  assert.equal(
    orch.classifyTask('Analyse my monthly finances and suggest how I can save more.'),
    'FINANCIAL_ADVISORY'
  );

  assert.equal(
    orch.classifyTask('Check whether this transaction looks suspicious.'),
    'TRANSACTION_RISK'
  );

  assert.equal(
    orch.classifyTask('Review my finances and analyse these recent transactions.'),
    'COMBINED_HEALTH'
  );

  assert.equal(
    orch.classifyTask('What is the 50/30/20 budgeting rule?'),
    'FINANCIAL_EDUCATION'
  );

  assert.equal(
    orch.classifyTask('Demonstrate controlled tool failure for review evaluation'),
    'TOOL_FAILURE_DEMO'
  );
});

test('Orchestrator - Scenario 1: Financial Advisory Workflow', async () => {
  const orch = createTestOrchestrator();

  const result = await orch.runTask({
    prompt: 'Analyse my monthly finances and suggest how I can save more.',
    workflowType: 'FINANCIAL_ADVISORY',
    inputData: {
      monthly_income: 80000,
      monthly_expenses: 50000,
      essential_expenses: 35000,
      current_savings: 150000
    },
    mode: 'LOCAL'
  });

  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.workflow_type, 'FINANCIAL_ADVISORY');
  assert.equal(result.mode, 'LOCAL');
  assert.ok(result.execution_trace.length >= 2);

  // Check step 2 (Financial Advisory Agent)
  const advisoryStep = result.execution_trace.find(s => s.action === 'EXECUTE_ADVISORY');
  assert.ok(advisoryStep);
  assert.equal(advisoryStep.status, 'COMPLETED');
  assert.equal(advisoryStep.outputs?.calculations?.net_cash_flow, 30000);
  assert.ok(advisoryStep.duration_ms >= 0);

  // Check final synthesized explanation
  assert.ok(result.final_synthesis);
  assert.match(result.final_synthesis.explanation, /Financial Advisory Assessment/);
  assert.ok(result.final_synthesis.evidence.length >= 1);
});

test('Orchestrator - Scenario 2: Transaction Risk Workflow', async () => {
  const orch = createTestOrchestrator();

  const result = await orch.runTask({
    prompt: 'Check whether this transaction looks suspicious.',
    workflowType: 'TRANSACTION_RISK',
    inputData: {
      amount: 18500,
      historical_average: 3000,
      velocity_24h: 8,
      merchant_name: 'Unverified Electronics Store',
      is_unfamiliar_merchant: true
    },
    mode: 'LOCAL'
  });

  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.workflow_type, 'TRANSACTION_RISK');

  const fraudStep = result.execution_trace.find(s => s.action === 'EXECUTE_FRAUD_CHECK');
  assert.ok(fraudStep);
  assert.equal(fraudStep.status, 'COMPLETED');
  assert.ok(fraudStep.outputs?.scoring?.risk_score >= 30);
  assert.equal(fraudStep.outputs?.scoring?.risk_level, 'MEDIUM');

  // Verify explanation contains score and triggered rules
  assert.match(result.final_synthesis.explanation, /Transaction Risk Evaluation/);
  assert.match(result.final_synthesis.explanation, /MEDIUM RISK/);
});

test('Orchestrator - Scenario 3: Combined Financial Health Workflow', async () => {
  const orch = createTestOrchestrator();

  const result = await orch.runTask({
    prompt: 'Review my finances and analyse these recent transactions.',
    workflowType: 'COMBINED_HEALTH',
    inputData: {
      monthly_income: 120000,
      monthly_expenses: 80000,
      essential_expenses: 50000,
      current_savings: 100000,
      amount: 45000, // 45% of entire emergency fund!
      historical_average: 5000,
      is_unfamiliar_merchant: true,
      category: 'Virtual Assets / P2P'
    },
    mode: 'LOCAL'
  });

  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.workflow_type, 'COMBINED_HEALTH');
  assert.ok(result.execution_trace.length >= 4);

  // Both specialist outputs exist
  assert.ok(result.specialist_outputs.advisory);
  assert.ok(result.specialist_outputs.fraud);
  assert.ok(result.specialist_outputs.health);

  // Financial Health Agent computed exposure correlation alert
  const healthOutput = result.specialist_outputs.health;
  assert.ok(healthOutput.correlation_alerts.some(a => a.includes('High Exposure Risk')));
});

test('Orchestrator - Scenario 4: General Financial Education Workflow', async () => {
  const orch = createTestOrchestrator();

  const result = await orch.runTask({
    prompt: 'What is the 50/30/20 budgeting rule and how do I build an emergency fund?',
    workflowType: 'FINANCIAL_EDUCATION',
    mode: 'LOCAL'
  });

  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.workflow_type, 'FINANCIAL_EDUCATION');

  const searchStep = result.execution_trace.find(s => s.action === 'SEARCH_KNOWLEDGE');
  assert.ok(searchStep);
  assert.equal(searchStep.status, 'COMPLETED');
  assert.ok(searchStep.outputs?.results?.length >= 1);
  assert.match(result.final_synthesis.explanation, /50\/30\/20/);
});

test('Orchestrator - Scenario 5: Controlled Tool Failure Truthfulness', async () => {
  const orch = createTestOrchestrator();

  const result = await orch.runTask({
    prompt: 'Demonstrate controlled tool failure for review evaluation',
    workflowType: 'TOOL_FAILURE_DEMO',
    mode: 'LOCAL'
  });

  // Verify status is TRUTHFULLY marked FAILED, not falsely reported as success
  assert.equal(result.status, 'FAILED');

  const failedStep = result.execution_trace.find(s => s.status === 'FAILED');
  assert.ok(failedStep);
  assert.match(failedStep.error, /Controlled Tool Failure/);

  // Synthesis truthfully reports halt
  assert.match(result.final_synthesis.explanation, /Workflow Halted Due to Step Failure/);
});
