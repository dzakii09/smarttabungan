import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import StatsCard from '../components/dashboard/StatsCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import GoalProgress from '../components/dashboard/GoalProgress';
import CategoryStats from '../components/dashboard/CategoryStats';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import AdvancedCharts from '../components/dashboard/AdvancedCharts';
import SpendingInsights from '../components/dashboard/SpendingInsights';
import MonthlyComparison from '../components/dashboard/MonthlyComparison';
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import AIDashboard from '../components/dashboard/AIDashboard';
import api from '../api';

interface UserPreferences {
  dashboardLayout: string;
  defaultCurrency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  favoriteFeatures: string[];
  financialGoals: {
    monthlySavingsTarget: number;
    emergencyFundTarget: number;
    investmentPercentage: number;
  };
}

const Dashboard: React.FC = () => {
  const { dashboardStats, fetchDashboardData, fetchTransactions, fetchGoals, fetchCategories, isAuthenticated, setBudgetStats, token } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchTransactions(),
          fetchGoals(),
          fetchCategories(),
          fetchBudgetStats(),
          fetchUserPreferences()
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchDashboardData, fetchTransactions, fetchGoals, isAuthenticated]);

  const fetchUserPreferences = async () => {
    if (!token) return;
    
    try {
      const response = await api.get('/personalization/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Set default preferences
      setPreferences({
        dashboardLayout: 'default',
        defaultCurrency: 'IDR',
        language: 'id',
        theme: 'light',
        favoriteFeatures: ['dashboard', 'transactions', 'goals', 'budgets'],
        financialGoals: {
          monthlySavingsTarget: 0,
          emergencyFundTarget: 0,
          investmentPercentage: 0
        }
      });
    }
  };

  const fetchBudgetStats = async () => {
    if (!token) return;
    
    try {
      const response = await api.get('/budgets/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setBudgetStats(data);
    } catch (error) {
      console.error('Error fetching budget stats:', error);
      // Set default budget stats on error
      setBudgetStats({
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallProgress: 0,
        activeBudgets: 0,
        exceededBudgets: 0,
        warningBudgets: 0,
        onTrackBudgets: 0
      });
    }
  };

  const updateLayoutPreference = async (layout: string) => {
    if (!token || !preferences) return;
    
    try {
      const response = await api.put('/personalization/preferences', {
        ...preferences,
        dashboardLayout: layout
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setPreferences(data);
      setShowLayoutSettings(false);
    } catch (error) {
      console.error('Error updating layout preference:', error);
    }
  };

  const getLayoutConfig = () => {
    const layout = preferences?.dashboardLayout || 'default';
    
    switch (layout) {
      case 'compact':
        return {
          statsGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          mainGrid: 'grid-cols-1 lg:grid-cols-4 gap-4',
          leftColumn: 'lg:col-span-3',
          rightColumn: 'space-y-4',
          cardPadding: 'p-4',
          showAdvancedCharts: false,
          showMonthlyComparison: false
        };
      case 'detailed':
        return {
          statsGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
          mainGrid: 'grid-cols-1 lg:grid-cols-3 gap-6',
          leftColumn: 'lg:col-span-2',
          rightColumn: 'space-y-6',
          cardPadding: 'p-6',
          showAdvancedCharts: true,
          showMonthlyComparison: true
        };
      default:
        return {
          statsGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
          mainGrid: 'grid-cols-1 lg:grid-cols-3 gap-6',
          leftColumn: 'lg:col-span-2',
          rightColumn: 'space-y-6',
          cardPadding: 'p-6',
          showAdvancedCharts: true,
          showMonthlyComparison: true
        };
    }
  };

  const shouldShowComponent = (componentName: string) => {
    if (!preferences) return true;
    return preferences.favoriteFeatures.includes(componentName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const layoutConfig = getLayoutConfig();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header with Layout Settings */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Selamat Datang di SmartTabungan! 👋
            </h1>
            <p className="text-blue-100">
              Berikut ringkasan keuangan Anda hari ini. Mari capai tujuan keuangan Anda bersama!
            </p>
          </div>
          <button
            onClick={() => setShowLayoutSettings(!showLayoutSettings)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Pengaturan Layout"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Layout Settings Panel */}
        {showLayoutSettings && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold mb-3">Pilih Layout Dashboard</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => updateLayoutPreference('default')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  preferences?.dashboardLayout === 'default'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Default
              </button>
              <button
                onClick={() => updateLayoutPreference('compact')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  preferences?.dashboardLayout === 'compact'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => updateLayoutPreference('detailed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  preferences?.dashboardLayout === 'detailed'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className={`grid ${layoutConfig.statsGrid}`}>
        <StatsCard
          title="Total Saldo"
          value={dashboardStats.totalBalance}
          icon={Wallet}
          color="primary"
        />
        <StatsCard
          title="Pemasukan Bulan Ini"
          value={dashboardStats.monthlyIncome}
          icon={TrendingUp}
          color="secondary"
        />
        <StatsCard
          title="Pengeluaran Bulan Ini"
          value={dashboardStats.monthlyExpenses}
          icon={TrendingDown}
          color="accent"
        />
        <StatsCard
          title="Tingkat Tabungan"
          value={`${dashboardStats.savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          color="neutral"
        />
      </div>

      {/* Main Content Grid */}
      <div className={`grid ${layoutConfig.mainGrid}`}>
        {/* Left Column - Charts */}
        <div className={`${layoutConfig.leftColumn} space-y-6`}>
          <ExpenseChart />
          {shouldShowComponent('transactions') && <RecentTransactions />}
        </div>
        
        {/* Right Column - Goals, Categories & AI */}
        <div className={layoutConfig.rightColumn}>
          {shouldShowComponent('goals') && <GoalProgress />}
          {shouldShowComponent('categories') && <CategoryStats />}
          {shouldShowComponent('budgets') && <BudgetOverview />}
          {shouldShowComponent('analytics') && <AnalyticsSummary />}
          
          {/* Charts Section - Always Show */}
          <div className="space-y-6">
            <AdvancedCharts />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingInsights />
              <MonthlyComparison />
            </div>
          </div>
          
          {shouldShowComponent('ai-recommendations') && <AIDashboard />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;