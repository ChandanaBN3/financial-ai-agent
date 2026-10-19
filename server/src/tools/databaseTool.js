import { Repository } from '../db/repository.js';

let sharedRepo = null;

function getRepo() {
  if (!sharedRepo) {
    sharedRepo = new Repository();
    sharedRepo.seedInitialDataIfEmpty();
  }
  return sharedRepo;
}

export function getRecentTransactions(params = {}) {
  const repo = getRepo();
  const limit = params.limit ? Number(params.limit) : 10;
  const risk_level = params.risk_level || null;
  const search = params.search || null;

  try {
    const transactions = repo.getTransactions({ limit, risk_level, search });
    return {
      success: true,
      count: transactions.length,
      transactions
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to query transactions: ${error.message}`,
      count: 0,
      transactions: []
    };
  }
}

export function saveTransactionRecord(params = {}) {
  const repo = getRepo();

  if (!params.amount || isNaN(Number(params.amount))) {
    return {
      success: false,
      error: 'Cannot save transaction without a valid numerical amount.'
    };
  }

  try {
    const txId = params.transaction_id || `TXN-UPI-${Date.now().toString(36).toUpperCase()}`;
    const record = repo.insertTransaction({
      transaction_id: txId,
      timestamp: params.timestamp || new Date().toISOString(),
      amount: Number(params.amount),
      merchant: params.merchant || params.merchant_name || 'Demo Merchant',
      category: params.category || 'General',
      payment_method: params.payment_method || 'UPI',
      historical_average: Number(params.historical_average || params.amount),
      risk_score: Number(params.risk_score || 0),
      risk_level: params.risk_level || 'LOW',
      triggered_rules: params.triggered_rules || [],
      explanation: params.explanation || 'Processed through AI Agent Center',
      status: params.status || (params.risk_level === 'HIGH' ? 'BLOCKED' : params.risk_level === 'MEDIUM' ? 'FLAGGED_REVIEW' : 'APPROVED'),
      is_demo: 1
    });

    return {
      success: true,
      saved_transaction: record,
      message: `Transaction ${record.transaction_id} persisted to SQLite database.`
    };
  } catch (error) {
    return {
      success: false,
      error: `Database insertion error: ${error.message}`
    };
  }
}
