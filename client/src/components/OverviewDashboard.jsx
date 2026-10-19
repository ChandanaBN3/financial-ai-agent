import React from 'react';
import { 
  Bot, 
  TrendingUp, 
  ShieldAlert, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { formatINR, formatIndianDenomination, formatTimestampIST } from '../utils/formatters';

export default function OverviewDashboard({ summary, onSelectScenario, setActiveTab }) {
  const metrics = summary?.metrics || {
    total_transactions_analyzed: 0,
    total_volume_inr: 0,
    average_risk_score: 0,
    risk_breakdown: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    recent_agent_runs_count: 0
  };

  const agentSystem = summary?.agent_system || {
    active_mode: 'LOCAL',
    active_agents_count: 5,
    registered_tools_count: 6
  };

  const recentTxs = summary?.recent_transactions || [];
  const recentRuns = summary?.recent_runs || [];

  const totalRiskCount = (metrics.risk_breakdown.LOW || 0) + (metrics.risk_breakdown.MEDIUM || 0) + (metrics.risk_breakdown.HIGH || 0) || 1;
  const lowPct = Math.round(((metrics.risk_breakdown.LOW || 0) / totalRiskCount) * 100);
  const medPct = Math.round(((metrics.risk_breakdown.MEDIUM || 0) / totalRiskCount) * 100);
  const highPct = Math.round(((metrics.risk_breakdown.HIGH || 0) / totalRiskCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        borderColor: 'rgba(14, 165, 233, 0.3)',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-info"><Sparkles size={12} /> Design Project 1 • Review-2</span>
              <span className="badge badge-local"><Cpu size={12} /> Autonomous Multi-Agent Core</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              418 – Agentic AI-Based Smart Financial Advisory & Fraud Detection
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: '1.6' }}>
              A real multi-agent orchestration architecture tailored for the Indian financial ecosystem. Coordinated by a supervisor agent across deterministic financial planning, transparent heuristic fraud scoring, and grounded explainability.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setActiveTab('agent-center')}
              className="btn btn-primary"
              style={{ padding: '12px 20px' }}
            >
              <Bot size={18} />
              <span>Launch AI Agent Center</span>
            </button>
            <button 
              onClick={() => setActiveTab('architecture')}
              className="btn btn-secondary"
              style={{ padding: '12px 18px' }}
            >
              <span>Viva Guide & Specs</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(14, 165, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRANSACTIONS MONITORED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {metrics.total_transactions_analyzed}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>SQLite Persistent Storage</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399'
          }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL VOLUME EVALUATED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {formatIndianDenomination(metrics.total_volume_inr)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{formatINR(metrics.total_volume_inr)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE RISK SCORE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {metrics.average_risk_score} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Deterministic Rule Engine</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AGENTIC SYSTEM</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {agentSystem.active_agents_count} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agents</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>{agentSystem.registered_tools_count} Registered Tools</div>
          </div>
        </div>
      </div>

      {/* Demonstration Scenarios Quick Launcher */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              🎯 Review-2 Demonstration Workflows (5 End-to-End Scenarios)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Click any verified scenario to load inputs and inspect real agent trace execution.
            </p>
          </div>
          <span className="badge badge-info">Real Multi-Agent Workflows</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div 
            onClick={() => onSelectScenario('SCENARIO_1')}
            style={{
              background: '#0d1322',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="scenario-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-info">Scenario 1</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Advisory</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Monthly Financial Advisory
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              "Analyse my monthly finances and suggest how I can save more."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
              <span>Run Scenario</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div 
            onClick={() => onSelectScenario('SCENARIO_2')}
            style={{
              background: '#0d1322',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="scenario-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-medium">Scenario 2</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fraud Risk</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Transaction Risk Scoring
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              "Check whether this transaction looks suspicious (₹18,500 new merchant)."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
              <span>Run Scenario</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div 
            onClick={() => onSelectScenario('SCENARIO_3')}
            style={{
              background: '#0d1322',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="scenario-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-high">Scenario 3</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Multi-Agent</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Combined Financial Health
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              "Review my finances and analyse risk exposure on recent transactions."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fb7185', fontWeight: 600 }}>
              <span>Run Scenario</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div 
            onClick={() => onSelectScenario('SCENARIO_4')}
            style={{
              background: '#0d1322',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="scenario-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-low">Scenario 4</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Knowledge</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Financial Education
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              "What is the 50/30/20 budgeting rule and emergency fund guideline?"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
              <span>Run Scenario</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div 
            onClick={() => onSelectScenario('SCENARIO_5')}
            style={{
              background: '#0d1322',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="scenario-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-high">Scenario 5</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verification</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Truthful Tool Failure
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Simulates upstream service timeout; verifies truthful error status & trace.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#f43f5e', fontWeight: 600 }}>
              <span>Run Scenario</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Risk Distribution + Recent Agent Runs */}
      <div className="grid-2">
        {/* Risk Distribution Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              🛡️ Transaction Risk Distribution
            </h2>
            <button onClick={() => setActiveTab('history')} className="btn btn-secondary btn-sm">
              View All
            </button>
          </div>

          {/* Visual Bar */}
          <div style={{ display: 'flex', height: '14px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '18px' }}>
            <div style={{ width: `${lowPct}%`, background: '#10b981' }} title={`Low Risk: ${lowPct}%`} />
            <div style={{ width: `${medPct}%`, background: '#f59e0b' }} title={`Medium Risk: ${medPct}%`} />
            <div style={{ width: `${highPct}%`, background: '#f43f5e' }} title={`High Risk: ${highPct}%`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ padding: '12px', background: '#0d1322', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1.25rem' }}>{metrics.risk_breakdown.LOW || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOW RISK (0-29)</div>
            </div>
            <div style={{ padding: '12px', background: '#0d1322', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.25rem' }}>{metrics.risk_breakdown.MEDIUM || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEDIUM (30-69)</div>
            </div>
            <div style={{ padding: '12px', background: '#0d1322', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <div style={{ color: '#fb7185', fontWeight: 700, fontSize: '1.25rem' }}>{metrics.risk_breakdown.HIGH || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HIGH (70-100)</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', background: '#172033', padding: '10px 14px', borderRadius: '8px' }}>
            ℹ️ <strong>Rule Engine Note:</strong> All evaluations are computed via transparent heuristics based on transaction amount multipliers, 24h frequency, and IST dormant hours.
          </div>
        </div>

        {/* Recent Agent Execution Runs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              🤖 Recent Multi-Agent Execution Runs
            </h2>
            <button onClick={() => setActiveTab('agent-center')} className="btn btn-secondary btn-sm">
              Agent Center
            </button>
          </div>

          {recentRuns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No runs recorded yet. Launch a scenario to inspect agent traces.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentRuns.slice(0, 4).map((run) => (
                <div 
                  key={run.run_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: '#0d1322',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{run.run_id}</span>
                      <span className={`badge ${run.status === 'SUCCESS' ? 'badge-low' : 'badge-high'}`}>
                        {run.status}
                      </span>
                      <span className="badge badge-local" style={{ fontSize: '0.68rem' }}>{run.mode}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {run.task_prompt}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.8rem' }}>{run.duration_ms} ms</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{run.steps_count} steps</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table Preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              💳 Recent Evaluated Transactions (SQLite Persistent)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Real-time transaction log with automated risk level categorizations.
            </p>
          </div>
          <button onClick={() => setActiveTab('history')} className="btn btn-secondary btn-sm">
            Full Transaction History
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>TRANSACTION ID</th>
                <th>DATE & TIME (IST)</th>
                <th>MERCHANT / PAYEE</th>
                <th>PAYMENT</th>
                <th>AMOUNT</th>
                <th>RISK SCORE</th>
                <th>RISK LEVEL</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.map((tx) => (
                <tr key={tx.id || tx.transaction_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{tx.transaction_id}</td>
                  <td>{formatTimestampIST(tx.timestamp)}</td>
                  <td style={{ fontWeight: 500 }}>{tx.merchant}</td>
                  <td>
                    <span style={{ fontSize: '0.78rem', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>
                      {tx.payment_method || 'UPI'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{formatINR(tx.amount)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: tx.risk_score >= 70 ? '#fb7185' : tx.risk_score >= 30 ? '#fbbf24' : '#34d399' }}>
                      {tx.risk_score} / 100
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${tx.risk_level === 'HIGH' ? 'badge-high' : tx.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                      {tx.risk_level}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: tx.status === 'BLOCKED' ? '#fb7185' : tx.status === 'FLAGGED_REVIEW' ? '#fbbf24' : '#34d399' }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
