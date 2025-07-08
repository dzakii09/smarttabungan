import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const MonthlyComparison: React.FC = () => {
  const { transactions } = useApp();

  // Calculate monthly comparison data
  const calculateMonthlyComparison = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get current month data
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Get previous month data
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === prevMonth && txDate.getFullYear() === prevYear;
    });

    const currentIncome = currentMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const currentExpense = currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const prevIncome = prevMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const prevExpense = prevMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const currentMonthName = new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long' });
    const prevMonthName = new Date(prevYear, prevMonth).toLocaleDateString('id-ID', { month: 'long' });

    return [
      {
        month: prevMonthName,
        income: prevIncome,
        expense: prevExpense,
        savings: prevIncome - prevExpense
      },
      {
        month: currentMonthName,
        income: currentIncome,
        expense: currentExpense,
        savings: currentIncome - currentExpense
      }
    ];
  };

  const data = calculateMonthlyComparison();

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

  // Calculate percentage changes
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = getPercentageChange(data[1]?.income || 0, data[0]?.income || 0);
  const expenseChange = getPercentageChange(data[1]?.expense || 0, data[0]?.expense || 0);
  const savingsChange = getPercentageChange(data[1]?.savings || 0, data[0]?.savings || 0);

  // Add sample data for demonstration if no real data
  const sampleData = [
    {
      month: 'Bulan Lalu',
      income: 8000000,
      expense: 6000000,
      savings: 2000000
    },
    {
      month: 'Bulan Ini',
      income: 9500000,
      expense: 7000000,
      savings: 2500000
    }
  ];

  const displayData = (data.length > 0 && !(data[0]?.income === 0 && data[0]?.expense === 0 && data[1]?.income === 0 && data[1]?.expense === 0)) ? data : sampleData;
  const isSampleData = data.length === 0 || (data[0]?.income === 0 && data[0]?.expense === 0 && data[1]?.income === 0 && data[1]?.expense === 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">
            Perbandingan Bulanan
          </h3>
          <div className="flex items-center space-x-2">
            {isSampleData && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">Data contoh</p>
              </div>
            )}
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>
        </div>

      {/* Percentage Changes */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {incomeChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <p className="text-sm text-neutral-600">Pemasukan</p>
          <p className={`font-semibold ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {expenseChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600" />
            )}
          </div>
          <p className="text-sm text-neutral-600">Pengeluaran</p>
          <p className={`font-semibold ${expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {savingsChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <p className="text-sm text-neutral-600">Tabungan</p>
          <p className={`font-semibold ${savingsChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {savingsChange >= 0 ? '+' : ''}{savingsChange.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
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
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyComparison; 