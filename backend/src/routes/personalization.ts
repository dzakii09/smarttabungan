import express from 'express';
import { auth } from '../middleware/auth';
import personalizationController from '../controllers/personalizationController';

const router = express.Router();

// User Preferences
router.get('/preferences', auth as any, personalizationController.getUserPreferences as any);
router.put('/preferences', auth as any, personalizationController.updateUserPreferences as any);

// Personalized Dashboard
router.get('/dashboard', auth as any, personalizationController.getPersonalizedDashboard as any);

// User Insights
router.get('/insights', auth as any, personalizationController.getUserInsights as any);

// AI Recommendations
router.get('/recommendations', auth as any, personalizationController.getPersonalizedRecommendations as any);
router.get('/recommendations/summary', auth as any, personalizationController.getAIRecommendationsSummary as any);
router.post('/recommendations/apply', auth as any, personalizationController.applyRecommendation as any);

// Smart Budget Suggestions
router.get('/budget-suggestions', auth as any, personalizationController.getSmartBudgetSuggestions as any);

// Financial Insights
router.get('/financial-insights', auth as any, personalizationController.getFinancialInsights as any);

// User Financial Profile
router.get('/profile', auth as any, personalizationController.getUserFinancialProfile as any);

export default router; 