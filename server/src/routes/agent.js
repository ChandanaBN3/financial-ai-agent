import { Router } from 'express';
import { OrchestratorAgent } from '../agents/orchestrator.js';
import { Repository } from '../db/repository.js';

const router = Router();

router.post('/run', async (req, res) => {
  const { prompt, workflowType, inputData, mode = 'LOCAL' } = req.body;

  if (!prompt && !workflowType) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a task prompt or select a workflow type.'
    });
  }

  try {
    const orchestrator = new OrchestratorAgent();
    const result = await orchestrator.runTask({
      prompt: prompt || 'Execute selected workflow',
      workflowType,
      inputData: inputData || {},
      mode
    });

    res.json({
      success: true,
      run: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Agent orchestration error: ${error.message}`
    });
  }
});

router.get('/history', (req, res) => {
  try {
    const repo = new Repository();
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const runs = repo.getAgentRuns(limit);
    res.json({
      success: true,
      count: runs.length,
      runs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch agent history: ${error.message}`
    });
  }
});

router.get('/run/:runId', (req, res) => {
  try {
    const repo = new Repository();
    const run = repo.getAgentRunById(req.params.runId);
    if (!run) {
      return res.status(404).json({
        success: false,
        error: `Agent run '${req.params.runId}' not found.`
      });
    }
    res.json({
      success: true,
      run
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch agent run: ${error.message}`
    });
  }
});

export default router;
