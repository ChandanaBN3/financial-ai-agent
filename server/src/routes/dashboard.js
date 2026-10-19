import { Router } from 'express';
import { Repository } from '../db/repository.js';
import { LLMPlanner } from '../agents/llmPlanner.js';

const router = Router();

router.get('/summary', (req, res) => {
  try {
    const repo = new Repository();
    repo.seedInitialDataIfEmpty();

    const txStats = repo.getTransactionStats();
    const recentRuns = repo.getAgentRuns(5);
    const recentTxs = repo.getTransactions({ limit: 5 });
    const isLLM = new LLMPlanner().isConfigured();

    res.json({
      success: true,
      metrics: {
        total_transactions_analyzed: txStats.totalCount,
        total_volume_inr: txStats.totalAmount,
        average_risk_score: txStats.averageRiskScore,
        risk_breakdown: txStats.riskCounts,
        recent_agent_runs_count: recentRuns.length
      },
      agent_system: {
        active_mode: isLLM ? 'LLM_ASSISTED' : 'LOCAL',
        active_agents_count: 5,
        registered_tools_count: 6
      },
      recent_transactions: recentTxs,
      recent_runs: recentRuns.map(r => ({
        run_id: r.run_id,
        timestamp: r.timestamp,
        task_prompt: r.task_prompt,
        workflow_type: r.workflow_type,
        mode: r.mode,
        status: r.status,
        duration_ms: r.duration_ms,
        steps_count: r.steps_count
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch dashboard summary: ${error.message}`
    });
  }
});

export default router;
