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
const database_1 = __importDefault(require("../utils/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class SettingsService {
    // Get user settings
    getUserSettings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield database_1.default.user.findUnique({
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
            }
            catch (error) {
                console.error('Error getting user settings:', error);
                throw error;
            }
        });
    }
    // Update user settings
    updateUserSettings(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentSettings = yield this.getUserSettings(userId);
                const updatedSettings = Object.assign(Object.assign({}, currentSettings), updates);
                // For now, just return the updated settings
                // In the future, you can store settings in a separate table
                return updatedSettings;
            }
            catch (error) {
                console.error('Error updating user settings:', error);
                throw error;
            }
        });
    }
    // Update user profile
    updateUserProfile(userId, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield database_1.default.user.update({
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
            }
            catch (error) {
                console.error('Error updating user profile:', error);
                throw error;
            }
        });
    }
    // Change password
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield database_1.default.user.findUnique({
                    where: { id: userId }
                });
                if (!user) {
                    throw new Error('User not found');
                }
                // Verify current password
                const isCurrentPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isCurrentPasswordValid) {
                    throw new Error('Current password is incorrect');
                }
                // Hash new password
                const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, 10);
                // Update password
                yield database_1.default.user.update({
                    where: { id: userId },
                    data: {
                        password: hashedNewPassword
                    }
                });
            }
            catch (error) {
                console.error('Error changing password:', error);
                throw error;
            }
        });
    }
    // Update notification settings
    updateNotificationSettings(userId, notificationSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // For now, just return the notification settings
                // In the future, you can store these in a separate table
                return notificationSettings;
            }
            catch (error) {
                console.error('Error updating notification settings:', error);
                throw error;
            }
        });
    }
    // Update appearance settings
    updateAppearanceSettings(userId, appearanceSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // For now, just return the appearance settings
                // In the future, you can store these in a separate table
                return appearanceSettings;
            }
            catch (error) {
                console.error('Error updating appearance settings:', error);
                throw error;
            }
        });
    }
}
exports.default = new SettingsService();
