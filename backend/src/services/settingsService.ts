import prisma from '../utils/database';
import bcrypt from 'bcryptjs';

interface UserSettings {
  profile: {
    name: string;
    email: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    unusualSpending: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'id' | 'en';
    currency: 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR';
  };
  security: {
    changePassword: boolean;
    twoFactorAuth: boolean;
  };
}

class SettingsService {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // For now, return default settings
      // In the future, you can store settings in a separate table
      return {
        profile: {
          name: user.name || '',
          email: user.email || ''
        },
        notifications: {
          email: true,
          push: false,
          inApp: true,
          budgetAlerts: true,
          goalReminders: true,
          unusualSpending: true
        },
        appearance: {
          theme: 'light',
          language: 'id',
          currency: 'IDR'
        },
        security: {
          changePassword: false,
          twoFactorAuth: false
        }
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const currentSettings = await this.getUserSettings(userId);
      const updatedSettings = { ...currentSettings, ...updates };

      // For now, just return the updated settings
      // In the future, you can store settings in a separate table
      return updatedSettings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, profile: { name: string; email: string }): Promise<any> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: profile.name,
          email: profile.email
        }
      });

      return {
        name: updatedUser.name,
        email: updatedUser.email
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword
        }
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId: string, notificationSettings: any): Promise<any> {
    try {
      // For now, just return the notification settings
      // In the future, you can store these in a separate table
      return notificationSettings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Update appearance settings
  async updateAppearanceSettings(userId: string, appearanceSettings: any): Promise<any> {
    try {
      // For now, just return the appearance settings
      // In the future, you can store these in a separate table
      return appearanceSettings;
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      throw error;
    }
  }
}

export default new SettingsService(); 