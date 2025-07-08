import React from 'react';
import { BarChart3 } from 'lucide-react';

const AnalyticsSummary: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">
          Ringkasan Analisis
        </h3>
        <BarChart3 className="w-5 h-5 text-neutral-400" />
      </div>
      
      <div className="h-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-sm">Analisis detail tersedia di halaman Analytics</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSummary; 