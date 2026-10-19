import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Database,
  ArrowRight,
  Info
} from 'lucide-react';
import { evaluateFraud } from '../services/api';
import { formatINR, formatTimestampIST } from '../utils/formatters';

const PRESET_TX_SCENARIOS = {
  NORMAL: {
    label: 'Normal Swiggy Delivery (₹340)',
    amount: 340,
    historical_average: 450,
    velocity_24h: 2,
    merchant_name: 'Swiggy / Bundl Technologies',
    category: 'Food & Dining',
    payment_method: 'UPI',
    timestamp: '2026-10-19T13:30:00.000Z',
    is_unfamiliar_merchant: false,
    is_unfamiliar_device: false,
    location_mismatch: false
  },
  SUSPICIOUS: {
    label: 'Suspicious Spike + New Merchant (₹18,500)',
    amount: 18500,
    historical_average: 3200,
    velocity_24h: 7,
    merchant_name: 'QuickDigital Gadgets Mumbai',
    category: 'Electronics',
    payment_method: 'UPI',
    timestamp: '2026-10-19T15:45:00.000Z',
    is_unfamiliar_merchant: true,
    is_unfamiliar_device: false,
    location_mismatch: false
  },
  CRITICAL: {
    label: 'Critical 3 AM P2P Crypto (₹92,000)',
    amount: 92000,
    historical_average: 4000,
    velocity_24h: 12,
    merchant_name: 'GlobalCrypto P2P Gateway',
    category: 'Virtual Assets / P2P',
    payment_method: 'IMPS',
    timestamp: '2026-10-19T03:18:00.000Z', // 3:18 AM IST
    is_unfamiliar_merchant: true,
    is_unfamiliar_device: true,
    location_mismatch: true
  },
  PROBE: {
    label: 'Zero Rupee Probing Attack (₹0)',
    amount: 0,
    historical_average: 2000,
    velocity_24h: 3,
    merchant_name: 'Automated Gateway Probe',
    category: 'General',
    payment_method: 'UPI',
    timestamp: '2026-10-19T10:00:00.000Z',
    is_unfamiliar_merchant: true,
    is_unfamiliar_device: false,
    location_mismatch: false
  }
};

export default function FraudDetectionView({ onTransactionSaved }) {
  const [formData, setFormData] = useState({
    amount: 18500,
    historical_average: 3200,
    velocity_24h: 7,
    merchant_name: 'QuickDigital Gadgets Mumbai',
    category: 'Electronics',
    payment_method: 'UPI',
    timestamp: new Date().toISOString(),
    is_unfamiliar_merchant: true,
    is_unfamiliar_device: false,
    location_mismatch: false
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const applyPreset = (key) => {
    const s = PRESET_TX_SCENARIOS[key];
    setFormData({ ...s });
    setResult(null);
    setErrorMsg(null);
  };

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await evaluateFraud({
        ...formData,
        persist: true
      });

      if (!resp.success) {
        setErrorMsg(resp.error || 'Fraud evaluation failed');
      } else {
        setResult(resp);
        if (onTransactionSaved) onTransactionSaved();
      }
    } catch (err) {
      setErrorMsg(`Evaluation exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-medium"><ShieldAlert size={13} /> Fraud Detection Engine</span>
              <span className="badge badge-local">Deterministic Rule Heuristics</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Transaction Risk Scoring & Rule Inspector
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Evaluates transaction amount anomalies, velocity spikes, odd-hour timing (IST), and unfamiliar recipient patterns.
            </p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(PRESET_TX_SCENARIOS).map(([key, s]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                <Sparkles size={12} color="#fbbf24" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Form Column */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            🔍 Transaction Signals
          </h2>

          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Transaction Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Historical Average Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.historical_average}
                onChange={(e) => setFormData({ ...formData, historical_average: Number(e.target.value) })}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Merchant Name / UPI ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Merchant Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Groceries">Groceries</option>
                <option value="Electronics">Electronics</option>
                <option value="Fuel & Transport">Fuel & Transport</option>
                <option value="Housing & Utilities">Housing & Utilities</option>
                <option value="Virtual Assets / P2P">Virtual Assets / P2P (Monitored)</option>
                <option value="Gambling / Casino">Gambling / Offshore Betting (Monitored)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">24h Velocity (Transactions in past 24h)</label>
              <input
                type="number"
                className="form-input"
                value={formData.velocity_24h}
                onChange={(e) => setFormData({ ...formData, velocity_24h: Number(e.target.value) })}
                min="1"
              />
            </div>

            {/* Checkbox toggles for anomaly signals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_unfamiliar_merchant}
                  onChange={(e) => setFormData({ ...formData, is_unfamiliar_merchant: e.target.checked })}
                />
                <span>Unfamiliar / First-Time Merchant</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_unfamiliar_device}
                  onChange={(e) => setFormData({ ...formData, is_unfamiliar_device: e.target.checked })}
                />
                <span>Unrecognized Device / IP Fingerprint</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.location_mismatch}
                  onChange={(e) => setFormData({ ...formData, location_mismatch: e.target.checked })}
                />
                <span>Rapid Geographic Location Mismatch</span>
              </label>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px', color: '#fb7185', fontSize: '0.82rem' }}>
                {errorMsg}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '8px' }}>
              <ShieldAlert size={16} />
              <span>{loading ? 'Evaluating Risk...' : 'Evaluate & Persist Transaction'}</span>
            </button>
          </form>
        </div>

        {/* Results & Rule Inspector (2 Cols) */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            🛡️ Risk Score & Rule Trigger Breakdown
          </h2>

          {!result ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ShieldAlert size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>Configure transaction parameters or select a preset scenario.</p>
              <p style={{ fontSize: '0.85rem' }}>Evaluates deterministic rules and automatically persists records to the SQLite database.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score Gauge & Status */}
              <div style={{
                background: '#0d1322',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: result.risk_level === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : result.risk_level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    color: result.risk_level === 'HIGH' ? '#fb7185' : result.risk_level === 'MEDIUM' ? '#fbbf24' : '#34d399',
                    border: `2px solid ${result.risk_level === 'HIGH' ? '#fb7185' : result.risk_level === 'MEDIUM' ? '#fbbf24' : '#34d399'}`
                  }}>
                    {result.risk_score}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${result.risk_level === 'HIGH' ? 'badge-high' : result.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {result.risk_level} RISK
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score Range: 0 - 100</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                      Recommended Action: <code style={{ color: '#38bdf8' }}>{result.recommended_action}</code>
                    </div>
                  </div>
                </div>

                {result.saved_record && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Database size={16} color="#34d399" />
                    <span style={{ fontSize: '0.78rem', color: '#34d399' }}>
                      Persisted as <strong>{result.saved_record.transaction_id}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Rationale explanation */}
              <div style={{ background: '#0d1322', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.88rem', color: '#cbd5e1' }}>
                <strong>Assessment Rationale:</strong> {result.explanation}
              </div>

              {/* Triggered Rules List */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
                  ⚡ TRIGGERED HEURISTIC RULES ({result.triggered_rules.length})
                </div>

                {result.triggered_rules.length === 0 ? (
                  <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', color: '#34d399', fontSize: '0.84rem' }}>
                    ✅ No anomalous signals triggered. Transaction matches expected spending pattern.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.triggered_rules.map((rule, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#0d1322',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          borderLeft: '4px solid #f59e0b'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <strong style={{ color: '#fff', fontSize: '0.86rem' }}>{rule.rule}</strong>
                            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.78rem' }}>+{rule.points} pts</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rule.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* False Positive / Negative Educational Notes */}
              {result.educational_note && (
                <div className="grid-2" style={{ fontSize: '0.8rem' }}>
                  <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>False Positive Trade-off</div>
                    <div style={{ color: 'var(--text-muted)' }}>{result.educational_note.false_positive_risk}</div>
                  </div>
                  <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>False Negative Trade-off</div>
                    <div style={{ color: 'var(--text-muted)' }}>{result.educational_note.false_negative_risk}</div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                ⚠️ <strong>Demonstration Disclaimer:</strong> {result.disclaimer || 'Rule-based scores are heuristic indicators for college viva evaluation and not production bank fraud detectors.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
