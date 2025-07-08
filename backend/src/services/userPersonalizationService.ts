import prisma from '../utils/database';

interface UserPreferences {
  userId: string;
  dashboardLayout: string;
  defaultCurrency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notificationSettings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    unusualSpending: boolean;
  };
  financialGoals: {
    monthlySavingsTarget: number;
    emergencyFundTarget: number;
    investmentPercentage: number;
  };
  spendingCategories: string[];
  favoriteFeatures: string[];
}

interface UserInsights {
  userId: string;
  spendingPatterns: {
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    averageDailySpending: number;
    averageMonthlySpending: number;
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
  };
  savingHabits: {
    monthlySavingsRate: number;
    savingsTrend: 'improving' | 'declining' | 'stable';
    emergencyFundProgress: number;
  };
  financialHealth: {
    score: number; // 0-100
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

class UserPersonalizationService {
  // Get or create user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      if (!preferences) {
        // Create default preferences
        preferences = await prisma.userPreferences.create({
          data: {
            userId,
            dashboardLayout: 'default',
            defaultCurrency: 'IDR',
            language: 'id',
            theme: 'light',
            notificationSettings: {
              email: true,
              push: false,
              inApp: true,
              daily: true,
              weekly: true,
              monthly: true,
              budgetAlerts: true,
              goalReminders: true,
              unusualSpending: true
            },
            financialGoals: {
              monthlySavingsTarget: 0,
              emergencyFundTarget: 0,
              investmentPercentage: 0
            },
            spendingCategories: [],
            favoriteFeatures: ['dashboard', 'transactions']
          }
        });
      }

      return preferences as UserPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: updates,
        create: {
          userId,
          ...updates,
          dashboardLayout: updates.dashboardLayout || 'default',
          defaultCurrency: updates.defaultCurrency || 'IDR',
          language: updates.language || 'id',
          theme: updates.theme || 'light',
          notificationSettings: updates.notificationSettings || {
            email: true,
            push: false,
            inApp: true,
            daily: true,
            weekly: true,
            monthly: true,
            budgetAlerts: true,
            goalReminders: true,
            unusualSpending: true
          },
          financialGoals: updates.financialGoals || {
            monthlySavingsTarget: 0,
            emergencyFundTarget: 0,
            investmentPercentage: 0
          },
          spendingCategories: updates.spendingCategories || [],
          favoriteFeatures: updates.favoriteFeatures || ['dashboard', 'transactions']
        }
      });

      return preferences as UserPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Get personalized dashboard data
  async getPersonalizedDashboard(userId: string): Promise<any> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const insights = await this.getUserInsights(userId);

      // Get recent transactions based on user preferences
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: preferences.favoriteFeatures.includes('transactions') ? 10 : 5
      });

      // Get goals based on user preferences
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: preferences.favoriteFeatures.includes('goals') ? 5 : 3
      });

      // Get budgets based on user preferences
      const budgets = await prisma.budget.findMany({
        where: { userId, isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: preferences.favoriteFeatures.includes('budgets') ? 5 : 3
      });

      // Calculate financial summary
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const [monthlyIncome, monthlyExpense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            type: 'income',
            date: { gte: currentMonth }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            type: 'expense',
            date: { gte: currentMonth }
          },
          _sum: { amount: true }
        })
      ]);

      const totalIncome = monthlyIncome._sum.amount || 0;
      const totalExpense = monthlyExpense._sum.amount || 0;
      const savings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

      return {
        preferences,
        insights,
        recentTransactions,
        goals,
        budgets,
        financialSummary: {
          totalIncome,
          totalExpense,
          savings,
          savingsRate,
          currency: preferences.defaultCurrency
        },
        layout: preferences.dashboardLayout
      };
    } catch (error) {
      console.error('Error getting personalized dashboard:', error);
      throw error;
    }
  }

  // Get user insights and patterns
  async getUserInsights(userId: string): Promise<UserInsights> {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Get spending patterns
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense',
          date: { gte: threeMonthsAgo }
        },
        include: { category: true }
      });

      // Calculate top spending categories
      const categorySpending = new Map<string, number>();
      transactions.forEach(transaction => {
        const categoryName = transaction.category?.name || 'Lainnya';
        const current = categorySpending.get(categoryName) || 0;
        categorySpending.set(categoryName, current + transaction.amount);
      });

      const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
      const topCategories = Array.from(categorySpending.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate spending trends
      const monthlySpending = await this.calculateMonthlySpending(userId);
      const spendingTrend = this.calculateTrend(monthlySpending);

      // Calculate saving habits
      const incomeTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'income',
          date: { gte: threeMonthsAgo }
        }
      });

      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlySavingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

      // Calculate financial health score
      const financialHealth = await this.calculateFinancialHealth(userId, monthlySavingsRate, spendingTrend);

      return {
        userId,
        spendingPatterns: {
          topCategories,
          averageDailySpending: totalSpending / 90, // 3 months
          averageMonthlySpending: totalSpending / 3,
          spendingTrend
        },
        savingHabits: {
          monthlySavingsRate,
          savingsTrend: spendingTrend === 'decreasing' ? 'improving' : 'declining',
          emergencyFundProgress: 0 // TODO: Calculate based on emergency fund goal
        },
        financialHealth
      };
    } catch (error) {
      console.error('Error getting user insights:', error);
      throw error;
    }
  }

  // Calculate monthly spending for trend analysis
  private async calculateMonthlySpending(userId: string): Promise<number[]> {
    const months = [];
    for (let i = 0; i < 3; i++) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      
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

      months.unshift(result._sum.amount || 0);
    }

    return months;
  }

  // Calculate trend based on monthly data
  private calculateTrend(monthlyData: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (monthlyData.length < 2) return 'stable';
    
    const recent = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];
    const change = ((recent - previous) / previous) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  // Calculate financial health score
  private async calculateFinancialHealth(
    userId: string, 
    savingsRate: number, 
    spendingTrend: string
  ): Promise<{ score: number; recommendations: string[]; riskLevel: 'low' | 'medium' | 'high' }> {
    let score = 50; // Base score
    const recommendations: string[] = [];

    // Savings rate scoring (0-40 points)
    if (savingsRate >= 20) {
      score += 40;
    } else if (savingsRate >= 10) {
      score += 30;
      recommendations.push('Coba tingkatkan tabungan bulanan Anda');
    } else if (savingsRate >= 5) {
      score += 20;
      recommendations.push('Pertimbangkan untuk menabung lebih banyak setiap bulan');
    } else {
      score += 10;
      recommendations.push('Mulai menabung untuk masa depan yang lebih baik');
    }

    // Spending trend scoring (0-30 points)
    if (spendingTrend === 'decreasing') {
      score += 30;
    } else if (spendingTrend === 'stable') {
      score += 20;
    } else {
      score += 10;
      recommendations.push('Coba kurangi pengeluaran bulanan Anda');
    }

    // Emergency fund scoring (0-20 points)
    const emergencyFundGoal = await prisma.goal.findFirst({
      where: {
        userId,
        title: { contains: 'emergency' }
      }
    });

    if (emergencyFundGoal) {
      const emergencyProgress = (emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100;
      if (emergencyProgress >= 100) {
        score += 20;
      } else if (emergencyProgress >= 50) {
        score += 15;
        recommendations.push('Lanjutkan menabung untuk dana darurat');
      } else {
        score += 5;
        recommendations.push('Pertimbangkan untuk membuat dana darurat');
      }
    } else {
      recommendations.push('Buat tujuan dana darurat untuk keamanan finansial');
    }

    // Debt analysis (0-10 points)
    const debtTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        description: { contains: 'kartu kredit' }
      }
    });

    if (debtTransactions.length === 0) {
      score += 10;
    } else {
      score += 5;
      recommendations.push('Pertimbangkan untuk mengurangi penggunaan kartu kredit');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (score >= 80) {
      riskLevel = 'low';
    } else if (score >= 60) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    return { score, recommendations, riskLevel };
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId: string): Promise<string[]> {
    try {
      const insights = await this.getUserInsights(userId);
      const preferences = await this.getUserPreferences(userId);
      const recommendations: string[] = [];

      // Add financial health recommendations
      recommendations.push(...insights.financialHealth.recommendations);

      // Spending pattern recommendations
      if (insights.spendingPatterns.topCategories.length > 0) {
        const topCategory = insights.spendingPatterns.topCategories[0];
        if (topCategory.percentage > 40) {
          recommendations.push(`Kategori "${topCategory.category}" adalah ${topCategory.percentage.toFixed(1)}% dari pengeluaran Anda. Pertimbangkan untuk menguranginya.`);
        }
      }

      // Savings recommendations
      if (insights.savingHabits.monthlySavingsRate < 10) {
        recommendations.push('Coba sisihkan minimal 10% dari penghasilan untuk tabungan.');
      }

      // Goal recommendations
      if (preferences.financialGoals.monthlySavingsTarget === 0) {
        recommendations.push('Set target tabungan bulanan untuk mencapai tujuan keuangan Anda.');
      }

      // Investment recommendations
      if (preferences.financialGoals.investmentPercentage === 0 && insights.savingHabits.monthlySavingsRate > 20) {
        recommendations.push('Pertimbangkan untuk berinvestasi sebagian dari tabungan Anda.');
      }

      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
}

export default new UserPersonalizationService(); 