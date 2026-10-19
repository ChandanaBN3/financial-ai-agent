import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialMetrics } from '../src/tools/advisoryCalculator.js';

test('Advisory Calculator - Valid Standard Indian Financial Profile', () => {
  const result = calculateFinancialMetrics({
    monthly_income: 100000,
    monthly_expenses: 65000,
    essential_expenses: 45000,
    current_savings: 270000,
    savings_goal: 500000
  });

  assert.equal(result.success, true);
  assert.equal(result.currency, 'INR');

  const m = result.metrics;
  // Net cash flow: 100,000 - 65,000 = 35,000
  assert.equal(m.net_cash_flow, 35000);
  // Savings rate: 35,000 / 100,000 = 0.35 (35%)
  assert.equal(m.savings_rate, 0.35);
  // Expense ratio: 65,000 / 100,000 = 0.65
  assert.equal(m.expense_ratio, 0.65);
  // Emergency fund coverage: 270,000 / 45,000 = 6.0 months
  assert.equal(m.emergency_coverage_months, 6.0);

  // Goal analysis: (500,000 - 270,000) = 230,000 / 35,000 = 7 months
  assert.ok(m.goal_analysis);
  assert.equal(m.goal_analysis.estimated_months, 7);

  // 50/30/20 Target comparisons
  assert.equal(m.rule_50_30_20.target.needs, 50000); // 50%
  assert.equal(m.rule_50_30_20.target.wants, 30000); // 30%
  assert.equal(m.rule_50_30_20.target.savings, 20000); // 20%
});

test('Advisory Calculator - Zero Income Validation', () => {
  const result = calculateFinancialMetrics({
    monthly_income: 0,
    monthly_expenses: 30000
  });

  assert.equal(result.success, false);
  assert.equal(result.code, 'INVALID_INCOME');
  assert.match(result.error, /positive number/);
});

test('Advisory Calculator - Negative Income Validation', () => {
  const result = calculateFinancialMetrics({
    monthly_income: -50000,
    monthly_expenses: 25000
  });

  assert.equal(result.success, false);
  assert.equal(result.code, 'INVALID_INCOME');
});

test('Advisory Calculator - Negative Expenses Validation', () => {
  const result = calculateFinancialMetrics({
    monthly_income: 80000,
    monthly_expenses: -10000
  });

  assert.equal(result.success, false);
  assert.equal(result.code, 'INVALID_EXPENSES');
});

test('Advisory Calculator - Essential Expenses Exceeding Total Expenses', () => {
  const result = calculateFinancialMetrics({
    monthly_income: 90000,
    monthly_expenses: 50000,
    essential_expenses: 60000 // Inconsistent
  });

  assert.equal(result.success, false);
  assert.equal(result.code, 'ESSENTIALS_EXCEED_EXPENSES');
  assert.match(result.error, /cannot exceed/);
});

test('Advisory Calculator - Cash Flow Deficit Warning', () => {
  const result = calculateFinancialMetrics({
    monthly_income: 50000,
    monthly_expenses: 65000, // Deficit of 15,000
    essential_expenses: 40000,
    current_savings: 10000
  });

  assert.equal(result.success, true);
  assert.equal(result.assessment.budget_health_status, 'DEFICIT');
  assert.equal(result.assessment.stress_level, 'CRITICAL');
  assert.ok(result.assessment.warnings.some(w => w.includes('Monthly deficit detected')));
});
