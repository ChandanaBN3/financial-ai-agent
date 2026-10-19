import { ALLOWED_TOOLS } from '../config/constants.js';
import { calculateFinancialMetrics } from './advisoryCalculator.js';
import { scoreTransactionRisk } from './fraudScorer.js';
import { searchKnowledgeBase } from './knowledgeRetriever.js';
import { getRecentTransactions, saveTransactionRecord } from './databaseTool.js';
import { simulateToolFailure } from './failureSimulatorTool.js';

export const TOOL_REGISTRY = {
  calculateFinancialMetrics: {
    name: 'calculateFinancialMetrics',
    description: 'Calculates net cash flow, savings rate, emergency fund coverage in months, and 50/30/20 budget comparisons in INR.',
    execute: calculateFinancialMetrics
  },
  scoreTransactionRisk: {
    name: 'scoreTransactionRisk',
    description: 'Computes deterministic 0-100 fraud risk score, triggered rules, and recommended actions for a transaction.',
    execute: scoreTransactionRisk
  },
  searchKnowledgeBase: {
    name: 'searchKnowledgeBase',
    description: 'Retrieves relevant passages and source titles from the local verified financial knowledge base using keyword matching.',
    execute: searchKnowledgeBase
  },
  getRecentTransactions: {
    name: 'getRecentTransactions',
    description: 'Fetches recent transaction records from the persistent SQLite database for context and pattern evaluation.',
    execute: getRecentTransactions
  },
  saveTransactionRecord: {
    name: 'saveTransactionRecord',
    description: 'Persists evaluated transaction details, risk score, and triggered rules to the SQLite database.',
    execute: saveTransactionRecord
  },
  simulateToolFailure: {
    name: 'simulateToolFailure',
    description: 'Simulates a controlled tool failure to test and demonstrate truthful error reporting in agent execution traces.',
    execute: simulateToolFailure
  }
};

/**
 * Safe tool executor enforcing strict allowlist, timing, and error trapping
 */
export async function executeTool(toolName, params = {}) {
  const startTime = Date.now();

  // Strict allowlist security check
  if (!ALLOWED_TOOLS.includes(toolName) || !TOOL_REGISTRY[toolName]) {
    return {
      success: false,
      tool: toolName,
      error: `Tool execution rejected: '${toolName}' is not registered in the allowed-tool registry.`,
      code: 'UNAUTHORIZED_TOOL',
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const toolDef = TOOL_REGISTRY[toolName];
    // Tools can be synchronous or asynchronous
    const result = await Promise.resolve(toolDef.execute(params));
    const durationMs = Date.now() - startTime;

    // Truthful status verification: if tool result explicitly contains success: false, preserve failure
    const isSuccess = result && result.success !== false;

    return {
      success: isSuccess,
      tool: toolName,
      duration_ms: durationMs,
      timestamp: new Date().toISOString(),
      inputs: sanitizeToolInputs(toolName, params),
      output: result,
      error: !isSuccess ? (result?.error || 'Tool execution reported non-success status.') : null
    };
  } catch (err) {
    return {
      success: false,
      tool: toolName,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      inputs: sanitizeToolInputs(toolName, params),
      error: `Tool runtime exception: ${err.message}`,
      output: null
    };
  }
}

function sanitizeToolInputs(toolName, params) {
  if (!params || typeof params !== 'object') return params;
  const sanitized = { ...params };
  // Never expose sensitive fields if any were inadvertently passed
  delete sanitized.apiKey;
  delete sanitized.password;
  delete sanitized.secret;
  return sanitized;
}
