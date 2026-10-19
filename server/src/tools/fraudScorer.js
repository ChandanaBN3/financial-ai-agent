import { FRAUD_RULES, DISCLAIMERS } from '../config/constants.js';

/**
 * Deterministic Transaction Risk Scorer
 * Rule-based heuristic risk scoring engine for Indian digital payment patterns.
 */
export function scoreTransactionRisk(params = {}) {
  const {
    amount,
    historical_average = null,
    velocity_24h = 1,
    timestamp = new Date().toISOString(),
    is_unfamiliar_merchant = false,
    is_unfamiliar_device = false,
    category = 'General',
    location_mismatch = false,
    merchant_name = 'Unknown Merchant'
  } = params;

  // 1. Rigorous Input Validation
  const txAmount = Number(amount);
  if (isNaN(txAmount) || txAmount < 0) {
    return {
      success: false,
      error: 'Invalid transaction amount. Amount must be a non-negative number in INR.',
      code: 'INVALID_AMOUNT'
    };
  }

  // Micro-transaction probing check (e.g. ₹0 or ₹1 authorization fraud check)
  if (txAmount === 0) {
    return {
      success: true,
      risk_score: 30,
      risk_level: 'MEDIUM',
      recommended_action: 'STEP_UP_AUTHENTICATION',
      triggered_rules: [
        {
          rule: 'ZERO_AMOUNT_PROBE',
          points: 30,
          description: 'Zero rupee transaction detected. Often used as an automated card/account validity probe before large fraud attempts.'
        }
      ],
      explanation: 'Suspicious zero-value probe detected on account.',
      metrics: {
        amount: 0,
        historical_average: historical_average ? Number(historical_average) : 0,
        velocity_24h: Number(velocity_24h || 1),
        ratio: 0
      },
      disclaimer: DISCLAIMERS.FRAUD
    };
  }

  const histAvg = historical_average !== null && historical_average !== undefined && Number(historical_average) > 0
    ? Number(historical_average)
    : txAmount; // If historical average unavailable, assume baseline equal to txAmount

  const velocity = Math.max(1, Number(velocity_24h) || 1);
  const ratio = histAvg > 0 ? Number((txAmount / histAvg).toFixed(2)) : 1.0;

  let totalScore = 0;
  const triggeredRules = [];

  // Rule 1: Amount spike vs historical average
  if (ratio >= 5.0) {
    totalScore += FRAUD_RULES.WEIGHTS.EXTREME_AMOUNT_SPIKE;
    triggeredRules.push({
      rule: 'EXTREME_AMOUNT_SPIKE',
      points: FRAUD_RULES.WEIGHTS.EXTREME_AMOUNT_SPIKE,
      description: `Amount (₹${txAmount.toLocaleString('en-IN')}) is ${ratio}x higher than historical average (₹${histAvg.toLocaleString('en-IN')}).`
    });
  } else if (ratio >= 3.0) {
    totalScore += FRAUD_RULES.WEIGHTS.HIGH_AMOUNT_SPIKE;
    triggeredRules.push({
      rule: 'HIGH_AMOUNT_SPIKE',
      points: FRAUD_RULES.WEIGHTS.HIGH_AMOUNT_SPIKE,
      description: `Amount (₹${txAmount.toLocaleString('en-IN')}) is ${ratio}x higher than historical average (₹${histAvg.toLocaleString('en-IN')}).`
    });
  } else if (ratio >= 2.0) {
    totalScore += FRAUD_RULES.WEIGHTS.MODERATE_AMOUNT_SPIKE;
    triggeredRules.push({
      rule: 'MODERATE_AMOUNT_SPIKE',
      points: FRAUD_RULES.WEIGHTS.MODERATE_AMOUNT_SPIKE,
      description: `Amount is moderately elevated (${ratio}x historical average).`
    });
  }

  // Rule 2: 24h Velocity
  if (velocity > 10) {
    totalScore += FRAUD_RULES.WEIGHTS.HIGH_VELOCITY;
    triggeredRules.push({
      rule: 'HIGH_VELOCITY',
      points: FRAUD_RULES.WEIGHTS.HIGH_VELOCITY,
      description: `Rapid transaction frequency: ${velocity} transactions initiated in the past 24 hours.`
    });
  } else if (velocity >= 6) {
    totalScore += FRAUD_RULES.WEIGHTS.MODERATE_VELOCITY;
    triggeredRules.push({
      rule: 'MODERATE_VELOCITY',
      points: FRAUD_RULES.WEIGHTS.MODERATE_VELOCITY,
      description: `Elevated transaction frequency: ${velocity} transactions in 24 hours.`
    });
  }

  // Rule 3: Odd-Hour Timing (1 AM to 5 AM IST)
  const txDate = new Date(timestamp);
  // Get hour in IST (+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(txDate.getTime() + (txDate.getTimezoneOffset() * 60000) + istOffsetMs);
  const istHour = istDate.getHours();

  if (istHour >= 1 && istHour < 5) {
    totalScore += FRAUD_RULES.WEIGHTS.ODD_HOURS;
    triggeredRules.push({
      rule: 'ODD_HOURS',
      points: FRAUD_RULES.WEIGHTS.ODD_HOURS,
      description: `Transaction initiated at ${istHour}:${String(istDate.getMinutes()).padStart(2, '0')} AM IST (dormant banking hours 1 AM - 5 AM).`
    });
  }

  // Rule 4: Unfamiliar Device
  if (Boolean(is_unfamiliar_device)) {
    totalScore += FRAUD_RULES.WEIGHTS.UNFAMILIAR_DEVICE;
    triggeredRules.push({
      rule: 'UNFAMILIAR_DEVICE',
      points: FRAUD_RULES.WEIGHTS.UNFAMILIAR_DEVICE,
      description: 'Transaction requested from an unrecognized browser/device fingerprint.'
    });
  }

  // Rule 5: Unfamiliar Merchant with significant amount
  if (Boolean(is_unfamiliar_merchant) && txAmount > 3000) {
    totalScore += FRAUD_RULES.WEIGHTS.UNFAMILIAR_MERCHANT;
    triggeredRules.push({
      rule: 'UNFAMILIAR_MERCHANT',
      points: FRAUD_RULES.WEIGHTS.UNFAMILIAR_MERCHANT,
      description: `First-time transaction with merchant '${merchant_name}' exceeding ₹3,000 threshold.`
    });
  }

  // Rule 6: High Risk Category
  const catLower = String(category || '').toLowerCase();
  const highRiskKeywords = ['crypto', 'virtual asset', 'p2p', 'gambling', 'casino', 'betting', 'offshore', 'forex'];
  const matchedRiskCat = highRiskKeywords.find(kw => catLower.includes(kw));

  if (matchedRiskCat) {
    totalScore += FRAUD_RULES.WEIGHTS.HIGH_RISK_CATEGORY;
    triggeredRules.push({
      rule: 'HIGH_RISK_CATEGORY',
      points: FRAUD_RULES.WEIGHTS.HIGH_RISK_CATEGORY,
      description: `Merchant category matches monitored high-risk sector: '${category}'.`
    });
  }

  // Rule 7: Location / IP Anomaly
  if (Boolean(location_mismatch)) {
    totalScore += FRAUD_RULES.WEIGHTS.LOCATION_ANOMALY;
    triggeredRules.push({
      rule: 'LOCATION_ANOMALY',
      points: FRAUD_RULES.WEIGHTS.LOCATION_ANOMALY,
      description: 'Geographic location anomaly: IP coordinates conflict with recent user activity pattern.'
    });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Risk Category & Action
  let riskLevel = FRAUD_RULES.RISK_CATEGORIES.LOW;
  let recommendedAction = 'APPROVE';
  let explanation = '';

  if (finalScore >= FRAUD_RULES.THRESHOLDS.HIGH_MIN) {
    riskLevel = FRAUD_RULES.RISK_CATEGORIES.HIGH;
    recommendedAction = 'BLOCK_TRANSACTION';
    explanation = `High risk detected (Score: ${finalScore}/100). Multiple critical anomaly signals triggered (${triggeredRules.map(r => r.rule).join(', ')}). Recommended action is temporary block and biometric/call verification.`;
  } else if (finalScore > FRAUD_RULES.THRESHOLDS.LOW_MAX) {
    riskLevel = FRAUD_RULES.RISK_CATEGORIES.MEDIUM;
    recommendedAction = 'STEP_UP_AUTHENTICATION';
    explanation = `Moderate risk identified (Score: ${finalScore}/100). Deviation from standard profile noted. Recommended action is step-up OTP / UPI app confirmation.`;
  } else {
    riskLevel = FRAUD_RULES.RISK_CATEGORIES.LOW;
    recommendedAction = 'APPROVE';
    explanation = `Low risk (Score: ${finalScore}/100). Transaction patterns align with expected user profile. Safe to process.`;
  }

  return {
    success: true,
    risk_score: finalScore,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    triggered_rules: triggeredRules,
    explanation,
    metrics: {
      amount: txAmount,
      historical_average: histAvg,
      amount_ratio: ratio,
      velocity_24h: velocity,
      category,
      merchant_name,
      timestamp
    },
    educational_note: {
      false_positive_risk: finalScore >= 30 ? 'Note: Legitimate festive purchases (Diwali/Akshaya Tritiya) or emergency hospital bills can also trigger high-amount anomalies.' : 'Low chance of false alert.',
      false_negative_risk: finalScore < 30 ? 'Note: Micro-thefts split into small amounts under ₹500 may not trigger single-transaction rules without long-term velocity tracking.' : 'Monitored across multiple dimensions.'
    },
    disclaimer: DISCLAIMERS.FRAUD
  };
}
