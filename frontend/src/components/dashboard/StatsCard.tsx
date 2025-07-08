import React from 'react';
import { DollarSign as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: typeof LucideIcon;
  color: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700',
    secondary: 'bg-secondary-50 text-secondary-700',
    accent: 'bg-accent-50 text-accent-700',
    neutral: 'bg-neutral-50 text-neutral-700'
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    return val;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-800 font-inter">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <p className={`text-sm mt-2 flex items-center ${
              change >= 0 ? 'text-secondary-600' : 'text-red-600'
            }`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                change >= 0 ? 'bg-secondary-500' : 'bg-red-500'
              }`}></span>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% dari bulan lalu
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;