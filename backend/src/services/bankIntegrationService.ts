import { PrismaClient } from '../../generated/prisma';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface BankCredentials {
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  token?: string;
}

interface BankAccountInfo {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

interface BankTransaction {
  externalId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: Date;
  balance: number;
}

class BankIntegrationService {
  private readonly supportedBanks = [
    'BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Danamon'
  ];

  // Encrypt sensitive data
  private encryptData(data: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt sensitive data
  private decryptData(encryptedData: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Get supported banks
  async getSupportedBanks(): Promise<string[]> {
    return this.supportedBanks;
  }

  // Connect bank account
  async connectBankAccount(
    userId: string,
    bankName: string,
    accountNumber: string,
    credentials: BankCredentials
  ) {
    try {
      // Validate bank name
      if (!this.supportedBanks.includes(bankName)) {
        throw new Error(`Bank ${bankName} tidak didukung`);
      }

      // Encrypt credentials
      const encryptedCredentials = this.encryptData(JSON.stringify(credentials));

      // Test connection
      const accountInfo = await this.testBankConnection(bankName, credentials);

      // Create bank account record
      const bankAccount = await prisma.bankAccount.create({
        data: {
          userId,
          bankName,
          accountNumber,
          accountType: accountInfo.accountType,
          balance: accountInfo.balance,
          currency: accountInfo.currency,
          apiCredentials: { encrypted: encryptedCredentials },
          lastSync: new Date()
        }
      });

      return {
        success: true,
        data: {
          id: bankAccount.id,
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          balance: bankAccount.balance,
          currency: bankAccount.currency,
          lastSync: bankAccount.lastSync
        }
      };
    } catch (error) {
      console.error('Error connecting bank account:', error);
      throw new Error(`Gagal menghubungkan rekening bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test bank connection
  private async testBankConnection(bankName: string, credentials: BankCredentials): Promise<BankAccountInfo> {
    // Simulate API call to bank
    // In real implementation, this would call actual bank APIs
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    // Mock response for testing
    return {
      accountNumber: '1234567890',
      accountType: 'Savings',
      balance: 10000000,
      currency: 'IDR'
    };
  }

  // Get user's bank accounts
  async getUserBankAccounts(userId: string) {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountType: true,
          balance: true,
          currency: true,
          lastSync: true,
          syncFrequency: true,
          isActive: true
        }
      });

      return {
        success: true,
        data: accounts
      };
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      throw new Error('Gagal mengambil data rekening bank');
    }
  }

  // Sync bank account
  async syncBankAccount(accountId: string, userId: string) {
    try {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: accountId, userId }
      });

      if (!bankAccount) {
        throw new Error('Rekening bank tidak ditemukan');
      }

      // Decrypt credentials
      const encryptedCredentials = bankAccount.apiCredentials as any;
      const credentials: BankCredentials = JSON.parse(
        this.decryptData(encryptedCredentials.encrypted)
      );

      // Fetch transactions from bank API
      const transactions = await this.fetchBankTransactions(
        bankAccount.bankName,
        credentials,
        bankAccount.lastSync || new Date(0)
      );

      // Update account balance
      const latestBalance = transactions.length > 0 
        ? transactions[transactions.length - 1].balance 
        : bankAccount.balance;

      await prisma.bankAccount.update({
        where: { id: accountId },
        data: {
          balance: latestBalance,
          lastSync: new Date()
        }
      });

      // Save new transactions
      for (const transaction of transactions) {
        await prisma.bankTransaction.upsert({
          where: { externalId: transaction.externalId },
          update: {
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            date: transaction.date,
            balance: transaction.balance,
            isSynced: true
          },
          create: {
            bankAccountId: accountId,
            externalId: transaction.externalId,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            date: transaction.date,
            balance: transaction.balance,
            isSynced: true
          }
        });
      }

      return {
        success: true,
        data: {
          syncedTransactions: transactions.length,
          newBalance: latestBalance,
          lastSync: new Date()
        }
      };
    } catch (error) {
      console.error('Error syncing bank account:', error);
      throw new Error(`Gagal sinkronisasi rekening bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch transactions from bank API
  private async fetchBankTransactions(
    bankName: string,
    credentials: BankCredentials,
    sinceDate: Date
  ): Promise<BankTransaction[]> {
    // Simulate API call to bank
    // In real implementation, this would call actual bank APIs
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    // Mock transactions for testing
    const mockTransactions: BankTransaction[] = [
      {
        externalId: `txn_${Date.now()}_1`,
        amount: 500000,
        type: 'credit',
        description: 'Transfer masuk dari John Doe',
        date: new Date(),
        balance: 10500000
      },
      {
        externalId: `txn_${Date.now()}_2`,
        amount: 250000,
        type: 'debit',
        description: 'Pembayaran tagihan listrik',
        date: new Date(),
        balance: 10250000
      }
    ];

    return mockTransactions.filter(tx => tx.date >= sinceDate);
  }

  // Get bank transactions
  async getBankTransactions(accountId: string, userId: string, limit = 50) {
    try {
      const transactions = await prisma.bankTransaction.findMany({
        where: {
          bankAccount: {
            id: accountId,
            userId
          }
        },
        orderBy: { date: 'desc' },
        take: limit
      });

      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      throw new Error('Gagal mengambil data transaksi bank');
    }
  }

  // Disconnect bank account
  async disconnectBankAccount(accountId: string, userId: string) {
    try {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: accountId, userId }
      });

      if (!bankAccount) {
        throw new Error('Rekening bank tidak ditemukan');
      }

      // Deactivate account
      await prisma.bankAccount.update({
        where: { id: accountId },
        data: { isActive: false }
      });

      return {
        success: true,
        message: 'Rekening bank berhasil diputuskan'
      };
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      throw new Error('Gagal memutuskan rekening bank');
    }
  }

  // Get account balance
  async getAccountBalance(accountId: string, userId: string) {
    try {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: { id: accountId, userId, isActive: true },
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          balance: true,
          currency: true,
          lastSync: true
        }
      });

      if (!bankAccount) {
        throw new Error('Rekening bank tidak ditemukan');
      }

      return {
        success: true,
        data: bankAccount
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw new Error('Gagal mengambil saldo rekening');
    }
  }

  // Update sync frequency
  async updateSyncFrequency(accountId: string, userId: string, frequency: string) {
    try {
      const validFrequencies = ['hourly', 'daily', 'weekly', 'manual'];
      
      if (!validFrequencies.includes(frequency)) {
        throw new Error('Frekuensi sinkronisasi tidak valid');
      }

      const bankAccount = await prisma.bankAccount.update({
        where: { id: accountId, userId },
        data: { syncFrequency: frequency }
      });

      return {
        success: true,
        data: {
          id: bankAccount.id,
          syncFrequency: bankAccount.syncFrequency
        }
      };
    } catch (error) {
      console.error('Error updating sync frequency:', error);
      throw new Error('Gagal mengubah frekuensi sinkronisasi');
    }
  }
}

export default new BankIntegrationService(); 