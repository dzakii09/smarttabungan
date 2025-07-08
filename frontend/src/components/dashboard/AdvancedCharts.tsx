import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const AdvancedCharts: React.FC = () => {
  const { transactions } = useApp();
  const [activeChart, setActiveChart] = useState<'line' | 'bar'>('line');

  // Calculate monthly data for the last 6 months
  const calculateMonthlyData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
      
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const expense = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      months.push({
        month: monthName,
        income,
        expense,
        savings: income - expense
      });
    }

    return months;
  };

  const data = calculateMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Add sample data for demonstration if no real data
  const sampleData = [
    { month: 'Jan', income: 8000000, expense: 6000000, savings: 2000000 },
    { month: 'Feb', income: 7500000, expense: 5500000, savings: 2000000 },
    { month: 'Mar', income: 9000000, expense: 7000000, savings: 2000000 },
    { month: 'Apr', income: 8500000, expense: 6500000, savings: 2000000 },
    { month: 'Mei', income: 9500000, expense: 7500000, savings: 2000000 },
    { month: 'Jun', income: 10000000, expense: 8000000, savings: 2000000 }
  ];

  const displayData = (data.length > 0 && !data.every(item => item.income === 0 && item.expense === 0)) ? data : sampleData;
  const isSampleData = data.length === 0 || data.every(item => item.income === 0 && item.expense === 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">
            Grafik Lanjutan
          </h3>
          <div className="flex items-center space-x-2">
            {isSampleData && (
              <div className="mr-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">Data contoh</p>
              </div>
            )}
          <button
            onClick={() => setActiveChart('line')}
            className={`p-2 rounded-lg transition-colors ${
              activeChart === 'line' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="Line Chart"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveChart('bar')}
            className={`p-2 rounded-lg transition-colors ${
              activeChart === 'bar' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'line' ? (
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Pemasukan"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Pengeluaran"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Tabungan"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
                      ) : (
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
              <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
              <Bar dataKey="savings" fill="#3b82f6" name="Tabungan" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedCharts; 