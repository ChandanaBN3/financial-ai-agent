import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info,
  PhoneCall,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { evaluateFraud } from '../services/api';
import { formatINR } from '../utils/formatters';

export default function FraudDetectionView({ onTransactionSaved }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    amount: '18500',
    historical_average: '3000',
    velocity_1h: '6',
    is_unfamiliar: true,
    merchant_name: 'Quick Transfer'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sample presets for quick testing
  const PRESETS = [
    {
      name: t('presetNormal'),
      amount: '340',
      usual: '450',
      velocity: '1',
      unfamiliar: false,
      merchant: 'Food Delivery'
    },
    {
      name: t('presetSuspicious'),
      amount: '18500',
      usual: '3000',
      velocity: '6',
      unfamiliar: true,
      merchant: 'New Online Contact'
    },
    {
      name: t('presetHighRisk'),
      amount: '92000',
      usual: '4000',
      velocity: '10',
      unfamiliar: true,
      merchant: 'Urgent Wire Transfer'
    }
  ];

  const applyPreset = (preset) => {
    setFormData({
      amount: preset.amount,
      historical_average: preset.usual,
      velocity_1h: preset.velocity,
      is_unfamiliar: preset.unfamiliar,
      merchant_name: preset.merchant
    });
    setResult(null);
    setErrorMsg(null);
  };

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const amount = Number(formData.amount);
    const usual = Number(formData.historical_average || 0);
    const velocity = Number(formData.velocity_1h || 1);

    if (isNaN(amount) || amount < 0) {
      setErrorMsg(t('validationNonNegative'));
      return;
    }

    if (isNaN(usual) || usual < 0) {
      setErrorMsg(t('validationNonNegative'));
      return;
    }

    setLoading(true);

    try {
      // Map to existing backend schema: velocity_24h accepts hourly velocity
      const resp = await evaluateFraud({
        amount,
        historical_average: usual > 0 ? usual : amount,
        velocity_24h: velocity,
        is_unfamiliar_merchant: formData.is_unfamiliar,
        merchant_name: formData.merchant_name || 'Payment Recipient',
        payment_method: 'UPI',
        category: 'General',
        persist: true
      });

      if (!resp.success) {
        setErrorMsg(resp.error || t('error'));
      } else {
        setResult(resp);
        if (onTransactionSaved) onTransactionSaved();
      }
    } catch (err) {
      // Local fallback calculation if backend has network interruption
      let score = 0;
      const triggered = [];
      const mult = usual > 0 ? amount / usual : 1;

      if (amount > 0 && mult >= 5) {
        score += 35;
        triggered.push({ rule: 'AMOUNT_SPIKE', description: `Amount is ${mult.toFixed(1)}x higher than usual` });
      }
      if (formData.is_unfamiliar) {
        score += 30;
        triggered.push({ rule: 'UNFAMILIAR_RECIPIENT', description: 'Unfamiliar recipient or UPI ID' });
      }
      if (velocity >= 5) {
        score += 25;
        triggered.push({ rule: 'VELOCITY_BURST', description: `Multiple payments (${velocity}) in short time` });
      }

      const riskLevel = score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';

      setResult({
        success: true,
        risk_score: score,
        risk_level: riskLevel,
        triggered_rules: triggered,
        explanation: riskLevel === 'HIGH' 
          ? 'Multiple high-risk indicators detected including unfamiliar recipient and high volume.'
          : riskLevel === 'MEDIUM' 
            ? 'Moderate risk factors detected. Caution advised.'
            : 'Payment parameters are consistent with standard low-risk transactions.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      amount: '',
      historical_average: '',
      velocity_1h: '1',
      is_unfamiliar: false,
      merchant_name: ''
    });
    setResult(null);
    setErrorMsg(null);
  };

  const riskLevel = result?.risk_level || 'LOW';
  const riskScore = result?.risk_score ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Introduction */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-medium">
            <ShieldAlert size={13} style={{ marginRight: '4px' }} />
            {t('navCheckPayment')}
          </span>
          <span className="badge badge-low">
            <ShieldCheck size={13} style={{ marginRight: '4px' }} />
            {t('agentFraudTitle')}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          {t('fraudTitle')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
          {t('fraudSubtitle')}
        </p>
      </div>

      {/* Main Grid: Form on left, Results on right */}
      <div className="grid-2">
        {/* Transaction Input Form */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              🛡️ {t('fraudTitle')}
            </h2>
            <button 
              type="button" 
              onClick={handleReset} 
              className="btn btn-secondary btn-sm"
              title="Reset"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <form onSubmit={handleEvaluate}>
            {/* Field 1: Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx_amount">
                {t('fieldAmountLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  id="tx_amount"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <span className="form-helper">{t('fieldAmountHelper')}</span>
            </div>

            {/* Field 2: Usual Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx_usual">
                {t('fieldUsualLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  id="tx_usual"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '28px' }}
                  value={formData.historical_average}
                  onChange={(e) => setFormData({ ...formData, historical_average: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="e.g. 1000"
                  required
                />
              </div>
              <span className="form-helper">{t('fieldUsualHelper')}</span>
            </div>

            {/* Field 3: Velocity in last hour */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx_velocity">
                {t('fieldVelocityLabel')}
              </label>
              <select
                id="tx_velocity"
                className="form-select"
                value={formData.velocity_1h}
                onChange={(e) => setFormData({ ...formData, velocity_1h: e.target.value })}
              >
                <option value="1">1 (Just this payment)</option>
                <option value="2">2 payments</option>
                <option value="3">3 payments</option>
                <option value="5">5 payments</option>
                <option value="8">8 or more (unusually frequent)</option>
              </select>
              <span className="form-helper">{t('fieldVelocityHelper')}</span>
            </div>

            {/* Field 4: Unfamiliar recipient? */}
            <div className="form-group">
              <label className="form-label">
                {t('fieldUnfamiliarLabel')}
              </label>
              <div className="radio-group">
                <button
                  type="button"
                  className={`radio-pill ${formData.is_unfamiliar ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, is_unfamiliar: true })}
                >
                  <AlertTriangle size={15} color={formData.is_unfamiliar ? '#d97706' : '#64748b'} />
                  <span>{t('yes')}</span>
                </button>

                <button
                  type="button"
                  className={`radio-pill ${!formData.is_unfamiliar ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, is_unfamiliar: false })}
                >
                  <CheckCircle2 size={15} color={!formData.is_unfamiliar ? '#059669' : '#64748b'} />
                  <span>{t('no')}</span>
                </button>
              </div>
              <span className="form-helper">{t('fieldUnfamiliarHelper')}</span>
            </div>

            {/* Field 5 (Optional): Merchant / UPI handle */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx_merchant">
                {t('fieldMerchantLabel')}
              </label>
              <input
                id="tx_merchant"
                type="text"
                className="form-input"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                placeholder="e.g. Ramesh / Grocery Store / paytmqr@paytm"
              />
              <span className="form-helper">{t('fieldMerchantHelper')}</span>
            </div>

            {errorMsg && (
              <div className="alert-box alert-error" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary btn-block"
              style={{ marginTop: '8px' }}
            >
              <ShieldAlert size={17} />
              <span>{loading ? t('btnChecking') : t('btnCheckRisk')}</span>
            </button>
          </form>

          {/* Preset Buttons for Quick Testing */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
              {t('presetTxTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.8rem', textAlign: 'left' }}
                >
                  <Sparkles size={12} color="#d97706" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Results */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            🔍 {t('riskResultTitle')}
          </h2>

          {!result ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <ShieldAlert size={44} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#d97706' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                {t('fraudSubtitle')}
              </p>
              <p style={{ fontSize: '0.86rem', marginTop: '6px' }}>
                Fill in the payment details on the left and tap "{t('btnCheckRisk')}".
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Risk Level Banner */}
              <div style={{
                background: riskLevel === 'HIGH' ? '#fef2f2' : riskLevel === 'MEDIUM' ? '#fffbeb' : '#f0fdf4',
                border: `1.5px solid ${riskLevel === 'HIGH' ? '#fecaca' : riskLevel === 'MEDIUM' ? '#fde68a' : '#bbf7d0'}`,
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: riskLevel === 'HIGH' ? '#fee2e2' : riskLevel === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: riskLevel === 'HIGH' ? '#dc2626' : riskLevel === 'MEDIUM' ? '#d97706' : '#16a34a',
                    fontWeight: 800,
                    fontSize: '1.25rem'
                  }}>
                    {riskScore}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${riskLevel === 'HIGH' ? 'badge-high' : riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {riskLevel === 'HIGH' ? t('riskHigh') : riskLevel === 'MEDIUM' ? t('riskMedium') : t('riskLow')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      Payment of {formatINR(formData.amount)}
                    </div>
                  </div>
                </div>

                {result.saved_record && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                    <Database size={13} />
                    <span>Saved to history</span>
                  </div>
                )}
              </div>

              {/* Factors influencing the result */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '10px' }}>
                  {t('reasonsTitle')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#334155' }}>
                  {/* Spike check */}
                  {Number(formData.historical_average) > 0 && Number(formData.amount) >= Number(formData.historical_average) * 3 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('reasonSpike', { multiplier: (Number(formData.amount) / Number(formData.historical_average)).toFixed(1), usual: formatINR(formData.historical_average) })}</span>
                    </div>
                  )}

                  {/* Velocity check */}
                  {Number(formData.velocity_1h) >= 5 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('reasonVelocity', { count: formData.velocity_1h })}</span>
                    </div>
                  )}

                  {/* Unfamiliar recipient */}
                  {formData.is_unfamiliar && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('reasonUnfamiliar')}</span>
                    </div>
                  )}

                  {/* Normal payment */}
                  {riskLevel === 'LOW' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t('reasonNormal')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Next Step */}
              <div style={{
                background: riskLevel === 'HIGH' ? '#fff1f2' : riskLevel === 'MEDIUM' ? '#fffbeb' : '#eff6ff',
                border: `1px solid ${riskLevel === 'HIGH' ? '#fecdd3' : riskLevel === 'MEDIUM' ? '#fde68a' : '#bfdbfe'}`,
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: riskLevel === 'HIGH' ? '#be123c' : riskLevel === 'MEDIUM' ? '#b45309' : '#1d4ed8',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {riskLevel === 'HIGH' ? <PhoneCall size={16} /> : <CheckCircle2 size={16} />}
                  <span>{t('nextStepTitle')}</span>
                </div>

                <p style={{
                  fontSize: '0.86rem',
                  color: riskLevel === 'HIGH' ? '#9f1239' : riskLevel === 'MEDIUM' ? '#92400e' : '#1e40af',
                  lineHeight: 1.5
                }}>
                  {riskLevel === 'HIGH' 
                    ? t('nextStepHigh')
                    : riskLevel === 'MEDIUM'
                      ? t('nextStepMedium')
                      : t('nextStepLow')}
                </p>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                {t('disclaimerFraud')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
