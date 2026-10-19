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

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeScenario, setActiveScenario] = useState('SCENARIO_1');
  const [healthData, setHealthData] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async () => {
    try {
      const [h, d] = await Promise.all([
        fetchHealth().catch(err => ({ status: 'OFFLINE', error: err.message })),
        fetchDashboardSummary().catch(err => null)
      ]);
      setHealthData(h);
      setDashboardSummary(d);
    } catch (err) {
      console.error('App init fetch error:', err);
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
          background: '#172033',
          border: '1px solid #38bdf8',
          padding: '12px 20px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.88rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 999
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthData={healthData}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Tab Content */}
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
      <footer style={{
        background: '#070b14',
        borderTop: '1px solid var(--border-color)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>Project 418:</strong> Agentic AI-Based Smart Financial Advisory and Fraud Detection System (India-First MVP)
          </div>
          <div>
            Design Project 1 • Review-2 Implementation • 100% Offline Local Agent Mode
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#64748b' }}>
          Disclaimer: Educational prototype for CSE curriculum evaluation. Does not provide certified financial advice under SEBI guidelines or production bank fraud mitigation.
        </div>
      </footer>
    </div>
  );
}
