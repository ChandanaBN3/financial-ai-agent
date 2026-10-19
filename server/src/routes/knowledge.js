import { Router } from 'express';
import { searchKnowledgeBase } from '../tools/knowledgeRetriever.js';
import { Repository } from '../db/repository.js';

const router = Router();

router.get('/search', (req, res) => {
  const query = req.query.q || req.query.query;
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  const result = searchKnowledgeBase({ query, limit });
  res.json(result);
});

router.get('/docs', (req, res) => {
  try {
    const repo = new Repository();
    repo.seedInitialDataIfEmpty();
    const docs = repo.getAllKnowledgeDocs();
    res.json({
      success: true,
      count: docs.length,
      documents: docs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch knowledge docs: ${error.message}`
    });
  }
});

export default router;
