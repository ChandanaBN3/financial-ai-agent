// End-to-end verification script for Review-2 MVP requirements
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('=== STARTING REVIEW-2 VERIFICATION TESTS ===\n');
  const results = [];

  // 1. Financial Advisory Success Case
  try {
    const res = await fetch(`${BASE_URL}/api/advisory/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthly_income: 85000,
        monthly_expenses: 52000,
        essential_expenses: 36000,
        current_savings: 180000,
        savings_goal: 500000
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.metrics.net_cash_flow, 33000);
    assert.equal(data.metrics.emergency_coverage_months, 5);
    assert.ok(data.assessment.actionable_recommendations.length > 0);
    results.push({ test: '1. Financial Advisory Success Case', status: 'PASS', details: `Net Surplus: ₹${data.metrics.net_cash_flow}, Runway: ${data.metrics.emergency_coverage_months} months` });
  } catch (err) {
    results.push({ test: '1. Financial Advisory Success Case', status: 'FAIL', error: err.message });
  }

  // 2. Low Fraud Scenario (Swiggy ₹340)
  try {
    const res = await fetch(`${BASE_URL}/api/fraud/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 340,
        historical_average: 450,
        velocity_24h: 1,
        is_unfamiliar_merchant: false,
        merchant_name: 'Swiggy Delivery',
        persist: true
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.risk_level, 'LOW');
    assert.ok(data.risk_score < 30);
    results.push({ test: '2. Low Fraud Scenario (Normal Swiggy ₹340)', status: 'PASS', details: `Risk: ${data.risk_level} (Score: ${data.risk_score}/100)` });
  } catch (err) {
    results.push({ test: '2. Low Fraud Scenario', status: 'FAIL', error: err.message });
  }

  // 3. Medium Fraud Scenario (Spike + Unfamiliar merchant)
  try {
    const res = await fetch(`${BASE_URL}/api/fraud/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 18500,
        historical_average: 3000,
        velocity_24h: 6,
        is_unfamiliar_merchant: true,
        merchant_name: 'QuickDigital Gadgets Mumbai',
        persist: true
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.risk_level, 'MEDIUM');
    assert.ok(data.risk_score >= 30 && data.risk_score < 70);
    results.push({ test: '3. Medium Fraud Scenario (₹18,500 Spike)', status: 'PASS', details: `Risk: ${data.risk_level} (Score: ${data.risk_score}/100), Rules: ${data.triggered_rules.map(r=>r.rule).join(', ')}` });
  } catch (err) {
    results.push({ test: '3. Medium Fraud Scenario', status: 'FAIL', error: err.message });
  }

  // 4. High Fraud Scenario (P2P / Crypto + Spike + Velocity + Unfamiliar Device)
  try {
    const res = await fetch(`${BASE_URL}/api/fraud/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 92000,
        historical_average: 4000,
        velocity_24h: 12,
        is_unfamiliar_merchant: true,
        is_unfamiliar_device: true,
        location_mismatch: true,
        category: 'Virtual Assets / P2P',
        merchant_name: 'GlobalCrypto P2P Gateway',
        persist: true
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.risk_level, 'HIGH');
    assert.ok(data.risk_score >= 70);
    results.push({ test: '4. High Fraud Scenario (₹92,000 Crypto Spike)', status: 'PASS', details: `Risk: ${data.risk_level} (Score: ${data.risk_score}/100), Action: ${data.recommended_action}` });
  } catch (err) {
    results.push({ test: '4. High Fraud Scenario', status: 'FAIL', error: err.message });
  }

  // 5. Combined Health Workflow (Multi-Agent Coordination)
  try {
    const res = await fetch(`${BASE_URL}/api/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Review my finances and analyse risk exposure on recent transactions.',
        workflowType: 'COMBINED_HEALTH',
        inputData: {
          monthly_income: 110000,
          monthly_expenses: 70000,
          essential_expenses: 45000,
          current_savings: 120000,
          amount: 45000,
          historical_average: 4000,
          is_unfamiliar_merchant: true,
          merchant_name: 'Offshore P2P Virtual Assets'
        },
        mode: 'LOCAL'
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.run.workflow_type, 'COMBINED_HEALTH');
    assert.equal(data.run.status, 'SUCCESS');
    assert.ok(data.run.specialist_outputs.advisory);
    assert.ok(data.run.specialist_outputs.fraud);
    assert.ok(data.run.specialist_outputs.health);
    assert.ok(data.run.execution_trace.length >= 4);
    const healthGrade = data.run.specialist_outputs.health.overall_health_grade;
    results.push({ test: '5. Combined Multi-Agent Health Workflow', status: 'PASS', details: `Grade: ${healthGrade}, Steps: ${data.run.steps_count}, Duration: ${data.run.duration_ms}ms` });
  } catch (err) {
    results.push({ test: '5. Combined Multi-Agent Health Workflow', status: 'FAIL', error: err.message });
  }

  // 6. Missing or Invalid Inputs Validation
  try {
    // 6a: Missing income in advisory
    const res1 = await fetch(`${BASE_URL}/api/advisory/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_income: null, monthly_expenses: 50000 })
    });
    assert.equal(res1.status, 400);

    // 6b: Essentials exceeding expenses
    const res2 = await fetch(`${BASE_URL}/api/advisory/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_income: 80000, monthly_expenses: 30000, essential_expenses: 50000 })
    });
    const data2 = await res2.json();
    assert.equal(data2.success, false);
    assert.equal(data2.code, 'ESSENTIALS_EXCEED_EXPENSES');

    // 6c: Missing amount in fraud check
    const res3 = await fetch(`${BASE_URL}/api/fraud/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: null })
    });
    assert.equal(res3.status, 400);

    results.push({ test: '6. Missing or Invalid Input Validation', status: 'PASS', details: 'All 3 edge cases (missing income, essentials > expenses, missing amount) rejected safely with HTTP 400' });
  } catch (err) {
    results.push({ test: '6. Missing or Invalid Input Validation', status: 'FAIL', error: err.message });
  }

  // 7. Controlled Tool Failure (Truthful Error Reporting)
  try {
    const res = await fetch(`${BASE_URL}/api/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Demonstrate controlled tool failure for review evaluation',
        workflowType: 'TOOL_FAILURE_DEMO',
        mode: 'LOCAL'
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.run.status, 'FAILED');
    const failedStep = data.run.execution_trace.find(s => s.status === 'FAILED');
    assert.ok(failedStep);
    assert.match(failedStep.error, /Controlled Tool Failure/);
    results.push({ test: '7. Controlled Tool Failure (Truthful Reporting)', status: 'PASS', details: `Trace correctly halted at Step ${failedStep.step_id} with status 'FAILED'` });
  } catch (err) {
    results.push({ test: '7. Controlled Tool Failure', status: 'FAIL', error: err.message });
  }

  // 8. Persistence & History Retrieval
  try {
    // Check transactions list
    const resTx = await fetch(`${BASE_URL}/api/transactions?limit=5`);
    const dataTx = await resTx.json();
    assert.equal(dataTx.success, true);
    assert.ok(dataTx.transactions.length > 0);

    // Check agent execution history
    const resRuns = await fetch(`${BASE_URL}/api/agent/history?limit=5`);
    const dataRuns = await resRuns.json();
    assert.equal(dataRuns.success, true);
    assert.ok(dataRuns.runs.length > 0);

    results.push({ test: '8. SQLite Persistence & History Retrieval', status: 'PASS', details: `Found ${dataTx.transactions.length} transactions, ${dataRuns.runs.length} persisted agent runs` });
  } catch (err) {
    results.push({ test: '8. SQLite Persistence & History Retrieval', status: 'FAIL', error: err.message });
  }

  // 9. LLM-Unavailable Fallback Handling
  try {
    const res = await fetch(`${BASE_URL}/api/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Analyse my monthly finances and suggest how I can save more.',
        workflowType: 'FINANCIAL_ADVISORY',
        inputData: { monthly_income: 60000, monthly_expenses: 40000 },
        mode: 'LLM_ASSISTED' // Requesting LLM mode when GEMINI_API_KEY is not set
      })
    });
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.run.status, 'SUCCESS');
    // Mode should fall back gracefully to LOCAL
    assert.equal(data.run.mode, 'LOCAL');
    assert.equal(data.run.final_synthesis.is_llm_generated, false);
    results.push({ test: '9. LLM-Unavailable Graceful Fallback', status: 'PASS', details: `Requested LLM_ASSISTED without key -> seamlessly fell back to LOCAL mode with deterministic synthesis` });
  } catch (err) {
    results.push({ test: '9. LLM-Unavailable Fallback', status: 'FAIL', error: err.message });
  }

  console.log('\n================ TEST SUMMARY ================');
  results.forEach(r => {
    console.log(`[${r.status}] ${r.test}`);
    if (r.details) console.log(`       └─ ${r.details}`);
    if (r.error) console.log(`       └─ ERROR: ${r.error}`);
  });
  const passed = results.filter(r => r.status === 'PASS').length;
  console.log(`\nTOTAL: ${passed}/${results.length} PASSED`);
}

runTests().catch(console.error);
