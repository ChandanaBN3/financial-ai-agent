import { Router } from 'express';
import { scoreTransactionRisk } from '../tools/fraudScorer.js';
import { saveTransactionRecord } from '../tools/databaseTool.js';

const router = Router();

router.post('/evaluate', (req, res) => {
  const {
    amount,
    historical_average,
    velocity_24h,
    timestamp,
    is_unfamiliar_merchant,
    is_unfamiliar_device,
    category,
    location_mismatch,
    merchant_name,
    payment_method,
    persist = true
  } = req.body;

  if (amount === undefined || amount === null || amount === '') {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: amount (in INR) is required to score transaction risk.'
    });
  }

  const scoreResult = scoreTransactionRisk({
    amount,
    historical_average,
    velocity_24h,
    timestamp,
    is_unfamiliar_merchant,
    is_unfamiliar_device,
    category,
    location_mismatch,
    merchant_name
  });

  if (!scoreResult.success) {
    return res.status(400).json(scoreResult);
  }

  let savedTx = null;
  if (persist) {
    const saveResult = saveTransactionRecord({
      amount,
      merchant: merchant_name || 'Demo Merchant',
      category: category || 'General',
      payment_method: payment_method || 'UPI',
      historical_average,
      risk_score: scoreResult.risk_score,
      risk_level: scoreResult.risk_level,
      triggered_rules: scoreResult.triggered_rules,
      explanation: scoreResult.explanation,
      status: scoreResult.risk_level === 'HIGH' ? 'BLOCKED' : scoreResult.risk_level === 'MEDIUM' ? 'FLAGGED_REVIEW' : 'APPROVED'
    });
    if (saveResult.success) {
      savedTx = saveResult.saved_transaction;
    }
  }

  res.json({
    ...scoreResult,
    saved_record: savedTx
  });
});

export default router;
