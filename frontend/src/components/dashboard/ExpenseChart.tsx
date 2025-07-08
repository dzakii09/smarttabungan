import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../../contexts/AppContext';

const ExpenseChart: React.FC = () => {
  const { transactions, categories } = useApp();

  // Calculate expense data from user transactions
  const calculateExpenseData = () => {
    const expenseTransactions = transactions.filter(tx => tx.type === 'expense' && tx.categoryId);
    
    // Group by category and sum amounts
    const categoryTotals = new Map();
    
    expenseTransactions.forEach(transaction => {
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

  const data = calculateExpenseData();

  // Add sample data for demonstration if no real data
  const sampleData = [
    { name: 'Makanan & Minuman', value: 2500000, color: '#EF4444' },
    { name: 'Transportasi', value: 1500000, color: '#3B82F6' },
    { name: 'Belanja', value: 1000000, color: '#10B981' },
    { name: 'Hiburan', value: 500000, color: '#F59E0B' },
    { name: 'Lainnya', value: 300000, color: '#8B5CF6' }
  ];

  const displayData = data.length > 0 ? data : sampleData;
  const isSampleData = data.length === 0;

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
          {isSampleData && (
            <p className="text-xs text-neutral-500 mt-1">Data contoh</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 font-inter">
        Pengeluaran Berdasarkan Kategori
      </h3>
      {isSampleData && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Menampilkan data contoh. Tambahkan transaksi pengeluaran untuk melihat data Anda sendiri.
          </p>
        </div>
      )}
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
              {displayData.map((entry, index) => (
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