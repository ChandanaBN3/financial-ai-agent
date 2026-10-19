# System Modules Specification — Project 418

This document details the purpose, inputs, internal processing logic, and outputs for all major modules in **Project 418**.

---

## 1. Supervisor Orchestrator Module (`server/src/agents/orchestrator.js`)
- **Purpose**: Acts as the central supervisor for all AI workflows. Enforces bounded plans, step timeouts, and truthful execution tracing.
- **Inputs**: Task prompt string, optional `workflowType` override, `inputData` object, execution `mode` (`LOCAL` or `LLM_ASSISTED`).
- **Processing**:
  1. Classifies task into one of 5 supported workflows.
  2. Constructs bounded step execution plan.
  3. Sequentially executes steps with duration tracking.
  4. Enforces allowlist security (`ALLOWED_TOOLS`).
  5. Catches errors truthfully and routes context to downstream agents.
  6. Persists run metadata and trace to SQLite.
- **Outputs**: Complete run record containing `run_id`, `status` (`SUCCESS` or `FAILED`), `duration_ms`, `execution_trace` array, `final_synthesis`, and `specialist_outputs`.

---

## 2. Financial Advisory Module (`server/src/tools/advisoryCalculator.js`)
- **Purpose**: Provides mathematical personal finance calculations tailored for Indian salaried earners.
- **Inputs**: `monthly_income`, `monthly_expenses`, `essential_expenses`, `current_savings`, `savings_goal`.
- **Processing**:
  1. Validates inputs: rejects zero or negative income/expenses, checks essentials <= expenses.
  2. Calculates:
     - `Net Cash Flow = Income - Expenses`
     - `Savings Rate = Net Cash Flow / Income`
     - `Expense Ratio = Expenses / Income`
     - `Emergency Runway = Current Savings / Essential Monthly Expenses`
     - `50/30/20 Comparison`: Needs target (50%), Wants target (30%), Savings target (20%).
  3. Classifies budget pressure: `HEALTHY`, `HIGH_PRESSURE`, `CRITICAL_DEFICIT`.
- **Outputs**: Structured calculation metrics, health classifications, budget warnings, and actionable recommendations in INR (₹).

---

## 3. Fraud Detection Engine Module (`server/src/tools/fraudScorer.js`)
- **Purpose**: Computes transparent, deterministic risk scores for digital payments (UPI, IMPS, Cards).
- **Inputs**: `amount`, `historical_average`, `velocity_24h`, `timestamp`, `is_unfamiliar_merchant`, `is_unfamiliar_device`, `category`, `location_mismatch`.
- **Processing**:
  1. Verifies non-negative amount. Identifies ₹0 probing attacks.
  2. Computes Amount Anomaly Ratio (`amount / historical_average`).
  3. Evaluates IST dormant hours (01:00 to 05:00 AM IST).
  4. Accumulates weighted rule points (0 to 100).
  5. Assigns risk tier: `LOW` (0-29), `MEDIUM` (30-69), `HIGH` (70-100).
  6. Recommends policy action: `APPROVE`, `STEP_UP_AUTHENTICATION`, `BLOCK_TRANSACTION`.
- **Outputs**: Numerical score, risk category, array of triggered rules with point values, human explanation, false positive/negative education, and disclaimer.

---

## 4. Cross-Module Financial Health Analyst (`server/src/agents/financialHealthAgent.js`)
- **Purpose**: Evaluates cross-module interactions between advisory metrics and transaction risks.
- **Inputs**: Output of Financial Advisory Agent, output of Fraud Detection Agent, recent transactions from database.
- **Processing**:
  1. Computes percentage of emergency fund exposed to flagged transactions.
  2. Computes percentage of monthly savings surplus consumed by flagged transactions.
  3. Audits recent transaction velocity in SQLite for high-risk cluster patterns.
  4. Assigns holistic financial health grade (`ROBUST`, `STABLE`, `FAIR`, `AT_RISK`).
- **Outputs**: Overall health grade, correlation alerts array, combined insights, and missing data reports.

---

## 5. Local Knowledge Base & Retrieval Module (`server/src/tools/knowledgeRetriever.js`)
- **Purpose**: Implements keyword-based search over verified Indian financial education documents.
- **Inputs**: Query string, limit count, minimum relevance threshold.
- **Processing**:
  1. Tokenizes search query and strips common stopwords.
  2. Computes term match scores: tag matches (+3.0), title matches (+2.5), content frequency (+0.5 per hit).
  3. Extracts contextual snippet around matching keywords.
  4. If no document meets threshold, returns a truthful "No sufficiently relevant local source was found" message.
- **Outputs**: Count of matches, ranked document list with relevance scores, matched tags, and snippets.

---

## 6. SQLite Database & Repository Module (`server/src/db/repository.js`)
- **Purpose**: Provides persistent, zero-dependency data storage using Node.js 22's native `node:sqlite`.
- **Inputs**: SQL parameters, transaction objects, agent run payloads.
- **Processing**:
  1. Auto-creates schema (`transactions`, `agent_runs`, `knowledge_docs`).
  2. Executes parameterized prepared statements to prevent SQL injection.
  3. Serializes/deserializes JSON columns (`triggered_rules`, `execution_trace`, `final_synthesis`).
  4. Supports filtering, aggregations, and demo data reset.
- **Outputs**: Persisted transaction records, audit traces, aggregate statistics.

---

## 7. React FinTech Dashboard Client (`client/src/`)
- **Purpose**: Responsive, accessible user interface for students, faculty, and evaluators.
- **Components**:
  - `Navbar`: Live agent mode badge, tab navigation, demo data reset button.
  - `OverviewDashboard`: High-level KPI metrics, risk distribution bar, quick scenario launchers.
  - `AgentCenter`: Primary interactive centerpiece with scenario presets, parameter inputs, step-by-step trace inspection, and synthesis viewer.
  - `FinancialAdvisoryView`: Form with preset Indian profiles, 50/30/20 visual breakdown, and runway gauge.
  - `FraudDetectionView`: Transaction scoring form, scenario presets, triggered rule inspector.
  - `TransactionHistoryView`: Filterable audit trail table with inspection modal.
  - `KnowledgeBaseView`: Interactive educational search and full article reader.
  - `ArchitectureView`: Architecture flow diagrams, Review-2 scope table, 25+ viva questions, and 3-min presentation script.
