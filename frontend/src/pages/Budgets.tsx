import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, TrendingUp, AlertTriangle, CheckCircle, Target, Calendar, DollarSign, PieChart } from 'lucide-react';
import api from '../api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface Budget {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  status: 'on-track' | 'warning' | 'exceeded';
  name?: string;
  description?: string;
  alertThreshold?: number;
}

interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  activeBudgets: number;
  exceededBudgets: number;
  warningBudgets: number;
  onTrackBudgets: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    progress: number;
  }[];
}

const Budgets: React.FC = () => {
  const token = localStorage.getItem('token');
  const { categories, transactions } = useApp();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    startDate: '',
    categoryId: '',
    description: '',
    alertThreshold: '80'
  });

  useEffect(() => {
    if (token) {
      fetchBudgets();
      fetchStats();
    }
  }, [token]);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Gagal memuat data budget');
      setBudgets([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/budgets/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat statistik budget');
      setStats({
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallProgress: 0,
        activeBudgets: 0,
        exceededBudgets: 0,
        warningBudgets: 0,
        onTrackBudgets: 0,
        categoryBreakdown: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/budgets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if ((response.data as any).success) {
        toast.success('Budget berhasil dibuat');
        setShowCreateModal(false);
        setFormData({ 
          name: '', 
          amount: '', 
          period: 'monthly', 
          startDate: '', 
          categoryId: '', 
          description: '', 
          alertThreshold: '80' 
        });
        await fetchBudgets();
        await fetchStats();
      } else {
        toast.error((response.data as any).message || 'Gagal membuat budget');
      }
    } catch (error: any) {
      console.error('Error creating budget:', error);
      const errorMessage = error.response?.data?.message || 'Gagal membuat budget';
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (budgetId: string) => {
    try {
      const response = await api.patch(`/budgets/${budgetId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if ((response.data as any).success) {
        toast.success('Status budget berhasil diubah');
        await fetchBudgets();
        await fetchStats();
      } else {
        toast.error((response.data as any).message || 'Gagal mengubah status budget');
      }
    } catch (error: any) {
      console.error('Error toggling budget status:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengubah status budget';
      toast.error(errorMessage);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus budget ini?')) {
      try {
        const response = await api.delete(`/budgets/${budgetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if ((response.data as any).success) {
          toast.success('Budget berhasil dihapus');
          await fetchBudgets();
          await fetchStats();
        } else {
          toast.error((response.data as any).message || 'Gagal menghapus budget');
        }
      } catch (error: any) {
        console.error('Error deleting budget:', error);
        const errorMessage = error.response?.data?.message || 'Gagal menghapus budget';
        toast.error(errorMessage);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'on-track':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Kategori Tidak Diketahui';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Budget</h1>
          <p className="text-gray-600 mt-1">Kelola anggaran pengeluaran Anda dengan bijak</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Budget
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRemaining)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className={`w-5 h-5 ${
                stats.overallProgress >= 100 ? 'text-red-600' :
                stats.overallProgress >= 80 ? 'text-yellow-600' : 'text-purple-600'
              }`} />
              <h3 className="text-sm font-medium text-gray-500">Progress</h3>
            </div>
            <p className={`text-2xl font-bold ${
              stats.overallProgress >= 100 ? 'text-red-600' :
              stats.overallProgress >= 80 ? 'text-yellow-600' : 'text-purple-600'
            }`}>
              {stats.overallProgress.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Budget</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {budgets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Belum ada budget yang dibuat</p>
              <p className="text-sm mb-4">Mulai dengan membuat budget untuk kategori pengeluaran utama Anda</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Buat Budget Pertama
              </button>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(budget.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {budget.name || budget.category?.name || 'Total Budget'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {budget.category?.name && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2" 
                                style={{ backgroundColor: `${budget.category.color}20`, color: budget.category.color }}>
                            {budget.category.name}
                          </span>
                        )}
                        {budget.period} • {new Date(budget.startDate).toLocaleDateString('id-ID')} - {new Date(budget.endDate).toLocaleDateString('id-ID')}
                      </p>
                      {budget.description && (
                        <p className="text-sm text-gray-600 mt-1">{budget.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                      {budget.status === 'exceeded' ? 'Terlampaui' : 
                       budget.status === 'warning' ? 'Peringatan' : 'On Track'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(budget.id)}
                      className={`px-3 py-1 rounded text-sm ${budget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {budget.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: <span className={`font-medium ${
                      budget.progress >= 100 ? 'text-red-600' :
                      budget.progress >= 80 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>{budget.progress.toFixed(1)}%</span></span>
                    <span>{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budget.progress >= 100 ? 'bg-red-600' :
                        budget.progress >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Sisa: {formatCurrency(budget.remaining)}
                    {budget.progress >= 100 && (
                      <span className="ml-2 text-red-600 font-medium">
                        ⚠️ Budget terlampaui!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Buat Budget Baru</h2>
            <form onSubmit={handleCreateBudget}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Budget (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Budget Makanan Bulan Ini"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan jumlah budget"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tambahkan catatan tentang budget ini"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Threshold Peringatan (%)
                  </label>
                  <input
                    type="number"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="80"
                    min="50"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Anda akan mendapat peringatan ketika budget mencapai persentase ini
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Buat Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets; 