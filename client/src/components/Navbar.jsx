import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bot, 
  Home, 
  Calculator, 
  ShieldAlert, 
  History, 
  Globe, 
  ChevronDown,
  Sparkles,
  BookOpen,
  GitBranch,
  RefreshCw,
  Cpu
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' }
];

export default function Navbar({ activeTab, setActiveTab, healthData, onResetDemo, isResetting }) {
  const { lang, setLang, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const isLLM = healthData?.agent_mode === 'LLM_ASSISTED';

  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'overview', label: t('navHome'), icon: Home },
    { id: 'agent-center', label: t('navAgentCenter') || 'AI Agent Center', icon: Bot, isHighlight: true },
    { id: 'advisory', label: t('navFinances'), icon: Calculator },
    { id: 'fraud', label: t('navCheckPayment'), icon: ShieldAlert },
    { id: 'history', label: t('navHistory'), icon: History },
    { id: 'knowledge', label: t('navKnowledge') || 'Knowledge Base', icon: BookOpen },
    { id: 'architecture', label: t('navArchitecture') || 'Architecture & Specs', icon: GitBranch }
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div 
          className="nav-brand" 
          onClick={() => setActiveTab('overview')} 
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('overview')}
        >
          <div className="brand-icon">
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">FinWise</span>
              <span className="brand-pill">
                <Sparkles size={11} style={{ marginRight: '3px' }} />
                Smart Assistant
              </span>
            </div>
            <div className="brand-tagline">
              Smart Financial Advisory & Payment Safety (India)
            </div>
          </div>
        </div>

        {/* Navigation items + Language Selector + Demo Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <nav className="nav-links" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  style={item.isHighlight && !isActive ? { border: '1px dashed #93c5fd', color: '#2563eb' } : {}}
                  type="button"
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Reset Demo Database Button */}
          {onResetDemo && (
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="btn btn-secondary btn-sm"
              title="Reset SQLite database with initial demo records"
              style={{ fontSize: '0.78rem' }}
              type="button"
            >
              <RefreshCw size={13} className={isResetting ? 'spin' : ''} />
              <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="lang-selector-container" ref={langMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="lang-button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-expanded={langMenuOpen}
              aria-label="Select Language"
            >
              <Globe size={14} color="#2563eb" />
              <span style={{ fontWeight: 600 }}>{currentLangObj.native}</span>
              <ChevronDown size={13} className={langMenuOpen ? 'rotate-180' : ''} />
            </button>

            {langMenuOpen && (
              <div className="lang-dropdown">
                <div className="lang-dropdown-header">
                  {t('languageLabel')}
                </div>
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`lang-option ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="lang-native">{l.native}</span>
                      <span className="lang-english">({l.label})</span>
                      {isSelected && <span className="lang-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
