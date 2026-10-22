# MoneyWise – Personal Finance & Payment Safety Assistant

> A simple, private, beginner-friendly personal finance and digital payment safety web application tailored for everyday users in India.

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture & Agents](#-system-architecture--agents)
- [India-First Design & Localisation](#-india-first-design--localisation)
- [Technology Stack](#-technology-stack)
- [Quickstart Guide](#-quickstart-guide)
- [API Reference](#-api-reference)
- [Automated Testing & Verification](#-automated-testing--verification)
- [Privacy & Disclaimers](#-privacy--disclaimers)

---

## 🎯 Project Overview

MoneyWise is built for individuals and families in India who want to understand their monthly finances and protect themselves against unusual or risky digital payments (such as UPI QR scans and unexpected payment requests).

Key highlights:
- **No Financial Jargon**: All questions use conversational, plain language (e.g., *"How much do you receive each month?"* instead of *"Net Inflow"*).
- **100% Offline & Private**: Operates fully on your local machine using SQLite. No banking login, bank credentials, or third-party cloud uploads are required.
- **Multilingual Support**: Real-time language switching between English, ಕನ್ನಡ (Kannada), हिन्दी (Hindi), தமிழ் (Tamil), and తెలుగు (Telugu).
- **Deterministic Math**: Calculations (cash surplus/deficit, percentage spent, emergency runway) use pure mathematics with zero hallucinations.

---

## ✨ Key Features

1. **My Finances (Guided Financial Health)**:
   - Collects 4 simple figures: monthly income, total monthly expenses, current savings, and essential necessities.
   - Calculates monthly leftover money, percentage of income spent, and how many months your savings cushion will support basic necessities.
   - Generates 2–3 actionable, non-judgmental suggestions (e.g., surplus allocation, emergency buffer targets).

2. **Check a Payment (Transaction Risk Scoring)**:
   - Evaluates payment amounts, historical averages, 1-hour velocity spikes, and unfamiliar/first-time recipients.
   - Outputs a transparent risk level (**Low**, **Medium**, or **High**) along with understandable reasons and actionable next steps.
   - Helps prevent accidental transfers and common UPI frauds.

3. **Transaction History & Audit Trail**:
   - Persists evaluated checks in a local SQLite database (`node:sqlite`).
   - Filterable by risk level with search by payee name or transaction ID.

4. **Multi-Agent Coordination**:
   - **Coordinator Agent**: Directs user requests to the appropriate analysis engine.
   - **Financial Advisory Agent**: Evaluates cash flow, basic needs ratio, and runway.
   - **Fraud Detection Agent**: Analyzes transaction safety using transparent heuristic rules.

---

## 🏛️ System Architecture & Agents

```
                           [ Web Browser (React 18 + Vite) ]
                                          │
                    Language Context (en, kn, hi, ta, te)
                                          │
                    REST API Calls (/api/advisory, /api/fraud)
                                          │
                                          ▼
                ┌───────────────────────────────────────────────────┐
                │             Express.js Application                │
                └─────────────────────────┬─────────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │   Coordinator Agent  │      │  Financial Advisory  │      │   Fraud Detection    │
 │                      │      │        Agent         │      │        Agent         │
 │ • Routes requests    │      │ • Cash flow math     │      │ • Amount spike (5x)  │
 │ • Shared context     │      │ • 50/30/20 breakdown │      │ • Velocity burst     │
 │ • Graceful fallbacks │      │ • Savings runway     │      │ • Unfamiliar source  │
 └──────────────────────┘      └──────────┬───────────┘      └──────────┬───────────┘
                                          │                             │
                                          └──────────────┬──────────────┘
                                                         ▼
                                          ┌─────────────────────────────┐
                                          │    Local SQLite Database    │
                                          │  • Transactions Audit Log   │
                                          │  • Verified Knowledge Docs  │
                                          └─────────────────────────────┘
```

---

## 🌐 India-First Design & Localisation

- **Currency**: Indian Rupees (`₹`), with Indian numbering (Lakhs and Crores) and formatted currency tags.
- **Languages**: 
  - English (`en`)
  - ಕನ್ನಡ (`kn`) — Kannada
  - हिन्दी (`hi`) — Hindi
  - தமிழ் (`ta`) — Tamil
  - తెలుగు (`te`) — Telugu
- **Timezone**: Indian Standard Time (`IST`) for payment audit records.
- **Safety Helplines**: Displays National Cyber Crime Helpline (`1930`) advice on unfamiliar payment reviews.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, Lucide Icons |
| **Styling** | Modern responsive CSS, accessible contrast, system fonts |
| **Backend** | Node.js (v20+ or v22+), Express.js |
| **Database** | Native Node.js SQLite (`node:sqlite`) |
| **Internationalisation** | Built-in zero-dependency Context provider with client-side persistence |
| **Automated Tests** | Node.js native test runner (`node --test`) |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (version 20 or 22 recommended)
- Windows PowerShell, macOS Terminal, or Linux Bash

### Installation

```powershell
# 1. Clone or navigate to the project directory
cd "c:\Users\chand\financial-ai-agent"

# 2. Install dependencies
npm run setup
```

### Running the Application

**Option A: Run Server & Client Together (Development)**
```powershell
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

**Option B: Production Mode (Single Port)**
```powershell
# Build client and run server (Express serves dist files at root)
npm run build
npm start:server
```
- Open `http://localhost:5000` in any web browser.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, database connection, agent status |
| `POST` | `/api/advisory/calculate` | Compute monthly income, expenses, surplus, and runway |
| `POST` | `/api/fraud/evaluate` | Evaluate transaction risk and optionally persist to SQLite |
| `GET` | `/api/transactions` | Query evaluated transaction history with risk filters |
| `GET` | `/api/dashboard/summary` | Aggregate metrics and recent evaluations |
| `POST` | `/api/demo/reset` | Reset demo transaction records in SQLite |

---

## 🧪 Automated Testing & Verification

Run the test suite:
```powershell
npm test
```

### Test Suite Coverage:
- **31 test cases** across 6 test suites:
  - `test/advisory.test.js`: Positive profile, zero income, negative values, essentials > expenses validations.
  - `test/fraud.test.js`: Normal UPI payments, spike detection, unusual velocity, unfamiliar recipients, zero rupee verification probes.
  - `test/api.test.js`: Health check, advisory API, fraud API, transaction query API, reset demo API.
  - `test/database.test.js`: SQLite CRUD and metrics persistence.
  - `test/knowledge.test.js`: Rule querying and keyword retrieval.
  - `test/orchestrator.test.js`: Multi-agent coordination and fallback handling.

**Current Test Status**: `31 passed, 0 failed`.

---

## ⚠️ Privacy & Disclaimers

- **Educational & Informational Tool**: MoneyWise provides heuristic assessments based on mathematical budgeting models and rule-based safety patterns. It does not provide certified financial advice under SEBI regulations.
- **Payment Verification**: A "Low Risk" evaluation does not guarantee that a transfer is completely safe, nor does a "High Risk" score prove intentional fraud. Always confirm unfamiliar recipient phone numbers and UPI IDs before entering a UPI PIN.
