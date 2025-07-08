import express from 'express';
import analyticsController from '../controllers/analyticsController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth as any);

// Analytics endpoints
router.get('/spending-trends', auth as any, analyticsController.getSpendingTrends as any);
router.get('/category-analytics', auth as any, analyticsController.getCategoryAnalytics as any);
router.get('/monthly-comparison', auth as any, analyticsController.getMonthlyComparison as any);
router.get('/spending-patterns', auth as any, analyticsController.getSpendingPatterns as any);
router.get('/top-spending-days', auth as any, analyticsController.getTopSpendingDays as any);
router.get('/savings-analysis', auth as any, analyticsController.getSavingsAnalysis as any);
router.get('/budget-performance', auth as any, analyticsController.getBudgetPerformance as any);

// Advanced analytics
router.get('/financial-insights', auth as any, analyticsController.getFinancialInsights as any);

// Comprehensive reports
router.get('/comprehensive-report', auth as any, analyticsController.getComprehensiveReport as any);
router.get('/dashboard-summary', auth as any, analyticsController.getDashboardSummary as any);

// Export functionality
// router.get('/export', auth as any, analyticsController.exportData as any);

export default router; 