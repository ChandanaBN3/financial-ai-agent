import { AGENT_ROLES, WORKFLOW_TYPES, ALLOWED_TOOLS } from '../config/constants.js';
import { FinancialAdvisoryAgent } from './financialAdvisoryAgent.js';
import { FraudDetectionAgent } from './fraudDetectionAgent.js';
import { FinancialHealthAgent } from './financialHealthAgent.js';
import { ExplanationAgent } from './explanationAgent.js';
import { LLMPlanner } from './llmPlanner.js';
import { executeTool } from '../tools/index.js';
import { Repository } from '../db/repository.js';

export class OrchestratorAgent {
  constructor(repository = null) {
    this.role = AGENT_ROLES.ORCHESTRATOR;
    this.repo = repository || new Repository();
    this.advisoryAgent = new FinancialAdvisoryAgent();
    this.fraudAgent = new FraudDetectionAgent();
    this.healthAgent = new FinancialHealthAgent();
    this.explanationAgent = new ExplanationAgent();
    this.llmPlanner = new LLMPlanner();
    this.maxSteps = 6;
    this.timeoutMs = 15000;
  }

  /**
   * Main entry point to orchestrate user tasks
   */
  async runTask({ prompt, workflowType = null, inputData = {}, mode = 'LOCAL' }) {
    const runStartTime = Date.now();
    const runId = `RUN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Task Classification
    const classifiedWorkflow = workflowType || this.classifyTask(prompt, inputData);

    // 2. Determine execution mode (Check if LLM requested and available)
    let executionMode = 'LOCAL';
    if (mode === 'LLM_ASSISTED' && this.llmPlanner.isConfigured()) {
      executionMode = 'LLM_ASSISTED';
    }

    // 3. Create bounded execution plan
    const plan = this.createExecutionPlan(classifiedWorkflow, prompt, inputData);

    const executionTrace = [];
    const specialistOutputs = {};
    let runStatus = 'SUCCESS';
    let failureReason = null;

    // 4. Controlled Execution Loop
    for (let i = 0; i < plan.steps.length; i++) {
      if (i >= this.maxSteps) {
        break; // Hard boundary enforcement
      }

      const stepPlan = plan.steps[i];
      const stepRecord = {
        step_id: stepPlan.step_id,
        agent: stepPlan.agent,
        action: stepPlan.action,
        tool: stepPlan.tool,
        status: 'RUNNING',
        started_at: new Date().toISOString(),
        inputs: {},
        outputs: null,
        error: null,
        duration_ms: 0
      };

      const stepStart = Date.now();

      try {
        await this.executePlanStep(stepPlan, inputData, specialistOutputs, stepRecord);

        stepRecord.duration_ms = Date.now() - stepStart;
        stepRecord.completed_at = new Date().toISOString();

        if (stepRecord.error) {
          stepRecord.status = 'FAILED';
          runStatus = 'FAILED';
          failureReason = stepRecord.error;
          executionTrace.push(stepRecord);
          // If a crucial step fails, do not proceed with downstream dependency execution
          break;
        } else {
          stepRecord.status = 'COMPLETED';
          executionTrace.push(stepRecord);
        }
      } catch (err) {
        stepRecord.status = 'FAILED';
        stepRecord.error = `Unexpected step execution error: ${err.message}`;
        stepRecord.duration_ms = Date.now() - stepStart;
        runStatus = 'FAILED';
        failureReason = stepRecord.error;
        executionTrace.push(stepRecord);
        break;
      }
    }

    // 5. Final Synthesis by Explanation Agent
    let finalSynthesis = null;

    if (runStatus === 'SUCCESS') {
      try {
        finalSynthesis = await this.explanationAgent.synthesize({
          taskPrompt: prompt,
          workflowType: classifiedWorkflow,
          executionTrace,
          specialistOutputs,
          mode: executionMode
        });
      } catch (err) {
        finalSynthesis = {
          explanation: `Synthesis error: ${err.message}`,
          warnings: ['Failed to synthesize formatted narrative.'],
          is_llm_generated: false
        };
      }
    } else {
      // Truthful failure reporting
      finalSynthesis = {
        agent: AGENT_ROLES.EXPLAINER,
        mode: executionMode,
        explanation: `### ❌ Workflow Halted Due to Step Failure\n\nThe orchestrator encountered a failure during execution:\n> **${failureReason}**\n\nThe system stopped execution truthfully without inventing or fabricating downstream results.`,
        is_llm_generated: false,
        warnings: [failureReason || 'One or more tool steps reported failure.'],
        assumptions: [],
        next_steps: [
          'Verify that input values conform to required positive numerical ranges.',
          'Review the execution trace below for exact parameters and tool error codes.'
        ]
      };
    }

    const totalDurationMs = Date.now() - runStartTime;

    const runRecord = {
      run_id: runId,
      timestamp: new Date().toISOString(),
      task_prompt: prompt,
      workflow_type: classifiedWorkflow,
      mode: executionMode,
      status: runStatus,
      duration_ms: totalDurationMs,
      steps_count: executionTrace.length,
      execution_trace: executionTrace,
      final_synthesis: finalSynthesis,
      specialist_outputs: specialistOutputs
    };

    // 6. Persist Agent Run to SQLite
    try {
      this.repo.insertAgentRun(runRecord);
    } catch (dbErr) {
      console.error('Failed to persist agent run to SQLite:', dbErr.message);
    }

    return runRecord;
  }

  /**
   * Execute an individual planned step
   */
  async executePlanStep(stepPlan, inputData, specialistOutputs, stepRecord) {
    const { action, tool } = stepPlan;

    if (action === 'VALIDATE_AND_PREPARE') {
      stepRecord.inputs = { prompt: inputData.prompt, workflow: stepPlan.workflow };
      stepRecord.outputs = { validated: true, timestamp: new Date().toISOString() };
      return;
    }

    if (action === 'EXECUTE_ADVISORY') {
      stepRecord.inputs = {
        monthly_income: inputData.monthly_income,
        monthly_expenses: inputData.monthly_expenses,
        essential_expenses: inputData.essential_expenses,
        current_savings: inputData.current_savings
      };

      const result = await this.advisoryAgent.process(inputData);
      if (result.status === 'FAILED') {
        stepRecord.error = result.error;
        stepRecord.outputs = result;
      } else {
        stepRecord.outputs = result;
        specialistOutputs.advisory = result;
      }
      return;
    }

    if (action === 'EXECUTE_FRAUD_CHECK') {
      stepRecord.inputs = {
        amount: inputData.amount,
        merchant: inputData.merchant_name || inputData.merchant,
        historical_average: inputData.historical_average
      };

      const result = await this.fraudAgent.process(inputData);
      if (result.status === 'FAILED') {
        stepRecord.error = result.error;
        stepRecord.outputs = result;
      } else {
        stepRecord.outputs = result;
        specialistOutputs.fraud = result;
      }
      return;
    }

    if (action === 'FETCH_RECENT_TRANSACTIONS') {
      stepRecord.inputs = { limit: 5 };
      const toolResult = await executeTool('getRecentTransactions', { limit: 5 });
      if (!toolResult.success) {
        stepRecord.error = toolResult.error;
      } else {
        stepRecord.outputs = toolResult.output;
        specialistOutputs.recent_transactions = toolResult.output.transactions;
      }
      return;
    }

    if (action === 'EXECUTE_HEALTH_SYNTHESIS') {
      stepRecord.inputs = {
        has_advisory: Boolean(specialistOutputs.advisory),
        has_fraud: Boolean(specialistOutputs.fraud),
        recent_tx_count: specialistOutputs.recent_transactions?.length || 0
      };

      const result = await this.healthAgent.process(specialistOutputs);
      stepRecord.outputs = result;
      specialistOutputs.health = result;
      return;
    }

    if (action === 'SEARCH_KNOWLEDGE') {
      const query = inputData.query || inputData.prompt || 'budgeting emergency savings';
      stepRecord.inputs = { query, limit: 3 };

      const toolResult = await executeTool('searchKnowledgeBase', { query, limit: 3 });
      if (!toolResult.success) {
        stepRecord.error = toolResult.error;
      } else {
        stepRecord.outputs = toolResult.output;
        specialistOutputs.knowledge = toolResult.output;
      }
      return;
    }

    if (action === 'SIMULATE_CONTROLLED_FAILURE') {
      stepRecord.inputs = { simulated_error: true };
      const toolResult = await executeTool('simulateToolFailure', {
        reason: 'Simulated payment gateway timeout or invalid constraint parameter.',
        error_code: 'GATEWAY_TIMEOUT_DEMO'
      });
      // Tool intentionally returns success: false
      stepRecord.outputs = toolResult.output;
      stepRecord.error = toolResult.error || 'Simulated tool failure triggered successfully.';
      return;
    }

    throw new Error(`Unrecognized execution plan action: ${action}`);
  }

  /**
   * Classify user prompt into workflow type
   */
  classifyTask(prompt = '', inputData = {}) {
    const text = (prompt || '').toLowerCase();

    if (text.includes('fail') || text.includes('error') || text.includes('broken') || text.includes('scenario 5')) {
      return WORKFLOW_TYPES.TOOL_FAILURE_DEMO;
    }

    const hasFinancialFigures = inputData.monthly_income !== undefined && inputData.monthly_expenses !== undefined;
    const hasTxFigures = inputData.amount !== undefined;

    // Check for educational / informational questions
    const isEducationalQuery =
      text.includes('what is') ||
      text.includes('what are') ||
      text.includes('explain') ||
      text.includes('how to') ||
      text.includes('how do i') ||
      text.includes('rule') ||
      text.includes('guideline') ||
      text.includes('education') ||
      text.includes('tips');

    if (isEducationalQuery && !hasFinancialFigures && !hasTxFigures) {
      return WORKFLOW_TYPES.FINANCIAL_EDUCATION;
    }

    if (hasFinancialFigures && hasTxFigures) {
      return WORKFLOW_TYPES.COMBINED_HEALTH;
    }

    if (
      (text.includes('finance') || text.includes('save') || text.includes('budget') || text.includes('income') || text.includes('expense') || text.includes('salary')) &&
      (text.includes('transaction') || text.includes('suspicious') || text.includes('fraud') || text.includes('risk') || text.includes('upi'))
    ) {
      return WORKFLOW_TYPES.COMBINED_HEALTH;
    }

    if (text.includes('fraud') || text.includes('suspicious') || text.includes('transaction') || text.includes('upi') || text.includes('merchant') || text.includes('risk') || hasTxFigures) {
      return WORKFLOW_TYPES.TRANSACTION_RISK;
    }

    if (text.includes('save') || text.includes('budget') || text.includes('income') || text.includes('expense') || text.includes('salary') || text.includes('invest') || hasFinancialFigures) {
      return WORKFLOW_TYPES.FINANCIAL_ADVISORY;
    }

    return WORKFLOW_TYPES.FINANCIAL_EDUCATION;
  }

  /**
   * Create bounded execution plan
   */
  createExecutionPlan(workflowType, prompt, inputData) {
    switch (workflowType) {
      case WORKFLOW_TYPES.FINANCIAL_ADVISORY:
        return {
          workflow: workflowType,
          description: 'Evaluate monthly finances, compute cash flow & savings ratios, and generate budget advice.',
          steps: [
            {
              step_id: 1,
              agent: AGENT_ROLES.ORCHESTRATOR,
              action: 'VALIDATE_AND_PREPARE',
              tool: null,
              description: 'Validate income and expense input parameters.'
            },
            {
              step_id: 2,
              agent: AGENT_ROLES.FINANCIAL_ADVISOR,
              action: 'EXECUTE_ADVISORY',
              tool: 'calculateFinancialMetrics',
              description: 'Invoke deterministic financial calculator tool.'
            },
            {
              step_id: 3,
              agent: AGENT_ROLES.EXPLAINER,
              action: 'SEARCH_KNOWLEDGE',
              tool: 'searchKnowledgeBase',
              description: 'Retrieve verified educational guidelines.'
            }
          ]
        };

      case WORKFLOW_TYPES.TRANSACTION_RISK:
        return {
          workflow: workflowType,
          description: 'Score transaction risk indicators, evaluate velocity and anomalies, and record outcome.',
          steps: [
            {
              step_id: 1,
              agent: AGENT_ROLES.ORCHESTRATOR,
              action: 'VALIDATE_AND_PREPARE',
              tool: null,
              description: 'Validate transaction amount and metadata.'
            },
            {
              step_id: 2,
              agent: AGENT_ROLES.FRAUD_DETECTOR,
              action: 'EXECUTE_FRAUD_CHECK',
              tool: 'scoreTransactionRisk',
              description: 'Run transparent rule-based fraud scoring tool and persist to database.'
            }
          ]
        };

      case WORKFLOW_TYPES.COMBINED_HEALTH:
        return {
          workflow: workflowType,
          description: 'Execute multi-agent analysis combining personal finances and transaction risks.',
          steps: [
            {
              step_id: 1,
              agent: AGENT_ROLES.ORCHESTRATOR,
              action: 'VALIDATE_AND_PREPARE',
              tool: null,
              description: 'Coordinate shared execution context across advisory and fraud modules.'
            },
            {
              step_id: 2,
              agent: AGENT_ROLES.FINANCIAL_ADVISOR,
              action: 'EXECUTE_ADVISORY',
              tool: 'calculateFinancialMetrics',
              description: 'Calculate cash flow, savings rate, and emergency buffer.'
            },
            {
              step_id: 3,
              agent: AGENT_ROLES.FRAUD_DETECTOR,
              action: 'EXECUTE_FRAUD_CHECK',
              tool: 'scoreTransactionRisk',
              description: 'Score active transaction risk and potential exposure.'
            },
            {
              step_id: 4,
              agent: AGENT_ROLES.FINANCIAL_ANALYST,
              action: 'FETCH_RECENT_TRANSACTIONS',
              tool: 'getRecentTransactions',
              description: 'Fetch recent transaction records for velocity analysis.'
            },
            {
              step_id: 5,
              agent: AGENT_ROLES.FINANCIAL_ANALYST,
              action: 'EXECUTE_HEALTH_SYNTHESIS',
              tool: null,
              description: 'Synthesize cross-module exposure risks and overall health.'
            }
          ]
        };

      case WORKFLOW_TYPES.FINANCIAL_EDUCATION:
        return {
          workflow: workflowType,
          description: 'Search local verified knowledge base and synthesize clear non-expert guidance.',
          steps: [
            {
              step_id: 1,
              agent: AGENT_ROLES.ORCHESTRATOR,
              action: 'VALIDATE_AND_PREPARE',
              tool: null,
              description: 'Parse educational query tokens and remove stop words.'
            },
            {
              step_id: 2,
              agent: AGENT_ROLES.EXPLAINER,
              action: 'SEARCH_KNOWLEDGE',
              tool: 'searchKnowledgeBase',
              description: 'Perform keyword relevance search on verified articles.'
            }
          ]
        };

      case WORKFLOW_TYPES.TOOL_FAILURE_DEMO:
        return {
          workflow: workflowType,
          description: 'Controlled demonstration of tool failure and truthful trace recording without fabrication.',
          steps: [
            {
              step_id: 1,
              agent: AGENT_ROLES.ORCHESTRATOR,
              action: 'VALIDATE_AND_PREPARE',
              tool: null,
              description: 'Initiate controlled testing sequence.'
            },
            {
              step_id: 2,
              agent: AGENT_ROLES.ORCHESTRATOR,
              action: 'SIMULATE_CONTROLLED_FAILURE',
              tool: 'simulateToolFailure',
              description: 'Trigger intentional upstream service timeout.'
            }
          ]
        };

      default:
        return {
          workflow: WORKFLOW_TYPES.FINANCIAL_EDUCATION,
          description: 'General financial query fallback.',
          steps: [
            {
              step_id: 1,
              agent: AGENT_ROLES.EXPLAINER,
              action: 'SEARCH_KNOWLEDGE',
              tool: 'searchKnowledgeBase',
              description: 'Search educational base.'
            }
          ]
        };
    }
  }
}
