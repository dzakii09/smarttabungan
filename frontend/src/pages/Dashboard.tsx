import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  Settings
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import StatsCard from '../components/dashboard/StatsCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import SpendingInsights from '../components/dashboard/SpendingInsights';
import AdvancedCharts from '../components/dashboard/AdvancedCharts';
import MonthlyComparison from '../components/dashboard/MonthlyComparison';
import AIDashboard from '../components/dashboard/AIDashboard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import GoalProgress from '../components/dashboard/GoalProgress';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import CategoryStats from '../components/dashboard/CategoryStats';
import api from '../api';

const Dashboard: React.FC = () => {
  const { dashboardStats, fetchDashboardData, fetchTransactions, fetchGoals, fetchCategories, isAuthenticated, setBudgetStats, token } = useApp();
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
          fetchCategories(),
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
      <div className="flex items-center justify-center h-[60vh] bg-gradient-to-br from-primary-50 to-secondary-100 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 border-t-4 border-secondary-400"></div>
          <div className="text-lg text-primary-700 font-semibold animate-pulse">Memuat dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-gradient-to-br from-primary-50 to-secondary-100 animate-fade-in">
        <div className="text-center">
          <p className="text-red-600 mb-2 font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-bold shadow hover:scale-105 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-2 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-800 font-inter mb-1">Dashboard</h1>
          <p className="text-neutral-500">Ringkasan keuangan dan insight terbaru Anda</p>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <ExpenseChart />
          <AnalyticsSummary />
          <SpendingInsights />
          <AdvancedCharts />
          <MonthlyComparison />
          <AIDashboard />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <RecentTransactions />
          <GoalProgress />
          <BudgetOverview />
          <CategoryStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;