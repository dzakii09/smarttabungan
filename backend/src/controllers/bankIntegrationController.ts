import { Request, Response } from 'express';
import bankIntegrationService from '../services/bankIntegrationService';

class BankIntegrationController {
  // Get supported banks
  async getSupportedBanks(req: Request, res: Response) {
    try {
      const banks = await bankIntegrationService.getSupportedBanks();
      res.json({
        success: true,
        data: banks
      });
    } catch (error) {
      console.error('Error getting supported banks:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil daftar bank yang didukung'
      });
    }
  }

  // Get user's bank accounts
  async getUserBankAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await bankIntegrationService.getUserBankAccounts(userId);
      res.json(result);
    } catch (error) {
      console.error('Error getting user bank accounts:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data rekening bank'
      });
    }
  }

  // Connect bank account
  async connectBankAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { bankName, accountNumber, credentials } = req.body;

      if (!bankName || !accountNumber || !credentials) {
        return res.status(400).json({
          success: false,
          message: 'Data bank name, account number, dan credentials diperlukan'
        });
      }

      const result = await bankIntegrationService.connectBankAccount(
        userId,
        bankName,
        accountNumber,
        credentials
      );

      res.json(result);
    } catch (error) {
      console.error('Error connecting bank account:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal menghubungkan rekening bank'
      });
    }
  }

  // Sync bank account
  async syncBankAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { accountId } = req.params;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: 'Account ID diperlukan'
        });
      }

      const result = await bankIntegrationService.syncBankAccount(accountId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error syncing bank account:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal sinkronisasi rekening bank'
      });
    }
  }

  // Get bank transactions
  async getBankTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { accountId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: 'Account ID diperlukan'
        });
      }

      const result = await bankIntegrationService.getBankTransactions(accountId, userId, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data transaksi bank'
      });
    }
  }

  // Get account balance
  async getAccountBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { accountId } = req.params;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: 'Account ID diperlukan'
        });
      }

      const result = await bankIntegrationService.getAccountBalance(accountId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error getting account balance:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil saldo rekening'
      });
    }
  }

  // Disconnect bank account
  async disconnectBankAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { accountId } = req.params;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: 'Account ID diperlukan'
        });
      }

      const result = await bankIntegrationService.disconnectBankAccount(accountId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memutuskan rekening bank'
      });
    }
  }

  // Update sync frequency
  async updateSyncFrequency(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { accountId } = req.params;
      const { frequency } = req.body;

      if (!accountId || !frequency) {
        return res.status(400).json({
          success: false,
          message: 'Account ID dan frequency diperlukan'
        });
      }

      const result = await bankIntegrationService.updateSyncFrequency(accountId, userId, frequency);
      res.json(result);
    } catch (error) {
      console.error('Error updating sync frequency:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengubah frekuensi sinkronisasi'
      });
    }
  }
}

export default new BankIntegrationController(); 