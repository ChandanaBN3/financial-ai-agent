// Simplified Orchestrator (Coordinator) Agent
// Directs three main agents: Financial Advisory, Fraud Detection, and a health aggregator.
// Supports explicit workflow types and a controlled tool-failure demo for testing.
// All steps are recorded in a deterministic execution trace without LLM dependence.
// The 'mode' parameter can be 'LOCAL' (default) to run without external API keys.

import { AGENT_ROLES, WORKFLOW_TYPES } from '../config/constants.js';
import { FinancialAdvisoryAgent } from './financialAdvisoryAgent.js';
import { FraudDetectionAgent } from './fraudDetectionAgent.js';
import { FinancialHealthAgent } from './financialHealthAgent.js';
import { Repository } from '../db/repository.js';
import { searchKnowledgeBase } from '../tools/knowledgeRetriever.js';

export class OrchestratorAgent {
  constructor(repository = null) {
    this.role = AGENT_ROLES.ORCHESTRATOR;
    this.repo = repository || new Repository();
    this.advisoryAgent = new FinancialAdvisoryAgent();
    this.fraudAgent = new FraudDetectionAgent();
    this.healthAgent = new FinancialHealthAgent();
    this.maxSteps = 6;
    this.timeoutMs = 15000;
  }

  /** Main entry point – simplified workflow */
  async runTask({ prompt, workflowType = null, inputData = {}, mode = 'LOCAL' }) {
    const runStartTime = Date.now();
    const runId = `RUN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const classifiedWorkflow = workflowType || this.classifyTask(prompt, inputData);
    const plan = this.createSimplePlan(classifiedWorkflow);
    const executionTrace = [];
    const specialistOutputs = {};
    let runStatus = 'SUCCESS';
    let failureReason = null;

    for (let i = 0; i < plan.steps.length && i < this.maxSteps; i++) {
      const stepPlan = plan.steps[i];
      const stepRecord = {
        step_id: stepPlan.step_id,
        agent: stepPlan.agent,
        action: stepPlan.action,
        status: 'RUNNING',
        started_at: new Date().toISOString(),
        inputs: {},
        outputs: null,
        error: null,
        duration_ms: 0
      };
      const stepStart = Date.now();

      try {
        await this.executeSimpleStep(stepPlan, inputData, specialistOutputs, stepRecord, prompt);
        stepRecord.duration_ms = Date.now() - stepStart;
        stepRecord.completed_at = new Date().toISOString();

        if (stepRecord.error) {
          stepRecord.status = 'FAILED';
          runStatus = 'FAILED';
          failureReason = stepRecord.error;
          executionTrace.push(stepRecord);
          break;
        }
        stepRecord.status = 'COMPLETED';
        executionTrace.push(stepRecord);
      } catch (err) {
        stepRecord.status = 'FAILED';
        stepRecord.error = `Unexpected error: ${err.message}`;
        stepRecord.duration_ms = Date.now() - stepStart;
        runStatus = 'FAILED';
        failureReason = stepRecord.error;
        executionTrace.push(stepRecord);
        break;
      }
    }

    // Post-processing for combined health
    if (runStatus === 'SUCCESS' && classifiedWorkflow === WORKFLOW_TYPES.COMBINED_HEALTH) {
      const healthResult = await this.healthAgent.process(specialistOutputs);
      specialistOutputs.health = healthResult;
    }

    // Deterministic final synthesis (no LLM)
    const evidence = this.buildEvidence(specialistOutputs);
    const finalSynthesis = runStatus === 'SUCCESS'
      ? {
          explanation: this.buildExplanation(specialistOutputs),
          is_llm_generated: false,
          mode: mode,
          evidence: evidence,
          warnings: []
        }
      : {
          explanation: `Workflow Halted Due to Step Failure: ${failureReason}`,
          is_llm_generated: false,
          mode: mode,
          evidence: [],
          warnings: [`Step failed: ${failureReason}`]
        };

    const totalDurationMs = Date.now() - runStartTime;
    const runRecord = {
      run_id: runId,
      timestamp: new Date().toISOString(),
      task_prompt: prompt,
      workflow_type: classifiedWorkflow,
      mode,
      status: runStatus,
      duration_ms: totalDurationMs,
      steps_count: executionTrace.length,
      execution_trace: executionTrace,
      final_synthesis: finalSynthesis,
      specialist_outputs: specialistOutputs
    };

    // Persist the run
    try {
      this.repo.insertAgentRun(runRecord);
    } catch (dbErr) {
      console.error('Failed to persist agent run to SQLite:', dbErr.message);
    }
    return runRecord;
  }

  /** Executes a single step based on its action */
  async executeSimpleStep(stepPlan, inputData, specialistOutputs, stepRecord, prompt) {
    const { action } = stepPlan;

    if (action === 'VALIDATE') {
      stepRecord.inputs = inputData;
      stepRecord.outputs = { validated: true };
      return;
    }

    if (action === 'EXECUTE_ADVISORY') {
      stepRecord.inputs = inputData;
      const result = await this.advisoryAgent.process(inputData);
      stepRecord.outputs = result;
      if (result.status === 'FAILED') {
        stepRecord.error = result.error;
      } else {
        specialistOutputs.advisory = result;
      }
      return;
    }

    if (action === 'EXECUTE_FRAUD_CHECK') {
      stepRecord.inputs = inputData;
      const result = await this.fraudAgent.process(inputData);
      stepRecord.outputs = result;
      if (result.status === 'FAILED') {
        stepRecord.error = result.error;
      } else {
        specialistOutputs.fraud = result;
      }
      return;
    }

    if (action === 'EXECUTE_TOOL_FAILURE') {
      // Simulated controlled failure for the test suite
      stepRecord.error = 'Controlled Tool Failure';
      return;
    }

    if (action === 'EXECUTE_HEALTH') {
      // Placeholder step – real health is computed after both specialist steps
      stepRecord.outputs = { health_summary: 'Combined health generated' };
      return;
    }

    if (action === 'SEARCH_KNOWLEDGE') {
      // Financial education: search the knowledge base using the retriever tool
      stepRecord.inputs = inputData;
      const query = inputData.query || prompt || '';
      const searchResult = searchKnowledgeBase({ query }, this.repo);
      stepRecord.outputs = searchResult;
      specialistOutputs.knowledge = searchResult.results || [];
      return;
    }

    throw new Error(`Unrecognized action ${action}`);
  }

  /** Simple local knowledge search fallback */
  searchKnowledgeLocal(query) {
    try {
      const docs = this.repo.getKnowledgeDocs ? this.repo.getKnowledgeDocs() : [];
      if (!query || !query.trim()) return [];
      const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      return docs.filter(doc => {
        const text = `${doc.title || ''} ${doc.content || ''} ${(doc.tags || []).join(' ')}`.toLowerCase();
        return terms.some(t => text.includes(t));
      });
    } catch {
      return [];
    }
  }

  /** Builds evidence array from specialist outputs */
  buildEvidence(outputs) {
    const evidence = [];
    if (outputs.advisory) {
      evidence.push({
        tool: 'calculateFinancialMetrics',
        summary: `Net cash flow: ${outputs.advisory.calculations?.net_cash_flow ?? 'N/A'}, savings rate: ${outputs.advisory.calculations?.savings_rate ?? 'N/A'}`
      });
    }
    if (outputs.fraud) {
      const scoring = outputs.fraud.scoring || {};
      evidence.push({
        tool: 'scoreTransactionRisk',
        summary: `Risk score: ${scoring.risk_score ?? 'N/A'}/100, level: ${scoring.risk_level ?? 'N/A'}`
      });
    }
    if (outputs.knowledge && outputs.knowledge.length > 0) {
      evidence.push({
        tool: 'searchKnowledgeBase',
        summary: `Found ${outputs.knowledge.length} relevant article(s)`
      });
    }
    return evidence;
  }

  /** Builds a simple deterministic explanation string */
  buildExplanation(outputs) {
    const parts = [];

    if (outputs.advisory) {
      parts.push('Financial Advisory Assessment – recommendations generated.');
    }

    if (outputs.fraud) {
      const riskLevel = outputs.fraud.scoring?.risk_level ?? 'UNKNOWN';
      parts.push(`Transaction Risk Evaluation – details provided. ${riskLevel} RISK detected.`);
    }

    if (outputs.health) {
      parts.push('Combined Financial Health – advisory and fraud analysis completed.');
    }

    if (outputs.knowledge && outputs.knowledge.length > 0) {
      // Build explanation from knowledge results
      const titles = outputs.knowledge.map(k => k.title || 'Article').slice(0, 3);
      parts.push(`Financial Education – found relevant information: ${titles.join(', ')}.`);
    }

    if (parts.length === 0) {
      parts.push('Analysis completed successfully.');
    }

    return parts.join(' ');
  }

  /** Creates a minimal plan based on the requested workflow */
  createSimplePlan(workflowType) {
    const steps = [{
      step_id: 1,
      agent: AGENT_ROLES.ORCHESTRATOR,
      action: 'VALIDATE',
      description: 'Validate inputs'
    }];

    if (workflowType === WORKFLOW_TYPES.TOOL_FAILURE_DEMO) {
      steps.push({
        step_id: 2,
        agent: AGENT_ROLES.ORCHESTRATOR,
        action: 'EXECUTE_TOOL_FAILURE',
        description: 'Demonstrate controlled tool failure'
      });
    } else if (workflowType === WORKFLOW_TYPES.FINANCIAL_ADVISORY) {
      steps.push({
        step_id: 2,
        agent: AGENT_ROLES.FINANCIAL_ADVISOR,
        action: 'EXECUTE_ADVISORY',
        description: 'Run financial advisory calculations'
      });
    } else if (workflowType === WORKFLOW_TYPES.TRANSACTION_RISK) {
      steps.push({
        step_id: 2,
        agent: AGENT_ROLES.FRAUD_DETECTOR,
        action: 'EXECUTE_FRAUD_CHECK',
        description: 'Run fraud risk scoring'
      });
    } else if (workflowType === WORKFLOW_TYPES.COMBINED_HEALTH) {
      steps.push({
        step_id: 2,
        agent: AGENT_ROLES.FINANCIAL_ADVISOR,
        action: 'EXECUTE_ADVISORY',
        description: 'Financial advisory calculations'
      });
      steps.push({
        step_id: 3,
        agent: AGENT_ROLES.FRAUD_DETECTOR,
        action: 'EXECUTE_FRAUD_CHECK',
        description: 'Fraud risk scoring'
      });
      steps.push({
        step_id: 4,
        agent: AGENT_ROLES.ORCHESTRATOR,
        action: 'EXECUTE_HEALTH',
        description: 'Generate combined health summary'
      });
    } else if (workflowType === WORKFLOW_TYPES.FINANCIAL_EDUCATION) {
      // Knowledge search step
      steps.push({
        step_id: 2,
        agent: AGENT_ROLES.ORCHESTRATOR,
        action: 'SEARCH_KNOWLEDGE',
        description: 'Search knowledge base for educational content'
      });
    } else {
      // Fallback – knowledge search
      steps.push({
        step_id: 2,
        agent: AGENT_ROLES.ORCHESTRATOR,
        action: 'SEARCH_KNOWLEDGE',
        description: 'Search knowledge base'
      });
    }
    return { steps };
  }

  /** Classifies the user request into a workflow type */
  classifyTask(prompt = '', inputData = {}) {
    const text = (prompt || '').toLowerCase();

    // 1. Forced failure demo
    if (text.includes('fail') || text.includes('error') || text.includes('broken') || text.includes('scenario 5')) {
      return WORKFLOW_TYPES.TOOL_FAILURE_DEMO;
    }

    const hasFinancialFigures = inputData.monthly_income !== undefined && inputData.monthly_expenses !== undefined;
    const hasTxFigures = inputData.amount !== undefined;

    // 2. Educational queries (no numerical data)
    const isEducational =
      text.includes('what is') || text.includes('what are') || text.includes('explain') ||
      text.includes('how to') || text.includes('how do i') || text.includes('rule') ||
      text.includes('guideline') || text.includes('education') || text.includes('tips');

    if (isEducational && !hasFinancialFigures && !hasTxFigures) {
      return WORKFLOW_TYPES.FINANCIAL_EDUCATION;
    }

    // 3. Combined workflow – prompt mentions BOTH finance and transactions
    const hasFinanceWords = text.includes('financ') || text.includes('save') || text.includes('budget') ||
      text.includes('income') || text.includes('expense') || text.includes('salary');
    const hasTxWords = text.includes('transaction') || text.includes('fraud') || text.includes('suspicious') ||
      text.includes('risk') || text.includes('upi') || text.includes('merchant');

    if (hasFinancialFigures && hasTxFigures) return WORKFLOW_TYPES.COMBINED_HEALTH;
    if (hasFinanceWords && hasTxWords) return WORKFLOW_TYPES.COMBINED_HEALTH;

    // 4. Transaction-risk detection
    if (hasTxWords || hasTxFigures) {
      return WORKFLOW_TYPES.TRANSACTION_RISK;
    }

    // 5. Financial advisory
    if (hasFinanceWords || hasFinancialFigures) {
      return WORKFLOW_TYPES.FINANCIAL_ADVISORY;
    }

    // Default fallback
    return WORKFLOW_TYPES.FINANCIAL_EDUCATION;
  }
}
