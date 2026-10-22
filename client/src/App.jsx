import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewDashboard from './components/OverviewDashboard';
import FinancialAdvisoryView from './components/FinancialAdvisoryView';
import FraudDetectionView from './components/FraudDetectionView';
import TransactionHistoryView from './components/TransactionHistoryView';
import { fetchHealth, fetchDashboardSummary } from './services/api';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthData, setHealthData] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
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

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthData={healthData}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'overview' && (
          <OverviewDashboard
            summary={dashboardSummary}
            setActiveTab={setActiveTab}
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
      </main>

      {/* Polished, Beginner-Friendly Footer (Zero Academic References) */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div style={{ fontWeight: 600, color: '#334155' }}>
            {t('footerNote')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {t('footerDisclaimer')}
          </div>
        </div>
      </footer>
    </div>
  );
}
