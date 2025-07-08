import { Request, Response } from 'express';
import exportService from '../services/exportService';

interface AuthRequest extends Request {
  user?: any;
}

class ExportController {
  // Export user data
  async exportData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const {
        format = 'csv',
        startDate,
        endDate,
        includeTransactions = true,
        includeBudgets = true,
        includeGoals = true,
        includeAnalytics = true
      } = req.body;

      // Validate format
      if (!['csv', 'pdf', 'excel'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format tidak didukung. Gunakan csv, pdf, atau excel'
        });
      }

      // Prepare date range
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }

      const options = {
        format,
        dateRange,
        includeTransactions,
        includeBudgets,
        includeGoals,
        includeAnalytics
      };

      const result = await exportService.exportUserData(userId, options);

      // Set headers for file download
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      // Send the file
      res.send(result.data);

    } catch (error: any) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Export transactions only
  async exportTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const {
        format = 'csv',
        startDate,
        endDate,
        type,
        categoryId
      } = req.body;

      // Validate format
      if (!['csv', 'pdf', 'excel'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format tidak didukung. Gunakan csv, pdf, atau excel'
        });
      }

      const options = {
        format,
        dateRange: startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate)
        } : undefined,
        includeTransactions: true,
        includeBudgets: false,
        includeGoals: false,
        includeAnalytics: false,
        type,
        categoryId
      };

      const result = await exportService.exportUserData(userId, options);

      // Set headers for file download
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="transaksi_${new Date().toISOString().split('T')[0]}.${format}"`);
      
      // Send the file
      res.send(result.data);

    } catch (error: any) {
      console.error('Export transactions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Export budgets only
  async exportBudgets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { format = 'csv' } = req.body;

      // Validate format
      if (!['csv', 'pdf', 'excel'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format tidak didukung. Gunakan csv, pdf, atau excel'
        });
      }

      const options = {
        format,
        includeTransactions: false,
        includeBudgets: true,
        includeGoals: false,
        includeAnalytics: false
      };

      const result = await exportService.exportUserData(userId, options);

      // Set headers for file download
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="anggaran_${new Date().toISOString().split('T')[0]}.${format}"`);
      
      // Send the file
      res.send(result.data);

    } catch (error: any) {
      console.error('Export budgets error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Export goals only
  async exportGoals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { format = 'csv' } = req.body;

      // Validate format
      if (!['csv', 'pdf', 'excel'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format tidak didukung. Gunakan csv, pdf, atau excel'
        });
      }

      const options = {
        format,
        includeTransactions: false,
        includeBudgets: false,
        includeGoals: true,
        includeAnalytics: false
      };

      const result = await exportService.exportUserData(userId, options);

      // Set headers for file download
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="tujuan_${new Date().toISOString().split('T')[0]}.${format}"`);
      
      // Send the file
      res.send(result.data);

    } catch (error: any) {
      console.error('Export goals error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get export options
  async getExportOptions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const options = {
        formats: [
          { value: 'csv', label: 'CSV (Excel)', description: 'Format spreadsheet yang dapat dibuka di Excel' },
          { value: 'pdf', label: 'PDF', description: 'Format dokumen yang mudah dibaca dan dicetak' },
          { value: 'excel', label: 'Excel', description: 'Format Excel asli (dalam pengembangan)' }
        ],
        dateRanges: [
          { value: 'all', label: 'Semua Data', description: 'Export semua data tanpa batasan waktu' },
          { value: 'this_month', label: 'Bulan Ini', description: 'Data bulan berjalan' },
          { value: 'last_month', label: 'Bulan Lalu', description: 'Data bulan sebelumnya' },
          { value: 'this_year', label: 'Tahun Ini', description: 'Data tahun berjalan' },
          { value: 'custom', label: 'Kustom', description: 'Pilih rentang tanggal sendiri' }
        ],
        dataTypes: [
          { value: 'transactions', label: 'Transaksi', description: 'Data transaksi keuangan' },
          { value: 'budgets', label: 'Anggaran', description: 'Data anggaran dan budget' },
          { value: 'goals', label: 'Tujuan Keuangan', description: 'Data tujuan dan target keuangan' },
          { value: 'analytics', label: 'Analisis', description: 'Data analisis dan statistik' }
        ]
      };

      res.json({
        success: true,
        data: options
      });

    } catch (error: any) {
      console.error('Get export options error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
}

export default new ExportController(); 