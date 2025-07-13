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
class BudgetService {
    // Create new budget
    createBudget(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    throw new Error('User ID is required');
                }
                const endDate = this.calculateEndDate(data.startDate, data.period);
                return yield database_1.default.budget.create({
                    data: {
                        amount: data.amount,
                        period: data.period,
                        startDate: data.startDate,
                        endDate,
                        categoryId: data.categoryId || null,
                        userId
                    },
                    include: {
                        category: true
                    }
                });
            }
            catch (error) {
                console.error('Error creating budget:', error);
                throw error;
            }
        });
    }
    // Get all budgets for user
    getBudgets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    console.warn('getBudgets called with empty userId');
                    return [];
                }
                const budgets = yield database_1.default.budget.findMany({
                    where: { userId },
                    include: {
                        category: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return yield Promise.all(budgets.map((budget) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const spent = yield this.calculateSpentAmount(userId, budget);
                        const remaining = Math.max(0, budget.amount - spent);
                        const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                        let status = 'on-track';
                        if (progress >= 100) {
                            status = 'exceeded';
                        }
                        else if (progress >= 80) {
                            status = 'warning';
                        }
                        return {
                            id: budget.id,
                            amount: budget.amount,
                            spent,
                            remaining,
                            progress,
                            period: budget.period,
                            startDate: budget.startDate,
                            endDate: budget.endDate,
                            isActive: budget.isActive,
                            category: budget.category,
                            status
                        };
                    }
                    catch (error) {
                        console.error(`Error processing budget ${budget.id}:`, error);
                        // Return a safe default for this budget
                        return {
                            id: budget.id,
                            amount: budget.amount,
                            spent: 0,
                            remaining: budget.amount,
                            progress: 0,
                            period: budget.period,
                            startDate: budget.startDate,
                            endDate: budget.endDate,
                            isActive: budget.isActive,
                            category: budget.category,
                            status: 'on-track'
                        };
                    }
                })));
            }
            catch (error) {
                console.error('Error getting budgets:', error);
                return [];
            }
        });
    }
    // Get budget by ID
    getBudgetById(userId, budgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !budgetId) {
                    return null;
                }
                const budget = yield database_1.default.budget.findFirst({
                    where: { id: budgetId, userId },
                    include: {
                        category: true
                    }
                });
                if (!budget)
                    return null;
                const spent = yield this.calculateSpentAmount(userId, budget);
                const remaining = Math.max(0, budget.amount - spent);
                const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                let status = 'on-track';
                if (progress >= 100) {
                    status = 'exceeded';
                }
                else if (progress >= 80) {
                    status = 'warning';
                }
                return {
                    id: budget.id,
                    amount: budget.amount,
                    spent,
                    remaining,
                    progress,
                    period: budget.period,
                    startDate: budget.startDate,
                    endDate: budget.endDate,
                    isActive: budget.isActive,
                    category: budget.category,
                    status
                };
            }
            catch (error) {
                console.error('Error getting budget by ID:', error);
                return null;
            }
        });
    }
    // Update budget
    updateBudget(userId, budgetId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !budgetId) {
                    throw new Error('User ID and Budget ID are required');
                }
                const budget = yield database_1.default.budget.findFirst({
                    where: { id: budgetId, userId }
                });
                if (!budget) {
                    throw new Error('Budget not found');
                }
                const updateData = Object.assign({}, data);
                // Recalculate end date if period or start date changes
                if (data.period || data.startDate) {
                    const startDate = data.startDate || budget.startDate;
                    const period = data.period || budget.period;
                    updateData.endDate = this.calculateEndDate(startDate, period);
                }
                return yield database_1.default.budget.update({
                    where: { id: budgetId },
                    data: updateData,
                    include: {
                        category: true
                    }
                });
            }
            catch (error) {
                console.error('Error updating budget:', error);
                throw error;
            }
        });
    }
    // Delete budget
    deleteBudget(userId, budgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !budgetId) {
                    throw new Error('User ID and Budget ID are required');
                }
                const budget = yield database_1.default.budget.findFirst({
                    where: { id: budgetId, userId }
                });
                if (!budget) {
                    throw new Error('Budget not found');
                }
                yield database_1.default.budget.delete({
                    where: { id: budgetId }
                });
            }
            catch (error) {
                console.error('Error deleting budget:', error);
                throw error;
            }
        });
    }
    // Toggle budget status
    toggleBudgetStatus(userId, budgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !budgetId) {
                    throw new Error('User ID and Budget ID are required');
                }
                const budget = yield database_1.default.budget.findFirst({
                    where: { id: budgetId, userId }
                });
                if (!budget) {
                    throw new Error('Budget not found');
                }
                return yield database_1.default.budget.update({
                    where: { id: budgetId },
                    data: { isActive: !budget.isActive },
                    include: {
                        category: true
                    }
                });
            }
            catch (error) {
                console.error('Error toggling budget status:', error);
                throw error;
            }
        });
    }
    // Calculate spent amount for a budget
    calculateSpentAmount(userId, budget) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !budget) {
                    return 0;
                }
                const where = {
                    userId,
                    type: 'expense',
                    date: {
                        gte: budget.startDate,
                        lte: budget.endDate
                    }
                };
                // If budget is for specific category
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
    // Calculate end date based on period
    calculateEndDate(startDate, period) {
        try {
            const endDate = new Date(startDate);
            switch (period) {
                case 'weekly':
                    endDate.setDate(endDate.getDate() + 7);
                    break;
                case 'monthly':
                    endDate.setMonth(endDate.getMonth() + 1);
                    break;
                case 'yearly':
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
                default:
                    endDate.setMonth(endDate.getMonth() + 1);
            }
            return endDate;
        }
        catch (error) {
            console.error('Error calculating end date:', error);
            // Return a safe default
            const defaultEndDate = new Date(startDate);
            defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
            return defaultEndDate;
        }
    }
    // Get budget alerts (for notifications)
    getBudgetAlerts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                if (!userId) {
                    return [];
                }
                const budgets = yield this.getBudgets(userId);
                const alerts = [];
                for (const budget of budgets) {
                    if (!budget.isActive)
                        continue;
                    try {
                        const daysLeft = Math.ceil((budget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const daysElapsed = Math.max(1, (new Date().getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24));
                        const dailyAverage = budget.spent / daysElapsed;
                        const projectedSpending = dailyAverage * daysLeft;
                        // Alert if spending too fast
                        if (budget.progress >= 80 && budget.progress < 100) {
                            alerts.push({
                                type: 'warning',
                                budgetId: budget.id,
                                categoryName: ((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total',
                                message: `Budget ${((_b = budget.category) === null || _b === void 0 ? void 0 : _b.name) || 'total'} sudah ${Math.round(budget.progress)}% terpakai`,
                                progress: budget.progress
                            });
                        }
                        // Alert if exceeded
                        if (budget.progress >= 100) {
                            alerts.push({
                                type: 'exceeded',
                                budgetId: budget.id,
                                categoryName: ((_c = budget.category) === null || _c === void 0 ? void 0 : _c.name) || 'Total',
                                message: `Budget ${((_d = budget.category) === null || _d === void 0 ? void 0 : _d.name) || 'total'} sudah terlampaui!`,
                                progress: budget.progress
                            });
                        }
                        // Alert if projected to exceed
                        if (projectedSpending > budget.remaining && budget.progress < 80) {
                            alerts.push({
                                type: 'projection',
                                budgetId: budget.id,
                                categoryName: ((_e = budget.category) === null || _e === void 0 ? void 0 : _e.name) || 'Total',
                                message: `Berdasarkan tren, budget ${((_f = budget.category) === null || _f === void 0 ? void 0 : _f.name) || 'total'} akan terlampaui`,
                                progress: budget.progress
                            });
                        }
                    }
                    catch (error) {
                        console.error(`Error processing alert for budget ${budget.id}:`, error);
                    }
                }
                return alerts;
            }
            catch (error) {
                console.error('Error getting budget alerts:', error);
                return [];
            }
        });
    }
    // Get budget statistics
    getBudgetStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    return {
                        totalBudget: 0,
                        totalSpent: 0,
                        totalRemaining: 0,
                        overallProgress: 0,
                        activeBudgets: 0,
                        exceededBudgets: 0,
                        warningBudgets: 0,
                        onTrackBudgets: 0
                    };
                }
                const budgets = yield this.getBudgets(userId);
                const activeBudgets = budgets.filter(b => b.isActive);
                const totalBudget = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
                const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
                const totalRemaining = activeBudgets.reduce((sum, b) => sum + b.remaining, 0);
                const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                const exceededBudgets = activeBudgets.filter(b => b.status === 'exceeded').length;
                const warningBudgets = activeBudgets.filter(b => b.status === 'warning').length;
                const onTrackBudgets = activeBudgets.filter(b => b.status === 'on-track').length;
                return {
                    totalBudget,
                    totalSpent,
                    totalRemaining,
                    overallProgress,
                    activeBudgets: activeBudgets.length,
                    exceededBudgets,
                    warningBudgets,
                    onTrackBudgets
                };
            }
            catch (error) {
                console.error('Error getting budget stats:', error);
                return {
                    totalBudget: 0,
                    totalSpent: 0,
                    totalRemaining: 0,
                    overallProgress: 0,
                    activeBudgets: 0,
                    exceededBudgets: 0,
                    warningBudgets: 0,
                    onTrackBudgets: 0
                };
            }
        });
    }
    // Create budget from AI recommendation
    createBudgetFromRecommendation(userId, categoryId, recommendedAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !categoryId || !recommendedAmount) {
                    throw new Error('User ID, Category ID, and Recommended Amount are required');
                }
                const startDate = new Date();
                startDate.setDate(1); // Start from beginning of current month
                return yield this.createBudget(userId, {
                    amount: recommendedAmount,
                    period: 'monthly',
                    startDate,
                    categoryId
                });
            }
            catch (error) {
                console.error('Error creating budget from recommendation:', error);
                throw error;
            }
        });
    }
}
exports.default = new BudgetService();
