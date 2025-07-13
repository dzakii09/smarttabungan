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
const paymentGatewayService_1 = __importDefault(require("../services/paymentGatewayService"));
class PaymentGatewayController {
    // Get available payment methods
    getPaymentMethods(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const methods = yield paymentGatewayService_1.default.getPaymentMethods();
                res.json({
                    success: true,
                    data: methods
                });
            }
            catch (error) {
                console.error('Error getting payment methods:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil metode pembayaran'
                });
            }
        });
    }
    // Process payment
    processPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { amount, currency, paymentMethod, description, metadata } = req.body;
                if (!amount || !paymentMethod || !description) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data amount, paymentMethod, dan description diperlukan'
                    });
                }
                const result = yield paymentGatewayService_1.default.processPayment(userId, {
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
            }
            catch (error) {
                console.error('Error processing payment:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal memproses pembayaran'
                });
            }
        });
    }
    // Get payment history
    getPaymentHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const limit = parseInt(req.query.limit) || 50;
                const offset = parseInt(req.query.offset) || 0;
                const result = yield paymentGatewayService_1.default.getPaymentHistory(userId, limit, offset);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting payment history:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil riwayat pembayaran'
                });
            }
        });
    }
    // Get payment analytics
    getPaymentAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const period = req.query.period || 'month';
                const result = yield paymentGatewayService_1.default.getPaymentAnalytics(userId, period);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting payment analytics:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil analisis pembayaran'
                });
            }
        });
    }
    // Check payment status
    checkPaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { transactionId } = req.params;
                if (!transactionId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Transaction ID diperlukan'
                    });
                }
                const result = yield paymentGatewayService_1.default.checkPaymentStatus(transactionId, userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error checking payment status:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal memeriksa status pembayaran'
                });
            }
        });
    }
}
exports.default = new PaymentGatewayController();
