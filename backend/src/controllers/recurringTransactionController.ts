import { Request, Response } from 'express';
import { RecurringTransactionService } from '../services/recurringTransactionService';
import notificationService from '../services/notificationService';

export class RecurringTransactionController {
  // Create recurring transaction
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const recurringTransaction = await RecurringTransactionService.createRecurringTransaction(userId, req.body);
      
      // Create notification for new recurring transaction
      try {
        const { description, amount, frequency, nextDueDate } = req.body;
        await notificationService.createSystemNotification(
          userId,
          '🔄 Transaksi Berulang Dibuat',
          `Transaksi berulang "${description}" sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')} (${frequency}) telah dibuat. Jatuh tempo berikutnya: ${new Date(nextDueDate).toLocaleDateString('id-ID')}`,
          'low'
        );
      } catch (notificationError) {
        console.error('Error creating recurring transaction notification:', notificationError);
      }
      
      res.status(201).json({
        success: true,
        data: recurringTransaction
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all recurring transactions for user
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const recurringTransactions = await RecurringTransactionService.getUserRecurringTransactions(userId);
      res.status(200).json({
        success: true,
        data: recurringTransactions
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get single recurring transaction
  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const recurringTransaction = await RecurringTransactionService.getRecurringTransactionById(id, userId);
      res.status(200).json({
        success: true,
        data: recurringTransaction
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update recurring transaction
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const recurringTransaction = await RecurringTransactionService.updateRecurringTransaction(id, userId, req.body);
      res.status(200).json({
        success: true,
        data: recurringTransaction
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete recurring transaction
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      await RecurringTransactionService.deleteRecurringTransaction(id, userId);
      res.status(200).json({
        success: true,
        message: 'Recurring transaction deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Toggle recurring transaction status
  async toggleStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const recurringTransaction = await RecurringTransactionService.toggleRecurringTransaction(id, userId);
      res.status(200).json({
        success: true,
        data: recurringTransaction
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Generate transactions from recurring transactions
  async generateTransactions(req: Request, res: Response) {
    try {
      const generatedTransactions = await RecurringTransactionService.generateRecurringTransactions();
      
      // Create notifications for generated transactions
      if (generatedTransactions.length > 0) {
        try {
          const userId = (req as any).user.id;
          await notificationService.createSystemNotification(
            userId,
            '📅 Transaksi Berulang Diproses',
            `${generatedTransactions.length} transaksi berulang telah diproses dan ditambahkan ke daftar transaksi Anda`,
            'low'
          );
        } catch (notificationError) {
          console.error('Error creating generation notification:', notificationError);
        }
      }
      
      res.status(200).json({
        success: true,
        data: generatedTransactions,
        message: `Generated ${generatedTransactions.length} transactions`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
} 