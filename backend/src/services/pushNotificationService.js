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
const web_push_1 = __importDefault(require("web-push"));
class PushNotificationService {
    constructor() {
        // Generate VAPID keys for web push notifications
        // In production, these should be stored in environment variables
        const vapidKeys = web_push_1.default.generateVAPIDKeys();
        web_push_1.default.setVapidDetails('mailto:your-email@example.com', // Replace with your email
        vapidKeys.publicKey, vapidKeys.privateKey);
    }
    sendPushNotification(subscription, notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = JSON.stringify({
                    title: notificationData.title,
                    body: notificationData.body,
                    icon: notificationData.icon || '/icon-192x192.png',
                    badge: notificationData.badge || '/badge-72x72.png',
                    data: notificationData.data || {}
                });
                yield web_push_1.default.sendNotification(subscription, payload);
                console.log('Push notification sent successfully');
                return true;
            }
            catch (error) {
                console.error('Error sending push notification:', error);
                return false;
            }
        });
    }
    // Send budget alert push notification
    sendBudgetAlertPush(subscription, budgetData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { budget, spent, remaining, progress } = budgetData;
            const title = progress >= 100 ? '🚨 Budget Terlampaui!' : '⚠️ Peringatan Budget';
            const body = progress >= 100
                ? `Budget ${((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'total'} sudah terlampaui sebesar Rp ${(spent - budget.amount).toLocaleString('id-ID')}`
                : `Budget ${((_b = budget.category) === null || _b === void 0 ? void 0 : _b.name) || 'total'} sudah ${progress.toFixed(1)}% terpakai. Tersisa Rp ${remaining.toLocaleString('id-ID')}`;
            return yield this.sendPushNotification(subscription, {
                title,
                body,
                icon: '/icon-192x192.png',
                data: {
                    type: 'budget_alert',
                    budgetId: budget.id,
                    progress,
                    spent,
                    remaining
                }
            });
        });
    }
    // Send goal reminder push notification
    sendGoalReminderPush(subscription, goalData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { goal, currentAmount, targetAmount } = goalData;
            const progress = (currentAmount / targetAmount) * 100;
            const title = progress >= 100 ? '🎉 Tujuan Tercapai!' : '📈 Update Progress Tujuan';
            const body = progress >= 100
                ? `Selamat! Anda telah mencapai tujuan "${goal.title}"`
                : `Tujuan "${goal.title}" sudah ${progress.toFixed(1)}% tercapai. Tinggal Rp ${(targetAmount - currentAmount).toLocaleString('id-ID')} lagi!`;
            return yield this.sendPushNotification(subscription, {
                title,
                body,
                icon: '/icon-192x192.png',
                data: {
                    type: 'goal_reminder',
                    goalId: goal.id,
                    progress,
                    currentAmount,
                    targetAmount
                }
            });
        });
    }
    // Send transaction reminder push notification
    sendTransactionReminderPush(subscription, transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { description, amount, dueDate } = transactionData;
            const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const title = '💳 Pengingat Transaksi';
            const body = daysUntilDue <= 0
                ? `Tagihan "${description}" sudah jatuh tempo! Jumlah: Rp ${amount.toLocaleString('id-ID')}`
                : `Tagihan "${description}" jatuh tempo dalam ${daysUntilDue} hari. Jumlah: Rp ${amount.toLocaleString('id-ID')}`;
            return yield this.sendPushNotification(subscription, {
                title,
                body,
                icon: '/icon-192x192.png',
                data: {
                    type: 'transaction_reminder',
                    description,
                    amount,
                    dueDate,
                    daysUntilDue
                }
            });
        });
    }
    // Send general notification push
    sendGeneralNotificationPush(subscription, title, body, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sendPushNotification(subscription, {
                title,
                body,
                icon: '/icon-192x192.png',
                data: data || {}
            });
        });
    }
}
exports.default = new PushNotificationService();
