import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import StatsCard from '../components/dashboard/StatsCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';

import SpendingInsights from '../components/dashboard/SpendingInsights';
import AdvancedCharts from '../components/dashboard/AdvancedCharts';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import GoalProgress from '../components/dashboard/GoalProgress';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import QuickActions from '../components/dashboard/QuickActions';
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

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getSavingsStatus = () => {
    const rate = dashboardStats.savingsRate;
    if (rate >= 20) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (rate >= 10) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (rate >= 5) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // Check if user has any data
  const hasData = dashboardStats.totalBalance > 0 || dashboardStats.monthlyIncome > 0 || dashboardStats.monthlyExpenses > 0;

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

  // Empty state when no data
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-2 md:px-8 animate-fade-in-up">
        {/* Header dengan greeting */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{getCurrentGreeting()}! 👋</h1>
              <p className="text-gray-600">Selamat datang di SmartTabungan</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Update terakhir</p>
                <p className="text-sm font-medium text-gray-700">{new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Selamat Datang di SmartTabungan!</h3>
            <p className="text-gray-600 mb-6">
              Mulai dengan menambahkan transaksi pertama Anda untuk melihat dashboard yang lengkap.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/transactions'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tambah Transaksi Pertama
              </button>
              <button
                onClick={() => window.location.href = '/budgets'}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Buat Budget
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions for new users */}
        <div className="mt-8">
          <QuickActions />
        </div>
      </div>
    );
  }

  const savingsStatus = getSavingsStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-2 md:px-8 animate-fade-in-up">
      {/* Header dengan greeting */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{getCurrentGreeting()}! 👋</h1>
            <p className="text-gray-600">Selamat datang kembali di SmartTabungan</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Update terakhir</p>
              <p className="text-sm font-medium text-gray-700">{new Date().toLocaleString('id-ID')}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Total Saldo</span>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(dashboardStats.totalBalance)}
            </p>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500">Saldo saat ini</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Pemasukan</span>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(dashboardStats.monthlyIncome)}
            </p>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500">Bulan ini</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Pengeluaran</span>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(dashboardStats.monthlyExpenses)}
            </p>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500">Bulan ini</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <PiggyBank className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Tingkat Tabungan</span>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">
              {dashboardStats.savingsRate.toFixed(1)}%
            </p>
          </div>
          <div className={`flex items-center text-sm ${savingsStatus.color}`}>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${savingsStatus.bg}`}>
              {savingsStatus.status}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Component */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <ExpenseChart />
          <SpendingInsights />
          <AdvancedCharts />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <RecentTransactions />
          <GoalProgress />
          <BudgetOverview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;