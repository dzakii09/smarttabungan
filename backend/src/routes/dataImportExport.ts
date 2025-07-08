import express from 'express'
import dataImportExportController from '../controllers/dataImportExportController'
import { auth } from '../middleware/auth'

const router = express.Router()

// Get import templates
router.get('/templates', auth as any, dataImportExportController.getImportTemplates as any)

// Import data from file
router.post('/import', auth as any, dataImportExportController.importData as any)

// Export data
router.post('/export', auth as any, dataImportExportController.exportData as any)

// Validate import data
router.post('/validate', auth as any, dataImportExportController.validateImportData as any)

// Get import history
router.get('/import-history', auth as any, dataImportExportController.getImportHistory as any)

// Bulk operations
router.post('/bulk', auth as any, dataImportExportController.bulkOperations as any)

export default router 