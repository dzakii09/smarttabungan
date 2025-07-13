"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsController_1 = __importDefault(require("../controllers/analyticsController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(auth_1.auth);
// Analytics endpoints
router.get('/spending-trends', auth_1.auth, analyticsController_1.default.getSpendingTrends);
router.get('/category-analytics', auth_1.auth, analyticsController_1.default.getCategoryAnalytics);
router.get('/monthly-comparison', auth_1.auth, analyticsController_1.default.getMonthlyComparison);
router.get('/spending-patterns', auth_1.auth, analyticsController_1.default.getSpendingPatterns);
router.get('/top-spending-days', auth_1.auth, analyticsController_1.default.getTopSpendingDays);
router.get('/savings-analysis', auth_1.auth, analyticsController_1.default.getSavingsAnalysis);
router.get('/budget-performance', auth_1.auth, analyticsController_1.default.getBudgetPerformance);
// Advanced analytics
router.get('/financial-insights', auth_1.auth, analyticsController_1.default.getFinancialInsights);
// Comprehensive reports
router.get('/comprehensive-report', auth_1.auth, analyticsController_1.default.getComprehensiveReport);
router.get('/dashboard-summary', auth_1.auth, analyticsController_1.default.getDashboardSummary);
// Export functionality
// router.get('/export', auth as any, analyticsController.exportData as any);
exports.default = router;
