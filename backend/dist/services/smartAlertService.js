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
const database_1 = __importDefault(require("../utils/database"));
const notificationService_1 = __importDefault(require("./notificationService"));
class SmartAlertService {
    // Detect unusual spending patterns
    detectUnusualSpending(userId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const transaction = yield database_1.default.transaction.findUnique({
                    where: { id: transactionId },
                    include: { category: true }
                });
                if (!transaction || transaction.type !== 'expense' || !transaction.categoryId) {
                    return;
                }
                const pattern = yield this.getSpendingPattern(userId, transaction.categoryId);
                if (pattern && pattern.totalTransactions >= 3) {
                    const percentage = (transaction.amount / pattern.averageAmount) * 100;
                    if (percentage > 200) { // 200% lebih tinggi dari rata-rata
                        yield this.createUnusualSpendingAlert(userId, {
                            categoryId: transaction.categoryId,
                            categoryName: ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                            currentAmount: transaction.amount,
                            averageAmount: pattern.averageAmount,
                            percentage,
                            transactionId: transaction.id
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error detecting unusual spending:', error);
            }
        });
    }
    // Get spending pattern for a category
    getSpendingPattern(userId, categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                const transactions = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        categoryId,
                        type: 'expense',
                        date: {
                            gte: threeMonthsAgo
                        }
                    },
                    include: { category: true },
                    orderBy: { date: 'desc' }
                });
                if (transactions.length < 3) {
                    return null;
                }
                const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
                const averageAmount = totalAmount / transactions.length;
                return {
                    categoryId,
                    categoryName: ((_a = transactions[0].category) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                    averageAmount,
                    totalTransactions: transactions.length,
                    lastTransactionDate: transactions[0].date
                };
            }
            catch (error) {
                console.error('Error getting spending pattern:', error);
                return null;
            }
        });
    }
    // Create unusual spending alert
    createUnusualSpendingAlert(userId, alert) {
        return __awaiter(this, void 0, void 0, function* () {
            const priority = alert.percentage > 300 ? 'high' : 'medium';
            const message = alert.percentage > 300
                ? `Pengeluaran ${alert.categoryName} sebesar Rp ${alert.currentAmount.toLocaleString('id-ID')} sangat tinggi dari biasanya (Rp ${alert.averageAmount.toLocaleString('id-ID')})`
                : `Pengeluaran ${alert.categoryName} sebesar Rp ${alert.currentAmount.toLocaleString('id-ID')} lebih tinggi dari biasanya (Rp ${alert.averageAmount.toLocaleString('id-ID')})`;
            yield notificationService_1.default.createSystemNotification(userId, '🔍 Pengeluaran Tidak Biasa', message, priority);
        });
    }
    // Detect spending trends
    detectSpendingTrends(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                const [currentMonth, lastMonth] = yield Promise.all([
                    this.getMonthlyExpenses(userId, oneMonthAgo),
                    this.getMonthlyExpenses(userId, twoMonthsAgo)
                ]);
                if (currentMonth > 0 && lastMonth > 0) {
                    const percentageChange = ((currentMonth - lastMonth) / lastMonth) * 100;
                    if (percentageChange > 50) {
                        yield notificationService_1.default.createSystemNotification(userId, '📈 Peningkatan Pengeluaran', `Pengeluaran bulan ini meningkat ${percentageChange.toFixed(1)}% dari bulan lalu. Perhatikan pengeluaran Anda!`, 'medium');
                    }
                    else if (percentageChange < -30) {
                        yield notificationService_1.default.createSystemNotification(userId, '📉 Penurunan Pengeluaran', `Pengeluaran bulan ini menurun ${Math.abs(percentageChange).toFixed(1)}% dari bulan lalu. Bagus!`, 'low');
                    }
                }
            }
            catch (error) {
                console.error('Error detecting spending trends:', error);
            }
        });
    }
    // Get monthly expenses
    getMonthlyExpenses(userId, startDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            const result = yield database_1.default.transaction.aggregate({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: startDate,
                        lt: endDate
                    }
                },
                _sum: { amount: true }
            });
            return result._sum.amount || 0;
        });
    }
    // Detect savings opportunities
    detectSavingsOpportunities(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const expenses = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        type: 'expense',
                        date: {
                            gte: oneMonthAgo
                        }
                    },
                    include: { category: true }
                });
                const categoryExpenses = new Map();
                expenses.forEach(expense => {
                    var _a;
                    const categoryName = ((_a = expense.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
                    const current = categoryExpenses.get(categoryName) || 0;
                    categoryExpenses.set(categoryName, current + expense.amount);
                });
                // Find categories with highest expenses
                const sortedCategories = Array.from(categoryExpenses.entries())
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3);
                if (sortedCategories.length > 0) {
                    const [topCategory, amount] = sortedCategories[0];
                    const potentialSavings = amount * 0.1; // 10% potential savings
                    if (potentialSavings > 100000) { // Only alert if potential savings > 100k
                        yield notificationService_1.default.createSystemNotification(userId, '💡 Peluang Hemat', `Kategori "${topCategory}" adalah pengeluaran terbesar Anda bulan ini (Rp ${amount.toLocaleString('id-ID')}). Coba hemat 10% untuk menghemat Rp ${potentialSavings.toLocaleString('id-ID')}!`, 'low');
                    }
                }
            }
            catch (error) {
                console.error('Error detecting savings opportunities:', error);
            }
        });
    }
    // Detect income patterns
    detectIncomePatterns(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                const incomes = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        type: 'income',
                        date: {
                            gte: threeMonthsAgo
                        }
                    },
                    include: { category: true },
                    orderBy: { date: 'desc' }
                });
                if (incomes.length >= 3) {
                    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
                    const averageIncome = totalIncome / incomes.length;
                    const lastIncome = incomes[0];
                    if (lastIncome.amount > averageIncome * 1.5) {
                        yield notificationService_1.default.createSystemNotification(userId, '🎉 Pemasukan Tinggi', `Pemasukan terbaru Anda (Rp ${lastIncome.amount.toLocaleString('id-ID')}) lebih tinggi dari rata-rata (Rp ${averageIncome.toLocaleString('id-ID')}). Pertimbangkan untuk menabung lebih banyak!`, 'low');
                    }
                }
            }
            catch (error) {
                console.error('Error detecting income patterns:', error);
            }
        });
    }
    // Run all smart alerts
    runSmartAlerts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all([
                    this.detectSpendingTrends(userId),
                    this.detectSavingsOpportunities(userId),
                    this.detectIncomePatterns(userId)
                ]);
            }
            catch (error) {
                console.error('Error running smart alerts:', error);
            }
        });
    }
}
exports.default = new SmartAlertService();
