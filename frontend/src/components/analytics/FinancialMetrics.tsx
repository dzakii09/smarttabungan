import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';

interface Metric {
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

interface FinancialMetricsProps {
  metrics: Metric[];
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ metrics }) => {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp size={16} />;
      case 'negative':
        return <TrendingDown size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              {metric.icon}
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(metric.changeType)}`}>
              {getChangeIcon(metric.changeType)}
              <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
            </div>
          </div>
          
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
            <p className="text-sm text-gray-600">{metric.title}</p>
          </div>
          
          <p className="text-xs text-gray-500 leading-relaxed">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FinancialMetrics; 