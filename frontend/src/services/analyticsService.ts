import api from '../api';

export interface AnalyticsOverview {
  summary: {
    totalExpense: number;
    totalIncome: number;
    savings: number;
    savingsRate: number;
    period: string;
  };
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  monthlyData: Array<{
    month: string;
    expense: number;
    income: number;
    savings: number;
  }>;
  aiInsights: Array<{
    type: 'positive' | 'negative' | 'warning' | 'suggestion';
    title: string;
    description: string;
  }>;
}

export interface SpendingTrend {
  date: string;
  amount: number;
}

export interface CategoryAnalysis {
  category: string;
  amount: number;
  count: number;
  trend: number;
  trendType: 'up' | 'down' | 'stable';
}

export interface SavingsAnalysis {
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
    savings: number;
    savingsRate: number;
    targetRate: number;
  }>;
  summary: {
    averageSavingsRate: number;
    totalSavings: number;
    targetRate: number;
  };
}

class AnalyticsService {
  async getOverview(period: string = '6months'): Promise<AnalyticsOverview> {
    const token = localStorage.getItem('token');
    const response = await api.get(`/analytics/overview?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as AnalyticsOverview;
  }

  async getSpendingTrends(days: number = 30): Promise<{ trendData: SpendingTrend[] }> {
    const token = localStorage.getItem('token');
    const response = await api.get(`/analytics/trends?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as { trendData: SpendingTrend[] };
  }

  async getCategoryAnalysis(period: string = '6months'): Promise<{ categories: CategoryAnalysis[] }> {
    const token = localStorage.getItem('token');
    const response = await api.get(`/analytics/categories?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as { categories: CategoryAnalysis[] };
  }

  async getSavingsAnalysis(months: number = 12): Promise<SavingsAnalysis> {
    const token = localStorage.getItem('token');
    const response = await api.get(`/analytics/savings?months=${months}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as SavingsAnalysis;
  }
}

export const analyticsService = new AnalyticsService(); 