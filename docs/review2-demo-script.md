# Review-2 Demonstration Script (3–5 Minutes) — Project 418

This guide provides a live, step-by-step walkthrough for presenting **Project 418** to the college evaluation panel during Design Project 1 Review-2.

---

## 🎯 Presentation Objective
Demonstrate an active, working MVP of an **Agentic AI Financial Advisory & Fraud Detection System** built for India, proving that:
1. The AI Agent system is real, autonomous, and visible with step traces (not a hardcoded animation).
2. Calculations and fraud rules are deterministic and mathematically grounded (not LLM hallucinations).
3. The system works 100% locally and offline without requiring paid APIs or credit cards.
4. All 31 backend unit and integration tests pass.

---

## ⏱️ Step-by-Step Demonstration Timeline

### Part 1: Architecture & System Overview (1:00 min)
1. **Open Application**: Navigate to `http://localhost:5000` (or `http://localhost:3000`).
2. **Show Overview Dashboard**:
   - Point out the **Project 418** title and the **"Local Agent Mode (100% Offline)"** badge in the navbar.
   - Explain: *"Our project addresses the Indian personal finance and digital payment ecosystem. Notice all figures are formatted in Indian Rupees (₹) with Lakh/Crore denominations."*
   - Highlight the 4 KPI cards: Transactions Monitored in SQLite, Volume Evaluated, Average Risk Score, and Multi-Agent Architecture (5 Agents, 6 Tools).

---

### Part 2: Scenario 1 — Financial Advisory Agent (1:00 min)
1. Click the **"AI Agent Center"** tab in the navbar.
2. Click the **"Scenario 1: Financial Advisory"** preset button.
3. Show the input parameters:
   - Monthly Income: ₹85,000
   - Monthly Expenses: ₹52,000
   - Essential Expenses: ₹36,000
   - Current Liquid Savings: ₹1,80,000
4. Click **"Execute Workflow"**.
5. **Inspect the Execution Trace**:
   - Show Step 1: `Orchestrator` validates parameters.
   - Show Step 2: `Financial Advisory Agent` invokes `calculateFinancialMetrics`. Click to expand and show the exact input JSON and structured output JSON (Net cash flow: ₹33,000, Savings rate: 38.8%, Emergency runway: 5.0 months).
   - Show Step 3: `Explanation Agent` retrieves verified guidelines from the local knowledge base.
   - Point out the **Final Synthesized Explanation** formatted in plain language with evidence and assumptions.

---

### Part 3: Scenario 2 — Fraud Detection Agent (0:45 min)
1. In the AI Agent Center, click **"Scenario 2: Transaction Risk"**.
2. Notice the input values:
   - Transaction Amount: ₹18,500
   - Historical Average: ₹3,200 (5.7x spike)
   - Velocity: 7 transactions in 24 hours
   - Merchant: Unfamiliar first-time merchant
3. Click **"Execute Workflow"**.
4. **Inspect the Output**:
   - Point out the score: **55 / 100 (MEDIUM RISK)**.
   - Show the triggered heuristic rules: `HIGH_AMOUNT_SPIKE` (+20 pts), `UNFAMILIAR_MERCHANT` (+15 pts), `MODERATE_VELOCITY` (+15 pts).
   - Show the recommended policy action: `STEP_UP_AUTHENTICATION` (e.g., OTP or biometric check).
   - Explain: *"This is a transparent heuristic scoring engine. We explain false positive risks, such as festival shopping during Diwali, to non-experts."*

---

### Part 4: Scenario 3 — Combined Multi-Agent Synergy (0:45 min)
1. Click **"Scenario 3: Combined Financial Health"**.
2. Explain the setup:
   - The user has ₹1,20,000 in emergency savings.
   - A suspicious transaction of ₹45,000 is initiated to an unverified P2P crypto exchange.
3. Click **"Execute Workflow"**.
4. **Show the Cross-Module Insight**:
   - Show Step 2 (`Financial Advisory Agent`) and Step 3 (`Fraud Detection Agent`).
   - Highlight Step 5 (`Financial Health / Analysis Agent`): Point out the **"High Exposure Risk"** warning:
     > *"Flagged transaction of ₹45,000 represents 37.5% of your entire liquid emergency reserve! If fraudulent, it would severely deplete your safety cushion."*
   - Explain: *"This cross-module reasoning is where the Agentic architecture outperforms isolated dashboards."*

---

### Part 5: Scenario 5 — Truthful Tool Failure & Terminal Tests (0:30 min)
1. Click **"Scenario 5: Controlled Tool Failure"**.
2. Click **"Execute Workflow"**.
3. **Show Truthful Failure**:
   - Step 2 is highlighted in RED: `status = 'FAILED'`.
   - The error message shows: `Controlled Tool Failure: Simulated payment gateway timeout...`
   - Explain: *"Our supervisor enforces truthful status reporting. When a tool fails, it halts downstream dependent tasks and truthfully reports the error instead of hallucinating success."*
4. **Switch to PowerShell Terminal**:
   - Run `npm test`.
   - Show that all **31 tests pass with 0 failures** in ~1.5 seconds.

---

## 💡 Quick Tips for Viva Questions
- If asked: *"Is this an LLM or Machine Learning model?"*
  - Answer: *"The fraud engine uses transparent heuristic rules for deterministic auditing. The personal finance calculations use strict mathematical formulas. We provide an optional Gemini LLM integration for natural language explanation, but the system defaults to a 100% offline, deterministic local mode."*
- If asked: *"Where is the data stored?"*
  - Answer: *"In persistent local SQLite using Node.js 22's native node:sqlite DatabaseSync module, requiring zero external server configuration."*
