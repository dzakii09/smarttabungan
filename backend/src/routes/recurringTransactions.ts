import express from 'express';
import { RecurringTransactionController } from '../controllers/recurringTransactionController';
import { auth } from '../middleware/auth';

const router = express.Router();
const recurringTransactionController = new RecurringTransactionController();

// Create recurring transaction
router.post('/', auth as any, recurringTransactionController.create.bind(recurringTransactionController));

// Get all recurring transactions for user
router.get('/', auth as any, recurringTransactionController.getAll.bind(recurringTransactionController));

// Get single recurring transaction
router.get('/:id', auth as any, recurringTransactionController.getById.bind(recurringTransactionController));

// Update recurring transaction
router.put('/:id', auth as any, recurringTransactionController.update.bind(recurringTransactionController));

// Delete recurring transaction
router.delete('/:id', auth as any, recurringTransactionController.delete.bind(recurringTransactionController));

// Toggle recurring transaction status
router.patch('/:id/toggle', auth as any, recurringTransactionController.toggleStatus.bind(recurringTransactionController));

// Generate transactions from recurring transactions
router.post('/generate', auth as any, recurringTransactionController.generateTransactions.bind(recurringTransactionController));

export default router; 