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
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
class AnalyticsController {
    // Get comprehensive financial insights
    getFinancialInsights(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate, categoryId, type } = req.query;
                const filters = {};
                if (startDate && endDate) {
                    filters.startDate = new Date(startDate);
                    filters.endDate = new Date(endDate);
                }
                if (categoryId) {
                    filters.categoryId = categoryId;
                }
                if (type && ['income', 'expense', 'all'].includes(type)) {
                    filters.type = type;
                }
                const insights = yield analyticsService_1.default.getFinancialInsights(userId, filters);
                res.json({
                    success: true,
                    data: insights
                });
            }
            catch (error) {
                console.error('Error getting financial insights:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get spending trends
    getSpendingTrends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate, groupBy = 'day' } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'startDate dan endDate diperlukan'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const trends = yield analyticsService_1.default.getSpendingTrends(userId, dateRange, groupBy);
                res.json({
                    success: true,
                    data: trends
                });
            }
            catch (error) {
                console.error('Error getting spending trends:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get category analytics
    getCategoryAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate, type = 'expense' } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'startDate dan endDate diperlukan'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const analytics = yield analyticsService_1.default.getCategoryAnalytics(userId, dateRange, type);
                res.json({
                    success: true,
                    data: analytics
                });
            }
            catch (error) {
                console.error('Error getting category analytics:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get monthly comparison
    getMonthlyComparison(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { months = 6 } = req.query;
                const comparison = yield analyticsService_1.default.getMonthlyComparison(userId, parseInt(months));
                res.json({
                    success: true,
                    data: comparison
                });
            }
            catch (error) {
                console.error('Error getting monthly comparison:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get spending patterns
    getSpendingPatterns(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'startDate dan endDate diperlukan'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const patterns = yield analyticsService_1.default.getSpendingPatterns(userId, dateRange);
                res.json({
                    success: true,
                    data: patterns
                });
            }
            catch (error) {
                console.error('Error getting spending patterns:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get top spending days
    getTopSpendingDays(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate, limit = 10 } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'startDate dan endDate diperlukan'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const topDays = yield analyticsService_1.default.getTopSpendingDays(userId, dateRange, parseInt(limit));
                res.json({
                    success: true,
                    data: topDays
                });
            }
            catch (error) {
                console.error('Error getting top spending days:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get savings analysis
    getSavingsAnalysis(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'startDate dan endDate diperlukan'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const analysis = yield analyticsService_1.default.getSavingsAnalysis(userId, dateRange);
                res.json({
                    success: true,
                    data: analysis
                });
            }
            catch (error) {
                console.error('Error getting savings analysis:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get budget performance
    getBudgetPerformance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'startDate dan endDate diperlukan'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const performance = yield analyticsService_1.default.getBudgetPerformance(userId, dateRange);
                res.json({
                    success: true,
                    data: performance
                });
            }
            catch (error) {
                console.error('Error getting budget performance:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get comprehensive analytics report
    getComprehensiveReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'Start date dan end date harus diisi'
                    });
                }
                const dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
                const [spendingTrends, categoryAnalytics, monthlyComparison, spendingPatterns, savingsAnalysis, budgetPerformance] = yield Promise.all([
                    analyticsService_1.default.getSpendingTrends(userId, dateRange),
                    analyticsService_1.default.getCategoryAnalytics(userId, dateRange, 'expense'),
                    analyticsService_1.default.getMonthlyComparison(userId, 6),
                    analyticsService_1.default.getSpendingPatterns(userId, dateRange),
                    analyticsService_1.default.getSavingsAnalysis(userId, dateRange),
                    analyticsService_1.default.getBudgetPerformance(userId, dateRange)
                ]);
                res.json({
                    success: true,
                    data: {
                        spendingTrends,
                        categoryAnalytics,
                        monthlyComparison,
                        spendingPatterns,
                        savingsAnalysis,
                        budgetPerformance,
                        reportDate: new Date().toISOString(),
                        dateRange: {
                            start: dateRange.startDate.toISOString(),
                            end: dateRange.endDate.toISOString()
                        }
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });
    }
    // Get dashboard analytics summary
    getDashboardSummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                // Get last 30 days data
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                const dateRange = { startDate, endDate };
                const [spendingTrends, categoryAnalytics, savingsAnalysis, budgetPerformance] = yield Promise.all([
                    analyticsService_1.default.getSpendingTrends(userId, dateRange, 'day'),
                    analyticsService_1.default.getCategoryAnalytics(userId, dateRange, 'expense'),
                    analyticsService_1.default.getSavingsAnalysis(userId, dateRange),
                    analyticsService_1.default.getBudgetPerformance(userId, dateRange)
                ]);
                // Get top 5 categories
                const topCategories = categoryAnalytics.slice(0, 5);
                // Calculate summary stats
                const totalSpent = categoryAnalytics.reduce((sum, cat) => sum + cat.totalAmount, 0);
                const averageDailySpending = savingsAnalysis.averageDailySpending;
                const budgetAlerts = budgetPerformance.filter(b => b.status === 'exceeded' || b.status === 'warning');
                res.json({
                    success: true,
                    data: {
                        spendingTrends: spendingTrends.slice(-7), // Last 7 days
                        topCategories,
                        summary: {
                            totalSpent,
                            averageDailySpending,
                            savingsRate: savingsAnalysis.savingsRate,
                            budgetAlerts: budgetAlerts.length
                        },
                        dateRange: {
                            start: startDate.toISOString(),
                            end: endDate.toISOString()
                        }
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });
    }
}
exports.default = new AnalyticsController();
