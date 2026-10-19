# Viva Examination Preparation Guide (25+ Questions & Answers) — Project 418

This document is prepared for CSE students facing internal and external viva panels for **Design Project 1 (Review-2)**.

---

### Q1. What is the title and approved objective of Project 418?
**Answer:**
**Title:** "418 – Agentic AI-Based Smart Financial Advisory and Fraud Detection System".
**Objective:** To build an autonomous multi-agent software system tailored for the Indian financial ecosystem that coordinates deterministic personal financial advisory, heuristic transaction fraud detection, cross-module exposure analysis, and grounded plain-language explanations.

---

### Q2. Why did you choose an Agentic AI architecture instead of a traditional monolithic web dashboard?
**Answer:**
In a traditional monolithic dashboard, calculation modules, risk scoring, and advice operate in isolated silos with hardcoded business logic. An Agentic AI architecture introduces:
1. **Dynamic Task Decomposition:** A Supervisor Orchestrator breaks complex user goals into bounded execution steps.
2. **Specialist Role Separation:** Dedicated agents (Advisor, Fraud Detector, Financial Analyst, Explainer) handle specific subtasks.
3. **Shared Context Routing:** Specialist outputs are passed dynamically to downstream agents (e.g. evaluating if an unfamiliar transaction threatens emergency savings).
4. **Auditable Execution Traces:** Every tool invocation, parameter, duration, and status is logged for verification.

---

### Q3. Name the 5 agents implemented in your backend and summarize their responsibilities.
**Answer:**
1. **Supervisor Orchestrator Agent (`orchestrator.js`):** Classifies user tasks, constructs bounded step plans, checks data sufficiency, enforces tool allowlists, logs execution traces, and handles error recovery.
2. **Financial Advisory Agent (`financialAdvisoryAgent.js`):** Validates monthly income/expenses, invokes `calculateFinancialMetrics`, and evaluates savings rate, runway, and 50/30/20 budget allocations.
3. **Fraud Detection Agent (`fraudDetectionAgent.js`):** Evaluates payment transactions against deterministic heuristic rules (amount multipliers, velocity, IST dormant hours), produces a 0-100 risk score, and recommends actions.
4. **Financial Health / Analysis Agent (`financialHealthAgent.js`):** Synthesizes cross-module correlations, calculating the percentage of emergency funds or monthly surplus exposed to flagged transactions.
5. **Explanation and Reporting Agent (`explanationAgent.js`):** Translates specialist findings into clear, grounded markdown explanations for non-experts, highlighting evidence, assumptions, and next steps.

---

### Q4. How does the Orchestrator decide which tools and agents to invoke?
**Answer:**
The Orchestrator utilizes intent classification on the user's prompt and structured input data. If financial figures (income/expenses) are provided, it plans the `FINANCIAL_ADVISORY` workflow. If transaction parameters (amount/merchant) are given, it plans `TRANSACTION_RISK`. If both are present, it selects `COMBINED_HEALTH`. For informational questions, it selects `FINANCIAL_EDUCATION`. Each workflow maps to a bounded sequence of allowlisted tools.

---

### Q5. What is the difference between Local Agent Mode and LLM-Assisted Mode?
**Answer:**
- **Local Agent Mode (Default):** Planning, calculations, risk scoring, and report synthesis run 100% offline using deterministic rule engines and template generators without paid APIs, credit cards, or external network calls.
- **LLM-Assisted Mode (Optional):** When a `GEMINI_API_KEY` is provided, Google Gemini 2.5 Flash is used to propose plans against allowlisted tools and generate natural language summaries from verified tool outputs. If the LLM API fails or times out, the system automatically falls back to Local Agent Mode.

---

### Q6. How do you prevent LLM hallucinations from corrupting financial figures or fraud scores?
**Answer:**
Through **Grounded Tool Execution**. The LLM is never allowed to perform mental arithmetic or invent risk scores. All mathematical metrics (cash flow, savings rate, emergency buffer) and fraud scores are computed strictly by deterministic backend JavaScript tools. The LLM only receives verified structured JSON outputs and is constrained to summarize those verified results.

---

### Q7. What tools are registered in your system and how is security enforced?
**Answer:**
Six allowlisted tools are registered in `server/src/tools/index.js`:
1. `calculateFinancialMetrics`
2. `scoreTransactionRisk`
3. `searchKnowledgeBase`
4. `getRecentTransactions`
5. `saveTransactionRecord`
6. `simulateToolFailure`

**Security Enforcement:** The Orchestrator verifies every tool call against `ALLOWED_TOOLS`. Disallowed tools are rejected immediately. The system never executes arbitrary code or model-generated SQL.

---

### Q8. How does the deterministic Fraud Detection Agent calculate risk scores?
**Answer:**
It uses a transparent, cumulative heuristic scoring algorithm (0 to 100 points):
- **Amount Spike vs Historical Average:** +10 pts for 2x-3x, +20 pts for 3x-5x, +35 pts for >5x.
- **24-Hour Velocity:** +15 pts for 6-10 tx, +25 pts for >10 tx in 24 hours.
- **Dormant Hours:** +15 pts for transactions between 01:00 AM and 05:00 AM IST.
- **Unfamiliar Device / Unfamiliar Merchant:** +15 pts each.
- **Monitored Category (Crypto/P2P/Gambling):** +25 pts.
- **Location Mismatch / IP Anomaly:** +30 pts.

Score Categories:
- **0 - 29 (LOW):** Standard transaction; action is `APPROVE`.
- **30 - 69 (MEDIUM):** Anomalous pattern; action is `STEP_UP_AUTHENTICATION` (OTP/biometric).
- **70 - 100 (HIGH):** Critical risk; action is `BLOCK_TRANSACTION` and secondary audit.

---

### Q9. Is your fraud detection system a machine learning model?
**Answer:**
No. It is an explicit, deterministic heuristic rule engine. Rule-based systems provide full auditability, zero training latency, and clear explainability, which is ideal for a university demonstration prototype. Machine learning systems, by contrast, learn high-dimensional behavioral patterns from massive datasets but can act as "black boxes." We explain these trade-offs clearly in our knowledge base.

---

### Q10. What are false positives and false negatives in your fraud detection module?
**Answer:**
- **False Positive:** A legitimate transaction is incorrectly flagged or blocked (e.g. a user making a genuine high-value hospital payment or festive Diwali shopping exceeding 5x historical average).
- **False Negative:** An actual fraudulent transaction slips through undetected (e.g. an attacker splitting stolen funds into small micro-transactions below ₹500 to evade single-transaction spike rules).

---

### Q11. How does the Financial Advisory Agent calculate Emergency Fund runway?
**Answer:**
Runway is calculated as:
$$\text{Emergency Runway (Months)} = \frac{\text{Current Liquid Savings}}{\text{Essential Monthly Expenses}}$$
In India, financial planners recommend 3 to 6 months of essential living expenses (rent, groceries, utilities, school fees) held in liquid instruments like high-interest savings accounts, sweep-in fixed deposits, or liquid mutual funds.

---

### Q12. What is the 50/30/20 rule and how is it adapted for Indian urban earners?
**Answer:**
The 50/30/20 rule allocates post-tax take-home monthly income into:
- **50% for Needs (Essentials):** Rent, EMIs, groceries (Zepto/Blinkit/kirana), electricity, school fees.
- **30% for Wants (Discretionary):** Dining out (Swiggy/Zomato), entertainment, OTT, shopping.
- **20% for Savings / Investments:** Emergency fund, PPF, NPS, equity mutual fund SIPs.
In Indian metro cities (Bengaluru, Mumbai, Delhi-NCR) where rent alone often consumes 35-40% of income, our system identifies the deviation and recommends a modified 60/20/20 budget.

---

### Q13. How does the Financial Health / Analysis Agent combine advisory and fraud outputs?
**Answer:**
It computes cross-module exposure:
$$\text{Emergency Fund Exposure \%} = \left(\frac{\text{Flagged Transaction Amount}}{\text{Current Liquid Savings}}\right) \times 100$$
If an unfamiliar transaction of ₹45,000 occurs on an account with ₹1,20,000 in liquid savings, it alerts the user that a single transaction threatens 37.5% of their entire safety cushion.

---

### Q14. What happens when a tool fails during orchestration (Scenario 5)?
**Answer:**
The Orchestrator implements **Truthful Status Reporting**:
1. It records `step.status = 'FAILED'`.
2. It captures the exact error message and tool code.
3. It halts downstream dependent steps.
4. The final synthesis reports the halt truthfully rather than fabricating a successful result.

---

### Q15. How does the local knowledge retrieval system work?
**Answer:**
It implements keyword and relevance retrieval over verified educational markdown documents. It tokenizes queries, removes English stop words, and scores documents using tag matches (+3.0 pts), title matches (+2.5 pts), and content frequency (+0.5 pts). If no documents meet the threshold, it truthfully reports that no relevant local sources were found.

---

### Q16. What database is used and what data does it store?
**Answer:**
We use persistent **SQLite** via Node.js 22's native `node:sqlite` (`DatabaseSync`). It persists:
1. `transactions`: ID, timestamp, amount, merchant, category, risk score, risk level, triggered rules JSON, status.
2. `agent_runs`: Run ID, timestamp, task prompt, workflow type, duration, step counts, execution trace JSON, final synthesis JSON.
3. `knowledge_docs`: Document ID, title, category, content, tags.

---

### Q17. Why is SQLite appropriate for this college design project?
**Answer:**
SQLite is zero-configuration, serverless, self-contained, and cross-platform. It requires no background database daemon (unlike MySQL or PostgreSQL), stores all data in a single file (`server/data/financial_agent.db`), and runs seamlessly on Windows without setup friction.

---

### Q18. How does the application implement India-First design requirements?
**Answer:**
- Currency displayed as Indian Rupees (₹) using `Intl.NumberFormat('en-IN')` with Lakhs and Crores.
- Payment methods reflect Indian standards: UPI, NetBanking, IMPS, Debit Card.
- Timestamps formatted in Indian Standard Time (IST, UTC+5:30).
- Educational materials address Indian regulations (RBI, NPCI, Cybercrime Helpline 1930).
- Zero US dollar symbols anywhere in the interface or documentation.

---

### Q19. How are API keys and sensitive secrets protected?
**Answer:**
Environment variables (like `GEMINI_API_KEY`) reside exclusively in the backend server (`server/.env`) and are never bundled into the client build. `.gitignore` strictly excludes `.env` files. If no API key is provided, the system defaults automatically to offline local mode.

---

### Q20. How did you test your application and what were the test outcomes?
**Answer:**
We created an automated backend test suite using Node's built-in test runner (`node --test`). It executes **31 test assertions** covering financial math, zero/negative edge cases, fraud scoring rules, keyword search, SQLite persistence, and all 5 multi-agent workflows. **All 31 tests pass with a 100% pass rate in ~1.5 seconds.**

---

### Q21. How do you handle edge cases such as zero income or negative expenses?
**Answer:**
Input validation occurs prior to calculation:
- Zero or negative income returns `{ success: false, code: 'INVALID_INCOME' }`.
- Negative expenses return `{ success: false, code: 'INVALID_EXPENSES' }`.
- Essential expenses exceeding total expenses return `{ success: false, code: 'ESSENTIALS_EXCEED_EXPENSES' }`.

---

### Q22. What is the execution trace shown in the UI and why is it important?
**Answer:**
The execution trace is a step-by-step audit log of the multi-agent workflow. It renders the responsible agent, tool invoked, input parameters, execution duration in milliseconds, status badge, and structured tool outputs. It proves the multi-agent coordination is real and auditable.

---

### Q23. How does the frontend communicate with the backend?
**Answer:**
The React frontend communicates with Express via JSON REST API endpoints (`/api/health`, `/api/agent/run`, `/api/advisory/calculate`, `/api/fraud/evaluate`, `/api/transactions`). In development, Vite proxies requests from port 3000 to port 5000.

---

### Q24. What is the current implementation progress against approved scope for Review-2?
**Answer:**
We have completed approximately 50-60% of the planned project scope:
- Multi-agent orchestration engine: **100% Implemented & Tested**
- Financial advisory calculation tools: **100% Implemented & Tested**
- Heuristic fraud scoring engine: **100% Implemented & Tested**
- SQLite persistence & audit traces: **100% Implemented & Tested**
- React UI dashboard with 5 demo scenarios: **100% Implemented & Tested**
- Advanced graph clustering and dense vector RAG are scheduled for Review-3.

---

### Q25. What features are planned for Review-3 and final semester submission?
**Answer:**
1. **Graph-based Money Mule Detection:** Visualizing multi-hop transaction networks.
2. **Dense Vector Embeddings:** Upgrading keyword search to semantic vector search using ChromaDB or FAISS.
3. **Multi-Month Budget Forecasting:** Projecting annual savings and inflation-adjusted retirement corpus.
4. **Role-Based User Authentication:** JWT-based login for personalized multi-user portfolios.
