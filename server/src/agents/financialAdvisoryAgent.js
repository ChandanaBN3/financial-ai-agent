import { AGENT_ROLES, DISCLAIMERS } from '../config/constants.js';
import { executeTool } from '../tools/index.js';

export class FinancialAdvisoryAgent {
  constructor() {
    this.role = AGENT_ROLES.FINANCIAL_ADVISOR;
    this.allowedTools = ['calculateFinancialMetrics', 'searchKnowledgeBase'];
  }

  /**
   * Process financial advisory task
   * @param {Object} inputData - User financial figures
   * @param {Object} context - Shared execution context
   */
  async process(inputData = {}, context = {}) {
    const startTime = Date.now();

    // 1. Check data sufficiency
    if (inputData.monthly_income === undefined || inputData.monthly_income === null || inputData.monthly_income === '') {
      return {
        agent: this.role,
        status: 'FAILED',
        error: 'Missing required field: monthly_income is required for financial advisory calculation.',
        clarification_needed: 'Please provide your monthly take-home income in INR.',
        duration_ms: Date.now() - startTime
      };
    }

    if (inputData.monthly_expenses === undefined || inputData.monthly_expenses === null || inputData.monthly_expenses === '') {
      return {
        agent: this.role,
        status: 'FAILED',
        error: 'Missing required field: monthly_expenses is required to compute cash flow and savings rate.',
        clarification_needed: 'Please provide your total estimated monthly expenses in INR.',
        duration_ms: Date.now() - startTime
      };
    }

    // 2. Invoke calculation tool
    const toolResult = await executeTool('calculateFinancialMetrics', {
      monthly_income: inputData.monthly_income,
      monthly_expenses: inputData.monthly_expenses,
      essential_expenses: inputData.essential_expenses,
      current_savings: inputData.current_savings,
      savings_goal: inputData.savings_goal,
      spending_categories: inputData.spending_categories
    });

    if (!toolResult.success) {
      return {
        agent: this.role,
        status: 'FAILED',
        error: toolResult.error || 'Financial metrics calculation tool reported an error.',
        tool_call: toolResult,
        duration_ms: Date.now() - startTime
      };
    }

    const calc = toolResult.output;

    // 3. Optional knowledge retrieval for contextual education
    let educationalContext = null;
    if (calc.assessment?.stress_level === 'CRITICAL' || calc.metrics?.emergency_coverage_months < 3) {
      const kbResult = await executeTool('searchKnowledgeBase', {
        query: 'emergency fund savings rules 50/30/20',
        limit: 1
      });
      if (kbResult.success && kbResult.output?.results?.length > 0) {
        educationalContext = kbResult.output.results[0];
      }
    }

    // 4. Return structured specialist output
    return {
      agent: this.role,
      status: 'COMPLETED',
      duration_ms: Date.now() - startTime,
      tool_calls: [toolResult],
      calculations: calc.metrics,
      assessment: calc.assessment,
      assumptions: [
        'All figures provided represent take-home monthly amounts in Indian Rupees (INR).',
        'Tax deductions, EPF, and professional tax are assumed to be already factored out of net income.',
        'Emergency fund benchmarks target 3 to 6 months of essential living expenses.'
      ],
      recommendations: calc.assessment?.actionable_recommendations || [],
      relevant_knowledge: educationalContext ? {
        title: educationalContext.title,
        doc_id: educationalContext.doc_id,
        snippet: educationalContext.snippet
      } : null,
      disclaimer: DISCLAIMERS.FINANCIAL
    };
  }
}
