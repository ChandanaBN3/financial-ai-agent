# Multi-Agent Engine Specifications — Project 418

This document details the responsibilities, allowed tools, input/output schemas, error recovery strategies, and inter-agent communication protocols of each agent in Project 418.

---

## 1. Orchestrator / Supervisor Agent

- **File Path**: `server/src/agents/orchestrator.js`
- **Role**: Coordinates overall task lifecycle, classifies intent, constructs bounded plans, invokes specialist agents in order, captures execution traces, and recovers from errors.

### Responsibilities
1. **Task Intent Classification**: Analyzes user prompts and payloads to map to one of 5 supported workflows:
   - `FINANCIAL_ADVISORY`
   - `TRANSACTION_RISK`
   - `COMBINED_HEALTH`
   - `FINANCIAL_EDUCATION`
   - `TOOL_FAILURE_DEMO`
2. **Execution Plan Construction**: Builds an array of discrete steps, each linked to a responsible agent, intended action, and registered tool.
3. **Execution Loop & Context Routing**: Sequentially invokes plan steps, routing outputs from preceding steps to downstream specialists.
4. **Trace Recording**: Logs step ID, agent name, tool called, inputs, structured outputs, duration in milliseconds, and status (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).
5. **Enforcement of Security & Resource Boundaries**:
   - Max 6 execution steps per task.
   - 15-second execution timeout.
   - Strict allowlist verification against `ALLOWED_TOOLS`.
6. **Truthful Error Handling**: If a tool reports failure or throws an exception, the Orchestrator marks `status = 'FAILED'`, captures the exact error reason, stops downstream dependent steps, and never fabricates success.

---

## 2. Financial Advisory Agent

- **File Path**: `server/src/agents/financialAdvisoryAgent.js`
- **Role**: Evaluates personal income, expenditures, savings habits, and emergency preparedness.
- **Allowed Tools**: `['calculateFinancialMetrics', 'searchKnowledgeBase']`

### Inputs
- `monthly_income` (number, > 0)
- `monthly_expenses` (number, >= 0)
- `essential_expenses` (number, optional, <= monthly_expenses)
- `current_savings` (number, optional, default 0)
- `savings_goal` (number, optional)

### Tool Invocations
- Calls `calculateFinancialMetrics`: computes net cash flow, savings rate, emergency coverage in months, and 50/30/20 target deviations.
- If emergency runway is under 3 months, calls `searchKnowledgeBase` to retrieve emergency fund guidance.

### Output Schema
```json
{
  "agent": "Financial Advisory Agent",
  "status": "COMPLETED",
  "calculations": {
    "monthly_income": 100000,
    "monthly_expenses": 65000,
    "net_cash_flow": 35000,
    "savings_rate": 0.35,
    "emergency_coverage_months": 6.0
  },
  "assessment": {
    "budget_health_status": "HEALTHY",
    "stress_level": "LOW",
    "actionable_recommendations": ["..."]
  },
  "assumptions": ["All figures in INR", "Tax already deducted"],
  "disclaimer": "Educational prototype notice..."
}
```

---

## 3. Fraud Detection Agent

- **File Path**: `server/src/agents/fraudDetectionAgent.js`
- **Role**: Evaluates individual digital payment transactions for risk anomalies using transparent heuristic rules.
- **Allowed Tools**: `['scoreTransactionRisk', 'saveTransactionRecord', 'searchKnowledgeBase']`

### Inputs
- `amount` (number, in INR)
- `historical_average` (number, in INR)
- `velocity_24h` (number, tx count in last 24h)
- `timestamp` (ISO timestamp)
- `is_unfamiliar_merchant` (boolean)
- `is_unfamiliar_device` (boolean)
- `category` (string)
- `location_mismatch` (boolean)
- `merchant_name` (string)

### Scoring Logic
Points are awarded deterministically:
- `EXTREME_AMOUNT_SPIKE` (> 5x historical avg): +35 pts
- `HIGH_AMOUNT_SPIKE` (3x - 5x avg): +20 pts
- `MODERATE_AMOUNT_SPIKE` (2x - 3x avg): +10 pts
- `HIGH_VELOCITY` (> 10 tx/24h): +25 pts
- `MODERATE_VELOCITY` (6 - 10 tx/24h): +15 pts
- `ODD_HOURS` (1 AM to 5 AM IST): +15 pts
- `UNFAMILIAR_DEVICE`: +15 pts
- `UNFAMILIAR_MERCHANT` (> ₹3k): +15 pts
- `HIGH_RISK_CATEGORY` (Crypto/P2P/Gambling): +25 pts
- `LOCATION_ANOMALY`: +30 pts

Capped at 100.
- 0 to 29: `LOW` (Approve)
- 30 to 69: `MEDIUM` (Step-Up OTP)
- 70 to 100: `HIGH` (Block & Alert)

---

## 4. Financial Health / Analysis Agent

- **File Path**: `server/src/agents/financialHealthAgent.js`
- **Role**: Synthesizes cross-module correlations between advisory cash flow and transaction risks.
- **Allowed Tools**: `['getRecentTransactions']`

### Key Synergy
- Calculates **Emergency Fund Exposure**: If a flagged transaction of ₹45,000 occurs on an account with ₹1,00,000 in liquid savings, it alerts the user that 45% of their safety net is exposed.
- Calculates **Monthly Surplus Exposure**: Flags transactions that consume > 50% of monthly savings surplus.
- Assesses pattern velocity across recent transactions stored in SQLite.

---

## 5. Explanation and Reporting Agent

- **File Path**: `server/src/agents/explanationAgent.js`
- **Role**: Translates complex structured outputs and calculation results into accessible, non-expert explanations.
- **Allowed Tools**: `['searchKnowledgeBase']`

### Operating Modes
1. **Local Deterministic Template (Default)**:
   Generates structured markdown sections with financial highlights, triggered rules breakdown, cross-module alerts, knowledge citations, assumptions, and actionable steps.
2. **LLM-Assisted Mode (Optional Gemini API)**:
   Passes validated structured JSON outputs to Google Gemini with strict grounding instructions. The LLM summarizes verified data without hallucinating figures.

---

## 6. Optional LLM Planner

- **File Path**: `server/src/agents/llmPlanner.js`
- **Role**: Connects to Google Gemini API when `GEMINI_API_KEY` is provided.
- **Constraints**:
  - Bound strictly to allowlisted tools (`ALLOWED_TOOLS`).
  - Strict JSON schema validation.
  - Automatic fallback to deterministic local mode on API timeout (6,000 ms), rate limits, or missing keys.
