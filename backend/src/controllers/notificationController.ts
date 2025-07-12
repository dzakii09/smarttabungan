import { Request, Response } from 'express';
import notificationService from '../services/notificationService';
import { NotificationFilters } from '../types/notification';

interface AuthRequest extends Request {
  user?: any;
}

class NotificationController {
  // Get all notifications for user
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { type, isRead, priority, limit, offset } = req.query;

      const filters: NotificationFilters = {
        userId,
        type: type as any,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        priority: priority as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };

      const notifications = await notificationService.getNotifications(filters);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount
        }
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications'
      });
    }
  }

  // Get user notifications
  async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { limit = 50 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const notifications = await notificationService.getUserNotifications(userId, Number(limit));

      res.json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Mark notification as read
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const notification = await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        message: 'Notifikasi ditandai sebagai telah dibaca',
        data: notification
      });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'Semua notifikasi ditandai sebagai telah dibaca'
      });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Delete notification
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await notificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: 'Notifikasi berhasil dihapus'
      });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get unread count
  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Create test notification
  async createTestNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { title, message, type, priority } = req.body;

      const notification = await notificationService.createNotification({
        userId,
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        type: type || 'info',
        priority: priority || 'medium'
      });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test notification'
      });
    }
  }

  // Clean old notifications
  async cleanOldNotifications(req: Request, res: Response) {
    try {
      await notificationService.cleanOldNotifications();

      res.json({
        success: true,
        message: 'Old notifications cleaned successfully'
      });
    } catch (error) {
      console.error('Error cleaning old notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clean old notifications'
      });
    }
  }

  // Check and create notifications
  async checkNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await notificationService.checkAndCreateNotifications(userId);

      res.json({
        success: true,
        message: 'Pengecekan notifikasi selesai'
      });
    } catch (error: any) {
      console.error('Check notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
}

export default new NotificationController(); 