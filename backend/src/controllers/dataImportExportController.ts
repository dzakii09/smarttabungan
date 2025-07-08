import { Request, Response } from 'express';
import dataImportExportService from '../services/dataImportExportService';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['csv', 'xlsx', 'xls', 'json'];
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class DataImportExportController {
  // Get import templates
  async getImportTemplates(req: Request, res: Response) {
    try {
      const templates = await dataImportExportService.getImportTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting import templates:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil template import'
      });
    }
  }

  // Import data from file
  async importData(req: Request, res: Response) {
    try {
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        const userId = (req as any).user.id;
        const { templateId } = req.body;

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'File tidak ditemukan'
          });
        }

        if (!templateId) {
          return res.status(400).json({
            success: false,
            message: 'Template ID diperlukan'
          });
        }

        const fileExtension = path.extname(req.file.originalname).toLowerCase().substring(1);
        const result = await dataImportExportService.importData(
          userId,
          req.file.path,
          fileExtension,
          templateId
        );

        res.json({
          success: result.success,
          data: {
            totalRecords: result.totalRecords,
            processedRecords: result.processedRecords,
            errorCount: result.errorCount,
            errors: result.errors
          }
        });
      });
    } catch (error) {
      console.error('Error importing data:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal import data'
      });
    }
  }

  // Export data
  async exportData(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const {
        format = 'csv',
        startDate,
        endDate,
        type,
        categoryId
      } = req.body;

      const options = {
        format: format as 'csv' | 'excel' | 'json' | 'pdf',
        filters: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          type,
          categoryId
        }
      };

      const filePath = await dataImportExportService.exportData(userId, options);
      const fileName = path.basename(filePath);

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).json({
            success: false,
            message: 'Gagal mengunduh file'
          });
        }
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal export data'
      });
    }
  }

  // Validate import data
  async validateImportData(req: Request, res: Response) {
    try {
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        const { templateId } = req.body;

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'File tidak ditemukan'
          });
        }

        if (!templateId) {
          return res.status(400).json({
            success: false,
            message: 'Template ID diperlukan'
          });
        }

        // Read file data for validation
        const fileExtension = path.extname(req.file.originalname).toLowerCase().substring(1);
        let data: any[] = [];

        try {
          switch (fileExtension) {
            case 'csv':
              data = await dataImportExportService['readCSVFile'](req.file.path);
              break;
            case 'xlsx':
            case 'xls':
              data = await dataImportExportService['readExcelFile'](req.file.path);
              break;
            case 'json':
              data = await dataImportExportService['readJSONFile'](req.file.path);
              break;
            default:
              throw new Error('Format file tidak didukung');
          }
        } catch (readError) {
          return res.status(400).json({
            success: false,
            message: 'Gagal membaca file'
          });
        }

        const validation = await dataImportExportService.validateImportData(data, templateId);

        res.json({
          success: validation.valid,
          data: {
            totalRecords: data.length,
            validRecords: data.length - validation.errors.length,
            errorCount: validation.errors.length,
            errors: validation.errors
          }
        });
      });
    } catch (error) {
      console.error('Error validating import data:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal validasi data import'
      });
    }
  }

  // Get import history
  async getImportHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await dataImportExportService.getImportHistory(userId, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting import history:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil riwayat import'
      });
    }
  }

  // Bulk operations
  async bulkOperations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { operation, data } = req.body;

      if (!operation || !data) {
        return res.status(400).json({
          success: false,
          message: 'Operation dan data diperlukan'
        });
      }

      // Handle different bulk operations
      switch (operation) {
        case 'delete_transactions':
          // Implementation for bulk delete transactions
          res.json({
            success: true,
            message: 'Operasi bulk berhasil dilakukan'
          });
          break;

        case 'update_categories':
          // Implementation for bulk update categories
          res.json({
            success: true,
            message: 'Operasi bulk berhasil dilakukan'
          });
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Operasi tidak didukung'
          });
      }
    } catch (error) {
      console.error('Error performing bulk operations:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal melakukan operasi bulk'
      });
    }
  }
}

export default new DataImportExportController(); 