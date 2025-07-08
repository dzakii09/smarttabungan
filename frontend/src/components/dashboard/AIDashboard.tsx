import React, { useState, useEffect } from 'react';
import { Bot, Lightbulb, TrendingUp, TrendingDown, Target, PiggyBank, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import api from '../../api';

interface AIRecommendation {
  id: string;
  type: 'budget' | 'savings' | 'investment' | 'spending' | 'goal' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  estimatedTime?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  actionable: boolean;
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

const AIDashboard: React.FC = () => {
  const { token } = useApp();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAIData();
    }
  }, [token]);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const [recommendationsRes, insightsRes] = await Promise.all([
        api.get('/personalization/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/personalization/insights', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const recommendationsData = (recommendationsRes.data as any).data || recommendationsRes.data;
      const insightsData = (insightsRes.data as any).data || insightsRes.data;

      setRecommendations(recommendationsData || []);
      setInsights(insightsData || null);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return <Target className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4" />;
      case 'spending':
        return <TrendingDown className="w-4 h-4" />;
      case 'goal':
        return <Target className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
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

  const displayedRecommendations = showAllRecommendations 
    ? recommendations 
    : recommendations.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">
            AI Assistant
          </h3>
          <Bot className="w-5 h-5 text-neutral-400" />
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800">
            AI Insights & Recommendations
          </h3>
        </div>
        <Bot className="w-5 h-5 text-neutral-400" />
      </div>

      {/* Financial Health Score */}
      {insights && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-neutral-800">Financial Health Score</h4>
            <span className={`text-lg font-bold ${getFinancialHealthColor(insights.financialHealth.score)}`}>
              {insights.financialHealth.score}/100
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Risk Level:</span>
            <span className={`font-medium ${getRiskLevelColor(insights.financialHealth.riskLevel)}`}>
              {insights.financialHealth.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-neutral-800">Top Recommendations</h4>
            {recommendations.length > 3 && (
              <button
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>{showAllRecommendations ? 'Show Less' : `Show All (${recommendations.length})`}</span>
                <ArrowRight className={`w-3 h-3 transition-transform ${showAllRecommendations ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {displayedRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getRecommendationIcon(recommendation.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-neutral-800 truncate">
                        {recommendation.title}
                      </h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2 line-clamp-2">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Impact: {recommendation.impact}</span>
                      {recommendation.estimatedSavings && (
                        <span>Save: Rp {recommendation.estimatedSavings.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <h4 className="font-semibold text-neutral-800 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => window.location.href = '/ai-recommendations'}
            className="p-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
          >
            <Lightbulb className="w-3 h-3" />
            <span>View All AI</span>
          </button>
          <button
            onClick={() => window.location.href = '/chatbot'}
            className="p-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-1"
          >
            <Bot className="w-3 h-3" />
            <span>Chat with AI</span>
          </button>
        </div>
      </div>

      {recommendations.length === 0 && !insights && (
        <div className="text-center py-8">
          <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">
            AI recommendations will appear here once you have more financial data
          </p>
        </div>
      )}
    </div>
  );
};

export default AIDashboard; 