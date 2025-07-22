import React, { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  DollarSign, 
  Calendar,
  BarChart3,
  ArrowRight,
  Sparkles,
  Eye,
  Brain,
  Award,
  Clock,
  PiggyBank
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const SpendingInsights: React.FC = () => {
  const { transactions, categories, budgetStats, goals } = useApp();
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  // Calculate spending insights
  const calculateSpendingInsights = () => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= currentMonth && tx.type === 'expense';
    });

    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    const prevMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= prevMonth && txDate < currentMonth && tx.type === 'expense';
    });

    // Calculate category spending
    const getCategorySpending = (transactions: any[]) => {
      const categoryTotals = new Map();
      
      transactions.forEach(tx => {
        const category = categories.find(cat => cat.id === tx.categoryId);
        if (category) {
          const current = categoryTotals.get(category.name) || 0;
          categoryTotals.set(category.name, current + tx.amount);
        }
      });

      return categoryTotals;
    };

    const currentCategorySpending = getCategorySpending(currentMonthTransactions);
    const prevCategorySpending = getCategorySpending(prevMonthTransactions);

    // Calculate insights
    const insights = [];

    // Top spending category with enhanced analysis
    let topCategory = '';
    let topAmount = 0;
    currentCategorySpending.forEach((amount, category) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    });

    if (topCategory) {
      const prevAmount = prevCategorySpending.get(topCategory) || 0;
      const change = prevAmount > 0 ? ((topAmount - prevAmount) / prevAmount) * 100 : 0;
      const currentTotal = Array.from(currentCategorySpending.values()).reduce((sum, amount) => sum + amount, 0);
      const percentage = (topAmount / currentTotal) * 100;
      
      insights.push({
        type: 'top-spending',
        title: `Kategori Pengeluaran Terbesar`,
        subtitle: topCategory,
        description: `Rp ${topAmount.toLocaleString('id-ID')} (${percentage.toFixed(1)}% dari total)`,
        change: change,
        icon: change > 10 ? TrendingUp : change < -10 ? TrendingDown : BarChart3,
        color: change > 10 ? 'text-red-600' : change < -10 ? 'text-green-600' : 'text-blue-600',
        bgColor: change > 10 ? 'bg-red-50' : change < -10 ? 'bg-green-50' : 'bg-blue-50',
        borderColor: change > 10 ? 'border-red-200' : change < -10 ? 'border-green-200' : 'border-blue-200',
        action: change > 10 ? 'Tinjau Budget' : 'Analisis Detail',
        severity: change > 20 ? 'high' : change > 10 ? 'medium' : 'low',
        details: {
          monthlyAverage: prevAmount,
          trend: change > 0 ? 'meningkat' : 'menurun',
          recommendation: change > 10 ? 'Pertimbangkan untuk mengurangi pengeluaran di kategori ini' : 'Pengeluaran di kategori ini relatif stabil'
        }
      });
    }

    // Spending trend with enhanced metrics
    const currentTotal = Array.from(currentCategorySpending.values()).reduce((sum, amount) => sum + amount, 0);
    const prevTotal = Array.from(prevCategorySpending.values()).reduce((sum, amount) => sum + amount, 0);
    const totalChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    if (Math.abs(totalChange) > 5) {
      insights.push({
        type: 'trend',
        title: totalChange > 0 ? 'Trend Pengeluaran Meningkat' : 'Trend Pengeluaran Menurun',
        subtitle: `${Math.abs(totalChange).toFixed(1)}% dari bulan lalu`,
        description: `Total: Rp ${currentTotal.toLocaleString('id-ID')}`,
        change: totalChange,
        icon: totalChange > 0 ? TrendingUp : TrendingDown,
        color: totalChange > 0 ? 'text-red-600' : 'text-green-600',
        bgColor: totalChange > 0 ? 'bg-red-50' : 'bg-green-50',
        borderColor: totalChange > 0 ? 'border-red-200' : 'border-green-200',
        action: totalChange > 0 ? 'Buat Budget' : 'Pertahankan',
        severity: Math.abs(totalChange) > 20 ? 'high' : Math.abs(totalChange) > 10 ? 'medium' : 'low',
        details: {
          averageDaily: currentTotal / 30,
          comparison: `Bulan lalu: Rp ${prevTotal.toLocaleString('id-ID')}`,
          recommendation: totalChange > 0 ? 'Pertimbangkan untuk mengatur budget yang lebih ketat' : 'Bagus! Pertahankan pola pengeluaran ini'
        }
      });
    }

    // Enhanced budget insights
    if (budgetStats && budgetStats.activeBudgets > 0) {
      if (budgetStats.exceededBudgets > 0) {
        insights.push({
          type: 'budget-alert',
          title: 'Budget Terlampaui',
          subtitle: `${budgetStats.exceededBudgets} dari ${budgetStats.activeBudgets} budget`,
          description: 'Tinjau dan sesuaikan budget Anda',
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          action: 'Tinjau Budget',
          severity: 'high',
          details: {
            impact: 'Pengeluaran melebihi rencana',
            recommendation: 'Segera tinjau budget dan kurangi pengeluaran di kategori yang terlampaui'
          }
        });
      }

      if (budgetStats.warningBudgets > 0) {
        insights.push({
          type: 'budget-warning',
          title: 'Budget dalam Peringatan',
          subtitle: `${budgetStats.warningBudgets} budget mendekati batas`,
          description: 'Hati-hati dengan pengeluaran Anda',
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          action: 'Tinjau Budget',
          severity: 'medium',
          details: {
            impact: 'Pengeluaran mendekati batas budget',
            recommendation: 'Kurangi pengeluaran atau sesuaikan budget untuk menghindari terlampaui'
          }
        });
      }

      if (budgetStats.onTrackBudgets > 0) {
        insights.push({
          type: 'budget-success',
          title: 'Budget On Track',
          subtitle: `${budgetStats.onTrackBudgets} budget berjalan baik`,
          description: 'Bagus! Anda mengelola budget dengan baik',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          action: 'Lihat Detail',
          severity: 'low',
          details: {
            impact: 'Pengeluaran sesuai dengan rencana',
            recommendation: 'Pertahankan pola pengelolaan budget yang baik'
          }
        });
      }
    }

    // Enhanced savings opportunity
    const topCategories = Array.from(currentCategorySpending.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topCategories.length > 0) {
      const biggestCategory = topCategories[0];
      const biggestAmount = biggestCategory[1];
      const percentage = (biggestAmount / currentTotal) * 100;

      if (percentage > 40) {
        insights.push({
          type: 'opportunity',
          title: 'Peluang Penghematan',
          subtitle: `${biggestCategory[0]} (${percentage.toFixed(1)}% dari total)`,
          description: 'Kategori ini menyerap sebagian besar pengeluaran',
          icon: Lightbulb,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          action: 'Buat Budget',
          severity: 'medium',
          details: {
            potential: `Potensi penghematan: Rp ${(biggestAmount * 0.1).toLocaleString('id-ID')} (10% pengurangan)`,
            recommendation: 'Pertimbangkan untuk membuat budget khusus untuk kategori ini'
          }
        });
      }
    }

    // Enhanced daily spending pattern
    const dailySpending = new Map();
    currentMonthTransactions.forEach(tx => {
      const day = new Date(tx.date).getDay();
      const current = dailySpending.get(day) || 0;
      dailySpending.set(day, current + tx.amount);
    });

    if (dailySpending.size > 0) {
      let maxDay = 0;
      let maxAmount = 0;
      dailySpending.forEach((amount, day) => {
        if (amount > maxAmount) {
          maxAmount = amount;
          maxDay = day;
        }
      });

      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const avgDaily = currentTotal / 30;
      const dayRatio = maxAmount / avgDaily;

      if (dayRatio > 1.5) {
        insights.push({
          type: 'pattern',
          title: 'Pola Pengeluaran Harian',
          subtitle: `${dayNames[maxDay]} adalah hari dengan pengeluaran tertinggi`,
          description: `Rp ${maxAmount.toLocaleString('id-ID')} (${dayRatio.toFixed(1)}x rata-rata)`,
          icon: Calendar,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          action: 'Analisis Pola',
          severity: 'low',
          details: {
            averageDaily: avgDaily,
            pattern: `Pengeluaran di ${dayNames[maxDay]} ${dayRatio > 2 ? 'sangat tinggi' : 'cukup tinggi'}`,
            recommendation: 'Pertimbangkan untuk merencanakan pengeluaran besar di hari lain'
          }
        });
      }
    }

    // New: Goal progress insights
    if (goals && goals.length > 0) {
      const urgentGoals = goals.filter(goal => {
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        return daysLeft < 90 && progress < 50;
      });

      if (urgentGoals.length > 0) {
        insights.push({
          type: 'goal-urgent',
          title: 'Tujuan Keuangan Mendesak',
          subtitle: `${urgentGoals.length} tujuan membutuhkan perhatian`,
          description: 'Beberapa tujuan Anda mendekati deadline',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          action: 'Tinjau Goals',
          severity: 'high',
          details: {
            goals: urgentGoals.map(g => g.name),
            recommendation: 'Pertimbangkan untuk meningkatkan kontribusi ke tujuan yang mendesak'
          }
        });
      }
    }

    // New: Financial health score
    const incomeTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= currentMonth && tx.type === 'income';
    });
    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - currentTotal) / totalIncome) * 100 : 0;

    if (savingsRate < 10) {
      insights.push({
        type: 'savings-low',
        title: 'Tingkat Tabungan Rendah',
        subtitle: `${savingsRate.toFixed(1)}% dari penghasilan`,
        description: 'Pertimbangkan untuk meningkatkan tabungan',
        icon: PiggyBank,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        action: 'Buat Rencana',
        severity: 'high',
        details: {
          target: 'Target tabungan yang disarankan: 20%',
          recommendation: 'Mulai dengan menabung 10% dari penghasilan dan tingkatkan secara bertahap'
        }
      });
    } else if (savingsRate > 30) {
      insights.push({
        type: 'savings-excellent',
        title: 'Tingkat Tabungan Excellent',
        subtitle: `${savingsRate.toFixed(1)}% dari penghasilan`,
        description: 'Bagus! Anda menabung dengan sangat baik',
        icon: Award,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        action: 'Lihat Investasi',
        severity: 'low',
        details: {
          achievement: 'Anda melebihi target tabungan yang disarankan',
          recommendation: 'Pertimbangkan untuk berinvestasi sebagian dari tabungan Anda'
        }
      });
    }

    return insights;
  };

  const insights = calculateSpendingInsights();

  // Check if we have any real insights
  const hasRealInsights = insights.length > 0;

  // Empty state when no data
  if (!hasRealInsights) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 font-inter">
                AI Insights
              </h3>
              <p className="text-sm text-neutral-500">Analisis cerdas pengeluaran Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-neutral-500">Powered by AI</span>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-sm mx-auto">
            <div className="relative">
              <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-10 h-10 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 bg-yellow-100 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <h4 className="text-xl font-semibold text-neutral-800 mb-2">Belum Ada Insights</h4>
            <p className="text-neutral-600 mb-6">
              AI akan menganalisis pola pengeluaran Anda dan memberikan rekomendasi yang berguna setelah Anda menambahkan beberapa transaksi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/transactions'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Tambah Transaksi
                </div>
              </button>
              <button
                onClick={() => window.location.href = '/budgets'}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Buat Budget
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 font-inter">
              AI Insights
            </h3>
            <p className="text-sm text-gray-500">Analisis cerdas pengeluaran Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-gray-500">Powered by AI</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          const isSelected = selectedInsight === index;
          
          return (
            <div 
              key={index} 
              className={`
                relative p-4 rounded-xl ${insight.bgColor} border ${insight.borderColor} 
                hover:shadow-lg transition-all duration-300 cursor-pointer
                ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                ${getSeverityColor(insight.severity)}
              `}
              onClick={() => setSelectedInsight(isSelected ? null : index)}
            >
              {/* Severity indicator */}
              <div className="absolute top-3 right-3">
                {getSeverityIcon(insight.severity)}
              </div>

              <div className="flex items-start space-x-3 pr-8">
                <div className={`p-3 rounded-xl ${insight.bgColor} bg-opacity-50 shadow-sm`}>
                  <IconComponent className={`w-6 h-6 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold text-lg ${insight.color}`}>
                      {insight.title}
                    </h4>
                    {insight.change !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.change > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {insight.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {insight.description}
                  </p>
                  
                  {/* Action button */}
                  {insight.action && (
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      {insight.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed view */}
              {isSelected && insight.details && (
                <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Detail Analisis
                    </h5>
                    <div className="space-y-2 text-sm">
                      {Object.entries(insight.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                          </span>
                          <span className="font-medium text-gray-800">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default SpendingInsights; 