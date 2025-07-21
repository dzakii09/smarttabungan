import { PrismaClient } from '@prisma/client';
import groqService from './groqService';

const prisma = new PrismaClient();

class AIService {
  // Get spending insights
  async getSpendingInsights(userId: string): Promise<string[]> {
    const insights: string[] = [];

    // Get last month's transactions
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: lastMonth
        }
      },
      include: {
        category: true
      }
    });

    if (transactions.length === 0) {
      insights.push('Belum ada data pengeluaran yang cukup untuk analisis');
      return insights;
    }

    // Calculate total spending
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Find top spending category
    const categorySpending = new Map<string, number>();
    transactions.forEach(t => {
      if (t.category) {
        const current = categorySpending.get(t.category.name) || 0;
        categorySpending.set(t.category.name, current + t.amount);
      }
    });

    const topCategory = Array.from(categorySpending.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topCategory) {
      const percentage = Math.round((topCategory[1] / totalSpending) * 100);
      insights.push(`Pengeluaran terbesar Anda adalah ${topCategory[0]} (${percentage}% dari total)`);
    }

    // Check for unusual spending patterns
    const averageAmount = totalSpending / transactions.length;
    const highAmountTransactions = transactions.filter(t => t.amount > averageAmount * 2);

    if (highAmountTransactions.length > 0) {
      insights.push(`Anda memiliki ${highAmountTransactions.length} transaksi dengan nilai tinggi`);
    }

    // Spending frequency insight
    const dailySpending = new Map<string, number>();
    transactions.forEach(t => {
      const date = t.date.toISOString().split('T')[0];
      dailySpending.set(date, (dailySpending.get(date) || 0) + 1);
    });

    const mostSpendingDay = Array.from(dailySpending.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostSpendingDay) {
      insights.push(`Hari dengan pengeluaran terbanyak adalah ${mostSpendingDay[0]} (${mostSpendingDay[1]} transaksi)`);
    }

    return insights;
  }

  // Get savings tips
  async getSavingsTips(userId: string): Promise<string[]> {
    const tips: string[] = [];

    // Get user's financial data
    const [transactions, goals] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true }
      }),
      prisma.goal.findMany({
        where: { userId }
      })
    ]);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Generate tips based on savings rate
    if (savingsRate < 10) {
      tips.push('Coba sisihkan minimal 10% dari penghasilan untuk tabungan');
      tips.push('Buat budget bulanan untuk mengontrol pengeluaran');
    } else if (savingsRate < 20) {
      tips.push('Bagus! Tingkatkan tabungan ke 20% untuk keamanan finansial');
      tips.push('Pertimbangkan investasi untuk pertumbuhan kekayaan');
    } else {
      tips.push('Excellent! Anda menabung dengan sangat baik');
      tips.push('Pertimbangkan diversifikasi investasi');
    }

    // Tips based on goals
    if (goals.length === 0) {
      tips.push('Buat tujuan keuangan yang spesifik untuk motivasi menabung');
    } else {
      const urgentGoals = goals.filter(g => {
        const daysLeft = Math.ceil((new Date(g.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft < 90;
      });

      if (urgentGoals.length > 0) {
        tips.push(`Fokus pada ${urgentGoals.length} tujuan yang mendekati deadline`);
      }
    }

    return tips;
  }

  // Get financial advice
  async getFinancialAdvice(userId: string): Promise<string[]> {
    const advice: string[] = [];

    // Get user's financial data
    const [transactions, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true }
      }),
      prisma.budget.findMany({
        where: { userId }
      })
    ]);

    const expenses = transactions.filter(t => t.type === 'expense');
    const categorySpending = new Map<string, number>();

    expenses.forEach(t => {
      if (t.category) {
        const current = categorySpending.get(t.category.name) || 0;
        categorySpending.set(t.category.name, current + t.amount);
      }
    });

    // Find top spending categories
    const topCategories = Array.from(categorySpending.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topCategories.length > 0) {
      advice.push(`Fokus pada pengurangan pengeluaran di kategori: ${topCategories.map(c => c[0]).join(', ')}`);
    }

    // Budget advice
    if (budgets.length === 0) {
      advice.push('Buat budget untuk kategori pengeluaran terbesar Anda');
    } else {
      const exceededBudgets = budgets.filter(b => b.spent > b.amount);
      if (exceededBudgets.length > 0) {
        advice.push(`Tinjau ${exceededBudgets.length} budget yang terlampaui`);
      }
    }

    return advice;
  }

  // Get budget insights
  async getBudgetInsights(userId: string): Promise<any[]> {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: {
          category: true
        }
      });

      if (budgets.length === 0) {
        return [{
          type: 'info',
          title: 'Belum Ada Budget',
          description: 'Buat budget pertama Anda untuk mulai mengontrol pengeluaran'
        }];
      }

      const insights: any[] = [];

      // Check for exceeded budgets
      const exceededBudgets = budgets.filter(b => b.spent > b.amount);
      if (exceededBudgets.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Budget Terlampaui',
          description: `${exceededBudgets.length} budget telah melebihi batas yang ditentukan`
        });
      }

      // Check for near-limit budgets
      const nearLimitBudgets = budgets.filter(b => {
        const usagePercentage = (b.spent / b.amount) * 100;
        return usagePercentage >= 80 && usagePercentage < 100;
      });

      if (nearLimitBudgets.length > 0) {
        insights.push({
          type: 'info',
          title: 'Budget Mendekati Batas',
          description: `${nearLimitBudgets.length} budget mendekati batas maksimal`
        });
      }

      // Check for well-managed budgets
      const wellManagedBudgets = budgets.filter(b => {
        const usagePercentage = (b.spent / b.amount) * 100;
        return usagePercentage <= 70;
      });

      if (wellManagedBudgets.length > 0) {
        insights.push({
          type: 'positive',
          title: 'Budget Terkelola Baik',
          description: `${wellManagedBudgets.length} budget masih dalam batas yang sehat`
        });
      }

      // Overall budget health
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
      const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      if (overallUsage > 100) {
        insights.push({
          type: 'negative',
          title: 'Pengeluaran Melebihi Budget',
          description: `Total pengeluaran melebihi ${(overallUsage - 100).toFixed(1)}% dari budget yang direncanakan`
        });
      } else if (overallUsage <= 80) {
        insights.push({
          type: 'positive',
          title: 'Pengelolaan Budget Baik',
          description: `Anda masih memiliki ${(100 - overallUsage).toFixed(1)}% dari budget yang tersisa`
        });
      }

      return insights;

    } catch (error) {
      console.error('Error getting budget insights:', error);
      return [{
        type: 'error',
        title: 'Error',
        description: 'Gagal mengambil insight budget'
      }];
    }
  }

  // Chat with AI
  async chatWithAI(userId: string, message: string): Promise<string> {
    try {
      // Get user context
      const [transactions, goals, budgets] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          include: { category: true }
        }),
        prisma.goal.findMany({
          where: { userId }
        }),
        prisma.budget.findMany({
          where: { userId }
        })
      ]);

      // Calculate financial metrics
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // Create context for AI
      const context = {
        userId,
        totalTransactions: transactions.length,
        income,
        expenses,
        savingsRate,
        goalsCount: goals.length,
        budgetsCount: budgets.length,
        recentTransactions: transactions.slice(-5)
      };

      // Generate AI response using Groq
      const response = await groqService.generateChatResponse(message, context);
      return response;

    } catch (error) {
      console.error('Error in chatWithAI:', error);
      return 'Maaf, terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi.';
    }
  }

  // Get dashboard insights
  async getDashboardInsights(userId: string, monthsData: any[]): Promise<any> {
    try {
      const context = {
        userId,
        monthsData,
        analysis: this.analyzeMonthsData(monthsData)
      };

      const prompt = `Berdasarkan data keuangan berikut, berikan insight yang berguna dalam bahasa Indonesia:

Data Bulanan:
${monthsData.map(m => `- ${m.month}: Pemasukan Rp${m.income.toLocaleString()}, Pengeluaran Rp${m.expense.toLocaleString()}, Tabungan Rp${m.savings.toLocaleString()}`).join('\n')}

Analisis:
- Total Pemasukan: Rp${context.analysis.totalIncome.toLocaleString()}
- Total Pengeluaran: Rp${context.analysis.totalExpense.toLocaleString()}
- Total Tabungan: Rp${context.analysis.totalSavings.toLocaleString()}
- Rata-rata Tabungan: ${context.analysis.avgSavingsRate.toFixed(1)}%

Berikan insight yang mencakup:
1. Trend keuangan (meningkat/menurun/stabil)
2. Kesehatan keuangan berdasarkan tingkat tabungan
3. Rekomendasi untuk perbaikan (jika diperlukan)
4. Pujian untuk pencapaian positif (jika ada)

Format response dalam JSON:
{
  "message": "Pesan utama insight",
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": [
    {"title": "Judul", "description": "Deskripsi"}
  ]
}`;

      const response = await groqService.generateChatResponse(prompt, context);
      
      try {
        // Try to parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
      }

      // Fallback to simple response
      return {
        message: response,
        insights: [],
        recommendations: []
      };

    } catch (error) {
      console.error('Error getting dashboard insights:', error);
      return {
        message: 'Gagal mengambil insight AI',
        insights: [],
        recommendations: []
      };
    }
  }

  private analyzeMonthsData(monthsData: any[]) {
    const totalIncome = monthsData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = monthsData.reduce((sum, m) => sum + m.expense, 0);
    const totalSavings = monthsData.reduce((sum, m) => sum + m.savings, 0);
    const avgSavingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      totalSavings,
      avgSavingsRate
    };
  }
}

export default new AIService(); 