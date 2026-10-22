import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  ShieldAlert, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Bot, 
  Sparkles,
  PieChart,
  HelpCircle,
  Cpu,
  Layers,
  IndianRupee,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { formatINR, formatIndianDenomination, formatTimestampIST } from '../utils/formatters';

export default function OverviewDashboard({ summary, onSelectScenario, setActiveTab }) {
  const { t } = useLanguage();

  const metrics = summary?.metrics || {
    total_transactions_analyzed: 8,
    total_volume_inr: 245000,
    average_risk_score: 34,
    risk_breakdown: { LOW: 5, MEDIUM: 2, HIGH: 1 },
    recent_agent_runs_count: 5
  };

  const agentSystem = summary?.agent_system || {
    active_mode: 'LOCAL',
    active_agents_count: 5,
    registered_tools_count: 6
  };

  const recentTxs = summary?.recent_transactions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
        borderColor: '#bfdbfe',
        padding: '36px 30px'
      }}>
        <div style={{ maxWidth: '840px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-info">
              <Sparkles size={13} style={{ marginRight: '4px' }} />
              Autonomous FinTech AI • India-First
            </span>
            <span className="badge badge-low">
              <ShieldCheck size={13} style={{ marginRight: '4px' }} />
              100% Offline Local Agent Core
            </span>
          </div>

          <h1 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 800, 
            color: '#0f172a', 
            lineHeight: 1.35, 
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            {t('heroTitle')}
          </h1>

          <p style={{ 
            color: '#475569', 
            fontSize: '1.02rem', 
            lineHeight: 1.6, 
            marginBottom: '24px' 
          }}>
            {t('heroSubtitle')}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('agent-center')}
              className="btn btn-primary"
              style={{ padding: '12px 22px', fontSize: '0.98rem' }}
            >
              <Bot size={18} />
              <span>Launch AI Agent Center</span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => setActiveTab('advisory')}
              className="btn btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.98rem' }}
            >
              <Calculator size={18} color="#2563eb" />
              <span>{t('cardFinancesAction')}</span>
            </button>

            <button 
              onClick={() => setActiveTab('architecture')}
              className="btn btn-secondary"
              style={{ padding: '12px 18px', fontSize: '0.98rem' }}
            >
              <span>System Specs & Architecture</span>
            </button>
          </div>
        </div>
      </section>

      {/* Top 4 KPI Metrics */}
      <section className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRANSACTIONS MONITORED</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {metrics.total_transactions_analyzed}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>SQLite Persistent Storage</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>VOLUME EVALUATED</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {formatIndianDenomination(metrics.total_volume_inr)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669' }}>{formatINR(metrics.total_volume_inr)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE RISK SCORE</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {metrics.average_risk_score} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#d97706' }}>Deterministic Heuristics</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#f5f3ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AGENT ARCHITECTURE</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              5 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agents</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6366f1' }}>6 Registered Tools</div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Workflows Quick Launcher */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              🎯 Multi-Agent Demonstration Workflows (5 End-to-End Scenarios)
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Click any scenario to inspect real-time multi-agent execution traces, duration, inputs, and outputs.
            </p>
          </div>
          <span className="badge badge-info">Coordinator Execution Traces</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Scenario 1 */}
          <div 
            onClick={() => onSelectScenario && onSelectScenario('SCENARIO_1')}
            className="action-card scenario-card"
            style={{ padding: '16px' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-info">Scenario 1</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Advisory</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Monthly Financial Advisory
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Calculates cash flow, savings rate, and 50/30/20 split.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
              <span>Run Trace</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Scenario 2 */}
          <div 
            onClick={() => onSelectScenario && onSelectScenario('SCENARIO_2')}
            className="action-card scenario-card"
            style={{ padding: '16px' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-medium">Scenario 2</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fraud Risk</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Transaction Risk Scoring
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Anomalous spike (₹18,500) + unfamiliar merchant detection.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>
              <span>Run Trace</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Scenario 3 */}
          <div 
            onClick={() => onSelectScenario && onSelectScenario('SCENARIO_3')}
            className="action-card scenario-card"
            style={{ padding: '16px' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-high">Scenario 3</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Combined</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Combined Financial Health
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Advisory + Fraud coordination: high transaction risk threatens reserves.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#e11d48', fontWeight: 700 }}>
              <span>Run Trace</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Scenario 4 */}
          <div 
            onClick={() => onSelectScenario && onSelectScenario('SCENARIO_4')}
            className="action-card scenario-card"
            style={{ padding: '16px' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-low">Scenario 4</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Knowledge</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Financial Education
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Retrieves verified 50/30/20 & emergency buffer guidelines.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
              <span>Run Trace</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Scenario 5 */}
          <div 
            onClick={() => onSelectScenario && onSelectScenario('SCENARIO_5')}
            className="action-card scenario-card"
            style={{ padding: '16px' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-high">Scenario 5</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Truthfulness</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Truthful Tool Failure
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Simulates upstream timeout; verifies truthful error status.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#e11d48', fontWeight: 700 }}>
              <span>Run Trace</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </section>

      {/* Main 3 Action Cards for Direct User Engagement */}
      <section>
        <div className="grid-3">
          {/* Action 1: Understand My Money */}
          <div 
            className="action-card"
            onClick={() => setActiveTab('advisory')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('advisory')}
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                marginBottom: '14px',
                border: '1px solid #bfdbfe'
              }}>
                <Calculator size={24} />
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {t('cardFinancesTitle')}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                {t('cardFinancesDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>{t('cardFinancesAction')}</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Action 2: Check a Payment */}
          <div 
            className="action-card"
            onClick={() => setActiveTab('fraud')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('fraud')}
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                marginBottom: '14px',
                border: '1px solid #fde68a'
              }}>
                <ShieldAlert size={24} />
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {t('cardPaymentTitle')}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                {t('cardPaymentDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>{t('cardPaymentAction')}</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Action 3: View Previous Results */}
          <div 
            className="action-card"
            onClick={() => setActiveTab('history')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('history')}
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                marginBottom: '14px',
                border: '1px solid #e2e8f0'
              }}>
                <History size={24} />
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {t('cardHistoryTitle')}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                {t('cardHistoryDesc')}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>{t('cardHistoryAction')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 3 AI Assistants Description */}
      <section className="card" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Bot size={18} color="#2563eb" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            {t('aiAgentsTitle')}
          </h3>
        </div>

        <div className="grid-3" style={{ fontSize: '0.86rem' }}>
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
              1. {t('agentCoordTitle')}
            </div>
            <div style={{ color: '#64748b', lineHeight: 1.45 }}>
              {t('agentCoordDesc')}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
              2. {t('agentAdvTitle')}
            </div>
            <div style={{ color: '#64748b', lineHeight: 1.45 }}>
              {t('agentAdvDesc')}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>
              3. {t('agentFraudTitle')}
            </div>
            <div style={{ color: '#64748b', lineHeight: 1.45 }}>
              {t('agentFraudDesc')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
