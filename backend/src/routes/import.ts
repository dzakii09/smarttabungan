import express from 'express';
import { importTransactions, getImportTemplate, upload } from '../controllers/importController';
import exportController from '../controllers/exportController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Import routes
router.post('/transactions', auth as any, upload.single('file'), importTransactions as any);
router.get('/template', auth as any, getImportTemplate as any);

// Export routes
router.get('/transactions', auth as any, exportController.exportTransactions.bind(exportController));
// router.get('/goals', auth as any, exportController.exportGoals.bind(exportController));
// router.get('/financial-report', auth as any, exportController.exportFinancialReport.bind(exportController));

export default router; 