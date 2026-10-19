# 418 – Agentic AI-Based Smart Financial Advisory and Fraud Detection System

> **College Design Project 1 (CSE Third-Year) • Review-2 Implementation MVP**  
> An autonomous multi-agent financial advisory and digital payment fraud detection system tailored for the Indian financial context (INR ₹, 50/30/20 budgeting rule, and UPI patterns). Built from scratch with zero paid cloud dependencies, 100% offline local agent mode, persistent SQLite storage, and 31 automated backend tests.

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Multi-Agent System Architecture](#-multi-agent-system-architecture)
- [Five Demonstration Workflows](#-five-demonstration-workflows)
- [India-First FinTech Specifications](#-india-first-fintech-specifications)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Windows PowerShell Quickstart](#-windows-powershell-quickstart)
- [Local Agent Mode vs. LLM-Assisted Mode](#-local-agent-mode-vs-llm-assisted-mode)
- [Automated Backend Testing](#-automated-backend-testing)
- [REST API Reference](#-rest-api-reference)
- [Documentation Index](#-documentation-index)
- [Safe GitHub Push Guide](#-safe-github-push-guide)
- [Limitations & Review-3 Roadmap](#-limitations--review-3-roadmap)

---

## 🎯 Project Overview
In traditional fintech dashboards, financial advisory and fraud detection operate as disconnected, static tools. **Project 418** introduces a **multi-agent orchestration architecture** where an autonomous Supervisor Orchestrator breaks user goals into bounded plans, assigns specialist agents, routes shared context between them, captures auditable execution traces, and synthesizes grounded insights.

All mathematical formulas (cash flow, savings rate, emergency runway) and fraud risk scoring (0–100 heuristic points) are computed strictly by **deterministic backend tools**, eliminating arithmetic hallucinations.

---

## ✨ Key Features
1. **Real Multi-Agent Orchestration**: Supervisor Orchestrator coordinating Financial Advisor, Fraud Detector, Financial Health Analyst, and Explainer.
2. **Interactive Execution Trace**: Step-by-step visibility into agent actions, tool inputs, structured JSON outputs, execution duration in milliseconds, and status badges.
3. **5 Pre-Configured Demo Scenarios**: 1-click execution of Financial Advisory, Transaction Risk, Combined Multi-Agent Health, Financial Education, and Truthful Tool Failure.
4. **India-First Formatting**: Indian Rupee currency (`₹`), `en-IN` numbering (Lakhs and Crores), IST timezone timestamps, and UPI transaction patterns.
5. **Deterministic Heuristic Fraud Scorer**: 0–100 risk score based on amount deviation multipliers, 24h frequency, IST dormant hours (1 AM to 5 AM), and unfamiliar recipients.
6. **50/30/20 Budgeting Visualizer**: Visual breakdown adapted for Indian living costs with emergency fund runway analysis.
7. **Local Knowledge Retrieval**: Term-frequency and tag-based search across verified Indian financial education articles.
8. **Native Persistent SQLite**: Uses Node.js 22's built-in `node:sqlite` engine for zero-configuration persistent storage.
9. **Zero-Secret Local Mode**: Runs 100% offline without mandatory API keys, credit cards, or paid external subscriptions.

---

## 🏛️ Multi-Agent System Architecture

```
                                  [ User Interface (React + Vite) ]
                                                │
                                    POST /api/agent/run
                                                │
                                                ▼
                     ┌─────────────────────────────────────────────────────┐
                     │          Supervisor Orchestrator Agent              │
                     │  • Intent Classification  • Bounded 6-Step Planner  │
                     │  • Allowlist Enforcer     • Trace Auditor & Error   │
                     └─────────┬───────────────────────────────┬───────────┘
                               │                               │
                ┌──────────────┴──────────────┐                │ (Optional Plan / Summary)
                ▼                             ▼                ▼
     ┌───────────────────────┐   ┌───────────────────────┐  ┌───────────────────────┐
     │  Financial Advisory   │   │    Fraud Detection    │  │   Optional LLM API    │
     │         Agent         │   │         Agent         │  │ (Google Gemini Flash) │
     │  • calculateMetrics   │   │  • scoreRisk (0-100)  │  │  • 100% Local Fallback│
     └──────────┬────────────┘   └───────────┬───────────┘  └───────────────────────┘
                │                            │
                └──────────────┬─────────────┘
                               ▼
     ┌───────────────────────────────────────────────────┐
     │         Financial Health / Analysis Agent         │
     │  • Cross-Module Emergency Reserve Exposure Alert  │
     └─────────────────────────┬─────────────────────────┘
                               ▼
     ┌───────────────────────────────────────────────────┐
     │          Explanation & Reporting Agent            │
     │  • Grounded Synthesis with Evidence & Assumptions │
     └─────────────────────────┬─────────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────┐
        │       SQLite Database & Knowledge Base       │
        │ • Transactions  • Traces  • Educational Docs │
        └──────────────────────────────────────────────┘
```

### Specialist Agents
| Agent | Responsibility | Registered Allowed Tools |
|---|---|---|
| **Supervisor Orchestrator** | Task classification, bounded plan construction, error recovery, trace capture | Strictly coordinates specialists |
| **Financial Advisory Agent** | Cash flow, savings rate %, expense ratio %, emergency fund runway, 50/30/20 | `calculateFinancialMetrics`, `searchKnowledgeBase` |
| **Fraud Detection Agent** | 0-100 transparent heuristic risk score, triggered rules, recommended action | `scoreTransactionRisk`, `saveTransactionRecord` |
| **Financial Health Agent** | Evaluates if anomalous transactions deplete emergency funds or surplus | `getRecentTransactions` |
| **Explanation Agent** | Plain-language summary with evidence, assumptions, warnings, and next steps | `searchKnowledgeBase`, deterministic template / LLM |

---

## 🎯 Five Demonstration Workflows
In the **AI Agent Center** tab, 5 verified workflows demonstrate the full capabilities of the multi-agent system:

- **Scenario 1 — Financial Advisory**: *"Analyse my monthly finances and suggest how I can save more."* Calls calculation tool, computes cash flow and runway, and returns structured advice.
- **Scenario 2 — Transaction Risk**: *"Check whether this transaction looks suspicious."* Evaluates a ₹18,500 purchase (5.7x historical average) from an unfamiliar merchant, awarding 55/100 points (Medium Risk).
- **Scenario 3 — Combined Financial Health**: *"Review my finances and analyse risk exposure on recent transactions."* Coordinates Advisory and Fraud agents, alerting the user that a ₹45,000 flagged crypto transfer threatens 37.5% of their entire emergency cushion.
- **Scenario 4 — Financial Education**: *"What is the 50/30/20 budgeting rule and how do I build an emergency fund?"* Searches local knowledge base and cites verified passages.
- **Scenario 5 — Truthful Tool Failure**: Simulates upstream payment timeout, demonstrating truthful `status = 'FAILED'` recording without fabricating results.

---

## 🇮🇳 India-First FinTech Specifications
- **Currency & Formatting**: Indian Rupees (`₹`), `en-IN` locale (`₹1,50,000`), with Lakhs and Crores.
- **Payment Channels**: Fictional Indian payment descriptors (UPI, IMPS, NetBanking, RuPay/Debit Card).
- **Fictional Data**: Fictional merchants (Swiggy, Zepto, QuickGadgets Mumbai, Indian Oil Petrol Pump).
- **Timezone Aware**: Heuristic checks recognize dormant banking hours (01:00 AM to 05:00 AM IST).
- **Disclaimers**: Explicit notices that calculations are educational prototypes and not official SEBI or RBI advice.

---

## 💻 Technology Stack
- **Frontend**: React 18, Vite 6, Lucide React icons, modern CSS variables.
- **Backend**: Node.js v22 (native ES Modules), Express.js 4, CORS.
- **Database**: SQLite via Node.js 22's native `node:sqlite` (`DatabaseSync`), requiring zero C++ build tools on Windows.
- **AI Planning**: Grounded deterministic local planning (default) + optional Google Gemini 2.5 Flash.
- **Testing**: Node.js built-in native test runner (`node:test`) and strict assertions (`node:assert/strict`).

---

## 📂 Project Structure
```
financial-ai-agent/
├── package.json                   # Root package: setup, test, and concurrent dev scripts
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules for node_modules, SQLite db, .env
├── CONTRIBUTING.md                # Development and contribution guide
├── README.md                      # Primary project documentation
│
├── client/                        # React + Vite Frontend Application
│   ├── package.json
│   ├── vite.config.js             # Vite configuration with API proxy to port 5000
│   ├── index.html                 # App entry point with Plus Jakarta Sans font
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # Main dashboard coordinator
│       ├── index.css              # Custom fintech design system
│       ├── components/
│       │   ├── Navbar.jsx         # Live mode badge & navigation
│       │   ├── OverviewDashboard.jsx  # KPI cards & risk breakdown
│       │   ├── AgentCenter.jsx    # Primary AI Multi-Agent Orchestrator UI
│       │   ├── FinancialAdvisoryView.jsx # 50/30/20 calculator & visualizer
│       │   ├── FraudDetectionView.jsx    # Heuristic scoring & rule inspector
│       │   ├── TransactionHistoryView.jsx# SQLite transaction log & audit trail
│       │   ├── KnowledgeBaseView.jsx     # Keyword retrieval & article reader
│       │   └── ArchitectureView.jsx      # Architecture flow, Review-2 scope, viva Q&A
│       ├── services/
│       │   └── api.js             # REST API client
│       └── utils/
│           └── formatters.js      # India-First formatters (INR, Lakhs, IST)
│
├── server/                        # Express Backend & Multi-Agent Core Engine
│   ├── package.json
│   ├── src/
│   │   ├── server.js              # Server entry point (starts port 5000)
│   │   ├── app.js                 # Express app, middleware, routes mounting
│   │   ├── config/
│   │   │   └── constants.js       # Thresholds, rules, allowlist, disclaimers
│   │   ├── db/
│   │   │   ├── database.js        # Native node:sqlite connection & schema
│   │   │   └── repository.js      # CRUD operations, seeds, and demo reset
│   │   ├── tools/
│   │   │   ├── index.js           # Tool registry & strict allowlist executor
│   │   │   ├── advisoryCalculator.js # Deterministic personal finance math
│   │   │   ├── fraudScorer.js     # Deterministic transparent rule scorer
│   │   │   ├── knowledgeRetriever.js # Keyword relevance retrieval engine
│   │   │   ├── databaseTool.js    # Transaction queries & persistence
│   │   │   └── failureSimulatorTool.js # Scenario 5 controlled failure simulator
│   │   ├── agents/
│   │   │   ├── orchestrator.js    # Supervisor Orchestrator Agent
│   │   │   ├── financialAdvisoryAgent.js
│   │   │   ├── fraudDetectionAgent.js
│   │   │   ├── financialHealthAgent.js
│   │   │   ├── explanationAgent.js
│   │   │   └── llmPlanner.js      # Optional Gemini API connector with local fallback
│   │   ├── utils/
│   │   │   └── formatters.js      # Server formatting utilities
│   │   └── routes/
│   │       ├── health.js          # GET /api/health
│   │       ├── dashboard.js       # GET /api/dashboard/summary
│   │       ├── advisory.js        # POST /api/advisory/calculate
│   │       ├── fraud.js           # POST /api/fraud/evaluate
│   │       ├── agent.js           # POST /api/agent/run
│   │       ├── transactions.js    # GET /api/transactions
│   │       ├── knowledge.js       # GET /api/knowledge/search
│   │       └── demo.js            # POST /api/demo/reset
│   │
│   └── test/                      # 31 Automated Tests (node:test)
│       ├── advisory.test.js       # Financial math & edge case tests
│       ├── fraud.test.js          # Fraud scoring & rule trigger tests
│       ├── knowledge.test.js      # Keyword retrieval tests
│       ├── database.test.js       # SQLite CRUD & statistics tests
│       ├── orchestrator.test.js   # Multi-agent workflows & failure tests
│       └── api.test.js            # Express API endpoint integration tests
│
└── docs/                          # Detailed Review-2 Documentation
    ├── architecture.md            # Mermaid diagrams & sequence flows
    ├── agents.md                  # Agent role specifications & schemas
    ├── modules.md                 # Module purpose, inputs, and outputs
    ├── api.md                     # REST API specification & samples
    ├── testing.md                 # Test suite results & verification report
    ├── review2-demo-script.md     # 3–5 min live demonstration walkthrough
    ├── viva-questions.md          # 25+ viva questions with in-depth answers
    └── progress-report.md         # Review-2 scope-to-feature matrix (~50%)
```

---

## 🚀 Windows PowerShell Quickstart

### Prerequisites
- Node.js **v22.0.0 or higher** (verified with Node v22.18.0).
- Git installed.

### 1. Setup & Install Dependencies
Open **Windows PowerShell** in the project directory:

```powershell
# Copy the environment configuration template
Copy-Item .env.example .env

# Install dependencies across root, server, and client
npm run setup
```

### 2. Run Automated Backend Tests
Verify all 31 tests pass prior to launching:

```powershell
npm test
```
*Expected: 31 passed, 0 failed (~1.5s).*

### 3. Build Frontend Application
Verify the Vite production build succeeds:

```powershell
npm run build
```

### 4. Start Development Servers
Run both backend API (Port 5000) and frontend Vite server (Port 3000) concurrently:

```powershell
npm run dev
```

### 5. Access the Application
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API Gateway**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Alternatively, to run the backend standalone which also serves the built frontend: `npm run start:server` and open [http://localhost:5000](http://localhost:5000))*

---

## 🤖 Local Agent Mode vs. LLM-Assisted Mode

### Local Agent Mode (Default — 100% Offline & Free)
- **Status**: Active out-of-the-box.
- **Requires API Key?**: **No.**
- **How it works**: Planning, calculations, heuristic fraud scoring, and report synthesis use deterministic rule engines and template generators. No network calls or third-party costs.

### LLM-Assisted Mode (Optional)
- **Status**: Activated if `GEMINI_API_KEY` is added to `.env`.
- **How it works**: When configured, Google Gemini is permitted to propose execution plans using allowlisted tools and generate plain-language explanations from verified structured outputs.
- **Safety**: Strict schema validation prevents arbitrary tool execution. If the Gemini API fails, times out, or runs out of quota, the system **automatically falls back to Local Agent Mode**.

---

## 🧪 Automated Backend Testing

Run the test suite with:
```powershell
npm test
```

### Verified Test Areas (31 / 31 Passing)
- **Financial Formulas**: Cash flow surplus, savings rate, emergency runway, 50/30/20 target allocations.
- **Edge Cases**: Zero income, negative expenses, essential expenses exceeding total expenses, deficit stress levels.
- **Fraud Rules**: Amount multipliers (2x, 3x, 5x), 24h velocity spikes, IST odd hours (1 AM to 5 AM), zero-rupee probe attacks, negative amounts.
- **Multi-Agent Orchestration**: Scenarios 1 to 5 end-to-end execution, trace capture, and synthesis.
- **Truthful Error Handling**: Verification that a tool failure reports `status = 'FAILED'` without fabricating success.
- **SQLite Persistence**: Schema creation, transaction insertion, risk level filtering, agent run logging, demo reset.

---

## 📚 Documentation Index
For the college review panel and viva preparation, refer to the detailed documents in `/docs`:
- [Architecture & Sequence Diagrams](docs/architecture.md)
- [Multi-Agent Specifications](docs/agents.md)
- [Module Descriptions](docs/modules.md)
- [REST API Specification](docs/api.md)
- [Testing & Verification Report](docs/testing.md)
- [3–5 Minute Review-2 Demo Script](docs/review2-demo-script.md)
- [25+ Viva Examination Questions & Answers](docs/viva-questions.md)
- [Review-2 Scope Progress Report (~50%)](docs/progress-report.md)

---

## 🛡️ Safe GitHub Push Guide
To push this project to a clean GitHub repository after reviewing:

### Step 1: Verify Git Status and Staged Secrets
Ensure `.env` and SQLite database files are ignored:

```powershell
git status
```
*Verify that `.env` and `server/data/financial_agent.db` are NOT listed in untracked/staged files.*

### Step 2: Stage and Commit Clean Files
```powershell
git add .
git commit -m "feat: complete MVP for Project 418 Review-2 with multi-agent orchestration"
```

### Step 3: Create GitHub Repository & Push
1. Create a new repository named `financial-ai-agent` on [GitHub](https://github.com/new) (do NOT initialize with README).
2. Run the following commands in PowerShell:

```powershell
git remote add origin https://github.com/<your-username>/financial-ai-agent.git
git branch -M main
git push -u origin main
```

---

## 🚧 Limitations & Review-3 Roadmap
- **Prototype Status**: This system is a third-year engineering prototype for educational demonstration and does not connect to live banking networks or credit bureaus.
- **Heuristic Scoring**: Fraud scoring is deterministic and rule-based, not a trained production ML classifier.
- **Planned for Review-3**:
  1. Graph-based money mule network clustering.
  2. Dense vector embeddings (ChromaDB / FAISS) for semantic knowledge retrieval.
  3. Multi-month budget forecasting.
  4. Role-based user authentication.

---

## 📄 License
This repository is prepared for academic curriculum evaluation. The author can add their preferred open-source license (such as MIT or Apache 2.0) when publishing publicly.
