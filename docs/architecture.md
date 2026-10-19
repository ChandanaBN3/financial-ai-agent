# System Architecture — Project 418

## 1. Overview
**Project 418** is an **Agentic AI-Based Smart Financial Advisory and Fraud Detection System** designed specifically for the Indian financial context (INR ₹, 50/30/20 budgeting rule adapted for Indian metro living costs, and UPI transaction patterns).

Unlike monolithic financial dashboards with static scripts or isolated AI chatbots, Project 418 implements an **autonomous multi-agent architecture** governed by a Supervisor Orchestrator. The system coordinates deterministic financial planning, transparent heuristic fraud detection, cross-module exposure analysis, and grounded non-expert explanation.

---

## 2. Mermaid Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18 + Vite)"]
        UI["FinTech Dashboard UI"]
        AAC["AI Agent Center (Task Launcher & Scenario Buttons)"]
        TraceView["Real-time Execution Trace Viewer"]
        AdvView["Advisory Calculator & 50/30/20 Visualizer"]
        FraudView["Fraud Risk Scorer & Rule Inspector"]
        HistView["Transaction History & Audit Trail"]
    end

    subgraph API["Express.js API Gateway (Port 5000)"]
        RouteAgent["/api/agent/run & /api/agent/history"]
        RouteAdvisory["/api/advisory/calculate"]
        RouteFraud["/api/fraud/evaluate"]
        RouteTx["/api/transactions"]
        RouteKB["/api/knowledge"]
        RouteHealth["/api/health"]
    end

    subgraph MultiAgentSystem["Multi-Agent Core Engine"]
        Orchestrator["Supervisor Orchestrator Agent<br/>(Intent Classification & Bounded Planner)"]
        
        subgraph Specialists["Specialist Agent Modules"]
            FAA["Financial Advisory Agent"]
            FDA["Fraud Detection Agent"]
            FHA["Financial Health / Analysis Agent"]
            ERA["Explanation & Reporting Agent"]
        end

        subgraph ToolRegistry["Grounded Tool Registry (Strict Allowlist)"]
            T1["calculateFinancialMetrics"]
            T2["scoreTransactionRisk"]
            T3["searchKnowledgeBase"]
            T4["getRecentTransactions"]
            T5["saveTransactionRecord"]
            T6["simulateToolFailure"]
        end

        subgraph OptionalLLM["Optional LLM Engine"]
            LLMP["LLM Planner & Synthesizer<br/>(Google Gemini 2.5 Flash)"]
            Fallback["Automatic Deterministic Local Fallback<br/>(100% Offline & Free)"]
        end
    end

    subgraph Persistence["Storage & Knowledge Base"]
        DB[(Persistent SQLite Database<br/>node:sqlite native)]
        KB[(Local Knowledge Base<br/>5 Verified Indian Financial Docs)]
    end

    %% Interactions
    AAC -->|POST /api/agent/run| RouteAgent
    AdvView -->|POST /api/advisory/calculate| RouteAdvisory
    FraudView -->|POST /api/fraud/evaluate| RouteFraud
    HistView -->|GET /api/transactions| RouteTx

    RouteAgent --> Orchestrator
    RouteAdvisory --> T1
    RouteFraud --> T2
    RouteKB --> T3

    Orchestrator -->|1. Classify & Plan| Specialists
    Orchestrator -.->|Optional Planning| LLMP
    LLMP -.->|Fallback on error/no-key| Fallback

    FAA -->|Call| T1
    FAA -->|Query| T3
    FDA -->|Call| T2
    FDA -->|Persist| T5
    FHA -->|Query| T4
    ERA -->|Retrieve| T3
    ERA -.->|Synthesize Narrative| LLMP

    T4 --> DB
    T5 --> DB
    T3 --> KB

    Orchestrator -->|Execution Trace & Synthesis| TraceView
```

---

## 3. Agent Execution Sequence Diagram

The sequence diagram below illustrates how **Scenario 3 (Combined Financial Health)** executes across multiple specialist agents:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student
    participant UI as React UI (Agent Center)
    participant Orch as Supervisor Orchestrator
    participant Adv as Financial Advisory Agent
    participant Fraud as Fraud Detection Agent
    participant Health as Financial Health Agent
    participant Tools as Deterministic Tools
    participant DB as SQLite DB
    participant Exp as Explanation Agent

    User->>UI: Select "Scenario 3: Combined Financial Health"
    UI->>Orch: POST /api/agent/run (Income ₹1.1L, Expenses ₹70k, Tx ₹45k P2P Crypto)
    Note over Orch: Step 1: Validate payload & create bounded 5-step plan

    Orch->>Adv: Step 2: Invoke Financial Advisory Agent
    Adv->>Tools: calculateFinancialMetrics(income, expenses, savings)
    Tools-->>Adv: Return net cash flow (₹40,000), savings rate (36.4%), runway (2.7 mos)
    Adv-->>Orch: Record Step 2 Status: COMPLETED

    Orch->>Fraud: Step 3: Invoke Fraud Detection Agent
    Fraud->>Tools: scoreTransactionRisk(amount: ₹45,000, 11x avg, new merchant, P2P)
    Tools-->>Fraud: Return score: 85/100, HIGH RISK, BLOCK_TRANSACTION
    Fraud->>DB: Persist transaction record
    Fraud-->>Orch: Record Step 3 Status: COMPLETED

    Orch->>Health: Step 4: Invoke Financial Health Agent
    Health->>Tools: getRecentTransactions()
    Health-->>Health: Cross-module exposure analysis:<br/>₹45k flagged tx threatens 37.5% of liquid emergency reserve!
    Health-->>Orch: Record Step 4 Status: COMPLETED

    Orch->>Exp: Step 5: Invoke Explanation Agent
    Exp-->>Exp: Grounded synthesis using structured outputs, evidence, and warnings
    Exp-->>Orch: Final narrative generated
    Orch->>DB: Save complete agent run & execution trace
    Orch-->>UI: Return full execution trace + final synthesis
    UI-->>User: Display interactive step trace & formatted report
```

---

## 4. Key Architectural Decisions

### 4.1 Bounded Supervisor vs. Autonomous Loops
Unbounded agent loops can lead to infinite execution cycles, runaway API costs, or nondeterministic halts. In Project 418:
- The **Orchestrator** enforces a **maximum limit of 6 steps** per workflow.
- It enforces a **15,000 ms execution timeout**.
- It enforces a **strict tool allowlist** (`ALLOWED_TOOLS`). Any tool invocation outside the registry is rejected.

### 4.2 Grounded Deterministic Calculations vs. Generative Hallucinations
LLMs are notoriously prone to arithmetic hallucinations. In personal finance and fraud risk scoring, hallucinations are unacceptable:
- **Net Cash Flow, Savings Rate, 50/30/20 Deviations, and Emergency Buffer Runway** are calculated mathematically in `server/src/tools/advisoryCalculator.js`.
- **Fraud Risk Scores (0-100)** and triggered heuristic rules are scored deterministically in `server/src/tools/fraudScorer.js`.
- The optional LLM is strictly restricted to **synthesizing natural language explanations** from verified structured outputs.

### 4.3 Native Zero-Dependency SQLite (`node:sqlite`)
Instead of requiring native C++ build tools (like `node-gyp` or Visual Studio Build Tools which frequently fail on Windows during `better-sqlite3` installs), Project 418 uses Node.js 22's built-in `node:sqlite` (`DatabaseSync`). This guarantees 100% install reliability on Windows without external prerequisites.
