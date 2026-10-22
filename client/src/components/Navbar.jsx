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
  Sparkles
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' }
];

export default function Navbar({ activeTab, setActiveTab }) {
  const { lang, setLang, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

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
    { id: 'advisory', label: t('navFinances'), icon: Calculator },
    { id: 'fraud', label: t('navCheckPayment'), icon: ShieldAlert },
    { id: 'history', label: t('navHistory'), icon: History }
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
              <span className="brand-title">{t('appName')}</span>
              <span className="brand-pill">
                <Sparkles size={11} style={{ marginRight: '3px' }} />
                Smart & Private
              </span>
            </div>
            <div className="brand-tagline">
              {t('brandTagline')}
            </div>
          </div>
        </div>

        {/* Navigation items + Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <nav className="nav-links" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  type="button"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Language Selector Dropdown */}
          <div className="lang-selector-container" ref={langMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="lang-button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-expanded={langMenuOpen}
              aria-label="Select Language"
            >
              <Globe size={15} color="#2563eb" />
              <span style={{ fontWeight: 600 }}>{currentLangObj.native}</span>
              <ChevronDown size={14} className={langMenuOpen ? 'rotate-180' : ''} />
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
