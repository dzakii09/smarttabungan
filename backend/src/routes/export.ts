import express from 'express';
import exportController from '../controllers/exportController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Export options
router.get('/options', auth as any, exportController.getExportOptions as any);

// Export all data
router.post('/all', auth as any, exportController.exportData as any);

// Export specific data types
router.post('/transactions', auth as any, exportController.exportTransactions as any);
router.post('/budgets', auth as any, exportController.exportBudgets as any);
router.post('/goals', auth as any, exportController.exportGoals as any);

export default router; 