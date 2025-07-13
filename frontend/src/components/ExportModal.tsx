import React, { useState, useEffect } from 'react';
import { X, Download, FileText, FileSpreadsheet, FilePdf, Calendar, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import api from '../api';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOptions {
  formats: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  dateRanges: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  dataTypes: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { token } = useApp();
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions | null>(null);
  
  // Export settings
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['transactions', 'budgets', 'goals']);

  // Fetch export options
  const fetchExportOptions = async () => {
    if (!token) return;
    
    try {
      const response = await api.get('/export/options', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setExportOptions(data);
    } catch (error) {
      console.error('Error fetching export options:', error);
      toast.error('Gagal memuat opsi export');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExportOptions();
    }
  }, [isOpen, token]);

  // Handle export
  const handleExport = async () => {
    if (!token) return;
    
    setLoading(true);
    
    try {
      // Prepare date range
      let startDate, endDate;
      
      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Pilih rentang tanggal kustom');
          setLoading(false);
          return;
        }
        startDate = customStartDate;
        endDate = customEndDate;
      } else if (dateRange !== 'all') {
        const now = new Date();
        const start = new Date();
        
        switch (dateRange) {
          case 'this_month':
            start.setDate(1);
            break;
          case 'last_month':
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            break;
          case 'this_year':
            start.setMonth(0, 1);
            break;
        }
        
        startDate = start.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      }

      const exportData = {
        format,
        startDate,
        endDate,
        includeTransactions: selectedDataTypes.includes('transactions'),
        includeBudgets: selectedDataTypes.includes('budgets'),
        includeGoals: selectedDataTypes.includes('goals')
      };

      const response = await api.post('/export/all', exportData, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `laporan_keuangan_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export berhasil! File telah diunduh');
      onClose();
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengexport data');
    } finally {
      setLoading(false);
    }
  };

  // Toggle data type selection
  const toggleDataType = (type: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet size={20} />;
      case 'pdf':
        return <FilePdf size={20} />;
      case 'excel':
        return <FileSpreadsheet size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Download className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Format File</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exportOptions?.formats.map((formatOption) => (
                <button
                  key={formatOption.value}
                  onClick={() => setFormat(formatOption.value)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    format === formatOption.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getFormatIcon(formatOption.value)}
                    <div>
                      <div className="font-medium">{formatOption.label}</div>
                      <div className="text-sm text-gray-500">{formatOption.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Rentang Tanggal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportOptions?.dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    dateRange === range.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <div>
                      <div className="font-medium">{range.label}</div>
                      <div className="text-sm text-gray-500">{range.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Data Types Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Jenis Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportOptions?.dataTypes.map((dataType) => (
                <button
                  key={dataType.value}
                  onClick={() => toggleDataType(dataType.value)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedDataTypes.includes(dataType.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Filter size={16} />
                    <div>
                      <div className="font-medium">{dataType.label}</div>
                      <div className="text-sm text-gray-500">{dataType.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={loading || selectedDataTypes.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 