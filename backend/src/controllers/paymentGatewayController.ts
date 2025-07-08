import { Request, Response } from 'express';
import paymentGatewayService from '../services/paymentGatewayService';

class PaymentGatewayController {
  // Get available payment methods
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const methods = await paymentGatewayService.getPaymentMethods();
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil metode pembayaran'
      });
    }
  }

  // Process payment
  async processPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { amount, currency, paymentMethod, description, metadata } = req.body;

      if (!amount || !paymentMethod || !description) {
        return res.status(400).json({
          success: false,
          message: 'Data amount, paymentMethod, dan description diperlukan'
        });
      }

      const result = await paymentGatewayService.processPayment(userId, {
        amount: parseFloat(amount),
        currency: currency || 'IDR',
        paymentMethod,
        description,
        metadata
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal memproses pembayaran'
      });
    }
  }

  // Get payment history
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await paymentGatewayService.getPaymentHistory(userId, limit, offset);
      res.json(result);
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil riwayat pembayaran'
      });
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';

      const result = await paymentGatewayService.getPaymentAnalytics(userId, period);
      res.json(result);
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil analisis pembayaran'
      });
    }
  }

  // Setup recurring payment
  async setupRecurringPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const {
        amount,
        frequency,
        paymentMethod,
        description,
        startDate,
        endDate
      } = req.body;

      if (!amount || !frequency || !paymentMethod || !description || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'Data amount, frequency, paymentMethod, description, dan startDate diperlukan'
        });
      }

      const result = await paymentGatewayService.setupRecurringPayment(
        userId,
        parseFloat(amount),
        frequency,
        paymentMethod,
        description,
        new Date(startDate),
        endDate ? new Date(endDate) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error('Error setting up recurring payment:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengatur pembayaran berulang'
      });
    }
  }

  // Cancel recurring payment
  async cancelRecurringPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { recurringId } = req.params;

      if (!recurringId) {
        return res.status(400).json({
          success: false,
          message: 'Recurring ID diperlukan'
        });
      }

      const result = await paymentGatewayService.cancelRecurringPayment(recurringId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error canceling recurring payment:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membatalkan pembayaran berulang'
      });
    }
  }

  // Check payment status
  async checkPaymentStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID diperlukan'
        });
      }

      const result = await paymentGatewayService.checkPaymentStatus(transactionId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memeriksa status pembayaran'
      });
    }
  }
}

export default new PaymentGatewayController(); 