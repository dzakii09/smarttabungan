import express from 'express'
import { 
  createTransaction, 
  getTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction,
  getTransactionStats
} from '../controllers/transactionController'
import { auth } from '../middleware/auth'
import multer from 'multer';
import { scanReceipt } from '../controllers/scanReceiptController';

const router = express.Router()

const upload = multer();

router.post('/', auth as any, createTransaction as any)
router.get('/', auth as any, getTransactions as any)
router.get('/stats', auth as any, getTransactionStats as any)
router.get('/:id', auth as any, getTransactionById as any)
router.put('/:id', auth as any, updateTransaction as any)
router.delete('/:id', auth as any, deleteTransaction as any)
router.post('/scan-receipt', upload.single('receipt'), scanReceipt);

export default router 