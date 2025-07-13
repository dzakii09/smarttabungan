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
const notificationService_1 = __importDefault(require("../services/notificationService"));
class NotificationController {
    // Get all notifications for user
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { type, isRead, priority, limit, offset } = req.query;
                const filters = {
                    userId,
                    type: type,
                    isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
                    priority: priority,
                    limit: limit ? parseInt(limit) : undefined,
                    offset: offset ? parseInt(offset) : undefined
                };
                const notifications = yield notificationService_1.default.getNotifications(filters);
                const unreadCount = yield notificationService_1.default.getUnreadCount(userId);
                res.json({
                    success: true,
                    data: {
                        notifications,
                        unreadCount
                    }
                });
            }
            catch (error) {
                console.error('Error getting notifications:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get notifications'
                });
            }
        });
    }
    // Get user notifications
    getUserNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { limit = 50 } = req.query;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const notifications = yield notificationService_1.default.getUserNotifications(userId, Number(limit));
                res.json({
                    success: true,
                    data: notifications
                });
            }
            catch (error) {
                console.error('Get notifications error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Mark notification as read
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { id } = req.params;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                const notification = yield notificationService_1.default.markAsRead(id, userId);
                res.json({
                    success: true,
                    message: 'Notifikasi ditandai sebagai telah dibaca',
                    data: notification
                });
            }
            catch (error) {
                console.error('Mark as read error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Mark all notifications as read
    markAllAsRead(req, res) {
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
                yield notificationService_1.default.markAllAsRead(userId);
                res.json({
                    success: true,
                    message: 'Semua notifikasi ditandai sebagai telah dibaca'
                });
            }
            catch (error) {
                console.error('Mark all as read error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Delete notification
    deleteNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { id } = req.params;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User ID tidak ditemukan'
                    });
                }
                yield notificationService_1.default.deleteNotification(id, userId);
                res.json({
                    success: true,
                    message: 'Notifikasi berhasil dihapus'
                });
            }
            catch (error) {
                console.error('Delete notification error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Get unread count
    getUnreadCount(req, res) {
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
                const count = yield notificationService_1.default.getUnreadCount(userId);
                res.json({
                    success: true,
                    data: { unreadCount: count }
                });
            }
            catch (error) {
                console.error('Get unread count error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
    // Create test notification
    createTestNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { title, message, type, priority } = req.body;
                const notification = yield notificationService_1.default.createNotification({
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
            }
            catch (error) {
                console.error('Error creating test notification:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create test notification'
                });
            }
        });
    }
    // Clean old notifications
    cleanOldNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield notificationService_1.default.cleanOldNotifications();
                res.json({
                    success: true,
                    message: 'Old notifications cleaned successfully'
                });
            }
            catch (error) {
                console.error('Error cleaning old notifications:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to clean old notifications'
                });
            }
        });
    }
    // Check and create notifications
    checkNotifications(req, res) {
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
                yield notificationService_1.default.checkAndCreateNotifications(userId);
                res.json({
                    success: true,
                    message: 'Pengecekan notifikasi selesai'
                });
            }
            catch (error) {
                console.error('Check notifications error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Server error'
                });
            }
        });
    }
}
exports.default = new NotificationController();
