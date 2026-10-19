import { Router } from 'express';
import { calculateFinancialMetrics } from '../tools/advisoryCalculator.js';

const router = Router();

router.post('/calculate', (req, res) => {
  const {
    monthly_income,
    monthly_expenses,
    essential_expenses,
    current_savings,
    savings_goal,
    spending_categories
  } = req.body;

  if (monthly_income === undefined || monthly_income === null || monthly_income === '') {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: monthly_income (in INR) is required.'
    });
  }

  if (monthly_expenses === undefined || monthly_expenses === null || monthly_expenses === '') {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: monthly_expenses (in INR) is required.'
    });
  }

  const result = calculateFinancialMetrics({
    monthly_income,
    monthly_expenses,
    essential_expenses,
    current_savings,
    savings_goal,
    spending_categories
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

export default router;
