import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
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

const Dashboard: React.FC = () => {
  const { dashboardStats, fetchDashboardData, fetchTransactions, fetchGoals, isAuthenticated, setBudgetStats, token } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          fetchBudgetStats()
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

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Selamat Datang di SmartTabungan! 👋
        </h1>
        <p className="text-blue-100">
          Berikut ringkasan keuangan Anda hari ini. Mari capai tujuan keuangan Anda bersama!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <ExpenseChart />
          <RecentTransactions />
        </div>
        
        {/* Right Column - Goals, Categories & AI */}
        <div className="space-y-6">
          <GoalProgress />
          <CategoryStats />
          <BudgetOverview />
          <AnalyticsSummary />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingInsights />
            <MonthlyComparison />
          </div>
          <AdvancedCharts />
          <AIDashboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;