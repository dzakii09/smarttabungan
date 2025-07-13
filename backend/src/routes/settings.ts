import express from 'express';
import { auth } from '../middleware/auth';
import settingsController from '../controllers/settingsController';

const router = express.Router();

// Get user settings
router.get('/', auth as any, settingsController.getUserSettings as any);

// Update user settings
router.put('/', auth as any, settingsController.updateUserSettings as any);

// Update user profile
router.put('/profile', auth as any, settingsController.updateUserProfile as any);

// Change password
router.put('/change-password', auth as any, settingsController.changePassword as any);

// Update notification settings
router.put('/notifications', auth as any, settingsController.updateNotificationSettings as any);

// Update appearance settings
router.put('/appearance', auth as any, settingsController.updateAppearanceSettings as any);

export default router; 