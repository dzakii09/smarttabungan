import prisma from '../utils/database';
import notificationService from './notificationService';
import smartAlertService from './smartAlertService';

class ScheduledNotificationService {
  // Daily reminder to check finances
  async sendDailyReminder(userId: string): Promise<void> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get yesterday's transactions
      const yesterdayTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: yesterday,
            lt: today
          }
        },
        include: { category: true }
      });

      const totalExpense = yesterdayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = yesterdayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      if (yesterdayTransactions.length > 0) {
        await notificationService.createSystemNotification(
          userId,
          '📅 Ringkasan Kemarin',
          `Kemarin Anda memiliki ${yesterdayTransactions.length} transaksi. Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}, Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`,
          'low'
        );
      } else {
        await notificationService.createSystemNotification(
          userId,
          '📝 Jangan Lupa Catat',
          'Jangan lupa untuk mencatat transaksi keuangan Anda hari ini!',
          'low'
        );
      }
    } catch (error) {
      console.error('Error sending daily reminder:', error);
    }
  }

  // Weekly financial summary
  async sendWeeklySummary(userId: string): Promise<void> {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: weekAgo,
            lte: today
          }
        },
        include: { category: true }
      });

      const totalExpense = weeklyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = weeklyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const savings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

      // Get top spending categories
      const categoryExpenses = new Map<string, number>();
      weeklyTransactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
          const categoryName = transaction.category?.name || 'Lainnya';
          const current = categoryExpenses.get(categoryName) || 0;
          categoryExpenses.set(categoryName, current + transaction.amount);
        });

      const topCategories = Array.from(categoryExpenses.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      let message = `Minggu ini: Pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}, Pemasukan Rp ${totalIncome.toLocaleString('id-ID')}, Tabungan Rp ${savings.toLocaleString('id-ID')} (${savingsRate.toFixed(1)}%)`;

      if (topCategories.length > 0) {
        message += `. Pengeluaran terbesar: ${topCategories[0][0]} (Rp ${topCategories[0][1].toLocaleString('id-ID')})`;
      }

      await notificationService.createSystemNotification(
        userId,
        '📊 Ringkasan Mingguan',
        message,
        'medium'
      );
    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }

  // Monthly financial summary
  async sendMonthlySummary(userId: string): Promise<void> {
    try {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const monthlyTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: monthAgo,
            lte: today
          }
        },
        include: { category: true }
      });

      const totalExpense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const savings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

      const monthName = monthAgo.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

      await notificationService.createSystemNotification(
        userId,
        '📈 Ringkasan Bulanan',
        `${monthName}: Pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}, Pemasukan Rp ${totalIncome.toLocaleString('id-ID')}, Tabungan Rp ${savings.toLocaleString('id-ID')} (${savingsRate.toFixed(1)}%)`,
        'medium'
      );
    } catch (error) {
      console.error('Error sending monthly summary:', error);
    }
  }

  // Goal progress reminder
  async sendGoalProgressReminder(userId: string): Promise<void> {
    try {
      const goals = await prisma.goal.findMany({
        where: {
          userId,
          isCompleted: false
        }
      });

      for (const goal of goals) {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (goal.targetDate) {
          const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft <= 30 && progress < 80) {
            await notificationService.createSystemNotification(
              userId,
              '🎯 Deadline Tujuan Mendekati',
              `Tujuan "${goal.title}" deadline dalam ${daysLeft} hari. Progress: ${progress.toFixed(1)}%. Tinggal Rp ${(goal.targetAmount - goal.currentAmount).toLocaleString('id-ID')} lagi!`,
              'high'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error sending goal progress reminder:', error);
    }
  }

  // Budget check reminder
  async sendBudgetCheckReminder(userId: string): Promise<void> {
    try {
      const activeBudgets = await prisma.budget.findMany({
        where: {
          userId,
          isActive: true
        },
        include: { category: true }
      });

      for (const budget of activeBudgets) {
        const spent = await this.calculateSpentAmount(userId, budget);
        const progress = (spent / budget.amount) * 100;

        if (progress >= 80 && progress < 100) {
          await notificationService.createSystemNotification(
            userId,
            '⚠️ Budget Hampir Habis',
            `Budget ${budget.category?.name || 'total'} sudah ${progress.toFixed(1)}% terpakai. Tersisa Rp ${(budget.amount - spent).toLocaleString('id-ID')}`,
            'medium'
          );
        }
      }
    } catch (error) {
      console.error('Error sending budget check reminder:', error);
    }
  }

  // Smart insights reminder
  async sendSmartInsightsReminder(userId: string): Promise<void> {
    try {
      await smartAlertService.runSmartAlerts(userId);
    } catch (error) {
      console.error('Error sending smart insights reminder:', error);
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

  // Run all scheduled notifications for a user
  async runScheduledNotifications(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.sendDailyReminder(userId),
        this.sendGoalProgressReminder(userId),
        this.sendBudgetCheckReminder(userId),
        this.sendSmartInsightsReminder(userId)
      ]);
    } catch (error) {
      console.error('Error running scheduled notifications:', error);
    }
  }
}

export default new ScheduledNotificationService(); 