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
class AnalyticsService {
    // Get spending trends over time
    getSpendingTrends(userId_1, dateRange_1) {
        return __awaiter(this, arguments, void 0, function* (userId, dateRange, groupBy = 'day') {
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate
                    }
                },
                orderBy: { date: 'asc' }
            });
            const trends = new Map();
            transactions.forEach(transaction => {
                let dateKey;
                switch (groupBy) {
                    case 'day':
                        dateKey = transaction.date.toISOString().split('T')[0];
                        break;
                    case 'week':
                        const weekStart = new Date(transaction.date);
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        dateKey = weekStart.toISOString().split('T')[0];
                        break;
                    case 'month':
                        dateKey = transaction.date.toISOString().slice(0, 7);
                        break;
                    default:
                        dateKey = transaction.date.toISOString().split('T')[0];
                }
                const existing = trends.get(dateKey);
                if (existing) {
                    existing.amount += transaction.amount;
                    existing.count += 1;
                }
                else {
                    trends.set(dateKey, { amount: transaction.amount, count: 1 });
                }
            });
            return Array.from(trends.entries()).map(([date, data]) => ({
                date,
                amount: data.amount,
                count: data.count
            }));
        });
    }
    // Get category analytics
    getCategoryAnalytics(userId, dateRange, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type,
                    date: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate
                    },
                    categoryId: {
                        not: null
                    }
                },
                include: {
                    category: true
                }
            });
            const categoryStats = new Map();
            transactions.forEach(transaction => {
                if (transaction.category) {
                    const existing = categoryStats.get(transaction.categoryId);
                    if (existing) {
                        existing.total += transaction.amount;
                        existing.count += 1;
                    }
                    else {
                        categoryStats.set(transaction.categoryId, {
                            total: transaction.amount,
                            count: 1,
                            category: transaction.category
                        });
                    }
                }
            });
            const totalAmount = Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.total, 0);
            return Array.from(categoryStats.entries()).map(([categoryId, stats]) => ({
                categoryId,
                categoryName: stats.category.name,
                totalAmount: stats.total,
                percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0,
                count: stats.count,
                averageAmount: stats.total / stats.count
            })).sort((a, b) => b.totalAmount - a.totalAmount);
        });
    }
    // Get monthly comparison
    getMonthlyComparison(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, months = 6) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: { date: 'asc' }
            });
            const monthlyMap = new Map();
            transactions.forEach(transaction => {
                const month = transaction.date.toISOString().slice(0, 7);
                const existing = monthlyMap.get(month) || { income: 0, expense: 0 };
                if (transaction.type === 'income') {
                    existing.income += transaction.amount;
                }
                else {
                    existing.expense += transaction.amount;
                }
                monthlyMap.set(month, existing);
            });
            return Array.from(monthlyMap.entries()).map(([month, data]) => ({
                month,
                income: data.income,
                expense: data.expense,
                balance: data.income - data.expense,
                savingsRate: data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0
            })).sort((a, b) => a.month.localeCompare(b.month));
        });
    }
    // Get spending patterns by day of week
    getSpendingPatterns(userId, dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate
                    }
                }
            });
            const dayStats = new Map();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            transactions.forEach(transaction => {
                const dayOfWeek = dayNames[transaction.date.getDay()];
                const existing = dayStats.get(dayOfWeek);
                if (existing) {
                    existing.total += transaction.amount;
                    existing.count += 1;
                }
                else {
                    dayStats.set(dayOfWeek, { total: transaction.amount, count: 1 });
                }
            });
            return dayNames.map(day => {
                const stats = dayStats.get(day) || { total: 0, count: 0 };
                return {
                    dayOfWeek: day,
                    averageAmount: stats.count > 0 ? stats.total / stats.count : 0,
                    totalAmount: stats.total,
                    count: stats.count
                };
            });
        });
    }
    // Get top spending days
    getTopSpendingDays(userId_1, dateRange_1) {
        return __awaiter(this, arguments, void 0, function* (userId, dateRange, limit = 10) {
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate
                    }
                },
                include: {
                    category: true
                },
                orderBy: { amount: 'desc' },
                take: limit
            });
            return transactions.map(transaction => {
                var _a;
                return ({
                    id: transaction.id,
                    date: transaction.date,
                    amount: transaction.amount,
                    description: transaction.description,
                    category: ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya'
                });
            });
        });
    }
    // Get savings analysis
    getSavingsAnalysis(userId, dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    date: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate
                    }
                }
            });
            const totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            const savings = totalIncome - totalExpense;
            const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
            // Calculate average daily spending
            const expenseTransactions = transactions.filter(t => t.type === 'expense');
            const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
            const averageDailySpending = daysDiff > 0 ? totalExpense / daysDiff : 0;
            return {
                totalIncome,
                totalExpense,
                savings,
                savingsRate,
                averageDailySpending,
                daysAnalyzed: daysDiff,
                transactionCount: transactions.length
            };
        });
    }
    // Get budget performance analysis
    getBudgetPerformance(userId, dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const budgets = yield database_1.default.budget.findMany({
                where: {
                    userId,
                    isActive: true,
                    startDate: {
                        lte: dateRange.endDate
                    },
                    endDate: {
                        gte: dateRange.startDate
                    }
                },
                include: {
                    category: true
                }
            });
            const performance = [];
            for (const budget of budgets) {
                const spent = yield this.calculateBudgetSpent(userId, budget, dateRange);
                const progress = (spent / budget.amount) * 100;
                const remaining = budget.amount - spent;
                const status = progress >= 100 ? 'exceeded' : progress >= 80 ? 'warning' : 'on-track';
                performance.push({
                    budgetId: budget.id,
                    categoryName: ((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total',
                    budgetAmount: budget.amount,
                    spent,
                    remaining,
                    progress,
                    status,
                    period: budget.period
                });
            }
            return performance.sort((a, b) => b.progress - a.progress);
        });
    }
    // Helper method to calculate budget spent
    calculateBudgetSpent(userId, budget, dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                userId,
                type: 'expense',
                date: {
                    gte: new Date(Math.max(budget.startDate.getTime(), dateRange.startDate.getTime())),
                    lte: new Date(Math.min(budget.endDate.getTime(), dateRange.endDate.getTime()))
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
        });
    }
    // Get comprehensive financial insights
    getFinancialInsights(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, filters = {}) {
            try {
                const [spendingPatterns, incomeAnalysis, expenseAnalysis, savingsAnalysis, budgetAnalysis, goalAnalysis] = yield Promise.all([
                    this.getSpendingPatternsByCategory(userId, filters),
                    this.getIncomeAnalysis(userId, filters),
                    this.getExpenseAnalysis(userId, filters),
                    this.getSavingsAnalysisByFilters(userId, filters),
                    this.getBudgetAnalysis(userId, filters),
                    this.getGoalAnalysis(userId)
                ]);
                const recommendations = this.generateRecommendations({
                    spendingPatterns,
                    incomeAnalysis,
                    expenseAnalysis,
                    savingsAnalysis,
                    budgetAnalysis,
                    goalAnalysis
                });
                const alerts = this.generateAlerts({
                    spendingPatterns,
                    expenseAnalysis,
                    budgetAnalysis,
                    savingsAnalysis
                });
                return {
                    spendingPatterns,
                    incomeAnalysis,
                    expenseAnalysis,
                    savingsAnalysis,
                    budgetAnalysis,
                    goalAnalysis,
                    recommendations,
                    alerts
                };
            }
            catch (error) {
                console.error('Error getting financial insights:', error);
                throw error;
            }
        });
    }
    // Get spending patterns by category
    getSpendingPatternsByCategory(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId, type: 'expense' };
            if (filters.startDate && filters.endDate) {
                whereClause.date = {
                    gte: filters.startDate,
                    lte: filters.endDate
                };
            }
            if (filters.categoryId) {
                whereClause.categoryId = filters.categoryId;
            }
            const transactions = yield database_1.default.transaction.findMany({
                where: whereClause,
                include: { category: true },
                orderBy: { date: 'desc' }
            });
            const categoryMap = new Map();
            transactions.forEach(transaction => {
                var _a;
                const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Tanpa Kategori';
                const existing = categoryMap.get(categoryName) || { amount: 0, count: 0, transactions: [] };
                existing.amount += transaction.amount;
                existing.count += 1;
                existing.transactions.push(transaction);
                categoryMap.set(categoryName, existing);
            });
            const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
            return Array.from(categoryMap.entries()).map(([category, data]) => {
                const percentage = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
                const averagePerTransaction = data.count > 0 ? data.amount / data.count : 0;
                // Calculate trend (simplified - compare first half vs second half of period)
                const midPoint = Math.floor(data.transactions.length / 2);
                const firstHalf = data.transactions.slice(0, midPoint).reduce((sum, t) => sum + t.amount, 0);
                const secondHalf = data.transactions.slice(midPoint).reduce((sum, t) => sum + t.amount, 0);
                let trend = 'stable';
                if (secondHalf > firstHalf * 1.1)
                    trend = 'up';
                else if (secondHalf < firstHalf * 0.9)
                    trend = 'down';
                return {
                    category,
                    amount: data.amount,
                    percentage,
                    trend,
                    averagePerTransaction
                };
            }).sort((a, b) => b.amount - a.amount);
        });
    }
    // Get income analysis
    getIncomeAnalysis(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId, type: 'income' };
            if (filters.startDate && filters.endDate) {
                whereClause.date = {
                    gte: filters.startDate,
                    lte: filters.endDate
                };
            }
            const transactions = yield database_1.default.transaction.findMany({
                where: whereClause,
                include: { category: true },
                orderBy: { date: 'asc' }
            });
            const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
            const averageIncome = transactions.length > 0 ? totalIncome / transactions.length : 0;
            // Group by category
            const categoryMap = new Map();
            transactions.forEach(transaction => {
                var _a;
                const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Tanpa Kategori';
                categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + transaction.amount);
            });
            const incomeSources = Array.from(categoryMap.entries()).map(([category, amount]) => ({
                category,
                amount,
                percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
            })).sort((a, b) => b.amount - a.amount);
            // Calculate trend
            const midPoint = Math.floor(transactions.length / 2);
            const firstHalf = transactions.slice(0, midPoint).reduce((sum, t) => sum + t.amount, 0);
            const secondHalf = transactions.slice(midPoint).reduce((sum, t) => sum + t.amount, 0);
            let incomeTrend = 'stable';
            if (secondHalf > firstHalf * 1.1)
                incomeTrend = 'increasing';
            else if (secondHalf < firstHalf * 0.9)
                incomeTrend = 'decreasing';
            return {
                totalIncome,
                averageIncome,
                incomeSources,
                incomeTrend
            };
        });
    }
    // Get expense analysis
    getExpenseAnalysis(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId, type: 'expense' };
            if (filters.startDate && filters.endDate) {
                whereClause.date = {
                    gte: filters.startDate,
                    lte: filters.endDate
                };
            }
            const transactions = yield database_1.default.transaction.findMany({
                where: whereClause,
                include: { category: true },
                orderBy: { date: 'asc' }
            });
            const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
            const averageExpense = transactions.length > 0 ? totalExpense / transactions.length : 0;
            // Get top categories
            const topCategories = yield this.getSpendingPatternsByCategory(userId, filters);
            // Calculate trend
            const midPoint = Math.floor(transactions.length / 2);
            const firstHalf = transactions.slice(0, midPoint).reduce((sum, t) => sum + t.amount, 0);
            const secondHalf = transactions.slice(midPoint).reduce((sum, t) => sum + t.amount, 0);
            let expenseTrend = 'stable';
            if (secondHalf > firstHalf * 1.1)
                expenseTrend = 'increasing';
            else if (secondHalf < firstHalf * 0.9)
                expenseTrend = 'decreasing';
            // Monthly breakdown
            const monthlyMap = new Map();
            transactions.forEach(transaction => {
                const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
                const existing = monthlyMap.get(month) || { amount: 0, count: 0 };
                existing.amount += transaction.amount;
                existing.count += 1;
                monthlyMap.set(month, existing);
            });
            const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({
                month,
                amount: data.amount,
                count: data.count
            })).sort((a, b) => a.month.localeCompare(b.month));
            return {
                totalExpense,
                averageExpense,
                topCategories,
                expenseTrend,
                monthlyBreakdown
            };
        });
    }
    // Get savings analysis with filters
    getSavingsAnalysisByFilters(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId };
            if (filters.startDate && filters.endDate) {
                whereClause.date = {
                    gte: filters.startDate,
                    lte: filters.endDate
                };
            }
            const transactions = yield database_1.default.transaction.findMany({
                where: whereClause,
                orderBy: { date: 'asc' }
            });
            const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const savingsAmount = totalIncome - totalExpense;
            const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;
            // Get savings goal (from goals)
            const savingsGoal = yield database_1.default.goal.aggregate({
                where: { userId, isCompleted: false },
                _sum: { targetAmount: true }
            });
            const goalAmount = savingsGoal._sum.targetAmount || 0;
            const savingsTrend = savingsAmount >= goalAmount * 0.8 ? 'on_track' :
                savingsAmount >= goalAmount * 0.6 ? 'behind' : 'ahead';
            // Monthly savings
            const monthlyMap = new Map();
            transactions.forEach(transaction => {
                const month = transaction.date.toISOString().substring(0, 7);
                const existing = monthlyMap.get(month) || { income: 0, expense: 0 };
                if (transaction.type === 'income') {
                    existing.income += transaction.amount;
                }
                else {
                    existing.expense += transaction.amount;
                }
                monthlyMap.set(month, existing);
            });
            const monthlySavings = Array.from(monthlyMap.entries()).map(([month, data]) => ({
                month,
                amount: data.income - data.expense,
                rate: data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0
            })).sort((a, b) => a.month.localeCompare(b.month));
            return {
                savingsRate,
                savingsAmount,
                savingsGoal: goalAmount,
                savingsTrend,
                monthlySavings
            };
        });
    }
    // Get budget analysis
    getBudgetAnalysis(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const budgets = yield database_1.default.budget.findMany({
                where: { userId, isActive: true },
                include: { category: true }
            });
            const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
            const remainingBudget = totalBudget - totalSpent;
            const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
            const overBudgetCategories = budgets
                .filter(b => b.spent > b.amount)
                .map(b => {
                var _a;
                return ({
                    category: ((_a = b.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total',
                    budget: b.amount,
                    spent: b.spent,
                    overAmount: b.spent - b.amount
                });
            })
                .sort((a, b) => b.overAmount - a.overAmount);
            const underBudgetCategories = budgets
                .filter(b => b.spent <= b.amount)
                .map(b => {
                var _a;
                return ({
                    category: ((_a = b.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total',
                    budget: b.amount,
                    spent: b.spent,
                    remaining: b.amount - b.spent
                });
            })
                .sort((a, b) => b.remaining - a.remaining);
            return {
                totalBudget,
                totalSpent,
                remainingBudget,
                budgetUtilization,
                overBudgetCategories,
                underBudgetCategories
            };
        });
    }
    // Get goal analysis
    getGoalAnalysis(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const goals = yield database_1.default.goal.findMany({
                where: { userId }
            });
            const totalGoals = goals.length;
            const completedGoals = goals.filter(g => g.isCompleted).length;
            const activeGoals = totalGoals - completedGoals;
            const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
            const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
            const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
            const goalsByStatus = [
                {
                    status: 'Completed',
                    count: completedGoals,
                    totalAmount: goals.filter(g => g.isCompleted).reduce((sum, g) => sum + g.targetAmount, 0)
                },
                {
                    status: 'Active',
                    count: activeGoals,
                    totalAmount: goals.filter(g => !g.isCompleted).reduce((sum, g) => sum + g.targetAmount, 0)
                }
            ];
            return {
                totalGoals,
                completedGoals,
                activeGoals,
                totalTargetAmount,
                totalCurrentAmount,
                overallProgress,
                goalsByStatus
            };
        });
    }
    // Generate recommendations
    generateRecommendations(data) {
        const recommendations = [];
        // Spending recommendations
        if (data.spendingPatterns.length > 0) {
            const topSpending = data.spendingPatterns[0];
            if (topSpending.percentage > 30) {
                recommendations.push(`Kategori ${topSpending.category} menghabiskan ${topSpending.percentage.toFixed(1)}% dari total pengeluaran. Pertimbangkan untuk mengurangi pengeluaran di kategori ini.`);
            }
        }
        // Savings recommendations
        if (data.savingsAnalysis.savingsRate < 20) {
            recommendations.push('Tingkat tabungan Anda di bawah 20%. Coba tingkatkan tabungan dengan mengurangi pengeluaran atau meningkatkan pendapatan.');
        }
        // Budget recommendations
        if (data.budgetAnalysis.overBudgetCategories.length > 0) {
            recommendations.push(`Anda melebihi anggaran di ${data.budgetAnalysis.overBudgetCategories.length} kategori. Tinjau ulang pengeluaran Anda.`);
        }
        // Goal recommendations
        if (data.goalAnalysis.overallProgress < 50) {
            recommendations.push('Progress tujuan keuangan Anda masih di bawah 50%. Pertimbangkan untuk meningkatkan kontribusi ke tujuan Anda.');
        }
        return recommendations;
    }
    // Generate alerts
    generateAlerts(data) {
        const alerts = [];
        // Budget alerts
        data.budgetAnalysis.overBudgetCategories.forEach((category) => {
            alerts.push(`⚠️ Melebihi anggaran: ${category.category} (${category.overAmount.toLocaleString('id-ID')} IDR)`);
        });
        // Spending alerts
        if (data.expenseAnalysis.expenseTrend === 'increasing') {
            alerts.push('📈 Tren pengeluaran meningkat. Perhatikan pengeluaran Anda.');
        }
        // Savings alerts
        if (data.savingsAnalysis.savingsRate < 10) {
            alerts.push('💰 Tingkat tabungan sangat rendah. Prioritaskan menabung.');
        }
        return alerts;
    }
}
exports.default = new AnalyticsService();
