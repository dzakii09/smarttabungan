import express from 'express'
import paymentGatewayController from '../controllers/paymentGatewayController'
import { auth } from '../middleware/auth'

const router = express.Router()

// Get available payment methods
router.get('/methods', auth as any, paymentGatewayController.getPaymentMethods as any)

// Process payment
router.post('/process', auth as any, paymentGatewayController.processPayment as any)

// Get payment history
router.get('/history', auth as any, paymentGatewayController.getPaymentHistory as any)

// Get payment analytics
router.get('/analytics', auth as any, paymentGatewayController.getPaymentAnalytics as any)

// Check payment status
router.get('/status/:transactionId', auth as any, paymentGatewayController.checkPaymentStatus as any)

export default router 