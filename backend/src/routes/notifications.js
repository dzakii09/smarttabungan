"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get user notifications
router.get('/', auth_1.auth, notificationController_1.default.getUserNotifications);
// Get unread count
router.get('/unread-count', auth_1.auth, notificationController_1.default.getUnreadCount);
// Mark notification as read
router.patch('/:id/read', auth_1.auth, notificationController_1.default.markAsRead);
// Mark all notifications as read
router.patch('/mark-all-read', auth_1.auth, notificationController_1.default.markAllAsRead);
// Delete notification
router.delete('/:id', auth_1.auth, notificationController_1.default.deleteNotification);
// Check and create notifications
router.post('/check', auth_1.auth, notificationController_1.default.checkNotifications);
// Create test notification
router.post('/test', notificationController_1.default.createTestNotification);
// Clean old notifications
router.delete('/clean-old', notificationController_1.default.cleanOldNotifications);
exports.default = router;
