import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import prisma from '../utils/database';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: string[];
  message: string;
}

export interface TransactionRow {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  tags?: string;
}

export class ImportService {
  static async importFromCSV(filePath: string, userId: string): Promise<ImportResult> {
    const results: TransactionRow[] = [];
    const errors: string[] = [];
    let rowNumber = 0;

    return new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv.default())
        .on('data', (data) => {
          rowNumber++;
          try {
            const row = this.parseCSVRow(data, rowNumber);
            if (row) {
              results.push(row);
            }
          } catch (error) {
            errors.push(`Row ${rowNumber}: ${error}`);
          }
        })
        .on('end', async () => {
          const importResult = await this.saveTransactions(results, userId);
          importResult.totalRows = rowNumber;
          importResult.errors = [...importResult.errors, ...errors];
          
          // Clean up file
          fs.unlinkSync(filePath);
          
          resolve(importResult);
        })
        .on('error', (error) => {
          errors.push(`File read error: ${error.message}`);
          fs.unlinkSync(filePath);
          resolve({
            success: false,
            totalRows: rowNumber,
            importedRows: 0,
            failedRows: rowNumber,
            errors,
            message: 'Failed to read CSV file'
          });
        });
    });
  }

  static async importFromExcel(filePath: string, userId: string): Promise<ImportResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const results: TransactionRow[] = [];
      const errors: string[] = [];

      data.forEach((row: any, index: number) => {
        try {
          const parsedRow = this.parseExcelRow(row, index + 1);
          if (parsedRow) {
            results.push(parsedRow);
          }
        } catch (error) {
          errors.push(`Row ${index + 1}: ${error}`);
        }
      });

      const importResult = await this.saveTransactions(results, userId);
      importResult.totalRows = data.length;
      importResult.errors = [...importResult.errors, ...errors];

      // Clean up file
      fs.unlinkSync(filePath);

      return importResult;
    } catch (error) {
      // Clean up file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return {
        success: false,
        totalRows: 0,
        importedRows: 0,
        failedRows: 0,
        errors: [`Excel parsing error: ${error}`],
        message: 'Failed to parse Excel file'
      };
    }
  }

  private static parseCSVRow(data: any, rowNumber: number): TransactionRow | null {
    // Expected columns: date, description, amount, type, category, tags
    const date = data.date || data.Date || data.DATE;
    const description = data.description || data.Description || data.DESC || data.desc;
    const amount = data.amount || data.Amount || data.AMOUNT;
    const type = data.type || data.Type || data.TYPE;
    const category = data.category || data.Category || data.CATEGORY;
    const tags = data.tags || data.Tags || data.TAGS;

    if (!date || !description || !amount || !type) {
      throw new Error('Missing required fields: date, description, amount, type');
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    const parsedType = type.toLowerCase();
    if (parsedType !== 'income' && parsedType !== 'expense') {
      throw new Error(`Invalid type: ${type}. Must be 'income' or 'expense'`);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    return {
      date: parsedDate.toISOString(),
      description: description.trim(),
      amount: parsedAmount,
      type: parsedType as 'income' | 'expense',
      category: category?.trim(),
      tags: tags?.trim()
    };
  }

  private static parseExcelRow(data: any, rowNumber: number): TransactionRow | null {
    // Similar to CSV parsing but handle Excel-specific data types
    const date = data.date || data.Date || data.DATE;
    const description = data.description || data.Description || data.DESC || data.desc;
    const amount = data.amount || data.Amount || data.AMOUNT;
    const type = data.type || data.Type || data.TYPE;
    const category = data.category || data.Category || data.CATEGORY;
    const tags = data.tags || data.Tags || data.TAGS;

    if (!date || !description || !amount || !type) {
      throw new Error('Missing required fields: date, description, amount, type');
    }

    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(parsedAmount)) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    const parsedType = type.toString().toLowerCase();
    if (parsedType !== 'income' && parsedType !== 'expense') {
      throw new Error(`Invalid type: ${type}. Must be 'income' or 'expense'`);
    }

    // Handle Excel date format
    let parsedDate: Date;
    if (typeof date === 'number') {
      // Excel date as number
      parsedDate = new Date((date - 25569) * 86400 * 1000);
    } else {
      parsedDate = new Date(date);
    }
    
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    return {
      date: parsedDate.toISOString(),
      description: description.toString().trim(),
      amount: parsedAmount,
      type: parsedType as 'income' | 'expense',
      category: category?.toString().trim(),
      tags: tags?.toString().trim()
    };
  }

  private static async saveTransactions(transactions: TransactionRow[], userId: string): Promise<ImportResult> {
    const errors: string[] = [];
    let importedCount = 0;

    for (const transaction of transactions) {
      try {
        // Find or create category if provided
        let categoryId: string | undefined;
        if (transaction.category) {
          const category = await prisma.category.findFirst({
            where: {
              name: transaction.category,
              type: transaction.type
            }
          });

          if (!category) {
            // Create new category
            const newCategory = await prisma.category.create({
              data: {
                name: transaction.category,
                type: transaction.type,
                icon: '📁', // Default icon
                color: transaction.type === 'income' ? '#10B981' : '#EF4444'
              }
            });
            categoryId = newCategory.id;
          } else {
            categoryId = category.id;
          }
        }

        // Create transaction
        await prisma.transaction.create({
          data: {
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            date: new Date(transaction.date),
            userId,
            categoryId
          }
        });

        importedCount++;
      } catch (error) {
        errors.push(`Failed to import transaction "${transaction.description}": ${error}`);
      }
    }

    return {
      success: importedCount > 0,
      totalRows: transactions.length,
      importedRows: importedCount,
      failedRows: transactions.length - importedCount,
      errors,
      message: `Successfully imported ${importedCount} out of ${transactions.length} transactions`
    };
  }
} 