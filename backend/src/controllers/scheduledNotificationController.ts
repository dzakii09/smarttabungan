import { Request, Response } from 'express';
import scheduledNotificationService from '../services/scheduledNotificationService';

interface AuthRequest extends Request {
  user?: any;
}

export class ScheduledNotificationController {
  // Run daily notifications for a user
  async runDailyNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.sendDailyReminder(userId);

      res.json({
        success: true,
        message: 'Daily notifications sent successfully'
      });
    } catch (error: any) {
      console.error('Error running daily notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Run weekly notifications for a user
  async runWeeklyNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.sendWeeklySummary(userId);

      res.json({
        success: true,
        message: 'Weekly notifications sent successfully'
      });
    } catch (error: any) {
      console.error('Error running weekly notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Run monthly notifications for a user
  async runMonthlyNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.sendMonthlySummary(userId);

      res.json({
        success: true,
        message: 'Monthly notifications sent successfully'
      });
    } catch (error: any) {
      console.error('Error running monthly notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Run goal progress reminders for a user
  async runGoalReminders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.sendGoalProgressReminder(userId);

      res.json({
        success: true,
        message: 'Goal reminders sent successfully'
      });
    } catch (error: any) {
      console.error('Error running goal reminders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Run budget check reminders for a user
  async runBudgetReminders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.sendBudgetCheckReminder(userId);

      res.json({
        success: true,
        message: 'Budget reminders sent successfully'
      });
    } catch (error: any) {
      console.error('Error running budget reminders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Run smart insights for a user
  async runSmartInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.sendSmartInsightsReminder(userId);

      res.json({
        success: true,
        message: 'Smart insights sent successfully'
      });
    } catch (error: any) {
      console.error('Error running smart insights:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Run all scheduled notifications for a user
  async runAllScheduledNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await scheduledNotificationService.runScheduledNotifications(userId);

      res.json({
        success: true,
        message: 'All scheduled notifications sent successfully'
      });
    } catch (error: any) {
      console.error('Error running all scheduled notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
}

export default new ScheduledNotificationController(); 