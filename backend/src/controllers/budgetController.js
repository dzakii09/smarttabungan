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
const budgetService_1 = __importDefault(require("../services/budgetService"));
const aiService_1 = __importDefault(require("../services/aiService"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
class BudgetController {
    // Create new budget
    createBudget(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                // Debug: log user info
                console.log('User info:', req.user);
                console.log('User ID:', userId);
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan. Silakan login ulang.'
                    });
                }
                const { amount, period, startDate, categoryId } = req.body;
                if (!amount || !period || !startDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'Amount, period, dan startDate harus diisi'
                    });
                }
                const budget = yield budgetService_1.default.createBudget(userId, {
                    amount: parseFloat(amount),
                    period,
                    startDate: new Date(startDate),
                    categoryId: categoryId || null
                });
                // Create notification for new budget
                try {
                    const categoryName = ((_b = budget.category) === null || _b === void 0 ? void 0 : _b.name) || 'total';
                    yield notificationService_1.default.createSystemNotification(userId, '💰 Budget Baru Dibuat', `Budget ${categoryName} sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')} untuk periode ${period} telah dibuat`, 'low');
                }
                catch (notificationError) {
                    console.error('Error creating budget notification:', notificationError);
                }
                res.status(201).json({
                    success: true,
                    message: 'Budget berhasil dibuat',
                    data: budget
                });
            }
            catch (error) {
                console.error('Create budget error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get all budgets
    getBudgets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const budgets = yield budgetService_1.default.getBudgets(userId);
                res.json({
                    success: true,
                    data: budgets
                });
            }
            catch (error) {
                console.error('Get budgets error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get budget by ID
    getBudgetById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { id } = req.params;
                const budget = yield budgetService_1.default.getBudgetById(userId, id);
                if (!budget) {
                    return res.status(404).json({
                        success: false,
                        message: 'Budget tidak ditemukan'
                    });
                }
                res.json({
                    success: true,
                    data: budget
                });
            }
            catch (error) {
                console.error('Get budget by ID error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Update budget
    updateBudget(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { id } = req.params;
                const updateData = req.body;
                // Convert amount to number if provided
                if (updateData.amount) {
                    updateData.amount = parseFloat(updateData.amount);
                }
                // Convert startDate to Date if provided
                if (updateData.startDate) {
                    updateData.startDate = new Date(updateData.startDate);
                }
                const budget = yield budgetService_1.default.updateBudget(userId, id, updateData);
                res.json({
                    success: true,
                    message: 'Budget berhasil diperbarui',
                    data: budget
                });
            }
            catch (error) {
                console.error('Update budget error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Delete budget
    deleteBudget(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { id } = req.params;
                yield budgetService_1.default.deleteBudget(userId, id);
                res.json({
                    success: true,
                    message: 'Budget berhasil dihapus'
                });
            }
            catch (error) {
                console.error('Delete budget error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Toggle budget status
    toggleBudgetStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { id } = req.params;
                const budget = yield budgetService_1.default.toggleBudgetStatus(userId, id);
                res.json({
                    success: true,
                    message: `Budget berhasil ${budget.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
                    data: budget
                });
            }
            catch (error) {
                console.error('Toggle budget status error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get budget alerts
    getBudgetAlerts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const alerts = yield budgetService_1.default.getBudgetAlerts(userId);
                res.json({
                    success: true,
                    data: alerts
                });
            }
            catch (error) {
                console.error('Get budget alerts error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get budget statistics
    getBudgetStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const stats = yield budgetService_1.default.getBudgetStats(userId);
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                console.error('Get budget stats error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get AI budget recommendations
    getBudgetRecommendations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const recommendations = yield aiService_1.default.getBudgetRecommendations(userId);
                res.json({
                    success: true,
                    data: recommendations
                });
            }
            catch (error) {
                console.error('Get budget recommendations error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Create budget from AI recommendation
    createBudgetFromRecommendation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { categoryId, recommendedAmount } = req.body;
                if (!categoryId || !recommendedAmount) {
                    return res.status(400).json({
                        success: false,
                        message: 'CategoryId dan recommendedAmount harus diisi'
                    });
                }
                const budget = yield budgetService_1.default.createBudgetFromRecommendation(userId, categoryId, parseFloat(recommendedAmount));
                res.status(201).json({
                    success: true,
                    message: 'Budget berhasil dibuat dari rekomendasi AI',
                    data: budget
                });
            }
            catch (error) {
                console.error('Create budget from recommendation error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get budget insights
    getBudgetInsights(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const insights = yield aiService_1.default.getBudgetInsights(userId);
                res.json({
                    success: true,
                    data: insights
                });
            }
            catch (error) {
                console.error('Get budget insights error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
}
exports.default = new BudgetController();
