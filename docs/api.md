# REST API Documentation — Project 418

Base URL: `http://localhost:5000/api`

---

## 1. System Health & Environment

### `GET /health`
Returns system status, active database engine, agent mode, and currency settings.

**Sample Response:**
```json
{
  "status": "HEALTHY",
  "project": "418 – Agentic AI-Based Smart Financial Advisory and Fraud Detection System",
  "timestamp": "2026-10-19T16:15:00.000Z",
  "uptime_seconds": 128,
  "database": {
    "type": "SQLite (node:sqlite)",
    "connected": true
  },
  "agent_mode": "LOCAL",
  "llm": {
    "provider": "Google Gemini",
    "configured": false,
    "active_model": "None (Deterministic Local Mode Active)"
  },
  "currency": "INR (₹)",
  "locale": "en-IN"
}
```

---

## 2. Dashboard Summary

### `GET /dashboard/summary`
Returns aggregate KPI metrics, transaction counts, risk score averages, and recent agent activity.

**Sample Response:**
```json
{
  "success": true,
  "metrics": {
    "total_transactions_analyzed": 6,
    "total_volume_inr": 145540,
    "average_risk_score": 27,
    "risk_breakdown": { "LOW": 4, "MEDIUM": 1, "HIGH": 1 },
    "recent_agent_runs_count": 3
  },
  "agent_system": {
    "active_mode": "LOCAL",
    "active_agents_count": 5,
    "registered_tools_count": 6
  },
  "recent_transactions": [...],
  "recent_runs": [...]
}
```

---

## 3. Financial Advisory

### `POST /advisory/calculate`
Executes deterministic personal finance calculations for cash flow, savings rate, emergency runway, and 50/30/20 comparison.

**Sample Request:**
```json
{
  "monthly_income": 100000,
  "monthly_expenses": 65000,
  "essential_expenses": 45000,
  "current_savings": 270000,
  "savings_goal": 500000
}
```

**Sample Response:**
```json
{
  "success": true,
  "currency": "INR",
  "metrics": {
    "monthly_income": 100000,
    "monthly_expenses": 65000,
    "essential_expenses": 45000,
    "discretionary_expenses": 20000,
    "net_cash_flow": 35000,
    "current_savings": 270000,
    "savings_rate": 0.35,
    "expense_ratio": 0.65,
    "emergency_coverage_months": 6.0,
    "target_emergency_fund": 270000,
    "emergency_shortfall": 0,
    "rule_50_30_20": {
      "actual": { "needs": 45000, "wants": 20000, "savings": 35000 },
      "target": { "needs": 50000, "wants": 30000, "savings": 20000 }
    },
    "goal_analysis": {
      "savings_goal": 500000,
      "remaining_target": 230000,
      "estimated_months": 7,
      "feasibility": "SHORT_TERM"
    }
  },
  "assessment": {
    "budget_health_status": "STRONG",
    "stress_level": "LOW",
    "findings": ["Excellent cash flow surplus...", "Robust emergency buffer..."],
    "warnings": [],
    "actionable_recommendations": ["Emergency reserve is fully funded..."]
  }
}
```

---

## 4. Fraud Detection

### `POST /fraud/evaluate`
Scores an individual digital payment transaction, detects anomalies, and persists the record to SQLite.

**Sample Request:**
```json
{
  "amount": 18500,
  "historical_average": 3200,
  "velocity_24h": 7,
  "merchant_name": "QuickDigital Gadgets Mumbai",
  "category": "Electronics",
  "payment_method": "UPI",
  "is_unfamiliar_merchant": true,
  "is_unfamiliar_device": false,
  "persist": true
}
```

**Sample Response:**
```json
{
  "success": true,
  "risk_score": 55,
  "risk_level": "MEDIUM",
  "recommended_action": "STEP_UP_AUTHENTICATION",
  "triggered_rules": [
    {
      "rule": "HIGH_AMOUNT_SPIKE",
      "points": 20,
      "description": "Amount (₹18,500) is 5.78x higher than historical average (₹3,200)."
    },
    {
      "rule": "MODERATE_VELOCITY",
      "points": 15,
      "description": "Elevated transaction frequency: 7 transactions in 24 hours."
    },
    {
      "rule": "UNFAMILIAR_MERCHANT",
      "points": 15,
      "description": "First-time transaction with merchant 'QuickDigital Gadgets Mumbai' exceeding ₹3,000 threshold."
    }
  ],
  "explanation": "Moderate risk identified (Score: 55/100). Deviation from standard profile noted. Recommended action is step-up OTP / UPI app confirmation.",
  "saved_record": {
    "transaction_id": "TXN-UPI-...",
    "amount": 18500,
    "status": "FLAGGED_REVIEW"
  }
}
```

---

## 5. Multi-Agent Orchestration

### `POST /agent/run`
Primary multi-agent entry point. Coordinates intent classification, bounded plan creation, tool invocations, and trace recording.

**Sample Request:**
```json
{
  "prompt": "Analyse my monthly finances and suggest how I can save more.",
  "workflowType": "FINANCIAL_ADVISORY",
  "inputData": {
    "monthly_income": 85000,
    "monthly_expenses": 52000,
    "essential_expenses": 36000,
    "current_savings": 180000
  },
  "mode": "LOCAL"
}
```

**Sample Response:**
```json
{
  "success": true,
  "run": {
    "run_id": "RUN-...",
    "workflow_type": "FINANCIAL_ADVISORY",
    "mode": "LOCAL",
    "status": "SUCCESS",
    "duration_ms": 118,
    "steps_count": 3,
    "execution_trace": [
      {
        "step_id": 1,
        "agent": "Orchestrator / Supervisor Agent",
        "action": "VALIDATE_AND_PREPARE",
        "status": "COMPLETED",
        "duration_ms": 2
      },
      {
        "step_id": 2,
        "agent": "Financial Advisory Agent",
        "action": "EXECUTE_ADVISORY",
        "tool": "calculateFinancialMetrics",
        "status": "COMPLETED",
        "duration_ms": 84,
        "inputs": { "monthly_income": 85000, "monthly_expenses": 52000 },
        "outputs": { ... }
      },
      {
        "step_id": 3,
        "agent": "Explanation and Reporting Agent",
        "action": "SEARCH_KNOWLEDGE",
        "tool": "searchKnowledgeBase",
        "status": "COMPLETED",
        "duration_ms": 18
      }
    ],
    "final_synthesis": {
      "explanation": "### 📊 Financial Advisory Assessment\n\n...",
      "evidence": [...],
      "warnings": [...],
      "next_steps": [...]
    }
  }
}
```

### `GET /agent/history?limit=10`
Returns recent multi-agent runs from SQLite.

---

## 6. Transaction History

- `GET /transactions?risk_level=HIGH&limit=20` — Filter transactions by risk level.
- `GET /transactions/stats` — Summary of volumes and counts.
- `GET /transactions/:id` — Details of a specific transaction.

---

## 7. Knowledge Base

- `GET /knowledge/search?q=50/30/20` — Keyword search returning ranked passages.
- `GET /knowledge/docs` — Full list of all verified educational documents.

---

## 8. Demo Data Reset

### `POST /demo/reset`
Clears existing runtime data and re-seeds the SQLite database with pristine Indian transactions and educational articles.
