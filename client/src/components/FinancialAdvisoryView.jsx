import React, { useState } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  PieChart
} from 'lucide-react';
import { calculateAdvisory } from '../services/api';
import { formatINR, formatPercentage } from '../utils/formatters';

const INDIAN_PROFILES = {
  BENGALURU_TECH: {
    label: 'Bengaluru IT Professional (₹1.2L Income)',
    income: 120000,
    expenses: 68000,
    essentials: 42000,
    savings: 320000,
    goal: 1000000,
    categories: { rent: 28000, groceries: 8000, utilities: 4000, dining: 15000, misc: 13000 }
  },
  MUMBAI_HIGH_RENT: {
    label: 'Mumbai High Rent Pressure (₹65k Income)',
    income: 65000,
    expenses: 58000,
    essentials: 48000,
    savings: 40000,
    goal: 300000,
    categories: { rent: 32000, groceries: 10000, utilities: 4000, transport: 5000, misc: 7000 }
  },
  FREELANCER_VARIABLE: {
    label: 'Freelancer / Variable Cash Flow (₹80k Income)',
    income: 80000,
    expenses: 45000,
    essentials: 30000,
    savings: 150000,
    goal: 500000,
    categories: { rent: 18000, groceries: 7000, utilities: 3000, software: 8000, misc: 9000 }
  }
};

export default function FinancialAdvisoryView() {
  const [formData, setFormData] = useState({
    monthly_income: 100000,
    monthly_expenses: 62000,
    essential_expenses: 42000,
    current_savings: 250000,
    savings_goal: 600000
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const applyProfile = (key) => {
    const p = INDIAN_PROFILES[key];
    setFormData({
      monthly_income: p.income,
      monthly_expenses: p.expenses,
      essential_expenses: p.essentials,
      current_savings: p.savings,
      savings_goal: p.goal
    });
    setResult(null);
    setErrorMsg(null);
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await calculateAdvisory(formData);
      if (!resp.success) {
        setErrorMsg(resp.error || 'Advisory calculation failed');
      } else {
        setResult(resp);
      }
    } catch (err) {
      setErrorMsg(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      monthly_income: 0,
      monthly_expenses: 0,
      essential_expenses: 0,
      current_savings: 0,
      savings_goal: 0
    });
    setResult(null);
    setErrorMsg(null);
  };

  const m = result?.metrics;
  const a = result?.assessment;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info"><Calculator size={13} /> Financial Advisory Module</span>
              <span className="badge badge-local">Deterministic Calculator</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Smart Financial Advisory & Cash Flow Analysis
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Analyzes Indian household cash flow, evaluates emergency fund runway, and contrasts against the 50/30/20 benchmark in INR.
            </p>
          </div>

          {/* Preset Profiles */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(INDIAN_PROFILES).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyProfile(key)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                <Sparkles size={12} color="#38bdf8" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Input Form (1 Col) */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            📊 Financial Inputs (₹ INR)
          </h2>

          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Monthly Take-Home Income (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.monthly_income}
                onChange={(e) => setFormData({ ...formData, monthly_income: Number(e.target.value) })}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Monthly Expenses (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.monthly_expenses}
                onChange={(e) => setFormData({ ...formData, monthly_expenses: Number(e.target.value) })}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Essential Living Expenses (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.essential_expenses}
                onChange={(e) => setFormData({ ...formData, essential_expenses: Number(e.target.value) })}
                placeholder="Rent, EMIs, Kirana groceries, Utilities"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Must be ≤ Total Monthly Expenses
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Current Liquid Savings (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.current_savings}
                onChange={(e) => setFormData({ ...formData, current_savings: Number(e.target.value) })}
                placeholder="Savings bank balance, liquid FDs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Optional Savings Goal (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.savings_goal}
                onChange={(e) => setFormData({ ...formData, savings_goal: Number(e.target.value) })}
                placeholder="e.g. 5,00,000 for emergency buffer or downpayment"
              />
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px', color: '#fb7185', fontSize: '0.82rem' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                <Calculator size={16} />
                <span>{loading ? 'Calculating...' : 'Calculate Metrics'}</span>
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                <RefreshCw size={15} />
              </button>
            </div>
          </form>
        </div>

        {/* Visual Summary & Results (2 Cols) */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            📈 Advisory Findings & Budget Visualizer
          </h2>

          {!result ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Calculator size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>Enter your monthly financial figures or click a sample profile above.</p>
              <p style={{ fontSize: '0.85rem' }}>Metrics are computed strictly through deterministic formulas without model hallucinations.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 4 Key Output Cards */}
              <div className="grid-4">
                <div style={{ background: '#0d1322', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET CASH FLOW</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: m.net_cash_flow >= 0 ? '#34d399' : '#fb7185' }}>
                    {formatINR(m.net_cash_flow)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monthly Surplus / Deficit</div>
                </div>

                <div style={{ background: '#0d1322', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAVINGS RATE</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: m.savings_rate >= 0.20 ? '#34d399' : m.savings_rate >= 0.10 ? '#fbbf24' : '#fb7185' }}>
                    {formatPercentage(m.savings_rate)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target: ≥ 20.0%</div>
                </div>

                <div style={{ background: '#0d1322', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPENSE RATIO</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: m.expense_ratio <= 0.80 ? '#34d399' : '#fb7185' }}>
                    {formatPercentage(m.expense_ratio)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Healthy: &lt; 80.0%</div>
                </div>

                <div style={{ background: '#0d1322', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMERGENCY RUNWAY</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: m.emergency_coverage_months >= 3 ? '#34d399' : '#fb7185' }}>
                    {m.emergency_coverage_months} <span style={{ fontSize: '0.85rem' }}>Months</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target: 3 - 6 Months</div>
                </div>
              </div>

              {/* 50/30/20 Budget Breakdown Bar & Comparison */}
              <div style={{ background: '#0d1322', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>50 / 30 / 20 Budgeting Rule Comparison</span>
                  <span className="badge badge-info">Indian Standard Framework</span>
                </div>

                <div style={{ display: 'flex', height: '14px', borderRadius: '9999px', overflow: 'hidden', margin: '12px 0' }}>
                  <div style={{ width: `${Math.min(100, (m.essential_expenses / m.monthly_income) * 100)}%`, background: '#3b82f6' }} title={`Needs: ${formatINR(m.essential_expenses)}`} />
                  <div style={{ width: `${Math.min(100, (m.discretionary_expenses / m.monthly_income) * 100)}%`, background: '#8b5cf6' }} title={`Wants: ${formatINR(m.discretionary_expenses)}`} />
                  <div style={{ width: `${Math.max(0, m.savings_rate * 100)}%`, background: '#10b981' }} title={`Savings: ${formatINR(m.net_cash_flow)}`} />
                </div>

                <div className="grid-3" style={{ fontSize: '0.82rem', marginTop: '10px' }}>
                  <div>
                    <div style={{ color: '#60a5fa', fontWeight: 600 }}>Needs (Essentials): {formatINR(m.essential_expenses)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Target (50%): {formatINR(m.rule_50_30_20.target.needs)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#a78bfa', fontWeight: 600 }}>Wants (Discretionary): {formatINR(m.discretionary_expenses)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Target (30%): {formatINR(m.rule_50_30_20.target.wants)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#34d399', fontWeight: 600 }}>Savings Surplus: {formatINR(m.net_cash_flow)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Target (20%): {formatINR(m.rule_50_30_20.target.savings)}</div>
                  </div>
                </div>
              </div>

              {/* Goal Feasibility */}
              {m.goal_analysis && (
                <div style={{ background: '#0d1322', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: '6px' }}>
                    🎯 Savings Goal Trajectory ({formatINR(m.goal_analysis.savings_goal)})
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Remaining Shortfall: <strong style={{ color: '#fff' }}>{formatINR(m.goal_analysis.remaining_target)}</strong> • Estimated Timeline: <strong style={{ color: '#38bdf8' }}>{m.goal_analysis.estimated_months ? `${m.goal_analysis.estimated_months} Months` : 'Unachievable at current negative cash flow'}</strong>
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              {a?.actionable_recommendations?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    💡 ACTIONABLE BUDGET RECOMMENDATIONS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {a.actionable_recommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#0d1322', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid var(--border-color)' }}>
                        <CheckCircle2 size={15} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                ⚠️ <strong>Educational Prototype Notice:</strong> {result.disclaimer || 'Calculations are deterministic educational simulations and not SEBI-registered advisory.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
