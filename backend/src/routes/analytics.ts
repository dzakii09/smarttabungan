import express from 'express';
import { auth } from '../middleware/auth';
import {
  getAnalyticsOverview,
  getSpendingTrends,
  getCategoryAnalysis,
  getSavingsAnalysis,
} from '../controllers/analyticsController';

const router = express.Router();

// Get analytics overview
router.get('/overview', auth as any, getAnalyticsOverview as any);

// Get spending trends
router.get('/trends', auth as any, getSpendingTrends as any);

// Get category analysis
router.get('/categories', auth as any, getCategoryAnalysis as any);

// Get savings analysis
router.get('/savings', auth as any, getSavingsAnalysis as any);

export default router; 