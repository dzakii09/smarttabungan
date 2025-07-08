import express from 'express';
import { 
  predictCategory,
  getBudgetRecommendations,
  getSpendingInsights,
  predictNextMonthSpending,
  getAIDashboardData
} from '../controllers/aiController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Auto-categorize transaction
router.post('/predict-category', auth as any, predictCategory as any);

// Get budget recommendations
router.get('/budget-recommendations', auth as any, getBudgetRecommendations as any);

// Get spending insights
router.get('/spending-insights', auth as any, getSpendingInsights as any);

// Predict next month spending
router.get('/predict-next-month', auth as any, predictNextMonthSpending as any);

// Get all AI dashboard data
router.get('/dashboard', auth as any, getAIDashboardData as any);

export default router; 