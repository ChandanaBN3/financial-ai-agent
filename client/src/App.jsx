import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewDashboard from './components/OverviewDashboard';
import AgentCenter from './components/AgentCenter';
import FinancialAdvisoryView from './components/FinancialAdvisoryView';
import FraudDetectionView from './components/FraudDetectionView';
import TransactionHistoryView from './components/TransactionHistoryView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import ArchitectureView from './components/ArchitectureView';
import { fetchHealth, fetchDashboardSummary, resetDemoData } from './services/api';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeScenario, setActiveScenario] = useState('SCENARIO_1');
  const [healthData, setHealthData] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const { t } = useLanguage();

  const loadData = async () => {
    try {
      const [h, d] = await Promise.all([
        fetchHealth().catch(err => ({ status: 'OFFLINE', error: err.message })),
        fetchDashboardSummary().catch(() => null)
      ]);
      setHealthData(h);
      setDashboardSummary(d);
    } catch (err) {
      console.warn('Initial data load notice:', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await resetDemoData();
      if (res.success) {
        showToast('✅ Demo database reset with fresh sample transactions and knowledge base.');
        await loadData();
      }
    } catch (err) {
      showToast(`❌ Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectScenario = (scenarioKey) => {
    setActiveScenario(scenarioKey);
    setActiveTab('agent-center');
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#1e293b',
          border: '1px solid #38bdf8',
          padding: '12px 20px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.88rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 999
        }}>
          {toastMessage}
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthData={healthData}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'overview' && (
          <OverviewDashboard
            summary={dashboardSummary}
            onSelectScenario={handleSelectScenario}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'agent-center' && (
          <AgentCenter
            key={activeScenario}
            initialScenario={activeScenario}
            healthData={healthData}
            onWorkflowCompleted={loadData}
          />
        )}

        {activeTab === 'advisory' && (
          <FinancialAdvisoryView />
        )}

        {activeTab === 'fraud' && (
          <FraudDetectionView
            onTransactionSaved={loadData}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistoryView />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.84rem' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>
              FinWise — Smart Financial Advisory & Payment Safety
            </span>
            <span style={{ color: '#64748b' }}>
              Autonomous Multi-Agent System • 100% Offline & Private Local Mode
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {t('footerDisclaimer')}
          </div>
        </div>
      </footer>
    </div>
  );
}
