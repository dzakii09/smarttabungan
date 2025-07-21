import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface ComparisonData {
  name: string;
  current: number;
  previous: number;
  target?: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title: string;
  type: 'bar' | 'line';
  currentPeriod: string;
  previousPeriod: string;
  formatValue?: (value: number) => string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  title,
  type,
  currentPeriod,
  previousPeriod,
  formatValue = (value) => value.toString()
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filteredData = selectedPeriod === 'all' 
    ? data 
    : data.slice(-parseInt(selectedPeriod));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">Perbandingan {currentPeriod} vs {previousPeriod}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Data</option>
            <option value="3">3 Bulan Terakhir</option>
            <option value="6">6 Bulan Terakhir</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="current" fill="#3B82F6" name={currentPeriod} />
            <Bar dataKey="previous" fill="#E5E7EB" name={previousPeriod} />
            {data[0]?.target && <Bar dataKey="target" fill="#10B981" name="Target" />}
          </BarChart>
        ) : (
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="current" stroke="#3B82F6" strokeWidth={3} name={currentPeriod} />
            <Line type="monotone" dataKey="previous" stroke="#E5E7EB" strokeWidth={2} name={previousPeriod} />
            {data[0]?.target && (
              <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart; 