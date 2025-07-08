import webpush from 'web-push';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

class PushNotificationService {
  constructor() {
    // Generate VAPID keys for web push notifications
    // In production, these should be stored in environment variables
    const vapidKeys = webpush.generateVAPIDKeys();
    
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // Replace with your email
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  }

  async sendPushNotification(
    subscription: PushSubscription,
    notificationData: PushNotificationData
  ): Promise<boolean> {
    try {
      const payload = JSON.stringify({
        title: notificationData.title,
        body: notificationData.body,
        icon: notificationData.icon || '/icon-192x192.png',
        badge: notificationData.badge || '/badge-72x72.png',
        data: notificationData.data || {}
      });

      await webpush.sendNotification(subscription, payload);
      console.log('Push notification sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send budget alert push notification
  async sendBudgetAlertPush(
    subscription: PushSubscription,
    budgetData: any
  ): Promise<boolean> {
    const { budget, spent, remaining, progress } = budgetData;
    
    const title = progress >= 100 ? '🚨 Budget Terlampaui!' : '⚠️ Peringatan Budget';
    const body = progress >= 100 
      ? `Budget ${budget.category?.name || 'total'} sudah terlampaui sebesar Rp ${(spent - budget.amount).toLocaleString('id-ID')}`
      : `Budget ${budget.category?.name || 'total'} sudah ${progress.toFixed(1)}% terpakai. Tersisa Rp ${remaining.toLocaleString('id-ID')}`;

    return await this.sendPushNotification(subscription, {
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
  }

  // Send goal reminder push notification
  async sendGoalReminderPush(
    subscription: PushSubscription,
    goalData: any
  ): Promise<boolean> {
    const { goal, currentAmount, targetAmount } = goalData;
    const progress = (currentAmount / targetAmount) * 100;
    
    const title = progress >= 100 ? '🎉 Tujuan Tercapai!' : '📈 Update Progress Tujuan';
    const body = progress >= 100
      ? `Selamat! Anda telah mencapai tujuan "${goal.title}"`
      : `Tujuan "${goal.title}" sudah ${progress.toFixed(1)}% tercapai. Tinggal Rp ${(targetAmount - currentAmount).toLocaleString('id-ID')} lagi!`;

    return await this.sendPushNotification(subscription, {
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
  }

  // Send transaction reminder push notification
  async sendTransactionReminderPush(
    subscription: PushSubscription,
    transactionData: any
  ): Promise<boolean> {
    const { description, amount, dueDate } = transactionData;
    
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const title = '💳 Pengingat Transaksi';
    const body = daysUntilDue <= 0
      ? `Tagihan "${description}" sudah jatuh tempo! Jumlah: Rp ${amount.toLocaleString('id-ID')}`
      : `Tagihan "${description}" jatuh tempo dalam ${daysUntilDue} hari. Jumlah: Rp ${amount.toLocaleString('id-ID')}`;

    return await this.sendPushNotification(subscription, {
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
  }

  // Send general notification push
  async sendGeneralNotificationPush(
    subscription: PushSubscription,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    return await this.sendPushNotification(subscription, {
      title,
      body,
      icon: '/icon-192x192.png',
      data: data || {}
    });
  }
}

export default new PushNotificationService(); 