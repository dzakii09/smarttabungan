import { Request, Response } from 'express';
import settingsService from '../services/settingsService';

interface AuthRequest extends Request {
  user?: any;
}

export class SettingsController {
  // Get user settings
  async getUserSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const settings = await settingsService.getUserSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Error getting user settings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Update user settings
  async updateUserSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const updates = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const settings = await settingsService.updateUserSettings(userId, updates);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error: any) {
      console.error('Error updating user settings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Update user profile
  async updateUserProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { name, email } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const profile = await settingsService.updateUserProfile(userId, { name, email });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Change password
  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      await settingsService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Update notification settings
  async updateNotificationSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const notificationSettings = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const settings = await settingsService.updateNotificationSettings(userId, notificationSettings);

      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings
      });
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Update appearance settings
  async updateAppearanceSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const appearanceSettings = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const settings = await settingsService.updateAppearanceSettings(userId, appearanceSettings);

      res.json({
        success: true,
        message: 'Appearance settings updated successfully',
        data: settings
      });
    } catch (error: any) {
      console.error('Error updating appearance settings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
}

export default new SettingsController(); 