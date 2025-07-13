"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const scheduledNotificationController_1 = __importDefault(require("../controllers/scheduledNotificationController"));
const router = express_1.default.Router();
// Run daily notifications
router.post('/daily', auth_1.auth, scheduledNotificationController_1.default.runDailyNotifications);
// Run weekly notifications
router.post('/weekly', auth_1.auth, scheduledNotificationController_1.default.runWeeklyNotifications);
// Run monthly notifications
router.post('/monthly', auth_1.auth, scheduledNotificationController_1.default.runMonthlyNotifications);
// Run goal reminders
router.post('/goals', auth_1.auth, scheduledNotificationController_1.default.runGoalReminders);
// Run budget reminders
router.post('/budgets', auth_1.auth, scheduledNotificationController_1.default.runBudgetReminders);
// Run smart insights
router.post('/smart-insights', auth_1.auth, scheduledNotificationController_1.default.runSmartInsights);
// Run all scheduled notifications
router.post('/all', auth_1.auth, scheduledNotificationController_1.default.runAllScheduledNotifications);
exports.default = router;
