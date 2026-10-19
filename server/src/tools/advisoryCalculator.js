import { ADVISORY_RULES } from '../config/constants.js';
import { formatINR, formatPercentage } from '../utils/formatters.js';

/**
 * Deterministic Financial Metrics Calculator
 * Strictly mathematical and rule-based. Zero LLM hallucinations.
 */
export function calculateFinancialMetrics(params = {}) {
  const {
    monthly_income,
    monthly_expenses,
    essential_expenses = null,
    current_savings = 0,
    savings_goal = null,
    spending_categories = {}
  } = params;

  // 1. Rigorous input validation
  const income = Number(monthly_income);
  const expenses = Number(monthly_expenses);
  const savings = Number(current_savings || 0);
  const goal = savings_goal !== null && savings_goal !== undefined ? Number(savings_goal) : null;

  if (isNaN(income) || income <= 0) {
    return {
      success: false,
      error: 'Invalid monthly income. Monthly income must be a positive number in INR.',
      code: 'INVALID_INCOME'
    };
  }

  if (isNaN(expenses) || expenses < 0) {
    return {
      success: false,
      error: 'Invalid monthly expenses. Expenses cannot be negative.',
      code: 'INVALID_EXPENSES'
    };
  }

  if (isNaN(savings) || savings < 0) {
    return {
      success: false,
      error: 'Current savings cannot be negative.',
      code: 'INVALID_SAVINGS'
    };
  }

  // Derive essentials if not provided (default estimate: 70% of total expenses)
  let essentials = essential_expenses !== null && essential_expenses !== undefined
    ? Number(essential_expenses)
    : Math.round(expenses * 0.70);

  if (isNaN(essentials) || essentials < 0) {
    essentials = Math.round(expenses * 0.70);
  }

  if (essentials > expenses) {
    return {
      success: false,
      error: 'Essential expenses (₹' + essentials.toLocaleString('en-IN') + ') cannot exceed total monthly expenses (₹' + expenses.toLocaleString('en-IN') + ').',
      code: 'ESSENTIALS_EXCEED_EXPENSES'
    };
  }

  const discretionary = Math.max(0, expenses - essentials);

  // 2. Core deterministic calculations
  const netCashFlow = income - expenses;
  const expenseRatio = Number((expenses / income).toFixed(4));
  const savingsRate = Number(((Math.max(0, netCashFlow)) / income).toFixed(4));
  const essentialRatio = Number((essentials / income).toFixed(4));
  const discretionaryRatio = Number((discretionary / income).toFixed(4));

  // Emergency Fund Coverage (in months of essential spending)
  const monthlyBurn = essentials > 0 ? essentials : (expenses > 0 ? expenses : 1);
  const emergencyCoverageMonths = Number((savings / monthlyBurn).toFixed(1));
  const emergencyShortfall = Math.max(0, (monthlyBurn * ADVISORY_RULES.EMERGENCY_FUND_TARGET_MONTHS) - savings);

  // 50/30/20 Comparisons
  const targetNeeds = Math.round(income * ADVISORY_RULES.RECOMMENDED_NEEDS_RATIO);
  const targetWants = Math.round(income * ADVISORY_RULES.RECOMMENDED_WANTS_RATIO);
  const targetSavings = Math.round(income * ADVISORY_RULES.RECOMMENDED_SAVINGS_RATIO);

  const needsDifference = essentials - targetNeeds; // positive = over budget
  const wantsDifference = discretionary - targetWants;
  const savingsDifference = netCashFlow - targetSavings; // negative = under savings target

  // Savings Goal Trajectory
  let goalTimelineMonths = null;
  let goalFeasibility = 'NOT_SPECIFIED';
  if (goal !== null && !isNaN(goal) && goal > savings) {
    const requiredAmount = goal - savings;
    if (netCashFlow > 0) {
      goalTimelineMonths = Math.ceil(requiredAmount / netCashFlow);
      goalFeasibility = goalTimelineMonths <= 12 ? 'SHORT_TERM' : goalTimelineMonths <= 36 ? 'MEDIUM_TERM' : 'LONG_TERM';
    } else {
      goalTimelineMonths = null;
      goalFeasibility = 'UNACHIEVABLE_AT_CURRENT_BURN';
    }
  }

  // 3. Health & Budget Pressure Classification
  let budgetHealthStatus = 'HEALTHY';
  let stressLevel = 'LOW';
  const warnings = [];
  const findings = [];
  const actionableSteps = [];

  if (netCashFlow < 0) {
    budgetHealthStatus = 'DEFICIT';
    stressLevel = 'CRITICAL';
    warnings.push(`Monthly deficit detected: You are spending ₹${Math.abs(netCashFlow).toLocaleString('en-IN')} more than you earn each month.`);
    actionableSteps.push('Urgent audit required: Trim discretionary dining/entertainment and re-negotiate high recurring bills.');
  } else if (expenseRatio > ADVISORY_RULES.EXPENSE_RATIO_HIGH) {
    budgetHealthStatus = 'HIGH_PRESSURE';
    stressLevel = 'HIGH';
    warnings.push(`High expense ratio: Spending consumes ${(expenseRatio * 100).toFixed(1)}% of your monthly income (recommended < 80%).`);
    actionableSteps.push('Build a ₹5,000 to ₹10,000 monthly buffer by reducing non-essential category spending.');
  } else if (expenseRatio > ADVISORY_RULES.EXPENSE_RATIO_MODERATE) {
    budgetHealthStatus = 'MODERATE';
    stressLevel = 'MODERATE';
    findings.push(`Balanced cash flow: You retain ${(savingsRate * 100).toFixed(1)}% of income (₹${netCashFlow.toLocaleString('en-IN')}) for savings.`);
  } else {
    budgetHealthStatus = 'STRONG';
    stressLevel = 'LOW';
    findings.push(`Excellent cash flow surplus: You retain ${(savingsRate * 100).toFixed(1)}% of income (₹${netCashFlow.toLocaleString('en-IN')}).`);
  }

  // Emergency Fund Findings
  if (emergencyCoverageMonths < ADVISORY_RULES.EMERGENCY_FUND_MIN_MONTHS) {
    warnings.push(`Inadequate emergency cushion: Current savings cover only ${emergencyCoverageMonths} months of essential expenses (Target: 3-6 months, ₹${(monthlyBurn * 6).toLocaleString('en-IN')}).`);
    actionableSteps.push(`Prioritize building a 3-month emergency buffer (₹${(monthlyBurn * 3).toLocaleString('en-IN')}) in a liquid savings account or sweep-in FD.`);
  } else if (emergencyCoverageMonths < ADVISORY_RULES.EMERGENCY_FUND_TARGET_MONTHS) {
    findings.push(`Acceptable emergency buffer: ${emergencyCoverageMonths} months covered. Consider extending to 6 months (₹${emergencyShortfall.toLocaleString('en-IN')} remaining).`);
    actionableSteps.push('Gradually top up your liquid emergency reserve using 30% of your monthly surplus.');
  } else {
    findings.push(`Robust emergency buffer: Current liquid savings cover ${emergencyCoverageMonths} months of essential expenditure.`);
    actionableSteps.push('Emergency reserve is fully funded. Surplus cash flow can now be directed to goal-based SIPs or debt reduction.');
  }

  // 50/30/20 Rule Deviations
  if (needsDifference > 0) {
    findings.push(`Needs consumption is ₹${needsDifference.toLocaleString('en-IN')} above standard 50% benchmark (representing ${(essentialRatio * 100).toFixed(1)}% of income).`);
  }
  if (wantsDifference > 0) {
    warnings.push(`Discretionary spending is ₹${wantsDifference.toLocaleString('en-IN')} higher than recommended 30% limit.`);
    actionableSteps.push('Cap lifestyle and non-essential weekend expenses to bring wants under 30%.');
  }

  return {
    success: true,
    currency: 'INR',
    metrics: {
      monthly_income: income,
      monthly_expenses: expenses,
      essential_expenses: essentials,
      discretionary_expenses: discretionary,
      net_cash_flow: netCashFlow,
      current_savings: savings,
      savings_rate: savingsRate,
      expense_ratio: expenseRatio,
      essential_ratio: essentialRatio,
      discretionary_ratio: discretionaryRatio,
      emergency_coverage_months: emergencyCoverageMonths,
      target_emergency_fund: monthlyBurn * ADVISORY_RULES.EMERGENCY_FUND_TARGET_MONTHS,
      emergency_shortfall: emergencyShortfall,
      rule_50_30_20: {
        actual: {
          needs: essentials,
          wants: discretionary,
          savings: Math.max(0, netCashFlow)
        },
        target: {
          needs: targetNeeds,
          wants: targetWants,
          savings: targetSavings
        },
        ratios: {
          needs_ratio: essentialRatio,
          wants_ratio: discretionaryRatio,
          savings_ratio: savingsRate
        }
      },
      goal_analysis: goal ? {
        savings_goal: goal,
        current_savings: savings,
        remaining_target: Math.max(0, goal - savings),
        estimated_months: goalTimelineMonths,
        feasibility: goalFeasibility
      } : null
    },
    assessment: {
      budget_health_status: budgetHealthStatus,
      stress_level: stressLevel,
      findings,
      warnings,
      actionable_recommendations: actionableSteps
    },
    timestamp: new Date().toISOString()
  };
}
