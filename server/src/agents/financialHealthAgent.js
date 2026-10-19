import { AGENT_ROLES } from '../config/constants.js';

export class FinancialHealthAgent {
  constructor() {
    this.role = AGENT_ROLES.FINANCIAL_ANALYST;
    this.allowedTools = ['getRecentTransactions'];
  }

  /**
   * Synthesize advisory and transaction risk findings into a holistic financial health posture
   * @param {Object} specialistData - Outputs from advisory and fraud agents
   * @param {Object} context - Shared execution context
   */
  async process(specialistData = {}, context = {}) {
    const startTime = Date.now();
    const advisory = specialistData.advisory || null;
    const fraud = specialistData.fraud || null;
    const recentTransactions = specialistData.recent_transactions || [];

    const missingData = [];
    if (!advisory) missingData.push('advisory_metrics (monthly cash flow and savings rate)');
    if (!fraud && recentTransactions.length === 0) missingData.push('transaction_risk_data (recent transactions or evaluated transaction)');

    const combinedInsights = [];
    const correlationAlerts = [];

    // Analyze interaction between transaction risk and personal finances
    if (advisory?.calculations && fraud?.scoring) {
      const netCashFlow = advisory.calculations.net_cash_flow;
      const emergencyFund = advisory.calculations.current_savings;
      const txAmount = fraud.scoring.metrics?.amount || 0;
      const txRiskLevel = fraud.scoring.risk_level;

      if (txRiskLevel === 'HIGH' || txRiskLevel === 'MEDIUM') {
        const pctOfEmergencyFund = emergencyFund > 0 ? ((txAmount / emergencyFund) * 100).toFixed(1) : null;
        const pctOfMonthlySurplus = netCashFlow > 0 ? ((txAmount / netCashFlow) * 100).toFixed(1) : null;

        if (pctOfEmergencyFund && Number(pctOfEmergencyFund) > 20) {
          correlationAlerts.push(
            `High Exposure Risk: The flagged transaction (₹${txAmount.toLocaleString('en-IN')}) represents ${pctOfEmergencyFund}% of your entire liquid emergency savings (₹${emergencyFund.toLocaleString('en-IN')}). If fraudulent, it would significantly deplete your safety cushion.`
          );
        }

        if (pctOfMonthlySurplus && Number(pctOfMonthlySurplus) > 50) {
          correlationAlerts.push(
            `Budget Shock Alert: Flagged expenditure of ₹${txAmount.toLocaleString('en-IN')} consumes ${pctOfMonthlySurplus}% of your entire monthly savings surplus.`
          );
        }
      } else {
        combinedInsights.push('Low-risk transaction poses no threat to current cash flow or emergency reserves.');
      }
    }

    // Evaluate recent transaction patterns from history
    if (recentTransactions.length > 0) {
      const highRiskCount = recentTransactions.filter(t => t.risk_level === 'HIGH').length;
      const medRiskCount = recentTransactions.filter(t => t.risk_level === 'MEDIUM').length;

      if (highRiskCount > 0) {
        correlationAlerts.push(`Recent Pattern Alert: ${highRiskCount} high-risk transactions recorded in recent history require immediate user audit.`);
      }
      if (medRiskCount >= 2) {
        correlationAlerts.push(`Velocity Warning: ${medRiskCount} moderate-risk transactions detected, suggesting elevated anomalous spending.`);
      }
    }

    // Determine overall holistic health grade
    let overallHealthGrade = 'FAIR';
    if (advisory?.assessment?.stress_level === 'CRITICAL' || fraud?.scoring?.risk_level === 'HIGH') {
      overallHealthGrade = 'AT_RISK';
    } else if (advisory?.assessment?.stress_level === 'LOW' && (!fraud || fraud.scoring?.risk_level === 'LOW')) {
      overallHealthGrade = 'ROBUST';
    } else if (advisory?.assessment?.stress_level === 'MODERATE') {
      overallHealthGrade = 'STABLE';
    }

    return {
      agent: this.role,
      status: 'COMPLETED',
      duration_ms: Date.now() - startTime,
      overall_health_grade: overallHealthGrade,
      correlation_alerts: correlationAlerts,
      combined_insights: combinedInsights,
      missing_data_fields: missingData,
      summary: `Financial health evaluated as ${overallHealthGrade}. ${correlationAlerts.length} correlation warnings identified based on verified specialist tool outputs.`
    };
  }
}
