import express from 'express'
import bankIntegrationController from '../controllers/bankIntegrationController'
import { auth } from '../middleware/auth'

const router = express.Router()

// Get supported banks
router.get('/supported-banks', auth as any, bankIntegrationController.getSupportedBanks as any)

// Get user's bank accounts
router.get('/accounts', auth as any, bankIntegrationController.getUserBankAccounts as any)

// Connect bank account
router.post('/connect', auth as any, bankIntegrationController.connectBankAccount as any)

// Sync bank account
router.post('/sync/:accountId', auth as any, bankIntegrationController.syncBankAccount as any)

// Get bank transactions
router.get('/transactions/:accountId', auth as any, bankIntegrationController.getBankTransactions as any)

// Get account balance
router.get('/balance/:accountId', auth as any, bankIntegrationController.getAccountBalance as any)

// Disconnect bank account
router.delete('/disconnect/:accountId', auth as any, bankIntegrationController.disconnectBankAccount as any)

// Update sync frequency
router.put('/sync-frequency/:accountId', auth as any, bankIntegrationController.updateSyncFrequency as any)

export default router; 