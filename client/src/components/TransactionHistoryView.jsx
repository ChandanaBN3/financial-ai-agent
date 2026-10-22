import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  History, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  ExternalLink
} from 'lucide-react';
import { fetchTransactions } from '../services/api';
import { formatINR, formatTimestampIST } from '../utils/formatters';

export default function TransactionHistoryView() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const resp = await fetchTransactions({
        risk_level: selectedRisk === 'ALL' ? null : selectedRisk,
        search: searchQuery
      });
      if (resp.success) {
        setTransactions(resp.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedRisk]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTransactions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info"><History size={13} /> {t('navHistory')}</span>
              <span className="badge badge-low">{transactions.length} Records</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {t('historyTitle')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {t('historySubtitle')}
            </p>
          </div>

          <button onClick={loadTransactions} disabled={loading} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
          {/* Risk Level Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`btn btn-sm ${selectedRisk === risk ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {risk === 'ALL' ? 'All Checks' : `${risk} Risk`}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', height: '36px', fontSize: '0.84rem' }}
                placeholder="Search recipient or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '36px' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading records...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {t('noHistory')}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>{t('colDate')}</th>
                  <th>{t('colRecipient')}</th>
                  <th>PAYMENT</th>
                  <th>{t('colAmount')}</th>
                  <th>{t('colScore')}</th>
                  <th>{t('colRisk')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id || tx.transaction_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#2563eb' }}>
                      {tx.transaction_id}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {formatTimestampIST(tx.timestamp)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.merchant}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                        {tx.payment_method || 'UPI'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(tx.amount)}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: tx.risk_score >= 70 ? '#e11d48' : tx.risk_score >= 30 ? '#d97706' : '#059669' }}>
                        {tx.risk_score} / 100
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tx.risk_level === 'HIGH' ? 'badge-high' : tx.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {tx.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
