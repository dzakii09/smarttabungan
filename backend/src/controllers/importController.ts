import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { ImportService } from '../services/importService';

// Configure multer for file upload
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
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const importTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let importResult;
    
    if (fileExtension === '.csv') {
      importResult = await ImportService.importFromCSV(filePath, userId);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      importResult = await ImportService.importFromExcel(filePath, userId);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.json({
      success: importResult.success,
      message: importResult.message,
      data: {
        totalRows: importResult.totalRows,
        importedRows: importResult.importedRows,
        failedRows: importResult.failedRows,
        errors: importResult.errors
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Import failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getImportTemplate = async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'csv';
    
    if (format === 'csv') {
      const csvTemplate = `date,description,amount,type,category,tags
2024-01-01,Gaji Bulanan,5000000,income,Gaji,
2024-01-02,Makan Siang,50000,expense,Makanan,
2024-01-03,Bensin,100000,expense,Transportasi,`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transaction_template.csv');
      res.send(csvTemplate);
    } else if (format === 'excel') {
      // For Excel, we'll create a simple JSON template that can be converted
      const excelTemplate = [
        {
          date: '2024-01-01',
          description: 'Gaji Bulanan',
          amount: 5000000,
          type: 'income',
          category: 'Gaji',
          tags: ''
        },
        {
          date: '2024-01-02',
          description: 'Makan Siang',
          amount: 50000,
          type: 'expense',
          category: 'Makanan',
          tags: ''
        }
      ];
      
      res.json({
        message: 'Excel template structure',
        columns: ['date', 'description', 'amount', 'type', 'category', 'tags'],
        sampleData: excelTemplate
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use "csv" or "excel"' });
    }
  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
};

// Export the upload middleware for use in routes
export { upload }; 