import express from 'express';
import notificationController from '../controllers/notificationController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get user notifications
router.get('/', auth as any, notificationController.getUserNotifications as any);

// Get unread count
router.get('/unread-count', auth as any, notificationController.getUnreadCount as any);

// Mark notification as read
router.patch('/:id/read', auth as any, notificationController.markAsRead as any);

// Mark all notifications as read
router.patch('/mark-all-read', auth as any, notificationController.markAllAsRead as any);

// Delete notification
router.delete('/:id', auth as any, notificationController.deleteNotification as any);

// Check and create notifications
router.post('/check', auth as any, notificationController.checkNotifications as any);

// Create test notification
router.post('/test', notificationController.createTestNotification);

// Clean old notifications
router.delete('/clean-old', notificationController.cleanOldNotifications);

export default router; 