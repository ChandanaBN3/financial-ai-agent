import React, { useState } from 'react';
import { 
  GitBranch, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Bot, 
  Cpu, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Sparkles,
  FileText
} from 'lucide-react';

const VIVA_QUESTIONS = [
  {
    q: '1. What is the title and core objective of Project 418?',
    a: 'Title: "418 – Agentic AI-Based Smart Financial Advisory and Fraud Detection System". Objective: Build an autonomous, multi-agent fintech system designed specifically for the Indian financial context (INR, 50/30/20, UPI transaction patterns) that coordinates financial planning with real-time heuristic fraud detection.'
  },
  {
    q: '2. Why did you choose an Agentic AI architecture instead of a traditional monolithic web dashboard?',
    a: 'A traditional dashboard is static and siloed: calculations, risk checks, and advice happen in isolation. An Agentic AI architecture provides dynamic coordination: a Supervisor Orchestrator breaks user tasks into bounded plans, assigns specialist agents (Financial Advisor, Fraud Detector, Financial Analyst, Explainer), routes shared context between them, captures an auditable execution trace, and synthesizes grounded insights.'
  },
  {
    q: '3. What are the specific agents in your system and their respective roles?',
    a: 'We have 5 distinct backend agent modules:\n1. Orchestrator / Supervisor Agent: Classifies intent, creates bounded plans, enforces tool allowlists, tracks step statuses, handles errors.\n2. Financial Advisory Agent: Evaluates monthly income, expenses, savings rate, emergency coverage, and 50/30/20 budget.\n3. Fraud Detection Agent: Evaluates transaction amount spikes, velocity, odd-hour timing (IST), and unfamiliar recipients.\n4. Financial Health / Analysis Agent: Evaluates cross-module exposure (e.g., whether flagged transactions deplete emergency funds).\n5. Explanation and Reporting Agent: Synthesizes final plain-language reports backed strictly by tool evidence.'
  },
  {
    q: '4. How does the Orchestrator decide which tools and agents to invoke?',
    a: 'The Orchestrator implements intent classification that inspects the prompt and input payloads to categorize the request into one of five bounded workflows (Financial Advisory, Transaction Risk, Combined Health, Financial Education, or Failure Demo). It then maps the workflow to a pre-defined sequence of allowlisted tool calls and specialist agents.'
  },
  {
    q: '5. What is the difference between Local Agent Mode and LLM-Assisted Mode?',
    a: 'In Local Agent Mode (default), planning, calculations, risk scoring, and report synthesis run 100% offline using deterministic rule engines and template synthesis without paid APIs or external dependencies. In LLM-Assisted Mode, an optional Gemini API key allows an LLM to propose plans against allowlisted tools and generate explanations from verified tool outputs, with automatic fallback to local mode if the API fails.'
  },
  {
    q: '6. How do you prevent LLM hallucinations from corrupting financial figures or fraud scores?',
    a: 'We enforce Grounded Tool Execution: The LLM is never allowed to invent calculations or risk scores. All mathematical metrics (cash flow, savings rate, emergency buffer) and fraud scores (0-100) are computed strictly by deterministic backend JavaScript tools. The LLM only receives verified structured JSON outputs to generate summaries.'
  },
  {
    q: '7. What tools are registered in your system and how is security enforced?',
    a: 'We have 6 allowlisted tools: calculateFinancialMetrics, scoreTransactionRisk, searchKnowledgeBase, getRecentTransactions, saveTransactionRecord, and simulateToolFailure. Security is enforced through a strict allowlist registry: the Orchestrator rejects any tool call not in the registry and never executes arbitrary code or model-generated SQL.'
  },
  {
    q: '8. How does the deterministic Fraud Detection Agent calculate risk scores?',
    a: 'It uses a transparent heuristic scoring algorithm ranging from 0 to 100:\n- Amount Spike: +10 pts for 2x-3x avg, +20 pts for 3x-5x avg, +35 pts for >5x avg.\n- Velocity: +15 pts for 6-10 tx/24h, +25 pts for >10 tx/24h.\n- Dormant Hours: +15 pts for transactions between 1 AM and 5 AM IST.\n- Unfamiliar Device / Merchant: +15 pts each.\n- Monitored Category (Crypto/P2P/Gambling): +25 pts.\n- Location / IP Mismatch: +30 pts.\nScores 0-29 are LOW, 30-69 are MEDIUM, and 70-100 are HIGH.'
  },
  {
    q: '9. Is your fraud detection system a machine learning model?',
    a: 'No. As clearly stated in our viva documentation and disclaimers, our prototype is an explicit, rule-based heuristic scoring engine. We explain that rule-based systems are deterministic, transparent, and easy to audit, whereas production ML models learn high-dimensional patterns across millions of historical transactions.'
  },
  {
    q: '10. What are false positives and false negatives in your fraud detection module?',
    a: 'A False Positive occurs when a legitimate user transaction is incorrectly flagged or blocked (e.g. paying high hospital bills or festive Diwali shopping exceeding 5x average). A False Negative occurs when an actual fraudster slips through undetected (e.g. splitting stolen funds into small micro-transactions below anomaly thresholds).'
  },
  {
    q: '11. How does the Financial Advisory Agent calculate the Emergency Fund runway?',
    a: 'Runway is computed as Current Liquid Savings divided by Essential Monthly Expenses (or total monthly expenses if essentials are unspecified). In India, standard personal finance guidelines recommend maintaining 3 to 6 months of essential living expenses parked in liquid instruments like sweep-in FDs or liquid mutual funds.'
  },
  {
    q: '12. What is the 50/30/20 rule and how is it adapted for Indian urban earners?',
    a: 'The 50/30/20 rule allocates take-home monthly income into: 50% for Needs (Rent, groceries, utilities, school fees), 30% for Wants (dining out, shopping, entertainment), and 20% for Savings/Investments (SIPs, PPF, emergency fund). In metro cities like Bengaluru or Mumbai where rent exceeds 35%, our system highlights deviations and recommends a 60/20/20 or custom adjustment.'
  },
  {
    q: '13. How does the Financial Health / Analysis Agent combine advisory and fraud outputs?',
    a: 'It computes cross-module exposure: for example, if an unfamiliar transaction of ₹45,000 is flagged on an account with only ₹1,00,000 in liquid savings, it alerts the user that this single anomalous transaction threatens 45% of their entire emergency cushion.'
  },
  {
    q: '14. What happens when a tool fails during orchestration (Scenario 5)?',
    a: 'The system exhibits Truthful Status Reporting: the Orchestrator records step.status = "FAILED", captures the exact error reason, stops downstream dependent steps, and reports the failure in the final synthesis. It never fabricates a successful result or hallucinates downstream metrics.'
  },
  {
    q: '15. How does the local knowledge retrieval system work?',
    a: 'It uses a local keyword relevance engine that tokenizes queries, filters stopwords, and computes relevance scores across verified educational markdown documents based on tag matches, title matches, and term frequency. If no documents match, it truthfully reports that no relevant local sources were found.'
  },
  {
    q: '16. What database is used and what data does it store?',
    a: 'We use persistent SQLite via Node 22\'s native node:sqlite engine. It persists evaluated transactions (amounts, risk scores, triggered rules), multi-agent execution runs (prompt, workflow, duration, execution traces), and verified knowledge documents.'
  },
  {
    q: '17. Why is SQLite appropriate for this college design project?',
    a: 'SQLite is zero-configuration, serverless, self-contained, ACID-compliant, and stores all tables in a single local file. It runs identically across Windows, macOS, and Linux without needing to run background database server daemons like PostgreSQL or MySQL.'
  },
  {
    q: '18. How does the application implement India-First design requirements?',
    a: 'All currency is formatted in Indian Rupees (₹) using en-IN locale (Intl.NumberFormat) with Lakh and Crore denominations where appropriate. Indian payment conventions like UPI, IMPS, and RuPay are represented. Timestamps respect Indian Standard Time (IST). Clear disclaimers clarify that advice is not SEBI/RBI registered.'
  },
  {
    q: '19. How are API keys and sensitive secrets protected?',
    a: 'All environment variables (such as GEMINI_API_KEY) are stored exclusively in the backend server (.env) and never exposed to the React frontend. .gitignore excludes .env files. If no API key is provided, the system defaults automatically to 100% offline local agent mode.'
  },
  {
    q: '20. How did you test your application and what were the test outcomes?',
    a: 'We built an automated test suite using Node\'s built-in test runner (node --test). It covers 31 comprehensive test assertions across financial calculations, edge cases (zero/negative values), fraud rules, keyword retrieval, SQLite CRUD, and multi-agent orchestration for all 5 scenarios. All 31 tests pass with 0 failures.'
  },
  {
    q: '21. How do you handle edge cases such as zero income or negative expenses?',
    a: 'The calculation tool validates inputs before execution: zero income or negative values return structured validation error objects (e.g. code: "INVALID_INCOME") with descriptive messages. Similarly, if essential expenses exceed total expenses, it returns a validation error.'
  },
  {
    q: '22. What is the execution trace shown in the UI and why is it important?',
    a: 'The execution trace is an auditable log of every step taken by the Orchestrator. It shows which agent was invoked, the tool called, input parameters, execution duration in milliseconds, status (COMPLETED/FAILED), and structured output. This provides transparency for evaluation and prevents "black box" claims.'
  },
  {
    q: '23. How does the frontend communicate with the backend?',
    a: 'The React frontend communicates with Express via standard JSON REST endpoints (/api/health, /api/agent/run, /api/advisory/calculate, /api/fraud/evaluate, /api/transactions, etc.). In Vite dev mode, requests are proxied from port 3000 to port 5000.'
  },
  {
    q: '24. What is the current implementation progress against approved scope for Review-2?',
    a: 'We have implemented approximately 50-60% of the complete design scope: multi-agent architecture, deterministic tools, rule-based fraud scoring, financial advisory formulas, local knowledge retrieval, SQLite persistence, and 5 interactive demonstration scenarios are fully functional and tested.'
  },
  {
    q: '25. What features are planned for Review-3 and final semester submission?',
    a: 'For Review-3, we plan to implement: graph-based transaction network visualization (money mules), advanced vector embeddings for knowledge search, multi-month budgeting trend projections, and interactive user authentication.'
  }
];

const SCOPE_TABLE = [
  { module: 'Supervisor Orchestrator', scope: 'Multi-agent bounded workflow engine with trace tracking', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'orchestrator.js, 5 workflows, test/orchestrator.test.js' },
  { module: 'Financial Advisory Tool', scope: 'Deterministic cash flow, savings rate, 50/30/20, runway in INR', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'advisoryCalculator.js, test/advisory.test.js' },
  { module: 'Fraud Detection Tool', scope: 'Transparent heuristic rule engine (0-100 score, IST odd-hours)', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'fraudScorer.js, test/fraud.test.js' },
  { module: 'Financial Health Agent', scope: 'Cross-module exposure synthesis (tx impact on emergency funds)', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'financialHealthAgent.js, Scenario 3 flow' },
  { module: 'Explanation Agent', scope: 'Grounded plain-language summary with evidence and assumptions', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'explanationAgent.js, template & LLM modes' },
  { module: 'Optional LLM Planning', scope: 'Gemini API tool-bounded planning with strict local fallback', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'llmPlanner.js, safe JSON schema validator' },
  { module: 'Local Knowledge Base', scope: 'Original Indian financial articles with keyword retrieval', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'knowledgeRetriever.js, test/knowledge.test.js' },
  { module: 'Persistent SQLite DB', scope: 'Transactions, agent run traces, and document storage', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'node:sqlite, repository.js, test/database.test.js' },
  { module: 'Interactive Frontend UI', scope: 'React/Vite dashboard, Scenario quick-launchers, trace visualizer', status: 'IMPLEMENTED', testStatus: 'TESTED', evidence: 'React 18 components, INR formatting' },
  { module: 'Automated Test Suite', scope: 'Node native test runner covering formulas, agents, and API', status: 'IMPLEMENTED', testStatus: 'TESTED (31/31 PASS)', evidence: 'npm run test, 100% pass rate' },
  { module: 'Graph Fraud Network', scope: 'Visual graph clustering of mule accounts across accounts', status: 'PLANNED', testStatus: 'ROADMAP', evidence: 'Scheduled for Review-3' },
  { module: 'Vector RAG Embeddings', scope: 'Dense vector embeddings (e.g. ChromaDB / FAISS)', status: 'PLANNED', testStatus: 'ROADMAP', evidence: 'Scheduled for Review-3' }
];

export default function ArchitectureView() {
  const [activeSection, setActiveSection] = useState('diagram');
  const [expandedViva, setExpandedViva] = useState({});

  const toggleViva = (idx) => {
    setExpandedViva(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info"><GitBranch size={13} /> Review-2 Documentation & Viva</span>
              <span className="badge badge-local">College Design Project 1</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              System Architecture & Viva Guide
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Comprehensive evaluation materials: multi-agent interaction flow, scope-to-feature progress table, and 25 viva questions with answers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveSection('diagram')}
              className={`btn btn-sm ${activeSection === 'diagram' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <GitBranch size={14} />
              <span>Architecture Flow</span>
            </button>
            <button
              onClick={() => setActiveSection('scope')}
              className={`btn btn-sm ${activeSection === 'scope' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CheckCircle2 size={14} />
              <span>Scope & Progress (~50%)</span>
            </button>
            <button
              onClick={() => setActiveSection('viva')}
              className={`btn btn-sm ${activeSection === 'viva' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <HelpCircle size={14} />
              <span>25+ Viva Q&A</span>
            </button>
            <button
              onClick={() => setActiveSection('demo')}
              className={`btn btn-sm ${activeSection === 'demo' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Sparkles size={14} />
              <span>3-Min Demo Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Architecture Diagram */}
      {activeSection === 'diagram' && (
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            🏛️ Multi-Agent Interaction Architecture
          </h2>

          <div style={{ background: '#080d1a', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
            {/* Visual Box Architecture Representation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              {/* User / UI Tier */}
              <div style={{ padding: '12px 24px', background: '#172033', border: '2px solid #0ea5e9', borderRadius: '10px', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>USER INTERFACE (React + Vite Dashboard)</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Interactive Task Prompt • 5 Scenario Launchers • Real-Time Execution Trace Viewer
                </div>
              </div>

              <div style={{ color: '#0ea5e9', fontWeight: 700 }}>⬇️ REST API Call (/api/agent/run)</div>

              {/* Orchestrator Tier */}
              <div style={{ padding: '16px 24px', background: 'rgba(14, 165, 233, 0.1)', border: '2px solid #0ea5e9', borderRadius: '10px', textAlign: 'center', width: '100%', maxWidth: '700px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Bot size={18} color="#38bdf8" />
                  <strong style={{ color: '#fff', fontSize: '1.05rem' }}>ORCHESTRATOR / SUPERVISOR AGENT</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Intent Classifier • Bounded Execution Planner • Tool Allowlist Enforcer • Trace Auditor • Error Recovery
                </div>
              </div>

              <div style={{ color: '#38bdf8', fontWeight: 700 }}>⬇️ Parallel / Sequential Coordination</div>

              {/* Specialist Agents Grid */}
              <div className="grid-4" style={{ width: '100%' }}>
                <div style={{ background: '#0d1322', border: '1px solid #10b981', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.86rem' }}>Financial Advisory Agent</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tool: calculateFinancialMetrics
                  </div>
                </div>

                <div style={{ background: '#0d1322', border: '1px solid #f59e0b', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '0.86rem' }}>Fraud Detection Agent</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tools: scoreTransactionRisk, saveRecord
                  </div>
                </div>

                <div style={{ background: '#0d1322', border: '1px solid #8b5cf6', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <strong style={{ color: '#a78bfa', fontSize: '0.86rem' }}>Financial Health Agent</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Cross-Module Exposure & Runway Impact
                  </div>
                </div>

                <div style={{ background: '#0d1322', border: '1px solid #ec4899', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <strong style={{ color: '#f472b6', fontSize: '0.86rem' }}>Explanation Agent</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Grounded Non-Expert Narrative Synthesis
                  </div>
                </div>
              </div>

              <div style={{ color: '#10b981', fontWeight: 700 }}>⬇️ Storage & Knowledge Base</div>

              {/* Data & Storage Tier */}
              <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '700px', justifyContent: 'center' }}>
                <div style={{ flex: 1, padding: '12px', background: '#172033', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>SQLite Database (node:sqlite)</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Transactions • Agent Run History</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: '#172033', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Local Knowledge Base</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Verified Indian Educational Docs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Review-2 Scope & Progress Table */}
      {activeSection === 'scope' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                📋 Review-2 Scope-to-Feature Progress Mapping
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Evaluates implementation against approved Design Project 1 deliverables (~50% target).
              </p>
            </div>
            <span className="badge badge-low">31 / 31 Unit Tests Passing</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>MODULE / COMPONENT</th>
                  <th>APPROVED SCOPE DELIVERABLE</th>
                  <th>IMPLEMENTATION STATUS</th>
                  <th>TEST VERIFICATION</th>
                  <th>CODE EVIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {SCOPE_TABLE.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{item.module}</td>
                    <td style={{ fontSize: '0.84rem' }}>{item.scope}</td>
                    <td>
                      <span className={`badge ${item.status === 'IMPLEMENTED' ? 'badge-low' : 'badge-info'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: item.testStatus.includes('PASS') || item.testStatus === 'TESTED' ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                        {item.testStatus}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#38bdf8' }}>
                      {item.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 3: 25+ Viva Q&A */}
      {activeSection === 'viva' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                🎓 Oral Viva Examination Question Bank (25 Questions & Answers)
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Accurate, technical, beginner-friendly answers for the college project review panel.
              </p>
            </div>
            <button
              onClick={() => {
                const all = {};
                VIVA_QUESTIONS.forEach((_, i) => { all[i] = true; });
                setExpandedViva(all);
              }}
              className="btn btn-secondary btn-sm"
            >
              Expand All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {VIVA_QUESTIONS.map((item, idx) => {
              const isExpanded = Boolean(expandedViva[idx]);
              return (
                <div 
                  key={idx}
                  style={{
                    background: '#0d1322',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleViva(idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                      {item.q}
                    </div>
                    {isExpanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', color: '#cbd5e1', fontSize: '0.86rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: 3-Minute Demo Script */}
      {activeSection === 'demo' && (
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            ⏱️ 3–5 Minute Review-2 Demonstration Script
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', lineHeight: '1.7' }}>
            <div style={{ background: '#0d1322', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
              <strong style={{ color: '#38bdf8' }}>Minute 0:00 - 1:00: Project Introduction & Architecture</strong>
              <p style={{ marginTop: '4px', color: '#cbd5e1' }}>
                "Respected panel members, our project is Project 418: Agentic AI-Based Smart Financial Advisory and Fraud Detection System. Unlike standard dashboards, our system is powered by an autonomous Orchestrator agent coordinating 4 specialist agents: Financial Advisory, Fraud Detection, Financial Health Analyst, and Explainer. It operates 100% locally on Windows using Node.js, SQLite, and React, with optional LLM assistance."
              </p>
            </div>

            <div style={{ background: '#0d1322', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <strong style={{ color: '#34d399' }}>Minute 1:00 - 2:15: Demonstrate Scenario 1 (Advisory) & Scenario 2 (Fraud)</strong>
              <p style={{ marginTop: '4px', color: '#cbd5e1' }}>
                "In the AI Agent Center, we launch Scenario 1. Notice how the Orchestrator classifies the intent, invokes calculateFinancialMetrics, and checks the 50/30/20 split and emergency fund runway. Next, we click Scenario 2: a high-value purchase of ₹18,500. The Fraud Detection Agent calculates a score of 55/100 (Medium Risk) due to the 5.7x amount spike and unfamiliar merchant, recommending Step-Up OTP verification."
              </p>
            </div>

            <div style={{ background: '#0d1322', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ color: '#fbbf24' }}>Minute 2:15 - 3:30: Demonstrate Scenario 3 (Combined Multi-Agent Exposure)</strong>
              <p style={{ marginTop: '4px', color: '#cbd5e1' }}>
                "Scenario 3 shows true multi-agent synergy: both Advisory and Fraud agents execute, and the Financial Health Agent correlates them: it flags that the ₹45,000 suspicious crypto transaction would wipe out 45% of the user's entire liquid emergency savings."
              </p>
            </div>

            <div style={{ background: '#0d1322', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
              <strong style={{ color: '#fb7185' }}>Minute 3:30 - 4:30: Scenario 5 (Truthful Tool Failure) & Automated Tests</strong>
              <p style={{ marginTop: '4px', color: '#cbd5e1' }}>
                "Finally, we demonstrate Scenario 5: we simulate a tool failure. The system truthfully records step.status = FAILED and stops without inventing results. In our backend, we have 31 passing unit and integration tests verifying all mathematical formulas, fraud rules, and agent workflows."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
