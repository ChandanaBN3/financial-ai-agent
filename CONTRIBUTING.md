# Contributing to Project 418

Thank you for your interest in contributing to the **Agentic AI-Based Smart Financial Advisory and Fraud Detection System**!

---

## 1. Development Prerequisites
- **Node.js**: v22.0.0 or higher (uses native `node:sqlite` and `node:test`).
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Git**: Git version 2.30+ installed.

---

## 2. Local Setup Instructions

```powershell
# 1. Clone repository
git clone https://github.com/<your-username>/financial-ai-agent.git
cd financial-ai-agent

# 2. Copy environment template
Copy-Item .env.example .env

# 3. Install all dependencies (root, backend, frontend)
npm run setup

# 4. Run automated test suite
npm test

# 5. Start development servers (Vite on 3000, Express on 5000)
npm run dev
```

---

## 3. Running Automated Tests
We use Node.js's built-in native test runner:
```powershell
# Run backend tests
npm --prefix server test

# Watch mode for backend tests
npm --prefix server run test:watch
```

All 31 unit and integration tests must pass prior to opening a pull request.

---

## 4. Coding Standards & Guidelines
- **Zero API Leaks:** Never commit `.env` files, API keys, or database files.
- **India-First Formatting:** All currency must use Indian Rupees (`₹`) via `Intl.NumberFormat('en-IN')`. Never hardcode USD.
- **Deterministic Math:** Financial calculations and fraud scores must remain in backend deterministic tools; do not let the LLM invent figures.
- **Truthful Error Handling:** If a tool fails, report `status = 'FAILED'`. Never fabricate a successful result.
