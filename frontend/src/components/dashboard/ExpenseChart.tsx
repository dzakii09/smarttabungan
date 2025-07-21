import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { Calendar, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { Transaction } from '../../types';

type PeriodOption = {
  label: string;
  value: string;
  type: 'preset' | 'custom';
};

const ExpenseChart: React.FC = () => {
  const { transactions, categories, selectedMonths } = useApp();
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [customMonth, setCustomMonth] = useState<string>('');
  const [customYear, setCustomYear] = useState<string>(new Date().getFullYear().toString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get available months from transactions
  const getMonthOptions = (transactions: Transaction[]): string[] => {
    const months = Array.from(new Set(transactions.map((tx: Transaction) => tx.date.slice(0,7))));
    months.sort((a: string, b: string) => b.localeCompare(a));
    return months;
  };

  const getMonthLabel = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    return `${bulan[parseInt(month,10)-1]} ${year}`;
  };

  const monthOptions = useMemo(() => getMonthOptions(transactions), [transactions]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 7);
  const threeMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().slice(0, 7);

  // Generate period options
  const getPeriodOptions = (): PeriodOption[] => {
    const options: PeriodOption[] = [
      { label: 'Bulan Ini', value: 'current', type: 'preset' },
      { label: 'Bulan Lalu', value: 'last', type: 'preset' },
      { label: '3 Bulan Lalu', value: 'threeMonthsAgo', type: 'preset' },
      { label: 'Pilih Bulan & Tahun', value: 'custom', type: 'custom' }
    ];

    // Add available months from transactions
    monthOptions.slice(0, 10).forEach(month => {
      options.push({
        label: getMonthLabel(month),
        value: month,
        type: 'custom'
      });
    });

    return options;
  };

  // Get selected month based on period selection
  const getSelectedMonth = (): string => {
    switch (selectedPeriod) {
      case 'current':
        return currentMonth;
      case 'last':
        return lastMonth;
      case 'threeMonthsAgo':
        return threeMonthsAgo;
      case 'custom':
        if (customMonth && customYear) {
          const month = customMonth.padStart(2, '0');
          return `${customYear}-${month}`;
        }
        return currentMonth;
      default:
        return selectedPeriod; // Direct month value
    }
  };

  // Calculate expense data for specific month
  const calculateExpenseData = (monthFilter?: string) => {
    let filteredTransactions = transactions.filter(tx => tx.type === 'expense' && tx.categoryId);
    
    if (monthFilter) {
      filteredTransactions = filteredTransactions.filter(tx => tx.date.startsWith(monthFilter));
    }
    
    // Group by category and sum amounts
    const categoryTotals = new Map();
    
    filteredTransactions.forEach(transaction => {
      const category = categories.find(cat => cat.id === transaction.categoryId);
      if (category) {
        const currentTotal = categoryTotals.get(category.name) || 0;
        categoryTotals.set(category.name, currentTotal + transaction.amount);
      }
    });

    // Convert to chart data format
    const chartData = Array.from(categoryTotals.entries()).map(([name, value]) => {
      const category = categories.find(cat => cat.name === name);
      return {
        name,
        value: value as number,
        color: category?.color || '#6B7280'
      };
    });

    // Sort by value descending
    return chartData.sort((a, b) => b.value - a.value);
  };

  // Get data for selected month and comparison month
  const selectedMonth = getSelectedMonth();
  const selectedMonthData = calculateExpenseData(selectedMonth);
  
  // For comparison, use the previous month of selected month
  const getComparisonMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 2, 1);
    return date.toISOString().slice(0, 7);
  };
  
  const comparisonMonth = getComparisonMonth(selectedMonth);
  const comparisonMonthData = calculateExpenseData(comparisonMonth);

  // Calculate comparison data
  const getComparisonData = () => {
    const allCategories = new Set([
      ...selectedMonthData.map(item => item.name),
      ...comparisonMonthData.map(item => item.name)
    ]);

    return Array.from(allCategories).map(categoryName => {
      const current = selectedMonthData.find(item => item.name === categoryName);
      const last = comparisonMonthData.find(item => item.name === categoryName);
      const category = categories.find(cat => cat.name === categoryName);
      
      return {
        name: categoryName,
        current: current?.value || 0,
        last: last?.value || 0,
        change: current && last ? current.value - last.value : 0,
        changePercent: current && last && last.value > 0 
          ? ((current.value - last.value) / last.value) * 100 
          : 0,
        color: category?.color || '#6B7280'
      };
    }).sort((a, b) => b.current - a.current);
  };

  const comparisonData = getComparisonData();
  const displayData = selectedMonthData;

  // Check if we have any real data
  const hasRealData = displayData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-800">{data.name}</p>
          <p className="text-primary-600">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Empty state when no data
  if (!hasRealData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800 font-inter">
            Grafik Pengeluaran
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                showComparison 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {showComparison ? 'Sembunyikan' : 'Tampilkan'} Perbandingan
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-sm mx-auto">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-800 mb-2">Belum Ada Data Pengeluaran</h4>
            <p className="text-neutral-600 mb-6">
              Mulai dengan menambahkan transaksi pengeluaran untuk melihat grafik pengeluaran Anda.
            </p>
            <button
              onClick={() => window.location.href = '/transactions'}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Tambah Transaksi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const periodOptions = getPeriodOptions();
  const selectedPeriodLabel = periodOptions.find(opt => opt.value === selectedPeriod)?.label || 'Bulan Ini';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800 font-inter">
          Pengeluaran Berdasarkan Kategori
        </h3>
        <div className="flex items-center space-x-2">
          {/* Period Selection Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{selectedPeriodLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showPeriodDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {/* Preset Options */}
                  <div className="mb-2">
                    <div className="text-xs font-medium text-neutral-500 mb-1 px-2">Pilihan Cepat</div>
                    {periodOptions.filter(opt => opt.type === 'preset').map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedPeriod(option.value);
                          setShowPeriodDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-neutral-100 ${
                          selectedPeriod === option.value ? 'bg-primary-100 text-primary-700' : 'text-neutral-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Month/Year Selection */}
                  <div className="mb-2 border-t pt-2">
                    <div className="text-xs font-medium text-neutral-500 mb-1 px-2">Pilih Bulan & Tahun</div>
                    <div className="flex space-x-2 px-2">
                      <select
                        value={customMonth}
                        onChange={(e) => setCustomMonth(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded"
                      >
                        <option value="">Bulan</option>
                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(month => (
                          <option key={month} value={month}>
                            {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][parseInt(month)-1]}
                          </option>
                        ))}
                      </select>
                      <select
                        value={customYear}
                        onChange={(e) => setCustomYear(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded"
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (customMonth && customYear) {
                            setSelectedPeriod('custom');
                            setShowPeriodDropdown(false);
                          }
                        }}
                        disabled={!customMonth || !customYear}
                        className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                      >
                        Pilih
                      </button>
                    </div>
                  </div>
                  
                  {/* Available Months from Transactions */}
                  {monthOptions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1 px-2">Bulan Tersedia</div>
                      {periodOptions.filter(opt => opt.type === 'custom' && opt.value !== 'custom').slice(0, 8).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedPeriod(option.value);
                            setShowPeriodDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-neutral-100 ${
                            selectedPeriod === option.value ? 'bg-primary-100 text-primary-700' : 'text-neutral-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              showComparison 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {showComparison ? 'Sembunyikan' : 'Tampilkan'} Perbandingan
          </button>
        </div>
      </div>

      {/* Selected Period Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          📊 Menampilkan data untuk: <span className="font-semibold">{getMonthLabel(selectedMonth)}</span>
        </p>
      </div>

      {/* Comparison Section */}
      {showComparison && comparisonData.length > 0 && (
        <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
          <h4 className="font-semibold text-neutral-800 mb-3">
            Perbandingan {getMonthLabel(selectedMonth)} vs {getMonthLabel(comparisonMonth)}
          </h4>
          
          {/* Comparison Chart */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={11} 
                  tickFormatter={v => new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(v as number)}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), '']}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="current" fill="#3B82F6" name={getMonthLabel(selectedMonth)} />
                <Bar dataKey="last" fill="#9CA3AF" name={getMonthLabel(comparisonMonth)} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {comparisonData.slice(0, 6).map((item) => (
              <div key={item.name} className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-neutral-800 truncate">
                    {item.name}
                  </span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Sekarang:</span>
                    <span className="font-medium">{formatCurrency(item.current)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Lalu:</span>
                    <span className="font-medium">{formatCurrency(item.last)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Perubahan:</span>
                    <div className="flex items-center space-x-1">
                      {item.change > 0 ? (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      ) : item.change < 0 ? (
                        <TrendingDown className="w-3 h-3 text-green-500" />
                      ) : null}
                      <span className={`font-medium ${
                        item.change > 0 ? 'text-red-600' : 
                        item.change < 0 ? 'text-green-600' : 'text-neutral-500'
                      }`}>
                        {item.change > 0 ? '+' : ''}{formatCurrency(item.change)}
                        {item.changePercent !== 0 && ` (${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(1)}%)`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Pie Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {displayData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-neutral-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;