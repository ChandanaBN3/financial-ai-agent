import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
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
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info"><History size={13} /> SQLite Persistent Storage</span>
              <span className="badge badge-local">{transactions.length} Records</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Evaluated Transaction History & Audit Trail
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              All transactions scored by the Fraud Detection Agent and stored in local SQLite database.
            </p>
          </div>

          <button onClick={loadTransactions} disabled={loading} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {/* Risk Level Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`btn btn-sm ${selectedRisk === risk ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {risk} RISK
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '380px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', height: '36px', fontSize: '0.84rem' }}
                placeholder="Search merchant, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '36px' }}>
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading transactions from SQLite database...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No transactions match the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>TIMESTAMP (IST)</th>
                  <th>MERCHANT / PAYEE</th>
                  <th>CATEGORY</th>
                  <th>PAYMENT</th>
                  <th>AMOUNT</th>
                  <th>HIST. AVG</th>
                  <th>RISK SCORE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id || tx.transaction_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                      {tx.transaction_id}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{formatTimestampIST(tx.timestamp)}</td>
                    <td style={{ fontWeight: 600 }}>{tx.merchant}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{tx.category}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>
                        {tx.payment_method || 'UPI'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{formatINR(tx.amount)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatINR(tx.historical_average)}</td>
                    <td>
                      <span className={`badge ${tx.risk_level === 'HIGH' ? 'badge-high' : tx.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {tx.risk_score} / 100 • {tx.risk_level}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: tx.status === 'BLOCKED' ? '#fb7185' : tx.status === 'FLAGGED_REVIEW' ? '#fbbf24' : '#34d399', fontWeight: 600 }}>
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedTx && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span className={`badge ${selectedTx.risk_level === 'HIGH' ? 'badge-high' : selectedTx.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                  {selectedTx.risk_level} RISK
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                  {selectedTx.transaction_id}
                </h3>
              </div>
              <button onClick={() => setSelectedTx(null)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              <div className="grid-2">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Merchant:</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedTx.merchant}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{formatINR(selectedTx.amount)}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Historical Average:</span>
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{formatINR(selectedTx.historical_average)}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{selectedTx.payment_method || 'UPI'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Timestamp (IST):</span>
                  <div style={{ color: '#cbd5e1' }}>{formatTimestampIST(selectedTx.timestamp)}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Risk Score:</span>
                  <div style={{ fontWeight: 700, color: selectedTx.risk_score >= 70 ? '#fb7185' : selectedTx.risk_score >= 30 ? '#fbbf24' : '#34d399' }}>
                    {selectedTx.risk_score} / 100
                  </div>
                </div>
              </div>

              <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>Agent Rationale:</span>
                <p style={{ marginTop: '4px', color: '#e2e8f0' }}>{selectedTx.explanation}</p>
              </div>

              {selectedTx.triggered_rules && selectedTx.triggered_rules.length > 0 && (
                <div>
                  <span style={{ fontWeight: 700, color: '#fff' }}>Triggered Heuristic Signals:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {selectedTx.triggered_rules.map((rule, idx) => (
                      <div key={idx} style={{ background: '#0d1322', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #f59e0b', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: '#fff' }}>{rule.rule}</strong>
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>+{rule.points} pts</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{rule.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
