import prisma from '../utils/database';
import notificationService from './notificationService';

interface SpendingPattern {
  categoryId: string;
  categoryName: string;
  averageAmount: number;
  totalTransactions: number;
  lastTransactionDate: Date;
}

interface UnusualSpendingAlert {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  averageAmount: number;
  percentage: number;
  transactionId: string;
}

class SmartAlertService {
  // Detect unusual spending patterns
  async detectUnusualSpending(userId: string, transactionId: string): Promise<void> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { category: true }
      });

      if (!transaction || transaction.type !== 'expense' || !transaction.categoryId) {
        return;
      }

      const pattern = await this.getSpendingPattern(userId, transaction.categoryId);
      
      if (pattern && pattern.totalTransactions >= 3) {
        const percentage = (transaction.amount / pattern.averageAmount) * 100;
        
        if (percentage > 200) { // 200% lebih tinggi dari rata-rata
          await this.createUnusualSpendingAlert(userId, {
            categoryId: transaction.categoryId,
            categoryName: transaction.category?.name || 'Unknown',
            currentAmount: transaction.amount,
            averageAmount: pattern.averageAmount,
            percentage,
            transactionId: transaction.id
          });
        }
      }
    } catch (error) {
      console.error('Error detecting unusual spending:', error);
    }
  }

  // Get spending pattern for a category
  private async getSpendingPattern(userId: string, categoryId: string): Promise<SpendingPattern | null> {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          categoryId,
          type: 'expense',
          date: {
            gte: threeMonthsAgo
          }
        },
        include: { category: true },
        orderBy: { date: 'desc' }
      });

      if (transactions.length < 3) {
        return null;
      }

      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = totalAmount / transactions.length;

      return {
        categoryId,
        categoryName: transactions[0].category?.name || 'Unknown',
        averageAmount,
        totalTransactions: transactions.length,
        lastTransactionDate: transactions[0].date
      };
    } catch (error) {
      console.error('Error getting spending pattern:', error);
      return null;
    }
  }

  // Create unusual spending alert
  private async createUnusualSpendingAlert(userId: string, alert: UnusualSpendingAlert): Promise<void> {
    const priority = alert.percentage > 300 ? 'high' : 'medium';
    const message = alert.percentage > 300 
      ? `Pengeluaran ${alert.categoryName} sebesar Rp ${alert.currentAmount.toLocaleString('id-ID')} sangat tinggi dari biasanya (Rp ${alert.averageAmount.toLocaleString('id-ID')})`
      : `Pengeluaran ${alert.categoryName} sebesar Rp ${alert.currentAmount.toLocaleString('id-ID')} lebih tinggi dari biasanya (Rp ${alert.averageAmount.toLocaleString('id-ID')})`;

    await notificationService.createSystemNotification(
      userId,
      '🔍 Pengeluaran Tidak Biasa',
      message,
      priority
    );
  }

  // Detect spending trends
  async detectSpendingTrends(userId: string): Promise<void> {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const [currentMonth, lastMonth] = await Promise.all([
        this.getMonthlyExpenses(userId, oneMonthAgo),
        this.getMonthlyExpenses(userId, twoMonthsAgo)
      ]);

      if (currentMonth > 0 && lastMonth > 0) {
        const percentageChange = ((currentMonth - lastMonth) / lastMonth) * 100;
        
        if (percentageChange > 50) {
          await notificationService.createSystemNotification(
            userId,
            '📈 Peningkatan Pengeluaran',
            `Pengeluaran bulan ini meningkat ${percentageChange.toFixed(1)}% dari bulan lalu. Perhatikan pengeluaran Anda!`,
            'medium'
          );
        } else if (percentageChange < -30) {
          await notificationService.createSystemNotification(
            userId,
            '📉 Penurunan Pengeluaran',
            `Pengeluaran bulan ini menurun ${Math.abs(percentageChange).toFixed(1)}% dari bulan lalu. Bagus!`,
            'low'
          );
        }
      }
    } catch (error) {
      console.error('Error detecting spending trends:', error);
    }
  }

  // Get monthly expenses
  private async getMonthlyExpenses(userId: string, startDate: Date): Promise<number> {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      _sum: { amount: true }
    });

    return result._sum.amount || 0;
  }

  // Detect savings opportunities
  async detectSavingsOpportunities(userId: string): Promise<void> {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const expenses = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense',
          date: {
            gte: oneMonthAgo
          }
        },
        include: { category: true }
      });

      const categoryExpenses = new Map<string, number>();
      
      expenses.forEach(expense => {
        const categoryName = expense.category?.name || 'Lainnya';
        const current = categoryExpenses.get(categoryName) || 0;
        categoryExpenses.set(categoryName, current + expense.amount);
      });

      // Find categories with highest expenses
      const sortedCategories = Array.from(categoryExpenses.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      if (sortedCategories.length > 0) {
        const [topCategory, amount] = sortedCategories[0];
        const potentialSavings = amount * 0.1; // 10% potential savings

        if (potentialSavings > 100000) { // Only alert if potential savings > 100k
          await notificationService.createSystemNotification(
            userId,
            '💡 Peluang Hemat',
            `Kategori "${topCategory}" adalah pengeluaran terbesar Anda bulan ini (Rp ${amount.toLocaleString('id-ID')}). Coba hemat 10% untuk menghemat Rp ${potentialSavings.toLocaleString('id-ID')}!`,
            'low'
          );
        }
      }
    } catch (error) {
      console.error('Error detecting savings opportunities:', error);
    }
  }

  // Detect income patterns
  async detectIncomePatterns(userId: string): Promise<void> {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const incomes = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'income',
          date: {
            gte: threeMonthsAgo
          }
        },
        include: { category: true },
        orderBy: { date: 'desc' }
      });

      if (incomes.length >= 3) {
        const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
        const averageIncome = totalIncome / incomes.length;
        const lastIncome = incomes[0];

        if (lastIncome.amount > averageIncome * 1.5) {
          await notificationService.createSystemNotification(
            userId,
            '🎉 Pemasukan Tinggi',
            `Pemasukan terbaru Anda (Rp ${lastIncome.amount.toLocaleString('id-ID')}) lebih tinggi dari rata-rata (Rp ${averageIncome.toLocaleString('id-ID')}). Pertimbangkan untuk menabung lebih banyak!`,
            'low'
          );
        }
      }
    } catch (error) {
      console.error('Error detecting income patterns:', error);
    }
  }

  // Run all smart alerts
  async runSmartAlerts(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.detectSpendingTrends(userId),
        this.detectSavingsOpportunities(userId),
        this.detectIncomePatterns(userId)
      ]);
    } catch (error) {
      console.error('Error running smart alerts:', error);
    }
  }
}

export default new SmartAlertService(); 