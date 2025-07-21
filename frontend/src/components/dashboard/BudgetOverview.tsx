import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const BudgetOverview: React.FC = () => {
  const { budgetStats } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show message if no budget stats
  if (!budgetStats || budgetStats.activeBudgets === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">
            Overview Budget
          </h3>
          <TrendingUp className="w-5 h-5 text-neutral-400" />
        </div>
        
        <div className="h-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-500 text-sm mb-2">Belum ada budget aktif</p>
            <p className="text-xs text-neutral-400">Buat budget untuk melacak pengeluaran</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">
          Overview Budget
        </h3>
        <TrendingUp className="w-5 h-5 text-neutral-400" />
      </div>
      
      <div className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Progress Keseluruhan</span>
            <span className={`text-sm font-medium ${
              budgetStats.overallProgress >= 100 ? 'text-red-600' :
              budgetStats.overallProgress >= 80 ? 'text-yellow-600' : 'text-neutral-800'
            }`}>
              {budgetStats.overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                budgetStats.overallProgress >= 100 ? 'bg-red-500' :
                budgetStats.overallProgress >= 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetStats.overallProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Total Budget</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatCurrency(budgetStats.totalBudget)}
            </p>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Tersisa</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatCurrency(budgetStats.totalRemaining)}
            </p>
          </div>
        </div>

        {/* Budget Status */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-neutral-600">On Track</span>
            </div>
            <span className="font-medium text-neutral-800">{budgetStats.onTrackBudgets}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-neutral-600">Warning</span>
            </div>
            <span className="font-medium text-neutral-800">{budgetStats.warningBudgets}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-neutral-600">Exceeded</span>
            </div>
            <span className="font-medium text-neutral-800">{budgetStats.exceededBudgets}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview; 