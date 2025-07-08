import api from '../api';

export interface ImportResult {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    importedRows: number;
    failedRows: number;
    errors: string[];
  };
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
}

export class ImportExportService {
  static async importTransactions(file: File): Promise<ImportResult> {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/import-export/transactions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      return response.data as ImportResult;
    } catch (error: any) {
      console.error('Import error:', error);
      throw new Error(error.response?.data?.message || 'Failed to import transactions');
    }
  }

  static async downloadTemplate(format: 'csv' | 'excel' = 'csv'): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/import-export/template?format=${format}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transaction_template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Template download error:', error);
      throw new Error('Failed to download template');
    }
  }

  static async exportTransactions(options: ExportOptions): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('format', options.format);
      if (options.dateFrom) params.append('dateFrom', options.dateFrom);
      if (options.dateTo) params.append('dateTo', options.dateTo);
      if (options.type) params.append('type', options.type);
      if (options.categoryId) params.append('categoryId', options.categoryId);

      const response = await api.get(`/import-export/transactions?${params.toString()}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.${options.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error('Failed to export transactions');
    }
  }

  static async exportGoals(options: ExportOptions): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('format', options.format);

      const response = await api.get(`/import-export/goals?${params.toString()}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `goals_${new Date().toISOString().split('T')[0]}.${options.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error('Failed to export goals');
    }
  }

  static async exportFinancialReport(options: ExportOptions): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('format', options.format);
      if (options.dateFrom) params.append('dateFrom', options.dateFrom);
      if (options.dateTo) params.append('dateTo', options.dateTo);

      const response = await api.get(`/import-export/financial-report?${params.toString()}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.${options.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error('Failed to export financial report');
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload CSV or Excel files only.'
      };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    return { isValid: true };
  }
}

export default ImportExportService; 