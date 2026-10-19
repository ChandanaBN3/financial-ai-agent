import { AGENT_ROLES, DISCLAIMERS } from '../config/constants.js';
import { LLMPlanner } from './llmPlanner.js';
import { formatINR, formatPercentage } from '../utils/formatters.js';

export class ExplanationAgent {
  constructor() {
    this.role = AGENT_ROLES.EXPLAINER;
    this.llmPlanner = new LLMPlanner();
  }

  /**
   * Synthesize final user-facing response from verified agent outputs
   */
  async synthesize({ taskPrompt, workflowType, executionTrace, specialistOutputs, mode = 'LOCAL' }) {
    const startTime = Date.now();

    // 1. If LLM-assisted mode is requested and available, attempt grounded synthesis
    if (mode === 'LLM_ASSISTED' && this.llmPlanner.isConfigured()) {
      const llmResult = await this.llmPlanner.synthesizeExplanation(
        taskPrompt,
        executionTrace,
        specialistOutputs
      );

      if (llmResult.success) {
        return {
          agent: this.role,
          mode: 'LLM_ASSISTED',
          duration_ms: Date.now() - startTime,
          explanation: llmResult.explanation,
          is_llm_generated: true,
          evidence: this.extractEvidence(specialistOutputs),
          disclaimers: [DISCLAIMERS.FINANCIAL, DISCLAIMERS.FRAUD]
        };
      }
    }

    // 2. Deterministic Template Synthesis (Default & Reliable)
    const deterministicReport = this.buildDeterministicReport(workflowType, specialistOutputs);

    return {
      agent: this.role,
      mode: 'LOCAL',
      duration_ms: Date.now() - startTime,
      explanation: deterministicReport.text,
      is_llm_generated: false,
      sections: deterministicReport.sections,
      evidence: this.extractEvidence(specialistOutputs),
      assumptions: deterministicReport.assumptions,
      warnings: deterministicReport.warnings,
      next_steps: deterministicReport.next_steps,
      disclaimers: [DISCLAIMERS.FINANCIAL, DISCLAIMERS.FRAUD]
    };
  }

  buildDeterministicReport(workflowType, outputs = {}) {
    const sections = [];
    const assumptions = [];
    const warnings = [];
    const nextSteps = [];

    const advisory = outputs.advisory;
    const fraud = outputs.fraud;
    const health = outputs.health;
    const knowledge = outputs.knowledge;

    let narrative = '';

    // --- Financial Advisory Section ---
    if (advisory?.calculations) {
      const m = advisory.calculations;
      const a = advisory.assessment;

      sections.push({
        title: 'Monthly Cash Flow & Savings Summary',
        content: `Monthly Income: ${formatINR(m.monthly_income)} | Expenses: ${formatINR(m.monthly_expenses)} | Net Surplus: ${formatINR(m.net_cash_flow)} (${formatPercentage(m.savings_rate)} savings rate).`
      });

      if (m.emergency_coverage_months !== undefined) {
        sections.push({
          title: 'Emergency Reserve Analysis',
          content: `Current liquid savings: ${formatINR(m.current_savings)} provides ${m.emergency_coverage_months} months of essential coverage (Benchmark: 3 to 6 months = ${formatINR(m.target_emergency_fund)}).`
        });
      }

      if (a?.warnings?.length > 0) warnings.push(...a.warnings);
      if (a?.actionable_recommendations?.length > 0) nextSteps.push(...a.actionable_recommendations);
      if (advisory.assumptions?.length > 0) assumptions.push(...advisory.assumptions);

      narrative += `### 📊 Financial Advisory Assessment\n\n`;
      narrative += `Based on your monthly income of **${formatINR(m.monthly_income)}** and monthly expenses of **${formatINR(m.monthly_expenses)}**, your net monthly cash flow is **${formatINR(m.net_cash_flow)}** (${formatPercentage(m.savings_rate)} savings rate).\n\n`;

      narrative += `- **Budget Status**: ${a?.budget_health_status} (Stress Level: ${a?.stress_level})\n`;
      narrative += `- **Emergency Fund Buffer**: ${m.emergency_coverage_months} months of living expenses covered.\n`;
      narrative += `- **50/30/20 Target Split**: Needs: ${formatINR(m.rule_50_30_20.target.needs)} | Wants: ${formatINR(m.rule_50_30_20.target.wants)} | Savings: ${formatINR(m.rule_50_30_20.target.savings)}\n\n`;
    }

    // --- Fraud Detection Section ---
    if (fraud?.scoring) {
      const s = fraud.scoring;
      const m = s.metrics || {};

      sections.push({
        title: 'Transaction Risk Scoring',
        content: `Evaluated ${formatINR(m.amount)} transaction with merchant "${m.merchant_name || 'N/A'}". Risk Score: ${s.risk_score}/100 [${s.risk_level}]. Recommended Action: ${s.recommended_action}.`
      });

      if (s.triggered_rules?.length > 0) {
        sections.push({
          title: 'Triggered Risk Rules',
          content: s.triggered_rules.map(r => `• ${r.rule} (+${r.points} pts): ${r.description}`).join('\n')
        });
      }

      if (s.risk_level === 'HIGH') {
        warnings.push(`Critical transaction risk detected (${s.risk_score}/100). Do not approve until secondary verification is completed.`);
        nextSteps.push('Place immediate hold on payment and verify recipient details with the customer via registered mobile.');
      } else if (s.risk_level === 'MEDIUM') {
        warnings.push(`Suspicious indicators triggered for transaction of ${formatINR(m.amount)}. Requires step-up OTP authentication.`);
        nextSteps.push('Request biometric confirmation or send two-factor SMS OTP to authorized account holder.');
      } else {
        nextSteps.push('Transaction approved under standard low-risk policy.');
      }

      narrative += `### 🛡️ Transaction Risk Evaluation\n\n`;
      narrative += `Transaction Amount: **${formatINR(m.amount)}** | Merchant: **${m.merchant_name || 'Demo Merchant'}**\n`;
      narrative += `- **Risk Score**: **${s.risk_score} / 100** (**${s.risk_level} RISK**)\n`;
      narrative += `- **Recommended Action**: \`${s.recommended_action}\`\n`;
      narrative += `- **Analysis**: ${s.explanation}\n\n`;

      if (s.triggered_rules?.length > 0) {
        narrative += `**Triggered Signals:**\n`;
        for (const rule of s.triggered_rules) {
          narrative += `- **${rule.rule}** (+${rule.points} pts): ${rule.description}\n`;
        }
        narrative += '\n';
      }
    }

    // --- Combined Financial Health Section ---
    if (health?.overall_health_grade) {
      narrative += `### 🔗 Holistic Financial Health Posture\n\n`;
      narrative += `- **Health Grade**: **${health.overall_health_grade}**\n`;
      if (health.correlation_alerts?.length > 0) {
        narrative += `- **Cross-Module Alerts**:\n`;
        for (const alert of health.correlation_alerts) {
          narrative += `  * ⚠️ ${alert}\n`;
          warnings.push(alert);
        }
      }
      narrative += '\n';
    }

    // --- Educational Knowledge Section ---
    if (knowledge?.results?.length > 0) {
      narrative += `### 📚 Verified Knowledge References\n\n`;
      for (const doc of knowledge.results) {
        narrative += `**[${doc.doc_id}] ${doc.title}** (Relevance: ${doc.relevance_score})\n`;
        narrative += `> "${doc.snippet}"\n\n`;
      }
    } else if (workflowType === 'FINANCIAL_EDUCATION' && (!knowledge || knowledge.count === 0)) {
      narrative += `### 📚 Knowledge Base Retrieval\n\n`;
      narrative += `*Notice: No sufficiently relevant local source was found in the verified knowledge base for this specific query.*\n\n`;
    }

    // --- Actionable Next Steps ---
    if (nextSteps.length > 0) {
      narrative += `### 💡 Actionable Next Steps\n`;
      const uniqueSteps = [...new Set(nextSteps)];
      uniqueSteps.forEach((step, idx) => {
        narrative += `${idx + 1}. ${step}\n`;
      });
      narrative += '\n';
    }

    // --- Disclaimer ---
    narrative += `---\n*Educational Prototype Disclaimer: All calculations and scores are generated by local deterministic rules for university project demonstration.*`;

    return {
      text: narrative,
      sections,
      assumptions,
      warnings,
      next_steps: [...new Set(nextSteps)]
    };
  }

  extractEvidence(outputs = {}) {
    const evidence = [];
    if (outputs.advisory?.tool_calls) {
      for (const call of outputs.advisory.tool_calls) {
        evidence.push({
          tool: call.tool,
          status: call.success ? 'SUCCESS' : 'FAILED',
          summary: `Calculated metrics for ₹${call.inputs?.monthly_income} income.`
        });
      }
    }
    if (outputs.fraud?.tool_calls) {
      for (const call of outputs.fraud.tool_calls) {
        evidence.push({
          tool: call.tool,
          status: call.success ? 'SUCCESS' : 'FAILED',
          summary: `Evaluated risk score (${call.output?.risk_score}/100) for ₹${call.inputs?.amount}.`
        });
      }
    }
    if (outputs.knowledge?.results) {
      for (const doc of outputs.knowledge.results) {
        evidence.push({
          tool: 'searchKnowledgeBase',
          status: 'SUCCESS',
          summary: `Retrieved "${doc.title}" (Relevance: ${doc.relevance_score}).`
        });
      }
    }
    return evidence;
  }
}
