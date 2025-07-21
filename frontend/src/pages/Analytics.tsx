import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Eye, EyeOff, BarChart3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsData {
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

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [showDetailed, setShowDetailed] = useState(false);
  const [selectedChart, setSelectedChart] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getOverview(selectedPeriod);
      setData(response);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Gagal memuat data analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    toast.success('Data analytics berhasil diekspor');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no data
  if (!data || data.monthlyData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Keuangan</h1>
              <p className="text-gray-600">Analisis mendalam tentang pola keuangan Anda</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Data Analytics</h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan menambahkan transaksi dan budget untuk melihat analisis keuangan Anda.
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Keuangan</h1>
            <p className="text-gray-600">Analisis mendalam tentang pola keuangan Anda</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="3months">3 Bulan Terakhir</option>
              <option value="6months">6 Bulan Terakhir</option>
              <option value="12months">12 Bulan Terakhir</option>
              <option value="year">Tahun Ini</option>
            </select>
            <button
              onClick={() => setShowDetailed(!showDetailed)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showDetailed ? <EyeOff size={16} /> : <Eye size={16} />}
              {showDetailed ? 'Sederhana' : 'Detail'}
            </button>
            <button
              onClick={exportAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Ekspor
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalExpense)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Periode {selectedPeriod}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalIncome)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Periode {selectedPeriod}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tabungan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.savings)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Periode {selectedPeriod}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rasio Tabungan</p>
                <p className={`text-2xl font-bold ${
                  data.summary.savingsRate >= 30 ? 'text-green-600' :
                  data.summary.savingsRate >= 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.min(data.summary.savingsRate, 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              {data.summary.savingsRate > 100 && (
                <span className="text-red-600 text-xs">⚠️ Melebihi 100%</span>
              )}
            </div>
          </div>
        </div>

        {/* Chart Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Ringkasan' },
            { id: 'trends', label: 'Tren Pengeluaran' },
            { id: 'categories', label: 'Kategori' },
            { id: 'income', label: 'Pemasukan vs Pengeluaran' },
          ].map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedChart === chart.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {chart.label}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Expenses Comparison */}
          {selectedChart === 'overview' && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Pengeluaran Bulanan</h3>
                {data.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.monthlyData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value).replace('Rp', '').trim()}
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="expense" fill="#EF4444" name="Pengeluaran" />
                      <Bar dataKey="income" fill="#10B981" name="Pemasukan" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Tidak ada data untuk ditampilkan</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Kategori</h3>
                {data.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                      <Pie
                        data={data.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Tidak ada data kategori</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Income vs Expense */}
          {selectedChart === 'income' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pemasukan vs Pengeluaran</h3>
              {data.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.monthlyData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('Rp', '').trim()}
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" fill="#10B981" name="Pemasukan" />
                    <Bar dataKey="expense" fill="#EF4444" name="Pengeluaran" />
                    <Bar dataKey="savings" fill="#3B82F6" name="Tabungan" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ada data untuk ditampilkan</p>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* Spending Trends */}
          {selectedChart === 'trends' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Pengeluaran Bulanan</h3>
              {data.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.monthlyData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('Rp', '').trim()}
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      name="Pengeluaran"
                      dataKey="expense"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      name="Pemasukan"
                      dataKey="income"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ada data untuk ditampilkan</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category Analysis */}
          {selectedChart === 'categories' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Kategori Pengeluaran</h3>
              {data.categoryBreakdown.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4">Distribusi Kategori</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                        <Pie
                          data={data.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4">Detail Kategori</h4>
                    <div className="space-y-3">
                      {data.categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-medium text-gray-700">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(category.value)}</p>
                            <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ada data kategori</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Insights */}
        {showDetailed && data.aiInsights && data.aiInsights.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'positive' ? 'text-green-600 bg-green-50 border-green-200' :
                    insight.type === 'negative' ? 'text-red-600 bg-red-50 border-red-200' :
                    insight.type === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    'text-blue-600 bg-blue-50 border-blue-200'
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 