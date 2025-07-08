import express from 'express';
import budgetController from '../controllers/budgetController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Budget analytics and insights (harus sebelum /:id)
router.get('/alerts', auth as any, budgetController.getBudgetAlerts as any);
router.get('/stats', auth as any, budgetController.getBudgetStats as any);
router.get('/recommendations', auth as any, budgetController.getBudgetRecommendations as any);
router.get('/insights', auth as any, budgetController.getBudgetInsights as any);

// AI-powered budget features
router.post('/from-recommendation', auth as any, budgetController.createBudgetFromRecommendation as any);

// Budget CRUD operations
router.post('/', auth as any, budgetController.createBudget as any);
router.get('/', auth as any, budgetController.getBudgets as any);
router.get('/:id', auth as any, budgetController.getBudgetById as any);
router.put('/:id', auth as any, budgetController.updateBudget as any);
router.delete('/:id', auth as any, budgetController.deleteBudget as any);

// Budget status management
router.patch('/:id/toggle', auth as any, budgetController.toggleBudgetStatus as any);

export default router; 