import { getDatabase } from './database.js';

export class Repository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  // --- Transactions ---

  insertTransaction(tx) {
    const stmt = this.db.prepare(`
      INSERT INTO transactions (
        transaction_id, timestamp, amount, merchant, category, payment_method,
        historical_average, risk_score, risk_level, triggered_rules, explanation, status, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tx.transaction_id,
      tx.timestamp || new Date().toISOString(),
      Number(tx.amount),
      tx.merchant,
      tx.category || 'General',
      tx.payment_method || 'UPI',
      Number(tx.historical_average || tx.amount),
      Number(tx.risk_score || 0),
      tx.risk_level || 'LOW',
      typeof tx.triggered_rules === 'string' ? tx.triggered_rules : JSON.stringify(tx.triggered_rules || []),
      tx.explanation || '',
      tx.status || 'PROCESSED',
      tx.is_demo !== undefined ? (tx.is_demo ? 1 : 0) : 1
    );

    return this.getTransactionById(tx.transaction_id);
  }

  getTransactionById(transactionId) {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE transaction_id = ?');
    const row = stmt.get(transactionId);
    if (!row) return null;
    return this.deserializeTransaction(row);
  }

  getTransactions({ limit = 50, risk_level = null, search = null } = {}) {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (risk_level && risk_level !== 'ALL') {
      query += ' AND risk_level = ?';
      params.push(risk_level.toUpperCase());
    }

    if (search && search.trim() !== '') {
      query += ' AND (merchant LIKE ? OR transaction_id LIKE ? OR category LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(r => this.deserializeTransaction(r));
  }

  getTransactionStats() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count, SUM(amount) as total_amount FROM transactions');
    const total = totalStmt.get() || { count: 0, total_amount: 0 };

    const riskStmt = this.db.prepare(`
      SELECT risk_level, COUNT(*) as count
      FROM transactions
      GROUP BY risk_level
    `);
    const riskCounts = riskStmt.all();

    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const r of riskCounts) {
      if (counts[r.risk_level] !== undefined) {
        counts[r.risk_level] = Number(r.count);
      }
    }

    const avgRiskStmt = this.db.prepare('SELECT AVG(risk_score) as avg_score FROM transactions');
    const avgRisk = avgRiskStmt.get()?.avg_score || 0;

    return {
      totalCount: Number(total.count),
      totalAmount: Number(total.total_amount || 0),
      riskCounts: counts,
      averageRiskScore: Math.round(Number(avgRisk))
    };
  }

  deserializeTransaction(row) {
    return {
      ...row,
      amount: Number(row.amount),
      historical_average: Number(row.historical_average),
      risk_score: Number(row.risk_score),
      triggered_rules: typeof row.triggered_rules === 'string' ? JSON.parse(row.triggered_rules) : row.triggered_rules,
      is_demo: Boolean(row.is_demo)
    };
  }

  // --- Agent Runs ---

  insertAgentRun(run) {
    const stmt = this.db.prepare(`
      INSERT INTO agent_runs (
        run_id, timestamp, task_prompt, workflow_type, mode, status,
        duration_ms, steps_count, execution_trace, final_synthesis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      run.run_id,
      run.timestamp || new Date().toISOString(),
      run.task_prompt,
      run.workflow_type,
      run.mode,
      run.status,
      Number(run.duration_ms || 0),
      Number(run.steps_count || 0),
      typeof run.execution_trace === 'string' ? run.execution_trace : JSON.stringify(run.execution_trace || []),
      typeof run.final_synthesis === 'string' ? run.final_synthesis : JSON.stringify(run.final_synthesis || {})
    );

    return this.getAgentRunById(run.run_id);
  }

  getAgentRunById(runId) {
    const stmt = this.db.prepare('SELECT * FROM agent_runs WHERE run_id = ?');
    const row = stmt.get(runId);
    if (!row) return null;
    return this.deserializeAgentRun(row);
  }

  getAgentRuns(limit = 20) {
    const stmt = this.db.prepare('SELECT * FROM agent_runs ORDER BY id DESC LIMIT ?');
    const rows = stmt.all(Number(limit));
    return rows.map(r => this.deserializeAgentRun(r));
  }

  deserializeAgentRun(row) {
    return {
      ...row,
      execution_trace: typeof row.execution_trace === 'string' ? JSON.parse(row.execution_trace) : row.execution_trace,
      final_synthesis: typeof row.final_synthesis === 'string' ? JSON.parse(row.final_synthesis) : row.final_synthesis
    };
  }

  // --- Knowledge Documents ---

  getAllKnowledgeDocs() {
    const stmt = this.db.prepare('SELECT * FROM knowledge_docs ORDER BY id ASC');
    return stmt.all();
  }

  insertKnowledgeDoc(doc) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_docs (doc_id, title, category, content, tags, last_updated)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc.doc_id,
      doc.title,
      doc.category,
      doc.content,
      typeof doc.tags === 'string' ? doc.tags : doc.tags.join(','),
      doc.last_updated || new Date().toISOString()
    );
  }

  // --- Demo Seeding & Reset ---

  seedInitialDataIfEmpty() {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM transactions');
    const count = countStmt.get().count;

    if (count === 0) {
      this.seedSampleTransactions();
    }

    const docCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_docs');
    const docCount = docCountStmt.get().count;

    if (docCount === 0) {
      this.seedKnowledgeDocs();
    }
  }

  resetDemoData() {
    this.db.exec('DELETE FROM transactions;');
    this.db.exec('DELETE FROM agent_runs;');
    this.db.exec('DELETE FROM knowledge_docs;');
    this.seedSampleTransactions();
    this.seedKnowledgeDocs();
    return { success: true, message: 'Demo data reset successfully' };
  }

  seedSampleTransactions() {
    const sampleTxs = [
      {
        transaction_id: 'TXN-UPI-20261019-001',
        timestamp: '2026-10-19T09:15:00.000Z',
        amount: 340,
        merchant: 'Swiggy / Bundl Technologies',
        category: 'Food & Dining',
        payment_method: 'UPI',
        historical_average: 450,
        risk_score: 5,
        risk_level: 'LOW',
        triggered_rules: [],
        explanation: 'Transaction amount is within normal historical range for food delivery.',
        status: 'APPROVED',
        is_demo: 1
      },
      {
        transaction_id: 'TXN-UPI-20261019-002',
        timestamp: '2026-10-19T11:42:00.000Z',
        amount: 2200,
        merchant: 'Zepto Quick Commerce',
        category: 'Groceries',
        payment_method: 'UPI',
        historical_average: 1800,
        risk_score: 12,
        risk_level: 'LOW',
        triggered_rules: [],
        explanation: 'Familiar merchant and normal daytime grocery purchase.',
        status: 'APPROVED',
        is_demo: 1
      },
      {
        transaction_id: 'TXN-UPI-20261019-003',
        timestamp: '2026-10-19T14:20:00.000Z',
        amount: 18500,
        merchant: 'QuickDigital Gadgets Mumbai',
        category: 'Electronics',
        payment_method: 'UPI',
        historical_average: 3200,
        risk_score: 55,
        risk_level: 'MEDIUM',
        triggered_rules: [
          { rule: 'HIGH_AMOUNT_SPIKE', points: 20, description: 'Amount is 5.7x higher than user historical average (₹3,200).' },
          { rule: 'UNFAMILIAR_MERCHANT', points: 15, description: 'First-time transaction with high-value merchant.' },
          { rule: 'MODERATE_VELOCITY', points: 15, description: '7th transaction recorded in past 24 hours.' }
        ],
        explanation: 'Transaction flagged due to substantial deviation from average spending and unfamiliar merchant.',
        status: 'FLAGGED_REVIEW',
        is_demo: 1
      },
      {
        transaction_id: 'TXN-UPI-20261019-004',
        timestamp: '2026-10-19T03:18:00.000Z',
        amount: 92000,
        merchant: 'GlobalCrypto P2P Gateway',
        category: 'Virtual Assets / P2P',
        payment_method: 'IMPS',
        historical_average: 4000,
        risk_score: 85,
        risk_level: 'HIGH',
        triggered_rules: [
          { rule: 'EXTREME_AMOUNT_SPIKE', points: 35, description: 'Amount is 23x user historical average.' },
          { rule: 'ODD_HOURS', points: 15, description: 'Initiated at 3:18 AM IST (dormant hours).' },
          { rule: 'HIGH_RISK_CATEGORY', points: 25, description: 'Unverified virtual asset / P2P exchange gateway.' },
          { rule: 'UNFAMILIAR_DEVICE', points: 15, description: 'Unrecognized browser fingerprint and IP location.' }
        ],
        explanation: 'Critical risk: Out-of-pattern amount during dormant hours to high-risk recipient.',
        status: 'BLOCKED',
        is_demo: 1
      },
      {
        transaction_id: 'TXN-UPI-20261018-005',
        timestamp: '2026-10-18T18:05:00.000Z',
        amount: 4500,
        merchant: 'Indian Oil Petrol Pump Indiranagar',
        category: 'Fuel & Transport',
        payment_method: 'DebitCard',
        historical_average: 3800,
        risk_score: 8,
        risk_level: 'LOW',
        triggered_rules: [],
        explanation: 'Regular commuting expense at verified merchant.',
        status: 'APPROVED',
        is_demo: 1
      },
      {
        transaction_id: 'TXN-UPI-20261018-006',
        timestamp: '2026-10-18T20:30:00.000Z',
        amount: 28000,
        merchant: 'Apartment Maintenance Society',
        category: 'Housing & Utilities',
        payment_method: 'NetBanking',
        historical_average: 28000,
        risk_score: 0,
        risk_level: 'LOW',
        triggered_rules: [],
        explanation: 'Recurring monthly maintenance fee matches exact historical record.',
        status: 'APPROVED',
        is_demo: 1
      }
    ];

    for (const tx of sampleTxs) {
      this.insertTransaction(tx);
    }
  }

  seedKnowledgeDocs() {
    const docs = [
      {
        doc_id: 'KB-001',
        title: 'The 50/30/20 Budgeting Rule for Indian Salaried Earners',
        category: 'Budgeting & Expense Tracking',
        content: `The 50/30/20 rule is a simple, intuitive framework to organize post-tax monthly income in India:
1. 50% for Needs (Essentials): Rent/home loan EMI, groceries (Zepto/Blinkit/local kirana), electricity, water, LPG, basic broadband, and children's school fees.
2. 30% for Wants (Discretionary): Dining out, weekend trips, OTT subscriptions (Hotstar, Netflix), shopping, and gadgets.
3. 20% for Savings & Debt Paydown: Emergency fund contributions, Public Provident Fund (PPF), National Pension System (NPS), equity mutual fund SIPs, or prepaying high-interest personal loans.

In major Indian metro cities like Mumbai, Bengaluru, and Gurgaon, rent alone can consume 35-40% of income. If your Needs exceed 50%, aim for a modified 60/20/20 split rather than sacrificing the 20% savings target.`,
        tags: '50/30/20,budgeting,income,expenses,savings,rent,needs,wants,sip',
        last_updated: '2026-10-19T00:00:00.000Z'
      },
      {
        doc_id: 'KB-002',
        title: 'Building a 6-Month Emergency Fund in India: Step-by-Step',
        category: 'Emergency Savings',
        content: `An Emergency Fund acts as a financial shock absorber against unexpected life events, such as sudden medical emergencies, layoffs, or urgent home repairs.

How to calculate:
Multiply your Essential Monthly Expenses (rent, groceries, EMIs, insurance premiums, utilities) by 3 to 6 months. For single-income households or freelancers with variable income, a 6 to 9-month buffer is recommended.

Where to park the funds in India:
- Tier 1 (Immediate - 1 month): High-interest savings bank account with instant ATM/UPI access.
- Tier 2 (Short-term - 2 to 3 months): Sweep-in Fixed Deposits (FDs) or liquid mutual funds offering T+1 business day redemption with zero exit load.
- Never park emergency savings in volatile equity markets, lock-in tax schemes (ELSS), or real estate.`,
        tags: 'emergency fund,savings,liquid fund,fixed deposit,safety net,layoff,medical',
        last_updated: '2026-10-19T00:00:00.000Z'
      },
      {
        doc_id: 'KB-003',
        title: 'UPI Safety Guidelines & Recognizing Common Digital Payment Frauds',
        category: 'Transaction Safety & Fraud',
        content: `Unified Payments Interface (UPI) is India's premier instant payment system. However, social engineering remains the primary attack vector.

Crucial UPI Rules:
1. "UPI PIN is only required to SEND money, NEVER to receive money." If a seller or buyer on OLX/Facebook Marketplace sends a QR code or payment request asking for your PIN to "receive payment", it is 100% a fraud.
2. Beware of fake customer care numbers on Google Maps or unverified social media handles.
3. Check the beneficiary name displayed by the UPI app (BHIM, PhonePe, Google Pay, Paytm) before authorizing any payment.
4. Screen-sharing app scam: Never install AnyDesk, TeamViewer, or RustDesk on the instruction of anyone claiming to be bank or electricity board officials.

Reporting: In India, report digital financial fraud immediately to the National Cyber Crime Portal (cybercrime.gov.in) or call helpline 1930 within the golden hour to freeze illicit fund transfers.`,
        tags: 'upi,fraud,qr code,pin,cybercrime,safety,scam,1930',
        last_updated: '2026-10-19T00:00:00.000Z'
      },
      {
        doc_id: 'KB-004',
        title: 'Responsible Credit Card Usage & Avoiding High-Interest Debt Traps',
        category: 'Responsible Spending',
        content: `Credit cards in India offer interest-free grace periods (typically 45-50 days) and reward points, but carrying a balance attracts exorbitant Annual Percentage Rates (APR) of 36% to 48% per annum (3% to 4% per month).

Best Practices:
- Always pay the "Total Amount Due" by the due date. Paying only the "Minimum Amount Due" (MAD) leaves the remaining principal accumulating compound daily interest.
- Maintain a Credit Utilization Ratio (CUR) below 30% of your total sanction limit to maintain a healthy CIBIL / CRIF credit score.
- Never withdraw cash from an ATM using a credit card; cash advances attract immediate finance charges with no interest-free grace period.`,
        tags: 'credit card,cibil,debt,interest,minimum amount due,credit score',
        last_updated: '2026-10-19T00:00:00.000Z'
      },
      {
        doc_id: 'KB-005',
        title: 'Heuristic Rule-Based vs Machine Learning Fraud Detection: Prototype Limitations',
        category: 'Fraud Detection Architecture',
        content: `Understanding how fraud detection works in modern financial engineering:

1. Rule-Based Systems (Our Prototype):
- How it works: Evaluates explicit, deterministic rules (e.g. transaction > 5x historical average, velocity > 10 tx/day, odd-hour timing).
- Strengths: 100% transparent, explainable in audits, zero training lag, deterministic testability, low compute requirements.
- Limitations: Vulnerable to false positives (flagging legitimate high-value festive shopping during Diwali or medical emergencies) and false negatives (clever fraudsters splitting large thefts into sub-threshold micro-transactions).

2. Machine Learning Systems:
- How it works: Learns high-dimensional non-linear patterns, graph networks (money mules), and behavioral biometric telemetry across millions of historic transactions.
- Prototype Disclaimer: This project implements a deterministic heuristic rule-scoring system for transparent evaluation and educational viva demonstration. It is not an ML model and does not claim production-grade bank accuracy.`,
        tags: 'rule-based,machine learning,fraud detection,heuristics,false positive,false negative,limitations',
        last_updated: '2026-10-19T00:00:00.000Z'
      }
    ];

    for (const doc of docs) {
      this.insertKnowledgeDoc(doc);
    }
  }
}
