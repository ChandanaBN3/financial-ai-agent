import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreTransactionRisk } from '../src/tools/fraudScorer.js';

test('Fraud Scorer - Normal UPI Transaction (Swiggy ₹340)', () => {
  const result = scoreTransactionRisk({
    amount: 340,
    historical_average: 450,
    velocity_24h: 2,
    timestamp: '2026-10-19T13:30:00.000Z', // daytime
    is_unfamiliar_merchant: false,
    is_unfamiliar_device: false,
    category: 'Food & Dining',
    merchant_name: 'Swiggy'
  });

  assert.equal(result.success, true);
  assert.equal(result.risk_level, 'LOW');
  assert.ok(result.risk_score <= 29);
  assert.equal(result.recommended_action, 'APPROVE');
  assert.equal(result.triggered_rules.length, 0);
});

test('Fraud Scorer - Suspicious Transaction (5.7x Spike + New Merchant)', () => {
  const result = scoreTransactionRisk({
    amount: 18500,
    historical_average: 5000, // 3.7x -> HIGH_AMOUNT_SPIKE
    velocity_24h: 7, // triggers moderate velocity
    timestamp: '2026-10-19T15:00:00.000Z',
    is_unfamiliar_merchant: true, // triggers unfamiliar merchant
    is_unfamiliar_device: false,
    category: 'Electronics',
    merchant_name: 'QuickGadgets Store'
  });

  assert.equal(result.success, true);
  assert.equal(result.risk_level, 'MEDIUM');
  assert.ok(result.risk_score >= 30 && result.risk_score <= 69);
  assert.equal(result.recommended_action, 'STEP_UP_AUTHENTICATION');

  // Verify triggered rules match score points
  const ruleNames = result.triggered_rules.map(r => r.rule);
  assert.ok(ruleNames.includes('HIGH_AMOUNT_SPIKE'));
  assert.ok(ruleNames.includes('UNFAMILIAR_MERCHANT'));
  assert.ok(ruleNames.includes('MODERATE_VELOCITY'));
});

test('Fraud Scorer - Critical High Risk Transaction (Crypto + Odd Hours 3 AM IST + Spike)', () => {
  // 3:15 AM IST corresponds to 21:45 UTC of previous day
  const result = scoreTransactionRisk({
    amount: 95000,
    historical_average: 3000, // 31x spike -> EXTREME_AMOUNT_SPIKE (35 pts)
    velocity_24h: 12,          // > 10 -> HIGH_VELOCITY (25 pts)
    timestamp: '2026-10-18T21:45:00.000Z', // 3:15 AM IST (+5:30) -> ODD_HOURS (15 pts)
    is_unfamiliar_merchant: true,
    is_unfamiliar_device: true, // UNFAMILIAR_DEVICE (15 pts)
    category: 'Virtual Assets / P2P Crypto', // HIGH_RISK_CATEGORY (25 pts)
    location_mismatch: true     // LOCATION_ANOMALY (30 pts)
  });

  assert.equal(result.success, true);
  assert.equal(result.risk_level, 'HIGH');
  assert.equal(result.risk_score, 100); // capped at 100
  assert.equal(result.recommended_action, 'BLOCK_TRANSACTION');
  assert.ok(result.triggered_rules.length >= 4);
});

test('Fraud Scorer - Zero Rupee Verification Probe Handling', () => {
  const result = scoreTransactionRisk({
    amount: 0,
    historical_average: 1000
  });

  assert.equal(result.success, true);
  assert.equal(result.risk_level, 'MEDIUM');
  assert.ok(result.triggered_rules.some(r => r.rule === 'ZERO_AMOUNT_PROBE'));
  assert.equal(result.recommended_action, 'STEP_UP_AUTHENTICATION');
});

test('Fraud Scorer - Negative Amount Validation', () => {
  const result = scoreTransactionRisk({
    amount: -500
  });

  assert.equal(result.success, false);
  assert.equal(result.code, 'INVALID_AMOUNT');
});
