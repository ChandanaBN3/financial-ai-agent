import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  Terminal,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Info
} from 'lucide-react';
import { runAgentWorkflow } from '../services/api';
import { formatINR, formatPercentage, formatTimestampIST } from '../utils/formatters';

const SCENARIO_PRESETS = {
  SCENARIO_1: {
    title: 'Scenario 1: Financial Advisory',
    workflowType: 'FINANCIAL_ADVISORY',
    prompt: 'Analyse my monthly finances and suggest how I can save more.',
    description: 'Evaluates personal cash flow, savings rate, emergency reserve, and 50/30/20 split using deterministic tools.',
    inputs: {
      monthly_income: 85000,
      monthly_expenses: 52000,
      essential_expenses: 36000,
      current_savings: 180000,
      savings_goal: 500000
    }
  },
  SCENARIO_2: {
    title: 'Scenario 2: Transaction Risk',
    workflowType: 'TRANSACTION_RISK',
    prompt: 'Check whether this transaction looks suspicious.',
    description: 'Runs deterministic heuristic scoring on a high-value purchase with unfamiliar merchant signals.',
    inputs: {
      amount: 18500,
      historical_average: 3200,
      velocity_24h: 7,
      merchant_name: 'QuickDigital Gadgets Mumbai',
      category: 'Electronics',
      payment_method: 'UPI',
      is_unfamiliar_merchant: true,
      is_unfamiliar_device: false
    }
  },
  SCENARIO_3: {
    title: 'Scenario 3: Combined Financial Health',
    workflowType: 'COMBINED_HEALTH',
    prompt: 'Review my finances and analyse risk exposure on recent transactions.',
    description: 'Coordinates both Advisory and Fraud specialist agents to identify if anomalous spending threatens emergency reserves.',
    inputs: {
      monthly_income: 110000,
      monthly_expenses: 70000,
      essential_expenses: 45000,
      current_savings: 120000,
      amount: 45000,
      historical_average: 4000,
      merchant_name: 'Offshore P2P Virtual Assets',
      category: 'Virtual Assets / P2P',
      payment_method: 'IMPS',
      is_unfamiliar_merchant: true,
      is_unfamiliar_device: true
    }
  },
  SCENARIO_4: {
    title: 'Scenario 4: Financial Education',
    workflowType: 'FINANCIAL_EDUCATION',
    prompt: 'What is the 50/30/20 budgeting rule and how do I build an emergency fund in India?',
    description: 'Retrieves matched educational passages and citations from the verified local knowledge base.',
    inputs: {
      query: '50/30/20 budgeting emergency fund rules'
    }
  },
  SCENARIO_5: {
    title: 'Scenario 5: Controlled Tool Failure',
    workflowType: 'TOOL_FAILURE_DEMO',
    prompt: 'Demonstrate controlled tool failure for review evaluation',
    description: 'Causes intentional tool exception to verify truthful failure reporting without fabricating a successful result.',
    inputs: {
      simulated_reason: 'Simulated payment gateway timeout and invalid constraint'
    }
  }
};

export default function AgentCenter({ initialScenario = null, healthData, onWorkflowCompleted }) {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState(initialScenario || 'SCENARIO_1');
  const [prompt, setPrompt] = useState(SCENARIO_PRESETS[initialScenario || 'SCENARIO_1'].prompt);
  const [workflowType, setWorkflowType] = useState(SCENARIO_PRESETS[initialScenario || 'SCENARIO_1'].workflowType);
  const [inputData, setInputData] = useState(SCENARIO_PRESETS[initialScenario || 'SCENARIO_1'].inputs);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [activeRunResult, setActiveRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isLLMAvailable = healthData?.agent_mode === 'LLM_ASSISTED';
  const [requestedMode, setRequestedMode] = useState(isLLMAvailable ? 'LLM_ASSISTED' : 'LOCAL');

  const handleSelectScenario = (key) => {
    setSelectedScenarioKey(key);
    const preset = SCENARIO_PRESETS[key];
    setPrompt(preset.prompt);
    setWorkflowType(preset.workflowType);
    setInputData({ ...preset.inputs });
    setActiveRunResult(null);
    setErrorMsg(null);
    setExpandedSteps({});
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const response = await runAgentWorkflow({
        prompt,
        workflowType,
        inputData,
        mode: requestedMode
      });

      if (!response.success) {
        setErrorMsg(response.error || 'Failed to execute agent workflow');
      } else {
        setActiveRunResult(response.run);
        // Default expand first step and failed step if any
        const initialExpanded = { 0: true };
        response.run.execution_trace.forEach((step, idx) => {
          if (step.status === 'FAILED') initialExpanded[idx] = true;
        });
        setExpandedSteps(initialExpanded);
        if (onWorkflowCompleted) onWorkflowCompleted();
      }
    } catch (err) {
      setErrorMsg(`Agent communication exception: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleStepExpand = (idx) => {
    setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info"><Bot size={13} /> Central Autonomous Feature</span>
              <span className={requestedMode === 'LLM_ASSISTED' ? 'badge badge-info' : 'badge badge-local'}>
                <Cpu size={12} /> {requestedMode === 'LLM_ASSISTED' ? 'LLM-Assisted Mode' : 'Local Agent Mode'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Multi-Agent Orchestration Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Supervisor-led workflow coordinating Financial Advisor, Fraud Detector, Financial Analyst, and Explainer agents.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0d1322', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORCHESTRATION MODE:</span>
            <button
              onClick={() => setRequestedMode('LOCAL')}
              className={`btn btn-sm ${requestedMode === 'LOCAL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Local Deterministic
            </button>
            <button
              onClick={() => setRequestedMode('LLM_ASSISTED')}
              disabled={!isLLMAvailable}
              className={`btn btn-sm ${requestedMode === 'LLM_ASSISTED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: isLLMAvailable ? 1 : 0.4 }}
              title={isLLMAvailable ? 'Use Gemini LLM API for planning' : 'Configure GEMINI_API_KEY in .env to enable'}
            >
              LLM-Assisted {isLLMAvailable ? '' : '(No API Key)'}
            </button>
          </div>
        </div>

        {/* 5 Scenario Presets Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {Object.entries(SCENARIO_PRESETS).map(([key, item]) => {
            const isSelected = selectedScenarioKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectScenario(key)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem' }}
              >
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Task Configuration & Launch */}
      <div className="grid-3">
        {/* Left 2 Cols: Prompt & Inputs */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              📝 Task Configuration & Payload
            </h2>
            <span className="badge badge-info">{workflowType}</span>
          </div>

          <div className="form-group">
            <label className="form-label">User Task Prompt</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your financial or fraud analysis prompt..."
            />
          </div>

          {/* Dynamic Scenario Input Fields */}
          <div style={{ background: '#0d1322', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '12px' }}>
              PARAMETERS SUPPLIED TO ORCHESTRATOR
            </div>

            {(workflowType === 'FINANCIAL_ADVISORY' || workflowType === 'COMBINED_HEALTH') && (
              <div className="grid-2" style={{ marginBottom: '10px' }}>
                <div>
                  <label className="form-label">Monthly Income (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.monthly_income || ''}
                    onChange={(e) => setInputData({ ...inputData, monthly_income: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.monthly_expenses || ''}
                    onChange={(e) => setInputData({ ...inputData, monthly_expenses: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Essential Living Expenses (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.essential_expenses || ''}
                    onChange={(e) => setInputData({ ...inputData, essential_expenses: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Current Liquid Savings (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.current_savings || ''}
                    onChange={(e) => setInputData({ ...inputData, current_savings: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {(workflowType === 'TRANSACTION_RISK' || workflowType === 'COMBINED_HEALTH') && (
              <div className="grid-2" style={{ marginBottom: '10px' }}>
                <div>
                  <label className="form-label">Transaction Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.amount || ''}
                    onChange={(e) => setInputData({ ...inputData, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Historical Average (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.historical_average || ''}
                    onChange={(e) => setInputData({ ...inputData, historical_average: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Merchant Name / Payee</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inputData.merchant_name || ''}
                    onChange={(e) => setInputData({ ...inputData, merchant_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">24-Hour Velocity (Tx Count)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputData.velocity_24h || 1}
                    onChange={(e) => setInputData({ ...inputData, velocity_24h: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {workflowType === 'FINANCIAL_EDUCATION' && (
              <div>
                <label className="form-label">Knowledge Search Query</label>
                <input
                  type="text"
                  className="form-input"
                  value={inputData.query || ''}
                  onChange={(e) => setInputData({ ...inputData, query: e.target.value })}
                />
              </div>
            )}

            {workflowType === 'TOOL_FAILURE_DEMO' && (
              <div style={{ color: '#fb7185', fontSize: '0.85rem' }}>
                ⚠️ <strong>Scenario 5 Notice:</strong> This will intentionally invoke <code>simulateToolFailure</code> with simulated service timeout to prove truthful error reporting in the execution trace.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Execution timeout: 15s • Max steps: 6 • Grounded allowlist
            </div>
            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              <Play size={16} />
              <span>{isRunning ? 'Orchestrating...' : 'Execute Workflow'}</span>
            </button>
          </div>

          {errorMsg && (
            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: '#fb7185', fontSize: '0.88rem' }}>
              ❌ {errorMsg}
            </div>
          )}
        </div>

        {/* Right Col: Active Agents Architecture Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            🤖 Active Agents & Tool Registry
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', background: '#0d1322', borderRadius: '8px', borderLeft: '3px solid #0ea5e9' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>Orchestrator / Supervisor</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Task classification, bounded planning, trace recording.</div>
            </div>
            <div style={{ padding: '10px', background: '#0d1322', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>Financial Advisory Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tool: <code>calculateFinancialMetrics</code></div>
            </div>
            <div style={{ padding: '10px', background: '#0d1322', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>Fraud Detection Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tools: <code>scoreTransactionRisk</code>, <code>saveTransactionRecord</code></div>
            </div>
            <div style={{ padding: '10px', background: '#0d1322', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>Financial Health / Analysis Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tool: <code>getRecentTransactions</code>, Cross-module exposure.</div>
            </div>
            <div style={{ padding: '10px', background: '#0d1322', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>Explanation & Reporting Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tool: <code>searchKnowledgeBase</code>, Grounded synthesis.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Results & Trace Section */}
      {activeRunResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Run Status Banner */}
          <div className="card" style={{
            borderColor: activeRunResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
            background: activeRunResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    {activeRunResult.run_id}
                  </span>
                  <span className={`badge ${activeRunResult.status === 'SUCCESS' ? 'badge-low' : 'badge-high'}`}>
                    {activeRunResult.status === 'SUCCESS' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {activeRunResult.status}
                  </span>
                  <span className="badge badge-local">{activeRunResult.mode}</span>
                  <span className="badge badge-info">{activeRunResult.workflow_type}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Total Duration: <strong style={{ color: '#fff' }}>{activeRunResult.duration_ms} ms</strong> • Steps Executed: <strong style={{ color: '#fff' }}>{activeRunResult.steps_count}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Persisted to SQLite • {formatTimestampIST(activeRunResult.timestamp)}
              </div>
            </div>
          </div>

          {/* Expandable Step-by-Step Execution Trace */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  🔍 Execution Trace (Step-by-Step Real Tool Invocations)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Auditable execution log displaying agents invoked, registered tools, inputs, structured outputs, and truthful statuses.
                </p>
              </div>
              <button
                onClick={() => {
                  const allExpanded = {};
                  activeRunResult.execution_trace.forEach((_, idx) => { allExpanded[idx] = true; });
                  setExpandedSteps(allExpanded);
                }}
                className="btn btn-secondary btn-sm"
              >
                Expand All Steps
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeRunResult.execution_trace.map((step, idx) => {
                const isExpanded = Boolean(expandedSteps[idx]);
                const isSuccess = step.status === 'COMPLETED';
                const isFailed = step.status === 'FAILED';

                return (
                  <div 
                    key={step.step_id || idx}
                    className={`trace-step ${isSuccess ? 'completed' : isFailed ? 'failed' : 'running'}`}
                  >
                    <div 
                      onClick={() => toggleStepExpand(idx)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: isSuccess ? '#34d399' : '#fb7185',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {step.step_id || idx + 1}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{step.agent}</span>
                            <span className={`badge ${isSuccess ? 'badge-low' : 'badge-high'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {step.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Action: <code>{step.action}</code> {step.tool ? <>• Tool: <code style={{ color: '#38bdf8' }}>{step.tool}</code></> : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          {step.duration_ms} ms
                        </span>
                        {isExpanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Step Expansion: Inputs & Outputs */}
                    {isExpanded && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {step.error && (
                          <div style={{ padding: '10px 14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px', color: '#fb7185', fontSize: '0.84rem' }}>
                            <strong>Truthful Step Failure:</strong> {step.error}
                          </div>
                        )}

                        <div className="grid-2">
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                              TOOL INPUT PARAMETERS
                            </div>
                            <pre style={{ background: '#060a12', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#cbd5e1', overflowX: 'auto', border: '1px solid #1e293b' }}>
                              {JSON.stringify(step.inputs || {}, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                              STRUCTURED TOOL OUTPUT
                            </div>
                            <pre style={{ background: '#060a12', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#cbd5e1', overflowX: 'auto', border: '1px solid #1e293b' }}>
                              {JSON.stringify(step.outputs || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Synthesized Explanation Card */}
          <div className="card" style={{ background: '#0d1322', borderColor: 'rgba(14, 165, 233, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    Final Synthesized Explanation (Explanation Agent)
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Mode: {activeRunResult.final_synthesis?.mode} • Grounded strictly in verified tool outputs
                  </div>
                </div>
              </div>
              <span className={activeRunResult.final_synthesis?.is_llm_generated ? 'badge badge-info' : 'badge badge-local'}>
                {activeRunResult.final_synthesis?.is_llm_generated ? 'Generative LLM Synthesis' : 'Deterministic Template Engine'}
              </span>
            </div>

            {/* Markdown narrative body */}
            <div style={{
              background: '#080d1a',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '20px',
              fontSize: '0.92rem',
              lineHeight: '1.7',
              color: '#e2e8f0',
              whiteSpace: 'pre-line',
              marginBottom: '16px'
            }}>
              {activeRunResult.final_synthesis?.explanation}
            </div>

            {/* Evidence & Action Items */}
            {activeRunResult.final_synthesis?.evidence?.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                  GROUNDED EVIDENCE EXTRACTED FROM TOOLS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeRunResult.final_synthesis.evidence.map((ev, i) => (
                    <span key={i} style={{ background: '#172033', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      <strong>{ev.tool}</strong>: {ev.summary}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings if any */}
            {activeRunResult.final_synthesis?.warnings?.length > 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '0.84rem', marginBottom: '4px' }}>
                  <AlertTriangle size={15} />
                  <span>Warnings & Assumptions:</span>
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#fed7aa' }}>
                  {activeRunResult.final_synthesis.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
