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
const bankIntegrationService_1 = __importDefault(require("../services/bankIntegrationService"));
class BankIntegrationController {
    // Get supported banks
    getSupportedBanks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const banks = yield bankIntegrationService_1.default.getSupportedBanks();
                res.json({
                    success: true,
                    data: banks
                });
            }
            catch (error) {
                console.error('Error getting supported banks:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil daftar bank yang didukung'
                });
            }
        });
    }
    // Get user's bank accounts
    getUserBankAccounts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const result = yield bankIntegrationService_1.default.getUserBankAccounts(userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting user bank accounts:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil data rekening bank'
                });
            }
        });
    }
    // Connect bank account
    connectBankAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { bankName, accountNumber, credentials } = req.body;
                if (!bankName || !accountNumber || !credentials) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data bank name, account number, dan credentials diperlukan'
                    });
                }
                const result = yield bankIntegrationService_1.default.connectBankAccount(userId, bankName, accountNumber, credentials);
                res.json(result);
            }
            catch (error) {
                console.error('Error connecting bank account:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal menghubungkan rekening bank'
                });
            }
        });
    }
    // Sync bank account
    syncBankAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { accountId } = req.params;
                if (!accountId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Account ID diperlukan'
                    });
                }
                const result = yield bankIntegrationService_1.default.syncBankAccount(accountId, userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error syncing bank account:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal sinkronisasi rekening bank'
                });
            }
        });
    }
    // Get bank transactions
    getBankTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { accountId } = req.params;
                const limit = parseInt(req.query.limit) || 50;
                if (!accountId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Account ID diperlukan'
                    });
                }
                const result = yield bankIntegrationService_1.default.getBankTransactions(accountId, userId, limit);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting bank transactions:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil data transaksi bank'
                });
            }
        });
    }
    // Get account balance
    getAccountBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { accountId } = req.params;
                if (!accountId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Account ID diperlukan'
                    });
                }
                const result = yield bankIntegrationService_1.default.getAccountBalance(accountId, userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting account balance:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil saldo rekening'
                });
            }
        });
    }
    // Disconnect bank account
    disconnectBankAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { accountId } = req.params;
                if (!accountId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Account ID diperlukan'
                    });
                }
                const result = yield bankIntegrationService_1.default.disconnectBankAccount(accountId, userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error disconnecting bank account:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal memutuskan rekening bank'
                });
            }
        });
    }
    // Update sync frequency
    updateSyncFrequency(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { accountId } = req.params;
                const { frequency } = req.body;
                if (!accountId || !frequency) {
                    return res.status(400).json({
                        success: false,
                        message: 'Account ID dan frequency diperlukan'
                    });
                }
                const result = yield bankIntegrationService_1.default.updateSyncFrequency(accountId, userId, frequency);
                res.json(result);
            }
            catch (error) {
                console.error('Error updating sync frequency:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal mengubah frekuensi sinkronisasi'
                });
            }
        });
    }
}
exports.default = new BankIntegrationController();
