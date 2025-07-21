import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface SpendingInsight {
  type: 'positive' | 'negative' | 'warning' | 'suggestion';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface SpendingInsightsProps {
  insights: SpendingInsight[];
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({ insights }) => {
  const [expanded, setExpanded] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp size={20} />;
      case 'negative':
        return <TrendingDown size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'suggestion':
        return <Lightbulb size={20} />;
      default:
        return <Target size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'suggestion':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? 'Sembunyikan' : 'Lihat Semua'}
        </button>
      </div>
      
      <div className="space-y-3">
        {insights.slice(0, expanded ? insights.length : 3).map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getColor(insight.type)} transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!expanded && insights.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Lihat {insights.length - 3} insight lainnya
          </button>
        </div>
      )}
    </div>
  );
};

export default SpendingInsights; 