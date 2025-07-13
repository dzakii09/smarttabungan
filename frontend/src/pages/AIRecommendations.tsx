import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  CreditCard,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import api from '../api';

interface FinancialRecommendation {
  id: string;
  type: 'budget' | 'savings' | 'investment' | 'spending' | 'goal' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  estimatedTime?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  actionable: boolean;
  metadata?: any;
}

interface UserInsights {
  spendingPatterns: {
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    averageDailySpending: number;
    averageMonthlySpending: number;
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
  };
  savingHabits: {
    monthlySavingsRate: number;
    savingsTrend: 'improving' | 'declining' | 'stable';
    emergencyFundProgress: number;
  };
  financialHealth: {
    score: number;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

const AIRecommendations: React.FC = () => {
  const { token } = useApp();
  const [recommendations, setRecommendations] = useState<FinancialRecommendation[]>([]);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'profile'>('recommendations');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recommendationsRes, insightsRes] = await Promise.all([
        api.get('/ai/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/ai/insights', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRecommendations(recommendationsRes.data.data || []);
      setInsights(insightsRes.data.data || null);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return <CreditCard className="w-5 h-5" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      case 'spending':
        return <TrendingDown className="w-5 h-5" />;
      case 'goal':
        return <Target className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFinancialHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">AI Recommendations</h1>
          <p className="text-neutral-600">
            Rekomendasi personalisasi berdasarkan analisis keuangan Anda
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <span className="text-sm text-neutral-600">
            {recommendations.length} rekomendasi tersedia
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Rekomendasi ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Profil Keuangan
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada rekomendasi
              </h3>
              <p className="text-gray-500">
                Tambahkan lebih banyak transaksi untuk mendapatkan rekomendasi personalisasi
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getRecommendationIcon(recommendation.type)}
                      <span className="text-sm font-medium text-neutral-600 capitalize">
                        {recommendation.type}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </span>
                  </div>

                  <h3 className="font-semibold text-neutral-900 mb-2">
                    {recommendation.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                    {recommendation.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {recommendation.estimatedSavings && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-neutral-600">
                          Potensi hemat: Rp {recommendation.estimatedSavings.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    
                    {recommendation.estimatedTime && (
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-neutral-600">
                          Estimasi waktu: {recommendation.estimatedTime}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`${getImpactColor(recommendation.impact)}`}>
                      Impact: {recommendation.impact}
                    </span>
                    <span className={`${getDifficultyColor(recommendation.difficulty)}`}>
                      Difficulty: {recommendation.difficulty}
                    </span>
                  </div>

                  {recommendation.actionable && (
                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Terapkan Rekomendasi
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'insights' && insights && (
        <div className="space-y-6">
          {/* Financial Health Score */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Kesehatan Finansial</h3>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getFinancialHealthColor(insights.financialHealth.score)}`}>
                  {insights.financialHealth.score}
                </div>
                <div className="text-sm text-neutral-600">Skor</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Tingkat Risiko:</span>
                  <span className={`text-sm font-medium ${getRiskLevelColor(insights.financialHealth.riskLevel)}`}>
                    {insights.financialHealth.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  {insights.financialHealth.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-600">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Spending Patterns */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pola Pengeluaran</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Kategori Teratas</h4>
                <div className="space-y-3">
                  {insights.spendingPatterns.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">{category.category}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          Rp {category.amount.toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Statistik</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Rata-rata Harian:</span>
                    <span className="text-sm font-medium">
                      Rp {insights.spendingPatterns.averageDailySpending.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Rata-rata Bulanan:</span>
                    <span className="text-sm font-medium">
                      Rp {insights.spendingPatterns.averageMonthlySpending.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Tren:</span>
                    <div className="flex items-center space-x-1">
                      {insights.spendingPatterns.spendingTrend === 'increasing' ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : insights.spendingPatterns.spendingTrend === 'decreasing' ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {insights.spendingPatterns.spendingTrend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saving Habits */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Kebiasaan Menabung</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {insights.savingHabits.monthlySavingsRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-neutral-600">Rasio Tabungan Bulanan</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(insights.savingHabits.monthlySavingsRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neutral-600">Tren Tabungan:</span>
                    <div className="flex items-center space-x-1">
                      {insights.savingHabits.savingsTrend === 'improving' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : insights.savingHabits.savingsTrend === 'declining' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {insights.savingHabits.savingsTrend}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neutral-600">Dana Darurat:</span>
                    <span className="text-sm font-medium">
                      {insights.savingHabits.emergencyFundProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="text-center py-12">
          <Settings className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profil Keuangan
          </h3>
          <p className="text-gray-500">
            Fitur profil keuangan akan segera hadir
          </p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations; 