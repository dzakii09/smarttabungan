import express from 'express';
import { auth } from '../middleware/auth';
import scheduledNotificationController from '../controllers/scheduledNotificationController';

const router = express.Router();

// Run daily notifications
router.post('/daily', auth as any, scheduledNotificationController.runDailyNotifications as any);

// Run weekly notifications
router.post('/weekly', auth as any, scheduledNotificationController.runWeeklyNotifications as any);

// Run monthly notifications
router.post('/monthly', auth as any, scheduledNotificationController.runMonthlyNotifications as any);

// Run goal reminders
router.post('/goals', auth as any, scheduledNotificationController.runGoalReminders as any);

// Run budget reminders
router.post('/budgets', auth as any, scheduledNotificationController.runBudgetReminders as any);

// Run smart insights
router.post('/smart-insights', auth as any, scheduledNotificationController.runSmartInsights as any);

// Run all scheduled notifications
router.post('/all', auth as any, scheduledNotificationController.runAllScheduledNotifications as any);

export default router; 