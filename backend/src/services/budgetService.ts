import prisma from '../utils/database';

interface CreateBudgetData {
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  categoryId?: string;
}

interface UpdateBudgetData {
  amount?: number;
  period?: 'monthly' | 'weekly' | 'yearly';
  startDate?: Date;
  categoryId?: string;
  isActive?: boolean;
}

interface BudgetWithProgress {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  period: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  status: 'on-track' | 'warning' | 'exceeded';
}

class BudgetService {
  // Create new budget
  async createBudget(userId: string, data: CreateBudgetData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const endDate = this.calculateEndDate(data.startDate, data.period);
      
      return await prisma.budget.create({
        data: {
          amount: data.amount,
          period: data.period,
          startDate: data.startDate,
          endDate,
          categoryId: data.categoryId || null,
          userId
        },
        include: {
          category: true
        }
      });
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  // Get all budgets for user
  async getBudgets(userId: string): Promise<BudgetWithProgress[]> {
    try {
      if (!userId) {
        console.warn('getBudgets called with empty userId');
        return [];
      }

      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return await Promise.all(
        budgets.map(async (budget) => {
          try {
            const spent = await this.calculateSpentAmount(userId, budget);
            const remaining = Math.max(0, budget.amount - spent);
            const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            
            let status: 'on-track' | 'warning' | 'exceeded' = 'on-track';
            if (progress >= 100) {
              status = 'exceeded';
            } else if (progress >= 80) {
              status = 'warning';
            }

            return {
              id: budget.id,
              amount: budget.amount,
              spent,
              remaining,
              progress,
              period: budget.period,
              startDate: budget.startDate,
              endDate: budget.endDate,
              isActive: budget.isActive,
              category: budget.category,
              status
            };
          } catch (error) {
            console.error(`Error processing budget ${budget.id}:`, error);
            // Return a safe default for this budget
            return {
              id: budget.id,
              amount: budget.amount,
              spent: 0,
              remaining: budget.amount,
              progress: 0,
              period: budget.period,
              startDate: budget.startDate,
              endDate: budget.endDate,
              isActive: budget.isActive,
              category: budget.category,
              status: 'on-track' as const
            };
          }
        })
      );
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  }

  // Get budget by ID
  async getBudgetById(userId: string, budgetId: string): Promise<BudgetWithProgress | null> {
    try {
      if (!userId || !budgetId) {
        return null;
      }

      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId },
        include: {
          category: true
        }
      });

      if (!budget) return null;

      const spent = await this.calculateSpentAmount(userId, budget);
      const remaining = Math.max(0, budget.amount - spent);
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      let status: 'on-track' | 'warning' | 'exceeded' = 'on-track';
      if (progress >= 100) {
        status = 'exceeded';
      } else if (progress >= 80) {
        status = 'warning';
      }

      return {
        id: budget.id,
        amount: budget.amount,
        spent,
        remaining,
        progress,
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        isActive: budget.isActive,
        category: budget.category,
        status
      };
    } catch (error) {
      console.error('Error getting budget by ID:', error);
      return null;
    }
  }

  // Update budget
  async updateBudget(userId: string, budgetId: string, data: UpdateBudgetData) {
    try {
      if (!userId || !budgetId) {
        throw new Error('User ID and Budget ID are required');
      }

      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      const updateData: any = { ...data };
      
      // Recalculate end date if period or start date changes
      if (data.period || data.startDate) {
        const startDate = data.startDate || budget.startDate;
        const period = data.period || budget.period;
        updateData.endDate = this.calculateEndDate(startDate, period);
      }

      return await prisma.budget.update({
        where: { id: budgetId },
        data: updateData,
        include: {
          category: true
        }
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // Delete budget
  async deleteBudget(userId: string, budgetId: string) {
    try {
      if (!userId || !budgetId) {
        throw new Error('User ID and Budget ID are required');
      }

      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      await prisma.budget.delete({
        where: { id: budgetId }
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Toggle budget status
  async toggleBudgetStatus(userId: string, budgetId: string) {
    try {
      if (!userId || !budgetId) {
        throw new Error('User ID and Budget ID are required');
      }

      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId }
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      return await prisma.budget.update({
        where: { id: budgetId },
        data: { isActive: !budget.isActive },
        include: {
          category: true
        }
      });
    } catch (error) {
      console.error('Error toggling budget status:', error);
      throw error;
    }
  }

  // Calculate spent amount for a budget
  private async calculateSpentAmount(userId: string, budget: any): Promise<number> {
    try {
      if (!userId || !budget) {
        return 0;
      }

      const where: any = {
        userId,
        type: 'expense',
        date: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      };

      // If budget is for specific category
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

  // Calculate end date based on period
  private calculateEndDate(startDate: Date, period: string): Date {
    try {
      const endDate = new Date(startDate);
      
      switch (period) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1);
      }
      
      return endDate;
    } catch (error) {
      console.error('Error calculating end date:', error);
      // Return a safe default
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
      return defaultEndDate;
    }
  }

  // Get budget alerts (for notifications)
  async getBudgetAlerts(userId: string): Promise<any[]> {
    try {
      if (!userId) {
        return [];
      }

      const budgets = await this.getBudgets(userId);
      const alerts: any[] = [];

      for (const budget of budgets) {
        if (!budget.isActive) continue;

        try {
          const daysLeft = Math.ceil((budget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const daysElapsed = Math.max(1, (new Date().getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24));
          const dailyAverage = budget.spent / daysElapsed;
          const projectedSpending = dailyAverage * daysLeft;

          // Alert if spending too fast
          if (budget.progress >= 80 && budget.progress < 100) {
            alerts.push({
              type: 'warning',
              budgetId: budget.id,
              categoryName: budget.category?.name || 'Total',
              message: `Budget ${budget.category?.name || 'total'} sudah ${Math.round(budget.progress)}% terpakai`,
              progress: budget.progress
            });
          }

          // Alert if exceeded
          if (budget.progress >= 100) {
            alerts.push({
              type: 'exceeded',
              budgetId: budget.id,
              categoryName: budget.category?.name || 'Total',
              message: `Budget ${budget.category?.name || 'total'} sudah terlampaui!`,
              progress: budget.progress
            });
          }

          // Alert if projected to exceed
          if (projectedSpending > budget.remaining && budget.progress < 80) {
            alerts.push({
              type: 'projection',
              budgetId: budget.id,
              categoryName: budget.category?.name || 'Total',
              message: `Berdasarkan tren, budget ${budget.category?.name || 'total'} akan terlampaui`,
              progress: budget.progress
            });
          }
        } catch (error) {
          console.error(`Error processing alert for budget ${budget.id}:`, error);
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error getting budget alerts:', error);
      return [];
    }
  }

  // Get budget statistics
  async getBudgetStats(userId: string) {
    try {
      if (!userId) {
        return {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overallProgress: 0,
          activeBudgets: 0,
          exceededBudgets: 0,
          warningBudgets: 0,
          onTrackBudgets: 0
        };
      }

      const budgets = await this.getBudgets(userId);
      const activeBudgets = budgets.filter(b => b.isActive);
      
      const totalBudget = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
      const totalRemaining = activeBudgets.reduce((sum, b) => sum + b.remaining, 0);
      const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      const exceededBudgets = activeBudgets.filter(b => b.status === 'exceeded').length;
      const warningBudgets = activeBudgets.filter(b => b.status === 'warning').length;
      const onTrackBudgets = activeBudgets.filter(b => b.status === 'on-track').length;

      return {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallProgress,
        activeBudgets: activeBudgets.length,
        exceededBudgets,
        warningBudgets,
        onTrackBudgets
      };
    } catch (error) {
      console.error('Error getting budget stats:', error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallProgress: 0,
        activeBudgets: 0,
        exceededBudgets: 0,
        warningBudgets: 0,
        onTrackBudgets: 0
      };
    }
  }

  // Get budget recommendations based on transaction history
  async getBudgetRecommendations(userId: string) {
    try {
      if (!userId) {
        return [];
      }

      // Get categories that user has transactions for
      const userCategories = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'expense',
          categoryId: { not: null }
        },
        _count: {
          categoryId: true
        }
      });

      const categoryIds = userCategories.map(uc => uc.categoryId).filter(Boolean);
      
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          type: 'expense'
        }
      });

      const recommendations = [];

      for (const category of categories) {
        try {
          // Get transactions for this category in the last 3 months
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

          const transactions = await prisma.transaction.findMany({
            where: {
              userId,
              categoryId: category.id,
              type: 'expense',
              date: {
                gte: threeMonthsAgo
              }
            },
            orderBy: {
              date: 'desc'
            }
          });

          if (transactions.length === 0) continue;

          // Calculate average spending
          const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
          const averageAmount = totalAmount / 3; // 3 months
          
          // Calculate trend
          const recentTransactions = transactions.slice(0, Math.min(10, transactions.length));
          const olderTransactions = transactions.slice(-Math.min(10, transactions.length));
          
          const recentAverage = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
          const olderAverage = olderTransactions.reduce((sum, t) => sum + t.amount, 0) / olderTransactions.length;
          
          let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
          if (recentAverage > olderAverage * 1.1) {
            trend = 'increasing';
          } else if (recentAverage < olderAverage * 0.9) {
            trend = 'decreasing';
          }

          // Calculate confidence based on data consistency
          const variance = transactions.reduce((sum, t) => {
            const diff = t.amount - averageAmount;
            return sum + (diff * diff);
          }, 0) / transactions.length;
          
          const standardDeviation = Math.sqrt(variance);
          const coefficientOfVariation = standardDeviation / averageAmount;
          const confidence = Math.max(50, Math.min(95, 100 - (coefficientOfVariation * 100)));

          // Generate recommendation amount with buffer
          let recommendedAmount = averageAmount;
          if (trend === 'increasing') {
            recommendedAmount *= 1.15; // 15% buffer for increasing trend
          } else if (trend === 'decreasing') {
            recommendedAmount *= 1.05; // 5% buffer for decreasing trend
          } else {
            recommendedAmount *= 1.1; // 10% buffer for stable trend
          }

          // Generate reason
          let reason = '';
          if (transactions.length < 5) {
            reason = `Berdasarkan ${transactions.length} transaksi terbaru`;
          } else {
            reason = `Berdasarkan rata-rata pengeluaran ${transactions.length} transaksi dalam 3 bulan terakhir`;
          }

          if (trend === 'increasing') {
            reason += ' (tren meningkat)';
          } else if (trend === 'decreasing') {
            reason += ' (tren menurun)';
          }

          recommendations.push({
            categoryId: category.id,
            categoryName: category.name,
            recommendedAmount: Math.round(recommendedAmount),
            reason,
            confidence: Math.round(confidence),
            historicalAverage: Math.round(averageAmount),
            trend
          });
        } catch (error) {
          console.error(`Error processing recommendations for category ${category.id}:`, error);
        }
      }

      // Sort by confidence and return top 6
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6);
    } catch (error) {
      console.error('Error getting budget recommendations:', error);
      return [];
    }
  }
}

export default new BudgetService(); 