import { PrismaClient } from '../../generated/prisma';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sampleData: any[];
}

interface ImportResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  errors: string[];
  data: any[];
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    categoryId?: string;
  };
  fields?: string[];
}

class DataImportExportService {
  private readonly importTemplates: ImportTemplate[] = [
    {
      id: 'transactions',
      name: 'Template Transaksi',
      description: 'Template untuk import data transaksi',
      fields: ['date', 'amount', 'type', 'description', 'category'],
      sampleData: [
        {
          date: '2024-01-01',
          amount: '100000',
          type: 'expense',
          description: 'Makan siang',
          category: 'Makanan & Minuman'
        }
      ]
    },
    {
      id: 'bank-statement',
      name: 'Template Laporan Bank',
      description: 'Template untuk import laporan bank',
      fields: ['date', 'description', 'debit', 'credit', 'balance'],
      sampleData: [
        {
          date: '2024-01-01',
          description: 'Transfer masuk',
          debit: '',
          credit: '1000000',
          balance: '5000000'
        }
      ]
    }
  ];

  // Get import templates
  async getImportTemplates(): Promise<ImportTemplate[]> {
    return this.importTemplates;
  }

  // Import data from file
  async importData(
    userId: string,
    filePath: string,
    fileType: string,
    templateId: string
  ): Promise<ImportResult> {
    try {
      // Create import record
      const importRecord = await prisma.dataImport.create({
        data: {
          userId,
          fileName: path.basename(filePath),
          fileType,
          status: 'processing',
          totalRecords: 0,
          processedRecords: 0,
          errorCount: 0
        }
      });

      let data: any[] = [];
      const errors: string[] = [];

      // Read file based on type
      switch (fileType.toLowerCase()) {
        case 'csv':
          data = await this.readCSVFile(filePath);
          break;
        case 'xlsx':
        case 'xls':
          data = await this.readExcelFile(filePath);
          break;
        case 'json':
          data = await this.readJSONFile(filePath);
          break;
        default:
          throw new Error('Format file tidak didukung');
      }

      // Validate and process data
      const processedData = await this.processImportData(data, templateId, userId, errors);

      // Update import record
      await prisma.dataImport.update({
        where: { id: importRecord.id },
        data: {
          status: errors.length > 0 ? 'failed' : 'completed',
          totalRecords: data.length,
          processedRecords: processedData.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : null
        }
      });

      return {
        success: errors.length === 0,
        totalRecords: data.length,
        processedRecords: processedData.length,
        errorCount: errors.length,
        errors,
        data: processedData
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error(`Gagal import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Read CSV file
  private async readCSVFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv.default())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Read Excel file
  private async readExcelFile(filePath: string): Promise<any[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  // Read JSON file
  private async readJSONFile(filePath: string): Promise<any[]> {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [data];
  }

  // Process import data
  private async processImportData(
    data: any[],
    templateId: string,
    userId: string,
    errors: string[]
  ): Promise<any[]> {
    const processedData: any[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        let processedRow: any = {};

        switch (templateId) {
          case 'transactions':
            processedRow = await this.processTransactionRow(row, userId);
            break;
          case 'bank-statement':
            processedRow = await this.processBankStatementRow(row, userId);
            break;
          default:
            throw new Error(`Template ${templateId} tidak dikenali`);
        }

        if (processedRow) {
          processedData.push(processedRow);
        }
      } catch (error) {
        const errorMessage = `Baris ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
      }
    }

    return processedData;
  }

  // Process transaction row
  private async processTransactionRow(row: any, userId: string): Promise<any> {
    // Validate required fields
    if (!row.date || !row.amount || !row.type || !row.description) {
      throw new Error('Data tanggal, jumlah, tipe, dan deskripsi diperlukan');
    }

    // Parse date
    const date = new Date(row.date);
    if (isNaN(date.getTime())) {
      throw new Error('Format tanggal tidak valid');
    }

    // Parse amount
    const amount = parseFloat(row.amount);
    if (isNaN(amount)) {
      throw new Error('Jumlah tidak valid');
    }

    // Validate type
    if (!['income', 'expense'].includes(row.type)) {
      throw new Error('Tipe harus income atau expense');
    }

    // Find or create category
    let categoryId = null;
    if (row.category) {
      const category = await prisma.category.findFirst({
        where: {
          name: row.category,
          type: row.type
        }
      });

      if (category) {
        categoryId = category.id;
      } else {
        // Create new category
        const newCategory = await prisma.category.create({
          data: {
            name: row.category,
            type: row.type,
            color: this.getRandomColor()
          }
        });
        categoryId = newCategory.id;
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: row.type,
        description: row.description,
        date,
        categoryId
      }
    });

    return transaction;
  }

  // Process bank statement row
  private async processBankStatementRow(row: any, userId: string): Promise<any> {
    // Validate required fields
    if (!row.date || !row.description) {
      throw new Error('Data tanggal dan deskripsi diperlukan');
    }

    // Parse date
    const date = new Date(row.date);
    if (isNaN(date.getTime())) {
      throw new Error('Format tanggal tidak valid');
    }

    // Determine amount and type
    let amount = 0;
    let type = 'expense';

    if (row.debit && parseFloat(row.debit) > 0) {
      amount = parseFloat(row.debit);
      type = 'expense';
    } else if (row.credit && parseFloat(row.credit) > 0) {
      amount = parseFloat(row.credit);
      type = 'income';
    } else {
      throw new Error('Data debit atau credit diperlukan');
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        description: row.description,
        date
      }
    });

    return transaction;
  }

  // Get random color for category
  private getRandomColor(): string {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Export data
  async exportData(userId: string, options: ExportOptions): Promise<string> {
    try {
      // Build query filters
      const where: any = { userId };

      if (options.filters) {
        if (options.filters.startDate || options.filters.endDate) {
          where.date = {};
          if (options.filters.startDate) {
            where.date.gte = options.filters.startDate;
          }
          if (options.filters.endDate) {
            where.date.lte = options.filters.endDate;
          }
        }

        if (options.filters.type) {
          where.type = options.filters.type;
        }

        if (options.filters.categoryId) {
          where.categoryId = options.filters.categoryId;
        }
      }

      // Fetch data
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { date: 'desc' }
      });

      // Transform data
      const exportData = transactions.map(tx => ({
        id: tx.id,
        date: tx.date.toISOString().split('T')[0],
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        category: tx.category?.name || '',
        createdAt: tx.createdAt.toISOString()
      }));

      // Export based on format
      const fileName = `export_${Date.now()}`;
      let filePath = '';

      switch (options.format) {
        case 'csv':
          filePath = await this.exportToCSV(exportData, fileName);
          break;
        case 'excel':
          filePath = await this.exportToExcel(exportData, fileName);
          break;
        case 'json':
          filePath = await this.exportToJSON(exportData, fileName);
          break;
        case 'pdf':
          filePath = await this.exportToPDF(exportData, fileName);
          break;
        default:
          throw new Error('Format export tidak didukung');
      }

      return filePath;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Gagal export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export to CSV
  private async exportToCSV(data: any[], fileName: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'uploads', `${fileName}.csv`);
    
    // Convert data to CSV format
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf8');
    return filePath;
  }

  // Export to Excel
  private async exportToExcel(data: any[], fileName: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'uploads', `${fileName}.xlsx`);
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, filePath);

    return filePath;
  }

  // Export to JSON
  private async exportToJSON(data: any[], fileName: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'uploads', `${fileName}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
  }

  // Export to PDF (simplified)
  private async exportToPDF(data: any[], fileName: string): Promise<string> {
    // For now, return JSON file as PDF is complex to implement
    // In real implementation, use libraries like puppeteer or jsPDF
    return this.exportToJSON(data, fileName);
  }

  // Get import history
  async getImportHistory(userId: string, limit = 20) {
    try {
      const imports = await prisma.dataImport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return {
        success: true,
        data: imports
      };
    } catch (error) {
      console.error('Error getting import history:', error);
      throw new Error('Gagal mengambil riwayat import');
    }
  }

  // Validate import data
  async validateImportData(data: any[], templateId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        switch (templateId) {
          case 'transactions':
            this.validateTransactionRow(row, i + 1, errors);
            break;
          case 'bank-statement':
            this.validateBankStatementRow(row, i + 1, errors);
            break;
          default:
            errors.push(`Baris ${i + 1}: Template tidak dikenali`);
        }
      } catch (error) {
        errors.push(`Baris ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate transaction row
  private validateTransactionRow(row: any, rowNumber: number, errors: string[]) {
    if (!row.date) {
      errors.push(`Baris ${rowNumber}: Tanggal diperlukan`);
    } else {
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        errors.push(`Baris ${rowNumber}: Format tanggal tidak valid`);
      }
    }

    if (!row.amount) {
      errors.push(`Baris ${rowNumber}: Jumlah diperlukan`);
    } else if (isNaN(parseFloat(row.amount))) {
      errors.push(`Baris ${rowNumber}: Jumlah tidak valid`);
    }

    if (!row.type) {
      errors.push(`Baris ${rowNumber}: Tipe diperlukan`);
    } else if (!['income', 'expense'].includes(row.type)) {
      errors.push(`Baris ${rowNumber}: Tipe harus income atau expense`);
    }

    if (!row.description) {
      errors.push(`Baris ${rowNumber}: Deskripsi diperlukan`);
    }
  }

  // Validate bank statement row
  private validateBankStatementRow(row: any, rowNumber: number, errors: string[]) {
    if (!row.date) {
      errors.push(`Baris ${rowNumber}: Tanggal diperlukan`);
    } else {
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        errors.push(`Baris ${rowNumber}: Format tanggal tidak valid`);
      }
    }

    if (!row.description) {
      errors.push(`Baris ${rowNumber}: Deskripsi diperlukan`);
    }

    if (!row.debit && !row.credit) {
      errors.push(`Baris ${rowNumber}: Data debit atau credit diperlukan`);
    }
  }
}

export default new DataImportExportService(); 