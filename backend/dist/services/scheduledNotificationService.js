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
const smartAlertService_1 = __importDefault(require("./smartAlertService"));
class ScheduledNotificationService {
    // Daily reminder to check finances
    sendDailyReminder(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                // Get yesterday's transactions
                const yesterdayTransactions = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        date: {
                            gte: yesterday,
                            lt: today
                        }
                    },
                    include: { category: true }
                });
                const totalExpense = yesterdayTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                const totalIncome = yesterdayTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                if (yesterdayTransactions.length > 0) {
                    yield notificationService_1.default.createSystemNotification(userId, '📅 Ringkasan Kemarin', `Kemarin Anda memiliki ${yesterdayTransactions.length} transaksi. Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}, Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`, 'low');
                }
                else {
                    yield notificationService_1.default.createSystemNotification(userId, '📝 Jangan Lupa Catat', 'Jangan lupa untuk mencatat transaksi keuangan Anda hari ini!', 'low');
                }
            }
            catch (error) {
                console.error('Error sending daily reminder:', error);
            }
        });
    }
    // Weekly financial summary
    sendWeeklySummary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weeklyTransactions = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        date: {
                            gte: weekAgo,
                            lte: today
                        }
                    },
                    include: { category: true }
                });
                const totalExpense = weeklyTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                const totalIncome = weeklyTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const savings = totalIncome - totalExpense;
                const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
                // Get top spending categories
                const categoryExpenses = new Map();
                weeklyTransactions
                    .filter(t => t.type === 'expense')
                    .forEach(transaction => {
                    var _a;
                    const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
                    const current = categoryExpenses.get(categoryName) || 0;
                    categoryExpenses.set(categoryName, current + transaction.amount);
                });
                const topCategories = Array.from(categoryExpenses.entries())
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3);
                let message = `Minggu ini: Pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}, Pemasukan Rp ${totalIncome.toLocaleString('id-ID')}, Tabungan Rp ${savings.toLocaleString('id-ID')} (${savingsRate.toFixed(1)}%)`;
                if (topCategories.length > 0) {
                    message += `. Pengeluaran terbesar: ${topCategories[0][0]} (Rp ${topCategories[0][1].toLocaleString('id-ID')})`;
                }
                yield notificationService_1.default.createSystemNotification(userId, '📊 Ringkasan Mingguan', message, 'medium');
            }
            catch (error) {
                console.error('Error sending weekly summary:', error);
            }
        });
    }
    // Monthly financial summary
    sendMonthlySummary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                const monthlyTransactions = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        date: {
                            gte: monthAgo,
                            lte: today
                        }
                    },
                    include: { category: true }
                });
                const totalExpense = monthlyTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                const totalIncome = monthlyTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const savings = totalIncome - totalExpense;
                const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
                const monthName = monthAgo.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                yield notificationService_1.default.createSystemNotification(userId, '📈 Ringkasan Bulanan', `${monthName}: Pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}, Pemasukan Rp ${totalIncome.toLocaleString('id-ID')}, Tabungan Rp ${savings.toLocaleString('id-ID')} (${savingsRate.toFixed(1)}%)`, 'medium');
            }
            catch (error) {
                console.error('Error sending monthly summary:', error);
            }
        });
    }
    // Goal progress reminder
    sendGoalProgressReminder(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const goals = yield database_1.default.goal.findMany({
                    where: {
                        userId,
                        isCompleted: false
                    }
                });
                for (const goal of goals) {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    if (goal.targetDate) {
                        const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if (daysLeft <= 30 && progress < 80) {
                            yield notificationService_1.default.createSystemNotification(userId, '🎯 Deadline Tujuan Mendekati', `Tujuan "${goal.title}" deadline dalam ${daysLeft} hari. Progress: ${progress.toFixed(1)}%. Tinggal Rp ${(goal.targetAmount - goal.currentAmount).toLocaleString('id-ID')} lagi!`, 'high');
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error sending goal progress reminder:', error);
            }
        });
    }
    // Budget check reminder
    sendBudgetCheckReminder(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const activeBudgets = yield database_1.default.budget.findMany({
                    where: {
                        userId,
                        isActive: true
                    },
                    include: { category: true }
                });
                for (const budget of activeBudgets) {
                    const spent = yield this.calculateSpentAmount(userId, budget);
                    const progress = (spent / budget.amount) * 100;
                    if (progress >= 80 && progress < 100) {
                        yield notificationService_1.default.createSystemNotification(userId, '⚠️ Budget Hampir Habis', `Budget ${((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'total'} sudah ${progress.toFixed(1)}% terpakai. Tersisa Rp ${(budget.amount - spent).toLocaleString('id-ID')}`, 'medium');
                    }
                }
            }
            catch (error) {
                console.error('Error sending budget check reminder:', error);
            }
        });
    }
    // Smart insights reminder
    sendSmartInsightsReminder(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield smartAlertService_1.default.runSmartAlerts(userId);
            }
            catch (error) {
                console.error('Error sending smart insights reminder:', error);
            }
        });
    }
    // Calculate spent amount for budget
    calculateSpentAmount(userId, budget) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {
                    userId,
                    type: 'expense',
                    date: {
                        gte: budget.startDate,
                        lte: budget.endDate
                    }
                };
                if (budget.categoryId) {
                    where.categoryId = budget.categoryId;
                }
                const result = yield database_1.default.transaction.aggregate({
                    where,
                    _sum: { amount: true }
                });
                return result._sum.amount || 0;
            }
            catch (error) {
                console.error('Error calculating spent amount:', error);
                return 0;
            }
        });
    }
    // Run all scheduled notifications for a user
    runScheduledNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all([
                    this.sendDailyReminder(userId),
                    this.sendGoalProgressReminder(userId),
                    this.sendBudgetCheckReminder(userId),
                    this.sendSmartInsightsReminder(userId)
                ]);
            }
            catch (error) {
                console.error('Error running scheduled notifications:', error);
            }
        });
    }
}
exports.default = new ScheduledNotificationService();
