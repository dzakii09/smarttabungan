import prisma from '../utils/database';
import { NotificationType, NotificationPriority } from '../types/notification';

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: any;
}

export interface NotificationFilters {
  userId: string;
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

interface NotificationData {
  userId: string;
  type: 'budget_alert' | 'bill_reminder' | 'savings_goal' | 'unusual_spending' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NotificationWithRead {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

class NotificationService {
  // Create notification
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || 'medium',
          scheduledAt: data.scheduledAt,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications with filters
  async getNotifications(filters: NotificationFilters) {
    try {
      const where: any = {
        userId: filters.userId
      };

      if (filters.type) where.type = filters.type;
      if (filters.isRead !== undefined) where.isRead = filters.isRead;
      if (filters.priority) where.priority = filters.priority;

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return notifications.map(notification => ({
        ...notification,
        metadata: notification.metadata ? JSON.parse(notification.metadata as string) : null
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.notification.update({
        where: { 
          id: notificationId,
          userId 
        },
        data: { isRead: true }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    try {
      return await prisma.notification.delete({
        where: { 
          id: notificationId,
          userId 
        }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    try {
      return await prisma.notification.count({
        where: { userId, isRead: false }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Smart Budget Alerts
  async createBudgetAlert(userId: string, budgetId: string, budgetName: string, spent: number, limit: number, percentage: number) {
    let priority: NotificationPriority = 'medium';
    let message = '';

    if (percentage >= 90) {
      priority = 'urgent';
      message = `Budget ${budgetName} sudah mencapai ${percentage.toFixed(1)}% (${spent.toLocaleString('id-ID')} dari ${limit.toLocaleString('id-ID')}). Hati-hati dengan pengeluaran!`;
    } else if (percentage >= 75) {
      priority = 'high';
      message = `Budget ${budgetName} sudah mencapai ${percentage.toFixed(1)}% (${spent.toLocaleString('id-ID')} dari ${limit.toLocaleString('id-ID')}).`;
    } else if (percentage >= 50) {
      priority = 'medium';
      message = `Budget ${budgetName} sudah mencapai ${percentage.toFixed(1)}% (${spent.toLocaleString('id-ID')} dari ${limit.toLocaleString('id-ID')}).`;
    }

    if (message) {
      return this.createNotification({
        userId,
        title: 'Budget Alert',
        message,
        type: 'budget_alert',
        priority,
        metadata: {
          budgetId,
          budgetName,
          spent,
          limit,
          percentage
        }
      });
    }
  }

  // Goal Reminder
  async createGoalReminder(userId: string, goalId: string, goalTitle: string, currentAmount: number, targetAmount: number, targetDate: Date) {
    const daysLeft = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const percentage = (currentAmount / targetAmount) * 100;

    let priority: NotificationPriority = 'medium';
    let message = '';

    if (daysLeft <= 7 && percentage < 80) {
      priority = 'urgent';
      message = `Goal "${goalTitle}" deadline dalam ${daysLeft} hari! Progress: ${percentage.toFixed(1)}%. Segera tingkatkan tabungan!`;
    } else if (daysLeft <= 30 && percentage < 60) {
      priority = 'high';
      message = `Goal "${goalTitle}" deadline dalam ${daysLeft} hari. Progress: ${percentage.toFixed(1)}%.`;
    } else if (daysLeft <= 90 && percentage < 40) {
      priority = 'medium';
      message = `Goal "${goalTitle}" deadline dalam ${daysLeft} hari. Progress: ${percentage.toFixed(1)}%.`;
    }

    if (message) {
      return this.createNotification({
        userId,
        title: 'Goal Reminder',
        message,
        type: 'goal_reminder',
        priority,
        metadata: {
          goalId,
          goalTitle,
          currentAmount,
          targetAmount,
          targetDate: targetDate.toISOString(),
          daysLeft,
          percentage
        }
      });
    }
  }

  // Recurring Transaction Due
  async createRecurringDueAlert(userId: string, recurringId: string, description: string, amount: number, dueDate: Date) {
    const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    let priority: NotificationPriority = 'medium';
    let message = '';

    if (daysUntilDue <= 1) {
      priority = 'urgent';
      message = `Transaksi berulang "${description}" jatuh tempo besok! Jumlah: ${amount.toLocaleString('id-ID')}`;
    } else if (daysUntilDue <= 3) {
      priority = 'high';
      message = `Transaksi berulang "${description}" jatuh tempo dalam ${daysUntilDue} hari. Jumlah: ${amount.toLocaleString('id-ID')}`;
    } else if (daysUntilDue <= 7) {
      priority = 'medium';
      message = `Transaksi berulang "${description}" jatuh tempo dalam ${daysUntilDue} hari. Jumlah: ${amount.toLocaleString('id-ID')}`;
    }

    if (message) {
      return this.createNotification({
        userId,
        title: 'Recurring Transaction Due',
        message,
        type: 'recurring_due',
        priority,
        metadata: {
          recurringId,
          description,
          amount,
          dueDate: dueDate.toISOString(),
          daysUntilDue
        }
      });
    }
  }

  // Spending Pattern Alert
  async createSpendingPatternAlert(userId: string, categoryName: string, amount: number, averageAmount: number) {
    const increase = ((amount - averageAmount) / averageAmount) * 100;

    if (increase > 50) {
      return this.createNotification({
        userId,
        title: 'Spending Pattern Alert',
        message: `Pengeluaran untuk kategori "${categoryName}" meningkat ${increase.toFixed(1)}% dari rata-rata. Perhatikan pengeluaran Anda!`,
        type: 'warning',
        priority: 'high',
        metadata: {
          categoryName,
          amount,
          averageAmount,
          increase
        }
      });
    }
  }

  // Savings Goal Achievement
  async createSavingsAchievement(userId: string, goalTitle: string, percentage: number) {
    if (percentage >= 100) {
      return this.createNotification({
        userId,
        title: 'Goal Achieved! 🎉',
        message: `Selamat! Anda telah mencapai goal "${goalTitle}"!`,
        type: 'success',
        priority: 'high',
        metadata: {
          goalTitle,
          percentage
        }
      });
    } else if (percentage >= 80) {
      return this.createNotification({
        userId,
        title: 'Goal Progress',
        message: `Goal "${goalTitle}" sudah ${percentage.toFixed(1)}% tercapai! Hampir selesai!`,
        type: 'success',
        priority: 'medium',
        metadata: {
          goalTitle,
          percentage
        }
      });
    }
  }

  // Monthly Summary
  async createMonthlySummary(userId: string, month: string, totalIncome: number, totalExpense: number, savings: number, savingsRate: number) {
    let message = `Ringkasan ${month}: Pemasukan ${totalIncome.toLocaleString('id-ID')}, Pengeluaran ${totalExpense.toLocaleString('id-ID')}, Tabungan ${savings.toLocaleString('id-ID')} (${savingsRate.toFixed(1)}%)`;

    if (savingsRate >= 20) {
      message += ' - Excellent! Pertahankan kebiasaan menabung Anda!';
    } else if (savingsRate >= 10) {
      message += ' - Bagus! Coba tingkatkan lagi tabungan Anda.';
    } else {
      message += ' - Perlu evaluasi pengeluaran untuk meningkatkan tabungan.';
    }

    return this.createNotification({
      userId,
      title: 'Monthly Summary',
      message,
      type: 'info',
      priority: 'medium',
      metadata: {
        month,
        totalIncome,
        totalExpense,
        savings,
        savingsRate
      }
    });
  }

  // Clean old notifications (older than 30 days)
  async cleanOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          isRead: true
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error cleaning old notifications:', error);
      throw error;
    }
  }

  // Create new notification
  async createNewNotification(data: NotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          metadata: data.data || {},
          isRead: false
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 50) {
    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Budget Alert Notifications
  async createBudgetAlertNotification(userId: string, budgetData: any) {
    const { budget, spent, remaining, progress } = budgetData;
    
    let title = '';
    let message = '';
    let priority: 'low' | 'medium' | 'high' = 'low';

    if (progress >= 100) {
      title = '🚨 Budget Terlampaui!';
      message = `Budget ${budget.category?.name || 'total'} sudah terlampaui sebesar ${this.formatCurrency(spent - budget.amount)}`;
      priority = 'high';
    } else if (progress >= 80) {
      title = '⚠️ Budget Hampir Habis';
      message = `Budget ${budget.category?.name || 'total'} sudah ${progress.toFixed(1)}% terpakai. Tersisa ${this.formatCurrency(remaining)}`;
      priority = 'medium';
    } else if (progress >= 60) {
      title = '📊 Update Budget';
      message = `Budget ${budget.category?.name || 'total'} sudah ${progress.toFixed(1)}% terpakai`;
      priority = 'low';
    }

    if (title && message) {
      return await this.createNewNotification({
        userId,
        type: 'budget_alert',
        title,
        message,
        priority,
        data: { budgetId: budget.id, progress, spent, remaining }
      });
    }
  }

  // Bill Reminder Notifications
  async createBillReminderNotification(userId: string, billData: any) {
    const { title, amount, dueDate, category } = billData;
    
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    let priority: 'low' | 'medium' | 'high' = 'low';
    let urgencyMessage = '';

    if (daysUntilDue <= 0) {
      urgencyMessage = 'Tagihan sudah jatuh tempo!';
      priority = 'high';
    } else if (daysUntilDue <= 3) {
      urgencyMessage = `Jatuh tempo dalam ${daysUntilDue} hari`;
      priority = 'high';
    } else if (daysUntilDue <= 7) {
      urgencyMessage = `Jatuh tempo dalam ${daysUntilDue} hari`;
      priority = 'medium';
    } else {
      urgencyMessage = `Jatuh tempo dalam ${daysUntilDue} hari`;
      priority = 'low';
    }

    return await this.createNewNotification({
      userId,
      type: 'bill_reminder',
      title: `💳 ${title}`,
      message: `${urgencyMessage}. Jumlah: ${this.formatCurrency(amount)}`,
      priority,
      data: { billId: billData.id, dueDate, amount }
    });
  }

  // Savings Goal Notifications
  async createSavingsGoalNotification(userId: string, goalData: any) {
    const { goal, currentAmount, targetAmount } = goalData;
    const progress = (currentAmount / targetAmount) * 100;
    
    let title = '';
    let message = '';
    let priority: 'low' | 'medium' | 'high' = 'low';

    if (progress >= 100) {
      title = '🎉 Tujuan Tercapai!';
      message = `Selamat! Anda telah mencapai tujuan "${goal.name}"`;
      priority = 'high';
    } else if (progress >= 75) {
      title = '🏆 Hampir Tercapai!';
      message = `Tujuan "${goal.name}" sudah ${progress.toFixed(1)}% tercapai. Tinggal ${this.formatCurrency(targetAmount - currentAmount)} lagi!`;
      priority = 'medium';
    } else if (progress >= 50) {
      title = '📈 Progress Tujuan';
      message = `Tujuan "${goal.name}" sudah ${progress.toFixed(1)}% tercapai`;
      priority = 'low';
    }

    if (title && message) {
      return await this.createNewNotification({
        userId,
        type: 'savings_goal',
        title,
        message,
        priority,
        data: { goalId: goal.id, progress, currentAmount, targetAmount }
      });
    }
  }

  // Unusual Spending Detection
  async createUnusualSpendingAlert(userId: string, transactionData: any) {
    const { transaction, averageAmount, category } = transactionData;
    const difference = transaction.amount - averageAmount;
    const percentage = (difference / averageAmount) * 100;
    
    if (percentage > 200) { // 200% lebih tinggi dari rata-rata
      return await this.createNewNotification({
        userId,
        type: 'unusual_spending',
        title: '🔍 Pengeluaran Tidak Biasa',
        message: `Pengeluaran ${category.name} sebesar ${this.formatCurrency(transaction.amount)} ${percentage > 300 ? 'sangat tinggi' : 'lebih tinggi'} dari biasanya (${this.formatCurrency(averageAmount)})`,
        priority: 'medium',
        data: { transactionId: transaction.id, amount: transaction.amount, averageAmount, percentage }
      });
    }
  }

  // System Notifications
  async createSystemNotification(userId: string, title: string, message: string, priority: 'low' | 'medium' | 'high' = 'low') {
    return await this.createNewNotification({
      userId,
      type: 'system',
      title,
      message,
      priority
    });
  }

  // Check and create notifications for user
  async checkAndCreateNotifications(userId: string) {
    try {
      // Check budget alerts
      await this.checkBudgetAlerts(userId);
      
      // Check bill reminders
      await this.checkBillReminders(userId);
      
      // Check savings goals
      await this.checkSavingsGoals(userId);
      
      // Check unusual spending
      await this.checkUnusualSpending(userId);
      
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  // Check budget alerts
  private async checkBudgetAlerts(userId: string) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId, isActive: true },
        include: { category: true }
      });

      for (const budget of budgets) {
        const spent = await this.calculateSpentAmount(userId, budget);
        const remaining = Math.max(0, budget.amount - spent);
        const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        await this.createBudgetAlertNotification(userId, { budget, spent, remaining, progress });
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  }

  // Check bill reminders
  private async checkBillReminders(userId: string) {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const bills = await prisma.recurringTransaction.findMany({
        where: {
          userId,
          type: 'expense',
          nextDueDate: {
            gte: today,
            lte: nextWeek
          }
        },
        include: { category: true }
      });

      for (const bill of bills) {
        await this.createBillReminderNotification(userId, {
          id: bill.id,
          title: bill.description,
          amount: bill.amount,
          dueDate: bill.nextDueDate,
          category: bill.category
        });
      }
    } catch (error) {
      console.error('Error checking bill reminders:', error);
    }
  }

  // Check savings goals
  private async checkSavingsGoals(userId: string) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId }
      });

      for (const goal of goals) {
        await this.createSavingsGoalNotification(userId, {
          goal,
          currentAmount: goal.currentAmount,
          targetAmount: goal.targetAmount
        });
      }
    } catch (error) {
      console.error('Error checking savings goals:', error);
    }
  }

  // Check unusual spending
  private async checkUnusualSpending(userId: string) {
    try {
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense',
          date: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      for (const transaction of recentTransactions) {
        const averageAmount = await this.getAverageAmountForCategory(userId, transaction.categoryId);
        await this.createUnusualSpendingAlert(userId, {
          transaction,
          averageAmount,
          category: transaction.category
        });
      }
    } catch (error) {
      console.error('Error checking unusual spending:', error);
    }
  }

  // Calculate spent amount for budget
  private async calculateSpentAmount(userId: string, budget: any): Promise<number> {
    try {
      const where: any = {
        userId,
        type: 'expense',
        date: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      };

      if (budget.categoryId) {
        where.categoryId = budget.categoryId;
      }

      const result = await prisma.transaction.aggregate({
        where,
        _sum: { amount: true }
      });

      return result._sum.amount || 0;
    } catch (error) {
      console.error('Error calculating spent amount:', error);
      return 0;
    }
  }

  // Get average amount for category
  private async getAverageAmountForCategory(userId: string, categoryId: string): Promise<number> {
    try {
      const result = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId,
          type: 'expense',
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        _avg: { amount: true }
      });

      return result._avg.amount || 0;
    } catch (error) {
      console.error('Error getting average amount:', error);
      return 0;
    }
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export default new NotificationService(); 