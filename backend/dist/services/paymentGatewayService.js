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
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class PaymentGatewayService {
    constructor() {
        this.supportedPaymentMethods = [
            {
                id: 'gopay',
                name: 'GoPay',
                type: 'e-wallet',
                logo: '/images/payment/gopay.png',
                isActive: true
            },
            {
                id: 'ovo',
                name: 'OVO',
                type: 'e-wallet',
                logo: '/images/payment/ovo.png',
                isActive: true
            },
            {
                id: 'dana',
                name: 'DANA',
                type: 'e-wallet',
                logo: '/images/payment/dana.png',
                isActive: true
            },
            {
                id: 'linkaja',
                name: 'LinkAja',
                type: 'e-wallet',
                logo: '/images/payment/linkaja.png',
                isActive: true
            },
            {
                id: 'bca-va',
                name: 'BCA Virtual Account',
                type: 'bank-transfer',
                logo: '/images/payment/bca.png',
                isActive: true
            },
            {
                id: 'mandiri-va',
                name: 'Mandiri Virtual Account',
                type: 'bank-transfer',
                logo: '/images/payment/mandiri.png',
                isActive: true
            },
            {
                id: 'qris',
                name: 'QRIS',
                type: 'qris',
                logo: '/images/payment/qris.png',
                isActive: true
            },
            {
                id: 'visa',
                name: 'Visa',
                type: 'credit-card',
                logo: '/images/payment/visa.png',
                isActive: true
            },
            {
                id: 'mastercard',
                name: 'Mastercard',
                type: 'credit-card',
                logo: '/images/payment/mastercard.png',
                isActive: true
            },
            {
                id: 'indomaret',
                name: 'Indomaret',
                type: 'convenience-store',
                logo: '/images/payment/indomaret.png',
                isActive: true
            },
            {
                id: 'alfamart',
                name: 'Alfamart',
                type: 'convenience-store',
                logo: '/images/payment/alfamart.png',
                isActive: true
            }
        ];
    }
    // Get available payment methods
    getPaymentMethods() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.supportedPaymentMethods.filter(method => method.isActive);
        });
    }
    // Process payment
    processPayment(userId, paymentRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate payment method
                const paymentMethod = this.supportedPaymentMethods.find(method => method.id === paymentRequest.paymentMethod && method.isActive);
                if (!paymentMethod) {
                    throw new Error('Metode pembayaran tidak valid atau tidak tersedia');
                }
                // Create payment transaction record
                const paymentTransaction = yield prisma.paymentTransaction.create({
                    data: {
                        userId,
                        amount: paymentRequest.amount,
                        currency: paymentRequest.currency,
                        paymentMethod: paymentRequest.paymentMethod,
                        status: 'pending',
                        description: paymentRequest.description,
                        metadata: paymentRequest.metadata || {}
                    }
                });
                // Simulate payment processing
                const paymentResponse = yield this.simulatePaymentProcessing(paymentTransaction.id, paymentRequest, paymentMethod);
                // Update transaction with external ID
                yield prisma.paymentTransaction.update({
                    where: { id: paymentTransaction.id },
                    data: {
                        externalId: paymentResponse.externalId,
                        status: paymentResponse.status
                    }
                });
                return {
                    id: paymentTransaction.id,
                    status: paymentResponse.status,
                    paymentUrl: paymentResponse.paymentUrl,
                    qrCode: paymentResponse.qrCode,
                    externalId: paymentResponse.externalId
                };
            }
            catch (error) {
                console.error('Error processing payment:', error);
                throw new Error(`Gagal memproses pembayaran: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Simulate payment processing
    simulatePaymentProcessing(transactionId, paymentRequest, paymentMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulate API delay
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const externalId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Simulate different payment method responses
            switch (paymentMethod.type) {
                case 'e-wallet':
                    return {
                        id: transactionId,
                        status: 'pending',
                        paymentUrl: `https://payment.example.com/ewallet/${externalId}`,
                        externalId
                    };
                case 'bank-transfer':
                    return {
                        id: transactionId,
                        status: 'pending',
                        paymentUrl: `https://payment.example.com/va/${externalId}`,
                        externalId
                    };
                case 'qris':
                    return {
                        id: transactionId,
                        status: 'pending',
                        qrCode: `https://payment.example.com/qr/${externalId}`,
                        externalId
                    };
                case 'credit-card':
                    return {
                        id: transactionId,
                        status: 'pending',
                        paymentUrl: `https://payment.example.com/cc/${externalId}`,
                        externalId
                    };
                case 'convenience-store':
                    return {
                        id: transactionId,
                        status: 'pending',
                        paymentUrl: `https://payment.example.com/cstore/${externalId}`,
                        externalId
                    };
                default:
                    throw new Error('Metode pembayaran tidak didukung');
            }
        });
    }
    // Get payment history
    getPaymentHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50, offset = 0) {
            try {
                const transactions = yield prisma.paymentTransaction.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset
                });
                const total = yield prisma.paymentTransaction.count({
                    where: { userId }
                });
                return {
                    success: true,
                    data: {
                        transactions,
                        pagination: {
                            total,
                            limit,
                            offset,
                            hasMore: offset + limit < total
                        }
                    }
                };
            }
            catch (error) {
                console.error('Error getting payment history:', error);
                throw new Error('Gagal mengambil riwayat pembayaran');
            }
        });
    }
    // Get payment analytics
    getPaymentAnalytics(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, period = 'month') {
            try {
                const startDate = new Date();
                switch (period) {
                    case 'week':
                        startDate.setDate(startDate.getDate() - 7);
                        break;
                    case 'month':
                        startDate.setMonth(startDate.getMonth() - 1);
                        break;
                    case 'year':
                        startDate.setFullYear(startDate.getFullYear() - 1);
                        break;
                }
                const transactions = yield prisma.paymentTransaction.findMany({
                    where: {
                        userId,
                        createdAt: {
                            gte: startDate
                        }
                    }
                });
                // Calculate analytics
                const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
                const successCount = transactions.filter(tx => tx.status === 'success').length;
                const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
                const failedCount = transactions.filter(tx => tx.status === 'failed').length;
                // Payment method distribution
                const methodDistribution = transactions.reduce((acc, tx) => {
                    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + 1;
                    return acc;
                }, {});
                // Monthly trend
                const monthlyTrend = transactions.reduce((acc, tx) => {
                    const month = tx.createdAt.toISOString().substring(0, 7); // YYYY-MM
                    if (!acc[month]) {
                        acc[month] = { count: 0, amount: 0 };
                    }
                    acc[month].count++;
                    acc[month].amount += tx.amount;
                    return acc;
                }, {});
                return {
                    success: true,
                    data: {
                        summary: {
                            totalTransactions: transactions.length,
                            totalAmount,
                            successRate: transactions.length > 0 ? (successCount / transactions.length) * 100 : 0,
                            averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0
                        },
                        status: {
                            success: successCount,
                            pending: pendingCount,
                            failed: failedCount
                        },
                        methodDistribution,
                        monthlyTrend: Object.entries(monthlyTrend).map(([month, data]) => ({
                            month,
                            count: data.count,
                            amount: data.amount
                        }))
                    }
                };
            }
            catch (error) {
                console.error('Error getting payment analytics:', error);
                throw new Error('Gagal mengambil analisis pembayaran');
            }
        });
    }
    // Check payment status
    checkPaymentStatus(transactionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield prisma.paymentTransaction.findFirst({
                    where: { id: transactionId, userId }
                });
                if (!transaction) {
                    throw new Error('Transaksi pembayaran tidak ditemukan');
                }
                // Simulate status check
                const status = yield this.simulateStatusCheck(transaction.externalId);
                // Update status if changed
                if (status !== transaction.status) {
                    yield prisma.paymentTransaction.update({
                        where: { id: transactionId },
                        data: { status }
                    });
                }
                return {
                    success: true,
                    data: {
                        id: transaction.id,
                        status,
                        amount: transaction.amount,
                        paymentMethod: transaction.paymentMethod,
                        description: transaction.description,
                        createdAt: transaction.createdAt
                    }
                };
            }
            catch (error) {
                console.error('Error checking payment status:', error);
                throw new Error('Gagal memeriksa status pembayaran');
            }
        });
    }
    // Simulate status check
    simulateStatusCheck(externalId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!externalId)
                return 'failed';
            // Simulate API delay
            yield new Promise(resolve => setTimeout(resolve, 500));
            // Simulate different statuses based on external ID
            const random = Math.random();
            if (random < 0.7)
                return 'success';
            if (random < 0.9)
                return 'pending';
            return 'failed';
        });
    }
}
exports.default = new PaymentGatewayService();
