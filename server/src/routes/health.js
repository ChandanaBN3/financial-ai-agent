import { Router } from 'express';
import { LLMPlanner } from '../agents/llmPlanner.js';
import { getDatabase } from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const llmPlanner = new LLMPlanner();
  const isLLMConfigured = llmPlanner.isConfigured();

  let dbOk = false;
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as alive').get();
    dbOk = result?.alive === 1;
  } catch (err) {
    dbOk = false;
  }

  res.json({
    status: 'HEALTHY',
    project: 'MoneyWise – Smart Financial Advisory and Payment Safety System',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.round(process.uptime()),
    database: {
      type: 'SQLite (node:sqlite)',
      connected: dbOk
    },
    agent_mode: isLLMConfigured ? 'LLM_ASSISTED' : 'LOCAL',
    llm: {
      provider: 'Google Gemini',
      configured: isLLMConfigured,
      active_model: isLLMConfigured ? 'gemini-2.5-flash' : 'None (Deterministic Local Mode Active)'
    },
    currency: 'INR (₹)',
    locale: 'en-IN'
  });
});

export default router;
