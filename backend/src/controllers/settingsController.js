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
exports.SettingsController = void 0;
const settingsService_1 = __importDefault(require("../services/settingsService"));
class SettingsController {
    // Get user settings
    getUserSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const settings = yield settingsService_1.default.getUserSettings(userId);
                res.json({
                    success: true,
                    data: settings
                });
            }
            catch (error) {
                console.error('Error getting user settings:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Update user settings
    updateUserSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const updates = req.body;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const settings = yield settingsService_1.default.updateUserSettings(userId, updates);
                res.json({
                    success: true,
                    message: 'Settings updated successfully',
                    data: settings
                });
            }
            catch (error) {
                console.error('Error updating user settings:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Update user profile
    updateUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { name, email } = req.body;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const profile = yield settingsService_1.default.updateUserProfile(userId, { name, email });
                res.json({
                    success: true,
                    message: 'Profile updated successfully',
                    data: profile
                });
            }
            catch (error) {
                console.error('Error updating user profile:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Change password
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { currentPassword, newPassword } = req.body;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                yield settingsService_1.default.changePassword(userId, currentPassword, newPassword);
                res.json({
                    success: true,
                    message: 'Password changed successfully'
                });
            }
            catch (error) {
                console.error('Error changing password:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Update notification settings
    updateNotificationSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const notificationSettings = req.body;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const settings = yield settingsService_1.default.updateNotificationSettings(userId, notificationSettings);
                res.json({
                    success: true,
                    message: 'Notification settings updated successfully',
                    data: settings
                });
            }
            catch (error) {
                console.error('Error updating notification settings:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Update appearance settings
    updateAppearanceSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const appearanceSettings = req.body;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const settings = yield settingsService_1.default.updateAppearanceSettings(userId, appearanceSettings);
                res.json({
                    success: true,
                    message: 'Appearance settings updated successfully',
                    data: settings
                });
            }
            catch (error) {
                console.error('Error updating appearance settings:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
}
exports.SettingsController = SettingsController;
exports.default = new SettingsController();
