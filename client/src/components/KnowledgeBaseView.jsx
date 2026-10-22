import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Sparkles, 
  ExternalLink,
  Info,
  ShieldCheck
} from 'lucide-react';
import { searchKnowledge, fetchKnowledgeDocs } from '../services/api';

const QUICK_TOPICS = [
  '50/30/20 rule',
  'emergency fund',
  'UPI fraud helpline 1930',
  'credit card interest debt',
  'rule-based vs machine learning'
];

export default function KnowledgeBaseView() {
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchKnowledgeDocs().then((resp) => {
      if (resp.success) {
        setDocs(resp.documents || []);
        if (resp.documents?.length > 0) {
          setSelectedDoc(resp.documents[0]);
        }
      }
    });
  }, []);

  const handleSearch = async (searchStr = query) => {
    if (!searchStr || searchStr.trim() === '') {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const resp = await searchKnowledge(searchStr);
      setSearchResults(resp);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    setQuery(topic);
    handleSearch(topic);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info"><BookOpen size={13} /> Verified Local Knowledge</span>
              <span className="badge badge-local">Keyword-Based Retrieval</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Financial Education Knowledge Base
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Original educational material on Indian budgeting, liquid emergency funds, UPI digital payment safety, and smart financial practices.
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ marginTop: '20px' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Search financial rules, UPI safety guidelines, or emergency savings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ minWidth: '120px' }}>
              <Search size={15} />
              <span>{searchLoading ? 'Searching...' : 'Search'}</span>
            </button>
            {searchResults && (
              <button 
                type="button" 
                onClick={() => { setSearchResults(null); setQuery(''); }} 
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </form>

          {/* Quick topic pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>POPULAR TOPICS:</span>
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicClick(topic)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '3px 10px' }}
              >
                <Tag size={11} color="#38bdf8" />
                <span>{topic}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Display */}
      {searchResults && (
        <div className="card" style={{ borderColor: 'rgba(14, 165, 233, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              🔍 Retrieval Results for: "{searchResults.query}"
            </h2>
            <span className="badge badge-info">{searchResults.count} Matches</span>
          </div>

          {searchResults.count === 0 ? (
            <div style={{ padding: '20px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', color: '#b45309', fontSize: '0.9rem' }}>
              ℹ️ {searchResults.message}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {searchResults.results.map((r) => (
                <div 
                  key={r.doc_id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    borderLeft: '4px solid #0284c7'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{r.doc_id}</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{r.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>
                      Relevance Score: {r.relevance_score}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Category: {r.category}
                  </div>

                  <blockquote style={{ fontSize: '0.85rem', color: '#334155', background: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #0284c7', fontStyle: 'italic', marginBottom: '10px' }}>
                    "{r.snippet}"
                  </blockquote>

                  <button
                    onClick={() => {
                      const found = docs.find(d => d.doc_id === r.doc_id);
                      if (found) setSelectedDoc(found);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Read Full Document
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Browser Grid */}
      <div className="grid-3">
        {/* Left Col: Document List */}
        <div className="card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
            📚 Verified Articles ({docs.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {docs.map((doc) => {
              const isSelected = selectedDoc?.doc_id === doc.doc_id;
              return (
                <div
                  key={doc.doc_id}
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : '#f8fafc',
                    border: `1px solid ${isSelected ? '#0284c7' : 'var(--border-color)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{doc.doc_id}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {doc.category}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: isSelected ? '#0284c7' : '#0f172a' }}>
                    {doc.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Full Document Reader */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {selectedDoc ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-info">{selectedDoc.doc_id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedDoc.category}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                {selectedDoc.title}
              </h2>

              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                fontSize: '0.92rem',
                lineHeight: '1.8',
                color: '#334155',
                whiteSpace: 'pre-line'
              }}>
                {selectedDoc.content}
              </div>

              {selectedDoc.tags && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TAGS:</span>
                  {selectedDoc.tags.split(',').map((t, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#475569' }}>
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Select a document to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
