import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { calculateAdvisory } from '../services/api';
import { formatINR } from '../utils/formatters';

export default function FinancialAdvisoryView() {
  const { t } = useLanguage();

  // Form inputs state
  const [formData, setFormData] = useState({
    monthly_income: '30000',
    monthly_expenses: '22000',
    current_savings: '15000',
    essential_expenses: '14000'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sample beginner-friendly profiles for testing
  const SAMPLE_PROFILES = [
    {
      name: t('profileBangalore'),
      income: '100000',
      expenses: '65000',
      savings: '200000',
      essentials: '40000'
    },
    {
      name: t('profileMumbai'),
      income: '65000',
      expenses: '58000',
      savings: '35000',
      essentials: '45000'
    },
    {
      name: t('profileFreelancer'),
      income: '80000',
      expenses: '45000',
      savings: '120000',
      essentials: '30000'
    }
  ];

  const applySample = (profile) => {
    setFormData({
      monthly_income: profile.income,
      monthly_expenses: profile.expenses,
      current_savings: profile.savings,
      essential_expenses: profile.essentials
    });
    setResult(null);
    setValidationError(null);
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    // Only allow positive digits
    const cleaned = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [field]: cleaned }));
    if (validationError) setValidationError(null);
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const income = Number(formData.monthly_income);
    const expenses = Number(formData.monthly_expenses);
    const savings = Number(formData.current_savings || 0);
    const essentials = Number(formData.essential_expenses || 0);

    // Validation
    if (!formData.monthly_income || isNaN(income) || income <= 0) {
      setValidationError(t('incomeValidationNote'));
      return;
    }

    if (formData.monthly_expenses === '' || isNaN(expenses) || expenses < 0) {
      setValidationError(t('expensesValidationNote'));
      return;
    }

    if (isNaN(savings) || savings < 0) {
      setValidationError(t('savingsValidationNote'));
      return;
    }

    if (essentials > expenses) {
      setValidationError(t('essentialsValidationNote'));
      return;
    }

    setLoading(true);

    try {
      // Call existing backend calculator
      const resp = await calculateAdvisory({
        monthly_income: income,
        monthly_expenses: expenses,
        essential_expenses: essentials,
        current_savings: savings
      });

      if (!resp.success) {
        setValidationError(resp.error || t('error'));
      } else {
        setResult(resp);
        setIsEditing(false);
      }
    } catch (err) {
      // Local fallback calculation if backend has network glitch
      const netLeftover = income - expenses;
      const pctSpent = income > 0 ? (expenses / income) * 100 : 0;
      const runwayMonths = essentials > 0 ? (savings / essentials).toFixed(1) : (expenses > 0 ? (savings / expenses).toFixed(1) : 0);
      
      setResult({
        success: true,
        metrics: {
          monthly_income: income,
          monthly_expenses: expenses,
          essential_expenses: essentials,
          current_savings: savings,
          net_cash_flow: netLeftover,
          expense_ratio: pctSpent / 100,
          savings_rate: netLeftover > 0 ? netLeftover / income : 0,
          emergency_coverage_months: Number(runwayMonths)
        }
      });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      monthly_income: '',
      monthly_expenses: '',
      current_savings: '',
      essential_expenses: ''
    });
    setResult(null);
    setValidationError(null);
    setIsEditing(true);
  };

  // Metrics from results
  const m = result?.metrics;
  const netLeftover = m ? m.net_cash_flow : 0;
  const pctSpent = m ? Math.round((m.monthly_expenses / (m.monthly_income || 1)) * 100) : 0;
  const runway = m ? m.emergency_coverage_months : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Introduction */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-info">
            <Calculator size={13} style={{ marginRight: '4px' }} />
            {t('navFinances')}
          </span>
          <span className="badge badge-low">
            <ShieldCheck size={13} style={{ marginRight: '4px' }} />
            {t('agentAdvTitle')}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          {t('finTitle')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
          {t('finSubtitle')}
        </p>
      </div>

      {/* Main Grid: Form on left, Results on right */}
      <div className="grid-2">
        {/* Guided Form */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              📝 {t('finTitle')}
            </h2>
            {result && !isEditing && (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={14} />
                <span>{t('btnEdit')}</span>
              </button>
            )}
          </div>

          <form onSubmit={handleCalculate}>
            {/* Field 1: Income */}
            <div className="form-group">
              <label className="form-label" htmlFor="fin_income">
                {t('formIncomeLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  id="fin_income"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={formData.monthly_income}
                  onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                  placeholder="e.g. 30000"
                  required
                />
              </div>
              <span className="form-helper">{t('formIncomeHelper')}</span>
            </div>

            {/* Field 2: Total Expenses */}
            <div className="form-group">
              <label className="form-label" htmlFor="fin_expenses">
                {t('formExpensesLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  id="fin_expenses"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={formData.monthly_expenses}
                  onChange={(e) => handleInputChange('monthly_expenses', e.target.value)}
                  placeholder="e.g. 22000"
                  required
                />
              </div>
              <span className="form-helper">{t('formExpensesHelper')}</span>
            </div>

            {/* Field 3: Current Savings */}
            <div className="form-group">
              <label className="form-label" htmlFor="fin_savings">
                {t('formSavingsLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  id="fin_savings"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={formData.current_savings}
                  onChange={(e) => handleInputChange('current_savings', e.target.value)}
                  placeholder="e.g. 15000 (enter 0 if none)"
                />
              </div>
              <span className="form-helper">{t('formSavingsHelper')}</span>
            </div>

            {/* Field 4: Essential Needs */}
            <div className="form-group">
              <label className="form-label" htmlFor="fin_essentials">
                {t('formEssentialsLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  id="fin_essentials"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={formData.essential_expenses}
                  onChange={(e) => handleInputChange('essential_expenses', e.target.value)}
                  placeholder="e.g. 14000"
                />
              </div>
              <span className="form-helper">{t('formEssentialsHelper')}</span>
            </div>

            {/* Validation Warning */}
            {validationError && (
              <div className="alert-box alert-error" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button 
                type="submit" 
                disabled={loading} 
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <Calculator size={16} />
                <span>{loading ? t('btnCalculating') : t('btnCalculate')}</span>
              </button>
              
              <button 
                type="button" 
                onClick={handleReset} 
                className="btn btn-secondary"
                title={t('btnReset')}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </form>

          {/* Sample quick presets */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
              {t('sampleProfilesTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SAMPLE_PROFILES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applySample(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.8rem', textAlign: 'left' }}
                >
                  <Sparkles size={12} color="#2563eb" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Results Summary */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            📊 {t('summaryTitle')}
          </h2>

          {!result ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Calculator size={44} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#2563eb' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                {t('finSubtitle')}
              </p>
              <p style={{ fontSize: '0.86rem', marginTop: '6px' }}>
                Enter your monthly numbers on the left and tap "{t('btnCalculate')}".
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* 4 Core User Metrics */}
              <div className="grid-2">
                {/* Metric 1: Income */}
                <div className="metric-box">
                  <div className="metric-title">{t('metricIncome')}</div>
                  <div className="metric-value">{formatINR(m.monthly_income)}</div>
                  <div className="metric-sub">Received every month</div>
                </div>

                {/* Metric 2: Expenses */}
                <div className="metric-box">
                  <div className="metric-title">{t('metricExpenses')}</div>
                  <div className="metric-value">{formatINR(m.monthly_expenses)}</div>
                  <div className="metric-sub">Total monthly outgoings</div>
                </div>

                {/* Metric 3: Money Left Over */}
                <div className="metric-box" style={{ background: netLeftover >= 0 ? '#f0fdf4' : '#fef2f2', borderColor: netLeftover >= 0 ? '#bbf7d0' : '#fecaca' }}>
                  <div className="metric-title">{t('metricLeftover')}</div>
                  <div className={`metric-value ${netLeftover >= 0 ? 'positive' : 'negative'}`}>
                    {netLeftover >= 0 ? `+${formatINR(netLeftover)}` : `-${formatINR(Math.abs(netLeftover))}`}
                  </div>
                  <div className="metric-sub">
                    {netLeftover >= 0 ? 'Monthly surplus available' : 'Monthly deficit'}
                  </div>
                </div>

                {/* Metric 4: Spending % */}
                <div className="metric-box">
                  <div className="metric-title">{t('metricSpendRate')}</div>
                  <div className="metric-value" style={{ color: pctSpent <= 80 ? '#059669' : '#d97706' }}>
                    {pctSpent}%
                  </div>
                  <div className="metric-sub">
                    {pctSpent <= 80 ? 'Within healthy bounds (≤ 80%)' : 'High spending ratio (> 80%)'}
                  </div>
                </div>
              </div>

              {/* Savings Cushion (Runway) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    🛡️ {t('metricRunway')}
                  </span>
                  <span className={`badge ${runway >= 3 ? 'badge-low' : 'badge-medium'}`}>
                    {runway} {t('runwayMonths')}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>
                  At your current basic necessities of {formatINR(m.essential_expenses || m.monthly_expenses)}, your existing savings of {formatINR(m.current_savings)} would cover approximately <strong>{runway} months</strong> if income paused.
                </p>
              </div>

              {/* 2 to 3 Actionable Practical Suggestions */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} />
                  <span>{t('suggestionsTitle')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#1e3a8a' }}>
                  {/* Suggestion 1: Cash flow */}
                  {netLeftover > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('suggestionSurplus', { amount: formatINR(netLeftover) })}</span>
                    </div>
                  ) : netLeftover < 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('suggestionDeficit', { amount: formatINR(Math.abs(netLeftover)) })}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('suggestionTight')}</span>
                    </div>
                  )}

                  {/* Suggestion 2: Runway */}
                  {runway >= 3 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('suggestionRunwayGood', { months: runway })}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('suggestionRunwayLow')}</span>
                    </div>
                  )}

                  {/* Suggestion 3: Essentials ratio */}
                  {m.essential_expenses && m.monthly_income > 0 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('suggestionNeedsHigh', { pct: Math.round((m.essential_expenses / m.monthly_income) * 100) })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                {t('disclaimerFin')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
