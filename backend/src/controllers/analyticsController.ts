import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Groq } from 'groq-sdk';

const prisma = new PrismaClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { period = '6months' } = req.query;
    
    // Hitung periode berdasarkan parameter
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '12months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    // Ambil data transaksi
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        category: true,
      },
    });

    // Hitung total pengeluaran
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Hitung total pemasukan
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Hitung tabungan
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Analisis kategori
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        type: 'expense',
        date: {
          gte: startDate,
          lte: now,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const categoriesWithData = await Promise.all(
      categoryBreakdown.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          name: category?.name || 'Unknown',
          value: Number(item._sum.amount),
          percentage: totalExpense > 0 ? (Number(item._sum.amount) / totalExpense) * 100 : 0,
        };
      })
    );

    // Data bulanan untuk chart
    const monthlyData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyData.push({
        month: currentDate.toLocaleDateString('id-ID', { month: 'short' }),
        expense: monthExpense,
        income: monthIncome,
        savings: monthIncome - monthExpense,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Generate AI insights
    let aiInsights = [];
    try {
      const prompt = `
        Analisis data keuangan berikut dan berikan 3-5 insight yang berguna:
        - Total pengeluaran: Rp ${totalExpense.toLocaleString()}
        - Total pemasukan: Rp ${totalIncome.toLocaleString()}
        - Tabungan: Rp ${savings.toLocaleString()}
        - Rasio tabungan: ${savingsRate.toFixed(1)}%
        - Top kategori: ${categoriesWithData.slice(0, 3).map(c => `${c.name} (${c.percentage.toFixed(1)}%)`).join(', ')}
        
        Berikan insight dalam format JSON array dengan properti: type (positive/negative/warning/suggestion), title, description
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          aiInsights = JSON.parse(response);
        } catch (e) {
          // Fallback insights jika parsing gagal
          aiInsights = [
            {
              type: 'positive',
              title: 'Tabungan Stabil',
              description: `Rasio tabungan Anda ${savingsRate.toFixed(1)}% menunjukkan pola keuangan yang baik.`,
            },
            {
              type: 'suggestion',
              title: 'Optimasi Kategori',
              description: `Fokus pada pengurangan pengeluaran di kategori ${categoriesWithData[0]?.name || 'terbesar'}.`,
            },
          ];
        }
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback insights
      aiInsights = [
        {
          type: 'positive',
          title: 'Analisis Keuangan',
          description: 'Data keuangan Anda telah dianalisis dengan baik.',
        },
      ];
    }

    res.json({
      summary: {
        totalExpense,
        totalIncome,
        savings,
        savingsRate,
        period: period,
      },
      categoryBreakdown: categoriesWithData,
      monthlyData,
      aiInsights,
    });
  } catch (error) {
    console.error('Error in getAnalyticsOverview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSpendingTrends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { days = '30' } = req.query;
    const daysCount = parseInt(days as string);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        type: 'expense',
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by date
    const dailySpending = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    const trendData = Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount,
    }));

    res.json({ trendData });
  } catch (error) {
    console.error('Error in getSpendingTrends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { period = '6months' } = req.query;
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '12months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    const categoryAnalysis = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        type: 'expense',
        date: {
          gte: startDate,
          lte: now,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const categoriesWithDetails = await Promise.all(
      categoryAnalysis.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });

        // Hitung trend (bandingkan dengan periode sebelumnya)
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 6);
        
        const previousTransactions = await prisma.transaction.findMany({
          where: {
            userId: userId,
            categoryId: item.categoryId,
            type: 'expense',
            date: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
        });

        const previousAmount = previousTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const currentAmount = Number(item._sum.amount);
        const trend = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;

        return {
          category: category?.name || 'Unknown',
          amount: currentAmount,
          count: item._count.id,
          trend,
          trendType: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        };
      })
    );

    // Sort by amount descending
    categoriesWithDetails.sort((a, b) => b.amount - a.amount);

    res.json({ categories: categoriesWithDetails });
  } catch (error) {
    console.error('Error in getCategoryAnalysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSavingsAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { months = '12' } = req.query;
    const monthsCount = parseInt(months as string);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by month
    const monthlyData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= new Date()) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthSavings = monthIncome - monthExpense;
      const savingsRate = monthIncome > 0 ? (monthSavings / monthIncome) * 100 : 0;

      monthlyData.push({
        month: currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expense: monthExpense,
        savings: monthSavings,
        savingsRate,
        targetRate: 30, // Target 30% tabungan
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Hitung rata-rata tabungan
    const avgSavingsRate = monthlyData.reduce((sum, month) => sum + month.savingsRate, 0) / monthlyData.length;
    const totalSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0);

    res.json({
      monthlyData,
      summary: {
        averageSavingsRate: avgSavingsRate,
        totalSavings,
        targetRate: 30,
      },
    });
  } catch (error) {
    console.error('Error in getSavingsAnalysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 