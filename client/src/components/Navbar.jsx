import React, { useState } from 'react';
import { 
  Bot, 
  LayoutDashboard, 
  Calculator, 
  ShieldAlert, 
  History, 
  BookOpen, 
  GitBranch, 
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, healthData, onResetDemo, isResetting }) {
  const isLLM = healthData?.agent_mode === 'LLM_ASSISTED';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'agent-center', label: 'AI Agent Center', icon: Bot, isHighlight: true },
    { id: 'advisory', label: 'Financial Advisory', icon: Calculator },
    { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert },
    { id: 'history', label: 'Transactions', icon: History },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'architecture', label: 'Review-2 & Viva Guide', icon: GitBranch },
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="nav-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(14, 165, 233, 0.4)'
            }}>
              <Bot size={22} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Project 418</span>
                <span className="nav-badge">REVIEW-2 MVP</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Agentic AI Financial Advisory & Fraud Detection (India)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={isLLM ? 'badge badge-info' : 'badge badge-local'}>
              <Cpu size={12} />
              {isLLM ? 'LLM-Assisted Mode (Gemini)' : 'Local Agent Mode (100% Offline)'}
            </span>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={item.isHighlight && !isActive ? { border: '1px dashed rgba(14, 165, 233, 0.4)', color: '#38bdf8' } : {}}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="btn btn-secondary btn-sm"
            title="Reset SQLite database with initial demo transactions"
            style={{ marginLeft: '6px' }}
          >
            <RefreshCw size={13} className={isResetting ? 'spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
