import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import ImportExportService, { ImportResult } from '../../services/importExportService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validation = ImportExportService.validateFile(selectedFile);
      if (validation.isValid) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError(validation.error || 'Invalid file');
        setFile(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const validation = ImportExportService.validateFile(droppedFile);
      if (validation.isValid) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError(validation.error || 'Invalid file');
        setFile(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await ImportExportService.importTransactions(file);
      setImportResult(result);
      if (result.success) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to import transactions');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      await ImportExportService.downloadTemplate(format);
    } catch (error: any) {
      setError(error.message || 'Failed to download template');
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-neutral-800">Import Transaksi</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-medium text-blue-800 mb-3">Download Template</h3>
          <p className="text-sm text-blue-600 mb-3">
            Download template untuk memastikan format file yang benar
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownloadTemplate('csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={16} />
              <span>CSV Template</span>
            </button>
            <button
              onClick={() => handleDownloadTemplate('excel')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={16} />
              <span>Excel Template</span>
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-800 mb-3">Upload File</h3>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? 'border-green-300 bg-green-50' : 'border-neutral-300 hover:border-primary-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div>
                <Upload size={48} className="mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 mb-2">
                  Drag and drop file CSV atau Excel di sini
                </p>
                <p className="text-sm text-neutral-500 mb-4">
                  atau klik untuk memilih file
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Pilih File
                </button>
              </div>
            ) : (
              <div>
                <FileText size={48} className="mx-auto text-green-500 mb-4" />
                <p className="text-green-700 font-medium mb-2">{file.name}</p>
                <p className="text-sm text-green-600 mb-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Ganti File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              {importResult.success ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <AlertCircle size={20} className="text-yellow-500" />
              )}
              <h3 className="font-medium text-neutral-800">
                {importResult.success ? 'Import Berhasil' : 'Import Sebagian Berhasil'}
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-800">{importResult.data.totalRows}</p>
                <p className="text-sm text-neutral-600">Total Rows</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.data.importedRows}</p>
                <p className="text-sm text-neutral-600">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{importResult.data.failedRows}</p>
                <p className="text-sm text-neutral-600">Failed</p>
              </div>
            </div>

            {importResult.data.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-neutral-700 mb-2">Errors:</p>
                <div className="max-h-32 overflow-y-auto">
                  {importResult.data.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 mb-1">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal; 