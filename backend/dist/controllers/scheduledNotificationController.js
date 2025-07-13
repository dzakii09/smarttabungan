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
exports.ScheduledNotificationController = void 0;
const scheduledNotificationService_1 = __importDefault(require("../services/scheduledNotificationService"));
class ScheduledNotificationController {
    // Run daily notifications for a user
    runDailyNotifications(req, res) {
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
                yield scheduledNotificationService_1.default.sendDailyReminder(userId);
                res.json({
                    success: true,
                    message: 'Daily notifications sent successfully'
                });
            }
            catch (error) {
                console.error('Error running daily notifications:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Run weekly notifications for a user
    runWeeklyNotifications(req, res) {
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
                yield scheduledNotificationService_1.default.sendWeeklySummary(userId);
                res.json({
                    success: true,
                    message: 'Weekly notifications sent successfully'
                });
            }
            catch (error) {
                console.error('Error running weekly notifications:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Run monthly notifications for a user
    runMonthlyNotifications(req, res) {
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
                yield scheduledNotificationService_1.default.sendMonthlySummary(userId);
                res.json({
                    success: true,
                    message: 'Monthly notifications sent successfully'
                });
            }
            catch (error) {
                console.error('Error running monthly notifications:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Run goal progress reminders for a user
    runGoalReminders(req, res) {
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
                yield scheduledNotificationService_1.default.sendGoalProgressReminder(userId);
                res.json({
                    success: true,
                    message: 'Goal reminders sent successfully'
                });
            }
            catch (error) {
                console.error('Error running goal reminders:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Run budget check reminders for a user
    runBudgetReminders(req, res) {
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
                yield scheduledNotificationService_1.default.sendBudgetCheckReminder(userId);
                res.json({
                    success: true,
                    message: 'Budget reminders sent successfully'
                });
            }
            catch (error) {
                console.error('Error running budget reminders:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Run smart insights for a user
    runSmartInsights(req, res) {
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
                yield scheduledNotificationService_1.default.sendSmartInsightsReminder(userId);
                res.json({
                    success: true,
                    message: 'Smart insights sent successfully'
                });
            }
            catch (error) {
                console.error('Error running smart insights:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Run all scheduled notifications for a user
    runAllScheduledNotifications(req, res) {
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
                yield scheduledNotificationService_1.default.runScheduledNotifications(userId);
                res.json({
                    success: true,
                    message: 'All scheduled notifications sent successfully'
                });
            }
            catch (error) {
                console.error('Error running all scheduled notifications:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
}
exports.ScheduledNotificationController = ScheduledNotificationController;
exports.default = new ScheduledNotificationController();
