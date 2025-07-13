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
const groqAIService_1 = __importDefault(require("./groqAIService"));
class AIRecommendationService {
    // Get personalized AI recommendations
    getPersonalizedRecommendations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user data
                const [transactions, goals, budgets] = yield Promise.all([
                    this.getRecentTransactions(userId),
                    this.getUserGoals(userId),
                    this.getUserBudgets(userId)
                ]);
                // Try GROQ AI first
                if (groqAIService_1.default.isAvailable()) {
                    try {
                        const financialData = { transactions, goals, budgets, preferences: {} };
                        const aiResponse = yield groqAIService_1.default.generatePersonalizedRecommendations(userId, financialData);
                        if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
                            return aiResponse.recommendations.map((rec) => ({
                                id: rec.id || `rec_${Date.now()}`,
                                type: rec.type || 'general',
                                title: rec.title,
                                description: rec.description,
                                priority: rec.priority || 'medium',
                                impact: rec.impact || 'medium',
                                estimatedSavings: rec.estimatedSavings || 0,
                                estimatedTime: rec.estimatedTime || '1-3 bulan',
                                difficulty: rec.difficulty || 'medium',
                                category: rec.category,
                                actionable: rec.actionable !== false,
                                metadata: rec.metadata || {}
                            }));
                        }
                    }
                    catch (error) {
                        console.error('Error with GROQ AI, falling back to rule-based:', error);
                    }
                }
                // Fallback to rule-based recommendations
                const recommendations = [];
                // Analyze spending patterns
                const spendingAnalysis = yield this.analyzeSpendingPatterns(userId, transactions);
                // Generate recommendations based on analysis
                recommendations.push(...yield this.generateSpendingRecommendations(spendingAnalysis));
                recommendations.push(...yield this.generateSavingsRecommendations(userId, goals));
                recommendations.push(...yield this.generateBudgetRecommendations(userId, budgets, spendingAnalysis));
                recommendations.push(...yield this.generateGoalRecommendations(userId, goals));
                recommendations.push(...yield this.generateInvestmentRecommendations(userId));
                // Sort by priority and impact
                return recommendations.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    const impactOrder = { high: 3, medium: 2, low: 1 };
                    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                    if (priorityDiff !== 0)
                        return priorityDiff;
                    return impactOrder[b.impact] - impactOrder[a.impact];
                });
            }
            catch (error) {
                console.error('Error getting personalized recommendations:', error);
                return [];
            }
        });
    }
    // Analyze spending patterns
    analyzeSpendingPatterns(userId, transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = [];
            // Group transactions by category
            const categorySpending = new Map();
            transactions.forEach(transaction => {
                var _a;
                const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
                if (!categorySpending.has(categoryName)) {
                    categorySpending.set(categoryName, []);
                }
                categorySpending.get(categoryName).push(transaction.amount);
            });
            // Analyze each category
            for (const [category, amounts] of categorySpending) {
                const currentAmount = amounts[amounts.length - 1] || 0;
                const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
                const percentage = amounts.length > 1 ? ((currentAmount - averageAmount) / averageAmount) * 100 : 0;
                const trend = this.calculateTrend(amounts);
                const recommendations = this.generateCategoryRecommendations(category, currentAmount, averageAmount, percentage);
                analysis.push({
                    category,
                    currentAmount,
                    averageAmount,
                    percentage,
                    trend,
                    recommendations
                });
            }
            return analysis;
        });
    }
    // Generate spending recommendations
    generateSpendingRecommendations(analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            for (const item of analysis) {
                if (item.percentage > 50 && item.trend === 'increasing') {
                    recommendations.push({
                        id: `spending_${item.category}`,
                        type: 'spending',
                        title: `Kurangi Pengeluaran ${item.category}`,
                        description: `Pengeluaran ${item.category} meningkat ${item.percentage.toFixed(1)}% dari rata-rata. ${item.recommendations[0]}`,
                        priority: item.percentage > 100 ? 'high' : 'medium',
                        impact: 'medium',
                        estimatedSavings: item.currentAmount * 0.2,
                        estimatedTime: '1-2 bulan',
                        difficulty: 'medium',
                        category: item.category,
                        actionable: true,
                        metadata: { category: item.category, percentage: item.percentage }
                    });
                }
            }
            return recommendations;
        });
    }
    // Generate savings recommendations
    generateSavingsRecommendations(userId, goals) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // Check if user has emergency fund goal
            const emergencyFundGoal = goals.find(goal => goal.title.toLowerCase().includes('emergency') ||
                goal.title.toLowerCase().includes('darurat'));
            if (!emergencyFundGoal) {
                recommendations.push({
                    id: 'emergency_fund',
                    type: 'savings',
                    title: 'Buat Dana Darurat',
                    description: 'Dana darurat penting untuk keamanan finansial. Targetkan 3-6 bulan pengeluaran.',
                    priority: 'high',
                    impact: 'high',
                    estimatedSavings: 0,
                    estimatedTime: '6-12 bulan',
                    difficulty: 'medium',
                    actionable: true,
                    metadata: { goalType: 'emergency_fund' }
                });
            }
            // Check monthly savings target
            // This part of the logic needs to be re-evaluated as user preferences are no longer available
            // For now, we'll keep it as is, but it might need adjustment based on new data structure
            // if (preferences.financialGoals.monthlySavingsTarget === 0) {
            //   recommendations.push({
            //     id: 'monthly_savings_target',
            //     type: 'savings',
            //     title: 'Set Target Tabungan Bulanan',
            //     description: 'Tentukan target tabungan bulanan untuk mencapai tujuan keuangan Anda.',
            //     priority: 'medium',
            //     impact: 'medium',
            //     estimatedSavings: 0,
            //     estimatedTime: '1 bulan',
            //     difficulty: 'easy',
            //     actionable: true,
            //     metadata: { goalType: 'monthly_savings' }
            //   });
            // }
            return recommendations;
        });
    }
    // Generate budget recommendations
    generateBudgetRecommendations(userId, budgets, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // Check if user has budgets for top spending categories
            const topCategories = analysis
                .sort((a, b) => b.currentAmount - a.currentAmount)
                .slice(0, 3);
            for (const category of topCategories) {
                const hasBudget = budgets.some(budget => { var _a; return ((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) === category.category; });
                if (!hasBudget && category.currentAmount > 1000000) { // > 1 juta
                    recommendations.push({
                        id: `budget_${category.category}`,
                        type: 'budget',
                        title: `Buat Budget untuk ${category.category}`,
                        description: `Pengeluaran ${category.category} cukup besar. Buat budget untuk mengontrol pengeluaran.`,
                        priority: 'medium',
                        impact: 'medium',
                        estimatedSavings: category.currentAmount * 0.15,
                        estimatedTime: '1 bulan',
                        difficulty: 'easy',
                        category: category.category,
                        actionable: true,
                        metadata: { category: category.category, currentAmount: category.currentAmount }
                    });
                }
            }
            return recommendations;
        });
    }
    // Generate goal recommendations
    generateGoalRecommendations(userId, goals) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // Check for goals that are behind schedule
            for (const goal of goals) {
                if (!goal.isCompleted && goal.targetDate) {
                    const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    if (daysLeft <= 30 && progress < 80) {
                        recommendations.push({
                            id: `goal_${goal.id}`,
                            type: 'goal',
                            title: `Percepat Progress "${goal.title}"`,
                            description: `Tujuan Anda deadline dalam ${daysLeft} hari. Progress: ${progress.toFixed(1)}%. Tingkatkan tabungan untuk mencapai target.`,
                            priority: 'high',
                            impact: 'high',
                            estimatedSavings: goal.targetAmount - goal.currentAmount,
                            estimatedTime: `${daysLeft} hari`,
                            difficulty: 'hard',
                            actionable: true,
                            metadata: { goalId: goal.id, progress, daysLeft }
                        });
                    }
                }
            }
            return recommendations;
        });
    }
    // Generate investment recommendations
    generateInvestmentRecommendations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // Check if user has emergency fund and good savings rate
            // This part of the logic needs to be re-evaluated as user preferences are no longer available
            // For now, we'll keep it as is, but it might need adjustment based on new data structure
            // const hasEmergencyFund = preferences.financialGoals.emergencyFundTarget > 0;
            // const goodSavingsRate = preferences.financialGoals.monthlySavingsTarget >= 20;
            // if (hasEmergencyFund && goodSavingsRate && preferences.financialGoals.investmentPercentage === 0) {
            //   recommendations.push({
            //     id: 'investment_start',
            //     type: 'investment',
            //     title: 'Mulai Berinvestasi',
            //     description: 'Anda sudah memiliki dana darurat dan tabungan yang baik. Pertimbangkan untuk berinvestasi untuk pertumbuhan kekayaan jangka panjang.',
            //     priority: 'medium',
            //     impact: 'high',
            //     estimatedSavings: 0,
            //     estimatedTime: '3-6 bulan',
            //     difficulty: 'medium',
            //     actionable: true,
            //     metadata: { investmentType: 'general' }
            //   });
            // }
            return recommendations;
        });
    }
    // Get smart budget suggestions
    getSmartBudgetSuggestions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                const transactions = yield database_1.default.transaction.findMany({
                    where: {
                        userId,
                        type: 'expense',
                        date: { gte: threeMonthsAgo }
                    },
                    include: { category: true }
                });
                // Group by category and calculate average monthly spending
                const categorySpending = new Map();
                transactions.forEach(transaction => {
                    var _a;
                    const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
                    if (!categorySpending.has(categoryName)) {
                        categorySpending.set(categoryName, []);
                    }
                    categorySpending.get(categoryName).push(transaction.amount);
                });
                const suggestions = [];
                for (const [category, amounts] of categorySpending) {
                    const totalSpending = amounts.reduce((sum, amount) => sum + amount, 0);
                    const averageMonthly = totalSpending / 3;
                    if (averageMonthly > 500000) { // > 500k per bulan
                        suggestions.push({
                            category,
                            suggestedBudget: Math.round(averageMonthly * 0.9), // 90% dari rata-rata
                            currentAverage: Math.round(averageMonthly),
                            potentialSavings: Math.round(averageMonthly * 0.1),
                            confidence: amounts.length >= 3 ? 'high' : 'medium'
                        });
                    }
                }
                return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings);
            }
            catch (error) {
                console.error('Error getting smart budget suggestions:', error);
                return [];
            }
        });
    }
    // Get financial insights
    getFinancialInsights(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [transactions, goals, budgets] = yield Promise.all([
                    this.getRecentTransactions(userId),
                    this.getUserGoals(userId),
                    this.getUserBudgets(userId)
                ]);
                const insights = {
                    spendingInsights: yield this.getSpendingInsights(transactions),
                    savingInsights: yield this.getSavingInsights(userId, goals),
                    budgetInsights: yield this.getBudgetInsights(budgets),
                    goalInsights: yield this.getGoalInsights(goals)
                };
                return insights;
            }
            catch (error) {
                console.error('Error getting financial insights:', error);
                return {};
            }
        });
    }
    // Helper methods
    getRecentTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.transaction.findMany({
                where: { userId },
                include: { category: true },
                orderBy: { date: 'desc' },
                take: 100
            });
        });
    }
    getUserGoals(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.goal.findMany({
                where: { userId }
            });
        });
    }
    getUserBudgets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.budget.findMany({
                where: { userId, isActive: true },
                include: { category: true }
            });
        });
    }
    calculateTrend(amounts) {
        if (amounts.length < 2)
            return 'stable';
        const recent = amounts[amounts.length - 1];
        const previous = amounts[amounts.length - 2];
        const change = ((recent - previous) / previous) * 100;
        if (change > 10)
            return 'increasing';
        if (change < -10)
            return 'decreasing';
        return 'stable';
    }
    generateCategoryRecommendations(category, current, average, percentage) {
        const recommendations = [];
        if (percentage > 50) {
            recommendations.push(`Coba kurangi pengeluaran ${category} sebesar ${Math.round(current * 0.2).toLocaleString('id-ID')} per bulan.`);
        }
        if (category.toLowerCase().includes('makanan') || category.toLowerCase().includes('food')) {
            recommendations.push('Pertimbangkan memasak di rumah untuk menghemat pengeluaran makanan.');
        }
        if (category.toLowerCase().includes('transport') || category.toLowerCase().includes('bensin')) {
            recommendations.push('Gunakan transportasi umum atau carpool untuk menghemat biaya transport.');
        }
        return recommendations;
    }
    getSpendingInsights(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const expenses = transactions.filter(t => t.type === 'expense');
            const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
            const categorySpending = new Map();
            expenses.forEach(transaction => {
                var _a;
                const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
                const current = categorySpending.get(categoryName) || 0;
                categorySpending.set(categoryName, current + transaction.amount);
            });
            const topCategories = Array.from(categorySpending.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);
            return {
                totalExpense,
                topCategories,
                averagePerTransaction: totalExpense / expenses.length,
                totalTransactions: expenses.length
            };
        });
    }
    getSavingInsights(userId, goals) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMonth = new Date();
            currentMonth.setDate(1);
            const [monthlyIncome, monthlyExpense] = yield Promise.all([
                database_1.default.transaction.aggregate({
                    where: {
                        userId,
                        type: 'income',
                        date: { gte: currentMonth }
                    },
                    _sum: { amount: true }
                }),
                database_1.default.transaction.aggregate({
                    where: {
                        userId,
                        type: 'expense',
                        date: { gte: currentMonth }
                    },
                    _sum: { amount: true }
                })
            ]);
            const totalIncome = monthlyIncome._sum.amount || 0;
            const totalExpense = monthlyExpense._sum.amount || 0;
            const savings = totalIncome - totalExpense;
            const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
            return {
                monthlySavings: savings,
                savingsRate,
                totalGoals: goals.length,
                completedGoals: goals.filter(g => g.isCompleted).length,
                activeGoals: goals.filter(g => !g.isCompleted).length
            };
        });
    }
    getBudgetInsights(budgets) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeBudgets = budgets.filter(b => b.isActive);
            const totalBudget = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
            const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
            const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
            return {
                totalBudgets: activeBudgets.length,
                totalBudget,
                totalSpent,
                budgetUtilization,
                remainingBudget: totalBudget - totalSpent
            };
        });
    }
    getGoalInsights(goals) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalGoals = goals.length;
            const completedGoals = goals.filter(g => g.isCompleted).length;
            const activeGoals = totalGoals - completedGoals;
            const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
            const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
            const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
            return {
                totalGoals,
                completedGoals,
                activeGoals,
                overallProgress,
                totalTarget,
                totalCurrent
            };
        });
    }
}
exports.default = new AIRecommendationService();
