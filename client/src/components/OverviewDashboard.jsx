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
  HelpCircle
} from 'lucide-react';

export default function OverviewDashboard({ summary, setActiveTab }) {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcoming Hero Section */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
        borderColor: '#bfdbfe',
        padding: '36px 30px'
      }}>
        <div style={{ maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-info">
              <Sparkles size={13} style={{ marginRight: '4px' }} />
              {t('appName')}
            </span>
            <span className="badge badge-low">
              <ShieldCheck size={13} style={{ marginRight: '4px' }} />
              100% Private & Local
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
              onClick={() => setActiveTab('advisory')}
              className="btn btn-primary"
              style={{ padding: '12px 22px', fontSize: '0.98rem' }}
            >
              <Calculator size={18} />
              <span>{t('cardFinancesAction')}</span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => setActiveTab('fraud')}
              className="btn btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.98rem' }}
            >
              <ShieldAlert size={18} color="#d97706" />
              <span>{t('cardPaymentAction')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main 3 Action Cards */}
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

      {/* How It Helps Section */}
      <section className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '18px' }}>
          {t('howItWorksTitle')}
        </h2>

        <div className="grid-3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700 }}>
              <CheckCircle2 size={18} />
              <span>{t('feature1Title')}</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              {t('feature1Desc')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: 700 }}>
              <ShieldAlert size={18} />
              <span>{t('feature2Title')}</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              {t('feature2Desc')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700 }}>
              <ShieldCheck size={18} />
              <span>{t('feature3Title')}</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              {t('feature3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 3 AI Assistants Working in Harmony (Coordinator, Advisory, Fraud Detection) */}
      <section className="card" style={{ background: '#fafafa', borderStyle: 'dashed' }}>
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
