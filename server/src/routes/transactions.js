import { Router } from 'express';
import { Repository } from '../db/repository.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const repo = new Repository();
    repo.seedInitialDataIfEmpty();

    const { limit = 50, risk_level, search } = req.query;
    const transactions = repo.getTransactions({ limit, risk_level, search });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch transactions: ${error.message}`
    });
  }
});

router.get('/stats', (req, res) => {
  try {
    const repo = new Repository();
    repo.seedInitialDataIfEmpty();

    const stats = repo.getTransactionStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch transaction stats: ${error.message}`
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const repo = new Repository();
    const tx = repo.getTransactionById(req.params.id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        error: `Transaction '${req.params.id}' not found.`
      });
    }
    res.json({
      success: true,
      transaction: tx
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch transaction: ${error.message}`
    });
  }
});

export default router;
