import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Upload, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sampleData: any[];
}

interface ImportHistory {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  createdAt: string;
}

const DataImportExport: React.FC = () => {
  const { token } = useApp();
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'history'>('import');

  // Export form state
  const [exportForm, setExportForm] = useState({
    format: 'csv',
    startDate: '',
    endDate: '',
    type: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchImportHistory();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/data/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await fetch('/api/data/import-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setImportHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const importData = async () => {
    if (!selectedFile || !selectedTemplate) {
      alert('Pilih file dan template terlebih dahulu');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('templateId', selectedTemplate);

      const response = await fetch('/api/data/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert(`Import berhasil! ${data.data.processedRecords} data diproses.`);
        setSelectedFile(null);
        setSelectedTemplate('');
        fetchImportHistory();
      } else {
        alert(`Import gagal: ${data.message}`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Gagal import data');
    } finally {
      setUploading(false);
    }
  };

  const validateData = async () => {
    if (!selectedFile || !selectedTemplate) {
      alert('Pilih file dan template terlebih dahulu');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('templateId', selectedTemplate);

      const response = await fetch('/api/data/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert(`Validasi berhasil! ${data.data.validRecords} data valid dari ${data.data.totalRecords} total.`);
      } else {
        alert(`Validasi gagal: ${data.message}`);
      }
    } catch (error) {
      console.error('Error validating data:', error);
      alert('Gagal validasi data');
    } finally {
      setUploading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/data/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(exportForm)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${Date.now()}.${exportForm.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('Export berhasil!');
      } else {
        const data = await response.json();
        alert(`Export gagal: ${data.message}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal export data');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'csv':
        return <FileText className="w-6 h-6" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-6 h-6" />;
      case 'json':
        return <FileJson className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Import & Export Data
          </h1>
          <p className="text-gray-600">
            Import data dari file atau export data ke berbagai format
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('import')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'import'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Import Data
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Export Data
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Riwayat Import
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'import' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Import Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h3>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.xls,.json"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Klik untuk memilih file atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      CSV, Excel, atau JSON (max 10MB)
                    </p>
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={validateData}
                  disabled={!selectedFile || !selectedTemplate || uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Validasi
                </button>
                <button
                  onClick={importData}
                  disabled={!selectedFile || !selectedTemplate || uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Clock className="w-4 h-4 inline mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 inline mr-2" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Templates Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Tersedia</h3>
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Field yang diperlukan:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map(field => (
                          <span key={field} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    {template.sampleData.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                          Lihat contoh data
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <pre className="text-xs text-gray-700">
                            {JSON.stringify(template.sampleData[0], null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format Export
                </label>
                <select
                  value={exportForm.format}
                  onChange={(e) => setExportForm({...exportForm, format: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rentang Tanggal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={exportForm.startDate}
                    onChange={(e) => setExportForm({...exportForm, startDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dari"
                  />
                  <input
                    type="date"
                    value={exportForm.endDate}
                    onChange={(e) => setExportForm({...exportForm, endDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sampai"
                  />
                </div>
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Transaksi
                </label>
                <select
                  value={exportForm.type}
                  onChange={(e) => setExportForm({...exportForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori (Opsional)
                </label>
                <input
                  type="text"
                  value={exportForm.categoryId}
                  onChange={(e) => setExportForm({...exportForm, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID Kategori"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Riwayat Import</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Errors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importHistory.map(importItem => (
                    <tr key={importItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(importItem.fileType)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{importItem.fileName}</p>
                            <p className="text-sm text-gray-500">{importItem.fileType.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(importItem.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {importItem.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {importItem.processedRecords} / {importItem.totalRecords}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {importItem.errorCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(importItem.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importHistory.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada riwayat import</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataImportExport; 