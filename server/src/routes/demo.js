import { Router } from 'express';
import { Repository } from '../db/repository.js';

const router = Router();

router.post('/reset', (req, res) => {
  try {
    const repo = new Repository();
    const result = repo.resetDemoData();
    res.json({
      success: true,
      message: 'Demo database reset with fresh Indian fintech transactions and knowledge documents.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to reset demo data: ${error.message}`
    });
  }
});

export default router;
