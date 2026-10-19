import { AGENT_ROLES, DISCLAIMERS } from '../config/constants.js';
import { executeTool } from '../tools/index.js';

export class FraudDetectionAgent {
  constructor() {
    this.role = AGENT_ROLES.FRAUD_DETECTOR;
    this.allowedTools = ['scoreTransactionRisk', 'saveTransactionRecord', 'searchKnowledgeBase'];
  }

  /**
   * Process transaction risk analysis task
   * @param {Object} inputData - Transaction parameters
   * @param {Object} context - Shared execution context
   */
  async process(inputData = {}, context = {}) {
    const startTime = Date.now();

    // 1. Data sufficiency check
    if (inputData.amount === undefined || inputData.amount === null || inputData.amount === '') {
      return {
        agent: this.role,
        status: 'FAILED',
        error: 'Missing required field: amount is required to evaluate transaction risk.',
        clarification_needed: 'Please provide the transaction amount in INR.',
        duration_ms: Date.now() - startTime
      };
    }

    // 2. Invoke deterministic fraud risk scorer tool
    const scoreResult = await executeTool('scoreTransactionRisk', {
      amount: inputData.amount,
      historical_average: inputData.historical_average,
      velocity_24h: inputData.velocity_24h,
      timestamp: inputData.timestamp || new Date().toISOString(),
      is_unfamiliar_merchant: inputData.is_unfamiliar_merchant,
      is_unfamiliar_device: inputData.is_unfamiliar_device,
      category: inputData.category,
      location_mismatch: inputData.location_mismatch,
      merchant_name: inputData.merchant_name || inputData.merchant || 'Demo Merchant'
    });

    if (!scoreResult.success) {
      return {
        agent: this.role,
        status: 'FAILED',
        error: scoreResult.error || 'Fraud scoring tool reported an error.',
        tool_call: scoreResult,
        duration_ms: Date.now() - startTime
      };
    }

    const scoring = scoreResult.output;
    const toolCalls = [scoreResult];

    // 3. Persist transaction to SQLite if requested or by default for demonstration
    if (inputData.persist !== false) {
      const saveResult = await executeTool('saveTransactionRecord', {
        transaction_id: inputData.transaction_id,
        amount: inputData.amount,
        merchant: inputData.merchant_name || inputData.merchant || 'Demo Merchant',
        category: inputData.category || 'General',
        payment_method: inputData.payment_method || 'UPI',
        historical_average: inputData.historical_average,
        risk_score: scoring.risk_score,
        risk_level: scoring.risk_level,
        triggered_rules: scoring.triggered_rules,
        explanation: scoring.explanation,
        status: scoring.risk_level === 'HIGH' ? 'BLOCKED' : scoring.risk_level === 'MEDIUM' ? 'FLAGGED_REVIEW' : 'APPROVED'
      });
      toolCalls.push(saveResult);
    }

    // 4. Return structured specialist output
    return {
      agent: this.role,
      status: 'COMPLETED',
      duration_ms: Date.now() - startTime,
      tool_calls: toolCalls,
      scoring: {
        risk_score: scoring.risk_score,
        risk_level: scoring.risk_level,
        recommended_action: scoring.recommended_action,
        triggered_rules: scoring.triggered_rules,
        explanation: scoring.explanation,
        metrics: scoring.metrics
      },
      educational_context: scoring.educational_note,
      disclaimer: DISCLAIMERS.FRAUD
    };
  }
}
