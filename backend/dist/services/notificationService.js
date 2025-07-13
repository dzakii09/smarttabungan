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
exports.sendNotification = void 0;
const database_1 = __importDefault(require("../utils/database"));
class NotificationService {
    // Create notification
    createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield database_1.default.notification.create({
                    data: {
                        userId: data.userId,
                        title: data.title,
                        message: data.message,
                        type: data.type,
                        priority: data.priority || 'medium',
                        scheduledAt: data.scheduledAt,
                        metadata: data.metadata ? JSON.stringify(data.metadata) : null
                    }
                });
                return notification;
            }
            catch (error) {
                console.error('Error creating notification:', error);
                throw error;
            }
        });
    }
    // Get notifications with filters
    getNotifications(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const where = {
                    userId: filters.userId
                };
                if (filters.type)
                    where.type = filters.type;
                if (filters.isRead !== undefined)
                    where.isRead = filters.isRead;
                if (filters.priority)
                    where.priority = filters.priority;
                const notifications = yield database_1.default.notification.findMany({
                    where,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: filters.limit || 50,
                    skip: filters.offset || 0
                });
                return notifications.map(notification => (Object.assign(Object.assign({}, notification), { metadata: notification.metadata ? JSON.parse(notification.metadata) : null })));
            }
            catch (error) {
                console.error('Error getting notifications:', error);
                throw error;
            }
        });
    }
    // Mark notification as read
    markAsRead(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.notification.update({
                    where: {
                        id: notificationId,
                        userId
                    },
                    data: { isRead: true }
                });
            }
            catch (error) {
                console.error('Error marking notification as read:', error);
                throw error;
            }
        });
    }
    // Mark all notifications as read
    markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.notification.updateMany({
                    where: { userId, isRead: false },
                    data: { isRead: true }
                });
            }
            catch (error) {
                console.error('Error marking all notifications as read:', error);
                throw error;
            }
        });
    }
    // Delete notification
    deleteNotification(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.notification.delete({
                    where: {
                        id: notificationId,
                        userId
                    }
                });
            }
            catch (error) {
                console.error('Error deleting notification:', error);
                throw error;
            }
        });
    }
    // Get unread count
    getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.notification.count({
                    where: { userId, isRead: false }
                });
            }
            catch (error) {
                console.error('Error getting unread count:', error);
                return 0;
            }
        });
    }
    // Smart Budget Alerts
    createBudgetAlert(userId, budgetId, budgetName, spent, limit, percentage) {
        return __awaiter(this, void 0, void 0, function* () {
            let priority = 'medium';
            let message = '';
            if (percentage >= 90) {
                priority = 'urgent';
                message = `Budget ${budgetName} sudah mencapai ${percentage.toFixed(1)}% (${spent.toLocaleString('id-ID')} dari ${limit.toLocaleString('id-ID')}). Hati-hati dengan pengeluaran!`;
            }
            else if (percentage >= 75) {
                priority = 'high';
                message = `Budget ${budgetName} sudah mencapai ${percentage.toFixed(1)}% (${spent.toLocaleString('id-ID')} dari ${limit.toLocaleString('id-ID')}).`;
            }
            else if (percentage >= 50) {
                priority = 'medium';
                message = `Budget ${budgetName} sudah mencapai ${percentage.toFixed(1)}% (${spent.toLocaleString('id-ID')} dari ${limit.toLocaleString('id-ID')}).`;
            }
            if (message) {
                return this.createNotification({
                    userId,
                    title: 'Budget Alert',
                    message,
                    type: 'budget_alert',
                    priority,
                    metadata: {
                        budgetId,
                        budgetName,
                        spent,
                        limit,
                        percentage
                    }
                });
            }
        });
    }
    // Goal Reminder
    createGoalReminder(userId, goalId, goalTitle, currentAmount, targetAmount, targetDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const daysLeft = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const percentage = (currentAmount / targetAmount) * 100;
            let priority = 'medium';
            let message = '';
            if (daysLeft <= 7 && percentage < 80) {
                priority = 'urgent';
                message = `Goal "${goalTitle}" deadline dalam ${daysLeft} hari! Progress: ${percentage.toFixed(1)}%. Segera tingkatkan tabungan!`;
            }
            else if (daysLeft <= 30 && percentage < 60) {
                priority = 'high';
                message = `Goal "${goalTitle}" deadline dalam ${daysLeft} hari. Progress: ${percentage.toFixed(1)}%.`;
            }
            else if (daysLeft <= 90 && percentage < 40) {
                priority = 'medium';
                message = `Goal "${goalTitle}" deadline dalam ${daysLeft} hari. Progress: ${percentage.toFixed(1)}%.`;
            }
            if (message) {
                return this.createNotification({
                    userId,
                    title: 'Goal Reminder',
                    message,
                    type: 'goal_reminder',
                    priority,
                    metadata: {
                        goalId,
                        goalTitle,
                        currentAmount,
                        targetAmount,
                        targetDate: targetDate.toISOString(),
                        daysLeft,
                        percentage
                    }
                });
            }
        });
    }
    // Spending Pattern Alert
    createSpendingPatternAlert(userId, categoryName, amount, averageAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const increase = ((amount - averageAmount) / averageAmount) * 100;
            if (increase > 50) {
                return this.createNotification({
                    userId,
                    title: 'Spending Pattern Alert',
                    message: `Pengeluaran untuk kategori "${categoryName}" meningkat ${increase.toFixed(1)}% dari rata-rata. Perhatikan pengeluaran Anda!`,
                    type: 'warning',
                    priority: 'high',
                    metadata: {
                        categoryName,
                        amount,
                        averageAmount,
                        increase
                    }
                });
            }
        });
    }
    // Savings Goal Achievement
    createSavingsAchievement(userId, goalTitle, percentage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (percentage >= 100) {
                return this.createNotification({
                    userId,
                    title: 'Goal Achieved! 🎉',
                    message: `Selamat! Anda telah mencapai goal "${goalTitle}"!`,
                    type: 'success',
                    priority: 'high',
                    metadata: {
                        goalTitle,
                        percentage
                    }
                });
            }
            else if (percentage >= 80) {
                return this.createNotification({
                    userId,
                    title: 'Goal Progress',
                    message: `Goal "${goalTitle}" sudah ${percentage.toFixed(1)}% tercapai! Hampir selesai!`,
                    type: 'success',
                    priority: 'medium',
                    metadata: {
                        goalTitle,
                        percentage
                    }
                });
            }
        });
    }
    // Monthly Summary
    createMonthlySummary(userId, month, totalIncome, totalExpense, savings, savingsRate) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = `Ringkasan ${month}: Pemasukan ${totalIncome.toLocaleString('id-ID')}, Pengeluaran ${totalExpense.toLocaleString('id-ID')}, Tabungan ${savings.toLocaleString('id-ID')} (${savingsRate.toFixed(1)}%)`;
            if (savingsRate >= 20) {
                message += ' - Excellent! Pertahankan kebiasaan menabung Anda!';
            }
            else if (savingsRate >= 10) {
                message += ' - Bagus! Coba tingkatkan lagi tabungan Anda.';
            }
            else {
                message += ' - Perlu evaluasi pengeluaran untuk meningkatkan tabungan.';
            }
            return this.createNotification({
                userId,
                title: 'Monthly Summary',
                message,
                type: 'info',
                priority: 'medium',
                metadata: {
                    month,
                    totalIncome,
                    totalExpense,
                    savings,
                    savingsRate
                }
            });
        });
    }
    // Clean old notifications (older than 30 days)
    cleanOldNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                yield database_1.default.notification.deleteMany({
                    where: {
                        createdAt: {
                            lt: thirtyDaysAgo
                        },
                        isRead: true
                    }
                });
                return { success: true };
            }
            catch (error) {
                console.error('Error cleaning old notifications:', error);
                throw error;
            }
        });
    }
    // Create new notification
    createNewNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.notification.create({
                    data: {
                        userId: data.userId,
                        type: data.type,
                        title: data.title,
                        message: data.message,
                        priority: data.priority,
                        metadata: data.data || {},
                        isRead: false
                    }
                });
            }
            catch (error) {
                console.error('Error creating notification:', error);
                throw error;
            }
        });
    }
    // Get user notifications
    getUserNotifications(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50) {
            try {
                return yield database_1.default.notification.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: limit
                });
            }
            catch (error) {
                console.error('Error getting user notifications:', error);
                return [];
            }
        });
    }
    // Budget Alert Notifications
    createBudgetAlertNotification(userId, budgetData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { budget, spent, remaining, progress } = budgetData;
            let title = '';
            let message = '';
            let priority = 'low';
            if (progress >= 100) {
                title = '🚨 Budget Terlampaui!';
                message = `Budget ${((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'total'} sudah terlampaui sebesar ${this.formatCurrency(spent - budget.amount)}`;
                priority = 'high';
            }
            else if (progress >= 80) {
                title = '⚠️ Budget Hampir Habis';
                message = `Budget ${((_b = budget.category) === null || _b === void 0 ? void 0 : _b.name) || 'total'} sudah ${progress.toFixed(1)}% terpakai. Tersisa ${this.formatCurrency(remaining)}`;
                priority = 'medium';
            }
            else if (progress >= 60) {
                title = '📊 Update Budget';
                message = `Budget ${((_c = budget.category) === null || _c === void 0 ? void 0 : _c.name) || 'total'} sudah ${progress.toFixed(1)}% terpakai`;
                priority = 'low';
            }
            if (title && message) {
                return yield this.createNewNotification({
                    userId,
                    type: 'budget_alert',
                    title,
                    message,
                    priority,
                    data: { budgetId: budget.id, progress, spent, remaining }
                });
            }
        });
    }
    // Bill Reminder Notifications
    createBillReminderNotification(userId, billData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, amount, dueDate, category } = billData;
            const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            let priority = 'low';
            let urgencyMessage = '';
            if (daysUntilDue <= 0) {
                urgencyMessage = 'Tagihan sudah jatuh tempo!';
                priority = 'high';
            }
            else if (daysUntilDue <= 3) {
                urgencyMessage = `Jatuh tempo dalam ${daysUntilDue} hari`;
                priority = 'high';
            }
            else if (daysUntilDue <= 7) {
                urgencyMessage = `Jatuh tempo dalam ${daysUntilDue} hari`;
                priority = 'medium';
            }
            else {
                urgencyMessage = `Jatuh tempo dalam ${daysUntilDue} hari`;
                priority = 'low';
            }
            return yield this.createNewNotification({
                userId,
                type: 'bill_reminder',
                title: `💳 ${title}`,
                message: `${urgencyMessage}. Jumlah: ${this.formatCurrency(amount)}`,
                priority,
                data: { billId: billData.id, dueDate, amount }
            });
        });
    }
    // Savings Goal Notifications
    createSavingsGoalNotification(userId, goalData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { goal, currentAmount, targetAmount } = goalData;
            const progress = (currentAmount / targetAmount) * 100;
            let title = '';
            let message = '';
            let priority = 'low';
            if (progress >= 100) {
                title = '🎉 Tujuan Tercapai!';
                message = `Selamat! Anda telah mencapai tujuan "${goal.name}"`;
                priority = 'high';
            }
            else if (progress >= 75) {
                title = '🏆 Hampir Tercapai!';
                message = `Tujuan "${goal.name}" sudah ${progress.toFixed(1)}% tercapai. Tinggal ${this.formatCurrency(targetAmount - currentAmount)} lagi!`;
                priority = 'medium';
            }
            else if (progress >= 50) {
                title = '📈 Progress Tujuan';
                message = `Tujuan "${goal.name}" sudah ${progress.toFixed(1)}% tercapai`;
                priority = 'low';
            }
            if (title && message) {
                return yield this.createNewNotification({
                    userId,
                    type: 'savings_goal',
                    title,
                    message,
                    priority,
                    data: { goalId: goal.id, progress, currentAmount, targetAmount }
                });
            }
        });
    }
    // Unusual Spending Detection
    createUnusualSpendingAlert(userId, transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transaction, averageAmount, category } = transactionData;
            const difference = transaction.amount - averageAmount;
            const percentage = (difference / averageAmount) * 100;
            if (percentage > 200) { // 200% lebih tinggi dari rata-rata
                return yield this.createNewNotification({
                    userId,
                    type: 'unusual_spending',
                    title: '🔍 Pengeluaran Tidak Biasa',
                    message: `Pengeluaran ${category.name} sebesar ${this.formatCurrency(transaction.amount)} ${percentage > 300 ? 'sangat tinggi' : 'lebih tinggi'} dari biasanya (${this.formatCurrency(averageAmount)})`,
                    priority: 'medium',
                    data: { transactionId: transaction.id, amount: transaction.amount, averageAmount, percentage }
                });
            }
        });
    }
    // System Notifications
    createSystemNotification(userId_1, title_1, message_1) {
        return __awaiter(this, arguments, void 0, function* (userId, title, message, priority = 'low') {
            return yield this.createNewNotification({
                userId,
                type: 'system',
                title,
                message,
                priority
            });
        });
    }
    // Check and create notifications for user
    checkAndCreateNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check budget alerts
                yield this.checkBudgetAlerts(userId);
                // Check savings goals
                yield this.checkSavingsGoals(userId);
                // Check unusual spending
                yield this.checkUnusualSpending(userId);
            }
            catch (error) {
                console.error('Error checking notifications:', error);
            }
        });
    }
    // Check budget alerts
    checkBudgetAlerts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const budgets = yield database_1.default.budget.findMany({
                    where: { userId, isActive: true },
                    include: { category: true }
                });
                for (const budget of budgets) {
                    const spent = yield this.calculateSpentAmount(userId, budget);
                    const remaining = Math.max(0, budget.amount - spent);
                    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                    yield this.createBudgetAlertNotification(userId, { budget, spent, remaining, progress });
                }
            }
            catch (error) {
                console.error('Error checking budget alerts:', error);
            }
        });
    }
    // Check savings goals
    checkSavingsGoals(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const goals = yield database_1.default.goal.findMany({
                    where: { userId }
                });
                for (const goal of goals) {
                    yield this.createSavingsGoalNotification(userId, {
                        goal,
                        currentAmount: goal.currentAmount,
                        targetAmount: goal.targetAmount
                    });
                }
            }
            catch (error) {
                console.error('Error checking savings goals:', error);
            }
        });
    }
    // Check unusual spending
    checkUnusualSpending(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recentTransactions = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        type: 'expense',
                        date: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                        }
                    },
                    include: { category: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                });
                for (const transaction of recentTransactions) {
                    const averageAmount = yield this.getAverageAmountForCategory(userId, transaction.categoryId);
                    yield this.createUnusualSpendingAlert(userId, {
                        transaction,
                        averageAmount,
                        category: transaction.category
                    });
                }
            }
            catch (error) {
                console.error('Error checking unusual spending:', error);
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
    // Get average amount for category
    getAverageAmountForCategory(userId, categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.default.transaction.aggregate({
                    where: {
                        userId,
                        categoryId,
                        type: 'expense',
                        date: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                        }
                    },
                    _avg: { amount: true }
                });
                return result._avg.amount || 0;
            }
            catch (error) {
                console.error('Error getting average amount:', error);
                return 0;
            }
        });
    }
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }
}
// Export instance
const notificationService = new NotificationService();
// Export convenience function
const sendNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return notificationService.createNotification(data);
});
exports.sendNotification = sendNotification;
exports.default = notificationService;
