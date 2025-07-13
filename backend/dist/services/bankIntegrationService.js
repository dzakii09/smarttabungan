"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../generated/prisma");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new prisma_1.PrismaClient();
class BankIntegrationService {
    constructor() {
        this.supportedBanks = [
            'BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Danamon'
        ];
    }
    // Encrypt sensitive data
    encryptData(data) {
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    // Decrypt sensitive data
    decryptData(encryptedData) {
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    // Get supported banks
    getSupportedBanks() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.supportedBanks;
        });
    }
    // Connect bank account
    connectBankAccount(userId, bankName, accountNumber, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate bank name
                if (!this.supportedBanks.includes(bankName)) {
                    throw new Error(`Bank ${bankName} tidak didukung`);
                }
                // Encrypt credentials
                const encryptedCredentials = this.encryptData(JSON.stringify(credentials));
                // Test connection
                const accountInfo = yield this.testBankConnection(bankName, credentials);
                // Create bank account record
                const bankAccount = yield prisma.bankAccount.create({
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
            }
            catch (error) {
                console.error('Error connecting bank account:', error);
                throw new Error(`Gagal menghubungkan rekening bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Test bank connection
    testBankConnection(bankName, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulate API call to bank
            // In real implementation, this would call actual bank APIs
            yield new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            // Mock response for testing
            return {
                accountNumber: '1234567890',
                accountType: 'Savings',
                balance: 10000000,
                currency: 'IDR'
            };
        });
    }
    // Get user's bank accounts
    getUserBankAccounts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accounts = yield prisma.bankAccount.findMany({
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
            }
            catch (error) {
                console.error('Error getting bank accounts:', error);
                throw new Error('Gagal mengambil data rekening bank');
            }
        });
    }
    // Sync bank account
    syncBankAccount(accountId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bankAccount = yield prisma.bankAccount.findFirst({
                    where: { id: accountId, userId }
                });
                if (!bankAccount) {
                    throw new Error('Rekening bank tidak ditemukan');
                }
                // Decrypt credentials
                const encryptedCredentials = bankAccount.apiCredentials;
                const credentials = JSON.parse(this.decryptData(encryptedCredentials.encrypted));
                // Fetch transactions from bank API
                const transactions = yield this.fetchBankTransactions(bankAccount.bankName, credentials, bankAccount.lastSync || new Date(0));
                // Update account balance
                const latestBalance = transactions.length > 0
                    ? transactions[transactions.length - 1].balance
                    : bankAccount.balance;
                yield prisma.bankAccount.update({
                    where: { id: accountId },
                    data: {
                        balance: latestBalance,
                        lastSync: new Date()
                    }
                });
                // Save new transactions
                for (const transaction of transactions) {
                    yield prisma.bankTransaction.upsert({
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
            }
            catch (error) {
                console.error('Error syncing bank account:', error);
                throw new Error(`Gagal sinkronisasi rekening bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Fetch transactions from bank API
    fetchBankTransactions(bankName, credentials, sinceDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulate API call to bank
            // In real implementation, this would call actual bank APIs
            yield new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
            // Mock transactions for testing
            const mockTransactions = [
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
        });
    }
    // Get bank transactions
    getBankTransactions(accountId_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (accountId, userId, limit = 50) {
            try {
                const transactions = yield prisma.bankTransaction.findMany({
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
            }
            catch (error) {
                console.error('Error getting bank transactions:', error);
                throw new Error('Gagal mengambil data transaksi bank');
            }
        });
    }
    // Disconnect bank account
    disconnectBankAccount(accountId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bankAccount = yield prisma.bankAccount.findFirst({
                    where: { id: accountId, userId }
                });
                if (!bankAccount) {
                    throw new Error('Rekening bank tidak ditemukan');
                }
                // Deactivate account
                yield prisma.bankAccount.update({
                    where: { id: accountId },
                    data: { isActive: false }
                });
                return {
                    success: true,
                    message: 'Rekening bank berhasil diputuskan'
                };
            }
            catch (error) {
                console.error('Error disconnecting bank account:', error);
                throw new Error('Gagal memutuskan rekening bank');
            }
        });
    }
    // Get account balance
    getAccountBalance(accountId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bankAccount = yield prisma.bankAccount.findFirst({
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
            }
            catch (error) {
                console.error('Error getting account balance:', error);
                throw new Error('Gagal mengambil saldo rekening');
            }
        });
    }
    // Update sync frequency
    updateSyncFrequency(accountId, userId, frequency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validFrequencies = ['hourly', 'daily', 'weekly', 'manual'];
                if (!validFrequencies.includes(frequency)) {
                    throw new Error('Frekuensi sinkronisasi tidak valid');
                }
                const bankAccount = yield prisma.bankAccount.update({
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
            }
            catch (error) {
                console.error('Error updating sync frequency:', error);
                throw new Error('Gagal mengubah frekuensi sinkronisasi');
            }
        });
    }
}
exports.default = new BankIntegrationService();
