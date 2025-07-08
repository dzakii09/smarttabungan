import React, { useState } from 'react';
import { Download, Calendar, FileText, BarChart3, TrendingUp, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: string, startDate: string, endDate: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [exportType, setExportType] = useState('transactions');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(exportType, startDate, endDate);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const exportOptions = [
    {
      id: 'transactions',
      title: 'Data Transaksi',
      description: 'Export semua data transaksi dalam format JSON',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 'analytics',
      title: 'Laporan Analytics',
      description: 'Export laporan analisis lengkap dengan charts data',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      id: 'budgets',
      title: 'Data Budget',
      description: 'Export data budget dan performa tracking',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Export Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Jenis Export
          </label>
          <div className="space-y-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportType === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={option.id}
                    checked={exportType === option.id}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mt-1"
                  />
                  <Icon className={`w-5 h-5 ${option.color} mt-0.5`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rentang Tanggal
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="mb-6">
          <label className="block text-xs text-gray-600 mb-2">Preset Cepat</label>
          <div className="flex gap-2">
            {[
              { label: '7 Hari', days: 7 },
              { label: '30 Hari', days: 30 },
              { label: '90 Hari', days: 90 }
            ].map((preset) => (
              <button
                key={preset.days}
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - preset.days);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 