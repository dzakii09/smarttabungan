import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import api from '../api';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface FinancialInsights {
  spendingPatterns: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    averagePerTransaction: number;
  }>;
  incomeAnalysis: {
    totalIncome: number;
    averageIncome: number;
    incomeSources: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    incomeTrend: 'increasing' | 'decreasing' | 'stable';
  };
  expenseAnalysis: {
    totalExpense: number;
    averageExpense: number;
    topCategories: any[];
    expenseTrend: 'increasing' | 'decreasing' | 'stable';
    monthlyBreakdown: Array<{
      month: string;
      amount: number;
      count: number;
    }>;
  };
  savingsAnalysis: {
    savingsRate: number;
    savingsAmount: number;
    savingsGoal: number;
    savingsTrend: 'on_track' | 'behind' | 'ahead';
    monthlySavings: Array<{
      month: string;
      amount: number;
      rate: number;
    }>;
  };
  budgetAnalysis: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    budgetUtilization: number;
    overBudgetCategories: Array<{
      category: string;
      budget: number;
      spent: number;
      overAmount: number;
    }>;
    underBudgetCategories: Array<{
      category: string;
      budget: number;
      spent: number;
      remaining: number;
    }>;
  };
  goalAnalysis: {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    overallProgress: number;
    goalsByStatus: Array<{
      status: string;
      count: number;
      totalAmount: number;
    }>;
  };
  recommendations: string[];
  alerts: string[];
}

const Analytics: React.FC = () => {
  const { token } = useApp();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<FinancialInsights | null>(null);
  const [dateRange, setDateRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch financial insights
  const fetchInsights = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      let startDate, endDate;
      
      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Pilih rentang tanggal kustom');
          setLoading(false);
          return;
        }
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        const now = new Date();
        const start = new Date();
        
        switch (dateRange) {
          case 'this_month':
            start.setDate(1);
            break;
          case 'last_month':
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            break;
          case 'this_year':
            start.setMonth(0, 1);
            break;
          case 'last_3_months':
            start.setMonth(start.getMonth() - 3);
            break;
          case 'last_6_months':
            start.setMonth(start.getMonth() - 6);
            break;
        }
        
        startDate = start.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      }

      const response = await api.get('/analytics/financial-insights', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
      });

      setInsights(response.data.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Gagal memuat analisis keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [token, dateRange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'increasing':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'down':
      case 'decreasing':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  // Get trend text
  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'increasing':
        return 'Meningkat';
      case 'down':
      case 'decreasing':
        return 'Menurun';
      default:
        return 'Stabil';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisis Keuangan</h1>
          <p className="text-gray-600 mt-2">Insight mendalam tentang keuangan Anda</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="this_year">Tahun Ini</option>
              <option value="last_3_months">3 Bulan Terakhir</option>
              <option value="last_6_months">6 Bulan Terakhir</option>
              <option value="custom">Kustom</option>
            </select>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">sampai</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {insights.alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="text-orange-500 mr-2" size={20} />
            Peringatan
          </h2>
          <div className="grid gap-3">
            {insights.alerts.map((alert, index) => (
              <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800">{alert}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.incomeAnalysis.totalIncome)}</p>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(insights.incomeAnalysis.incomeTrend)}
              <span className="text-sm text-gray-500">{getTrendText(insights.incomeAnalysis.incomeTrend)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.expenseAnalysis.totalExpense)}</p>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(insights.expenseAnalysis.expenseTrend)}
              <span className="text-sm text-gray-500">{getTrendText(insights.expenseAnalysis.expenseTrend)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tabungan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.savingsAnalysis.savingsAmount)}</p>
              <p className="text-sm text-gray-500">{insights.savingsAnalysis.savingsRate.toFixed(1)}% dari pemasukan</p>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(insights.savingsAnalysis.savingsTrend)}
              <span className="text-sm text-gray-500">
                {insights.savingsAnalysis.savingsTrend === 'on_track' ? 'On Track' : 
                 insights.savingsAnalysis.savingsTrend === 'behind' ? 'Tertinggal' : 'Maju'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisasi Anggaran</p>
              <p className="text-2xl font-bold text-gray-900">{insights.budgetAnalysis.budgetUtilization.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(insights.budgetAnalysis.totalSpent)} / {formatCurrency(insights.budgetAnalysis.totalBudget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="mr-2" size={20} />
            Pola Pengeluaran
          </h3>
          <div className="space-y-4">
            {insights.spendingPatterns.slice(0, 5).map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">{pattern.category}</p>
                    <p className="text-sm text-gray-500">{pattern.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(pattern.amount)}</p>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(pattern.trend)}
                    <span className="text-sm text-gray-500">{getTrendText(pattern.trend)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Sumber Pendapatan
          </h3>
          <div className="space-y-4">
            {insights.incomeAnalysis.incomeSources.slice(0, 5).map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">{source.category}</p>
                    <p className="text-sm text-gray-500">{source.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">{formatCurrency(source.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            Melebihi Anggaran
          </h3>
          {insights.budgetAnalysis.overBudgetCategories.length > 0 ? (
            <div className="space-y-4">
              {insights.budgetAnalysis.overBudgetCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">{category.category}</p>
                    <p className="text-sm text-red-600">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-900">+{formatCurrency(category.overAmount)}</p>
                    <p className="text-sm text-red-600">Melebihi</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Tidak ada kategori yang melebihi anggaran</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="mr-2" size={20} />
            Sisa Anggaran
          </h3>
          {insights.budgetAnalysis.underBudgetCategories.length > 0 ? (
            <div className="space-y-4">
              {insights.budgetAnalysis.underBudgetCategories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">{category.category}</p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-900">{formatCurrency(category.remaining)}</p>
                    <p className="text-sm text-green-600">Tersisa</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Tidak ada sisa anggaran</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="text-yellow-500 mr-2" size={20} />
            Rekomendasi
          </h3>
          <div className="grid gap-3">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-blue-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="mr-2" size={20} />
          Progress Tujuan Keuangan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{insights.goalAnalysis.overallProgress.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Progress Keseluruhan</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{insights.goalAnalysis.activeGoals}</p>
            <p className="text-sm text-gray-600">Tujuan Aktif</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{insights.goalAnalysis.completedGoals}</p>
            <p className="text-sm text-gray-600">Tujuan Selesai</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${insights.goalAnalysis.overallProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{formatCurrency(insights.goalAnalysis.totalCurrentAmount)}</span>
            <span>{formatCurrency(insights.goalAnalysis.totalTargetAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 