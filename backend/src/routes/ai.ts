import express from 'express';
import { 
  getAIRecommendations,
  getSpendingInsights,
  getBudgetSuggestions,
  getSavingsTips,
  getFinancialAdvice
} from '../controllers/aiController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get AI recommendations
router.get('/recommendations', auth as any, getAIRecommendations as any);

// Get budget suggestions
router.get('/budget-suggestions', auth as any, getBudgetSuggestions as any);

// Get spending insights
router.get('/spending-insights', auth as any, getSpendingInsights as any);

// Get savings tips
router.get('/savings-tips', auth as any, getSavingsTips as any);

// Get financial advice
router.get('/financial-advice', auth as any, getFinancialAdvice as any);

export default router; 