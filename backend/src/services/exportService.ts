import * as XLSX from 'xlsx';
import prisma from '../utils/database';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeTransactions?: boolean;
  includeBudgets?: boolean;
  includeGoals?: boolean;
  includeAnalytics?: boolean;
}

interface ExportData {
  transactions: any[];
  budgets: any[];
  goals: any[];
  analytics: any;
  summary: any;
}

export class ExportService {
  static async exportTransactions(userId: string, options: ExportOptions) {
    try {
      // Build query filters
      const where: any = { userId };
      
      if (options.dateFrom || options.dateTo) {
        where.date = {};
        if (options.dateFrom) {
          where.date.gte = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          where.date.lte = new Date(options.dateTo);
        }
      }
      
      if (options.type && options.type !== 'all') {
        where.type = options.type;
      }
      
      if (options.categoryId) {
        where.categoryId = options.categoryId;
      }

      // Fetch transactions with category info
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Transform data for export
      const exportData = transactions.map(t => ({
        Date: t.date.toISOString().split('T')[0],
        Description: t.description,
        Amount: t.amount,
        Type: t.type,
        Category: t.category?.name || 'Uncategorized',
        Created: t.createdAt.toISOString().split('T')[0]
      }));

      if (options.format === 'csv') {
        return this.generateCSV(exportData, 'transactions');
      } else if (options.format === 'excel') {
        return this.generateExcel(exportData, 'transactions');
      } else if (options.format === 'pdf') {
        return this.generatePDF(exportData, 'transactions');
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export transactions');
    }
  }

  static async exportGoals(userId: string, options: ExportOptions) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const exportData = goals.map(g => ({
        Title: g.title,
        Description: g.description || '',
        TargetAmount: g.targetAmount,
        CurrentAmount: g.currentAmount,
        Progress: `${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%`,
        TargetDate: g.targetDate ? g.targetDate.toISOString().split('T')[0] : '',
        Status: g.isCompleted ? 'Completed' : 'In Progress',
        Created: g.createdAt.toISOString().split('T')[0]
      }));

      if (options.format === 'csv') {
        return this.generateCSV(exportData, 'goals');
      } else if (options.format === 'excel') {
        return this.generateExcel(exportData, 'goals');
      } else if (options.format === 'pdf') {
        return this.generatePDF(exportData, 'goals');
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export goals');
    }
  }

  static async exportFinancialReport(userId: string, options: ExportOptions) {
    try {
      // Get date range
      const dateFrom = options.dateFrom ? new Date(options.dateFrom) : new Date(new Date().getFullYear(), 0, 1); // Start of year
      const dateTo = options.dateTo ? new Date(options.dateTo) : new Date();

      // Fetch transactions
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: dateFrom,
            lte: dateTo
          }
        },
        include: {
          category: true
        }
      });

      // Calculate summary
      const income = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');
      
      const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
      const netIncome = totalIncome - totalExpenses;

      // Category breakdown
      const categoryBreakdown = expenses.reduce((acc, t) => {
        const categoryName = t.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

      const reportData = {
        summary: {
          period: `${dateFrom.toISOString().split('T')[0]} to ${dateTo.toISOString().split('T')[0]}`,
          totalIncome,
          totalExpenses,
          netIncome,
          transactionCount: transactions.length
        },
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({
          Category: category,
          Amount: amount,
          Percentage: `${((amount / totalExpenses) * 100).toFixed(1)}%`
        })),
        transactions: transactions.map(t => ({
          Date: t.date.toISOString().split('T')[0],
          Description: t.description,
          Amount: t.amount,
          Type: t.type,
          Category: t.category?.name || 'Uncategorized'
        }))
      };

      if (options.format === 'csv') {
        return this.generateCSV(reportData.transactions, 'financial_report');
      } else if (options.format === 'excel') {
        return this.generateExcel(reportData.transactions, 'financial_report');
      } else if (options.format === 'pdf') {
        return this.generatePDF(reportData.transactions, 'financial_report');
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export financial report');
    }
  }

  private static generateCSV(data: any[], filename: string) {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return {
      content: csvContent,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv'
    };
  }

  private static generateExcel(data: any[], filename: string) {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      content: excelBuffer,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  private static generatePDF(data: any[], filename: string) {
    // For now, we'll return a simple text representation
    // In a real implementation, you'd use a library like puppeteer or jsPDF
    const pdfContent = `Financial Report\n\n${data.map(row => 
      Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')
    ).join('\n')}`;

    return {
      content: pdfContent,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.txt`,
      contentType: 'text/plain'
    };
  }

  // Export user data
  async exportUserData(userId: string, options: ExportOptions): Promise<{ data: string | Buffer, filename: string, contentType: string }> {
    try {
      const exportData = await this.gatherExportData(userId, options);
      
      switch (options.format) {
        case 'csv':
          return await this.exportToCSV(exportData, options);
        case 'pdf':
          return await this.exportToPDF(exportData, options);
        case 'excel':
          return await this.exportToExcel(exportData, options);
        default:
          throw new Error('Format tidak didukung');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Gather all export data
  private async gatherExportData(userId: string, options: ExportOptions): Promise<ExportData> {
    const whereClause: any = { userId };
    
    if (options.dateRange) {
      whereClause.date = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    const [transactions, budgets, goals, analytics] = await Promise.all([
      options.includeTransactions !== false ? this.getTransactions(userId, whereClause) : [],
      options.includeBudgets !== false ? this.getBudgets(userId) : [],
      options.includeGoals !== false ? this.getGoals(userId) : [],
      options.includeAnalytics !== false ? this.getAnalytics(userId, options.dateRange) : null
    ]);

    const summary = this.generateSummary(transactions, budgets, goals, analytics);

    return {
      transactions,
      budgets,
      goals,
      analytics,
      summary
    };
  }

  // Get transactions for export
  private async getTransactions(userId: string, whereClause: any) {
    return await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    });
  }

  // Get budgets for export
  private async getBudgets(userId: string) {
    return await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get goals for export
  private async getGoals(userId: string) {
    return await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get analytics data
  private async getAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
    const whereClause: any = { userId };
    
    if (dateRange) {
      whereClause.date = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const [totalIncome, totalExpense, categoryStats, monthlyStats] = await Promise.all([
      this.getTotalIncome(userId, whereClause),
      this.getTotalExpense(userId, whereClause),
      this.getCategoryStats(userId, whereClause),
      this.getMonthlyStats(userId, dateRange)
    ]);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryStats,
      monthlyStats
    };
  }

  // Get total income
  private async getTotalIncome(userId: string, whereClause: any) {
    const result = await prisma.transaction.aggregate({
      where: { ...whereClause, type: 'income' },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  // Get total expense
  private async getTotalExpense(userId: string, whereClause: any) {
    const result = await prisma.transaction.aggregate({
      where: { ...whereClause, type: 'expense' },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  // Get category statistics
  private async getCategoryStats(userId: string, whereClause: any) {
    const transactions = await prisma.transaction.findMany({
      where: { ...whereClause, type: 'expense' },
      include: { category: true }
    });

    const categoryMap = new Map();
    
    transactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Tanpa Kategori';
      const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
      existing.amount += transaction.amount;
      existing.count += 1;
      categoryMap.set(categoryName, existing);
    });

    return Array.from(categoryMap.entries()).map(([name, data]: [string, any]) => ({
      category: name,
      amount: data.amount,
      count: data.count,
      percentage: 0 // Will be calculated in summary
    }));
  }

  // Get monthly statistics
  private async getMonthlyStats(userId: string, dateRange?: { start: Date; end: Date }) {
    const whereClause: any = { userId };
    
    if (dateRange) {
      whereClause.date = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      select: {
        amount: true,
        type: true,
        date: true
      },
      orderBy: { date: 'asc' }
    });

    const monthlyMap = new Map();
    
    transactions.forEach(transaction => {
      const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { income: 0, expense: 0 };
      
      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }
      
      monthlyMap.set(month, existing);
    });

    return Array.from(monthlyMap.entries()).map(([month, data]: [string, any]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    }));
  }

  // Generate summary
  private generateSummary(transactions: any[], budgets: any[], goals: any[], analytics: any) {
    const totalTransactions = transactions.length;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const activeBudgets = budgets.filter(b => b.isActive).length;
    const activeGoals = goals.filter(g => !g.isCompleted).length;
    const completedGoals = goals.filter(g => g.isCompleted).length;

    return {
      totalTransactions,
      totalIncome,
      totalExpense,
      balance,
      activeBudgets,
      activeGoals,
      completedGoals,
      savingsRate: totalIncome > 0 ? (balance / totalIncome) * 100 : 0,
      exportDate: new Date().toLocaleDateString('id-ID')
    };
  }

  // Export to CSV
  private async exportToCSV(data: ExportData, options: ExportOptions): Promise<{ data: string, filename: string, contentType: string }> {
    const csvData: any[] = [];
    
    // Add summary
    csvData.push(['LAPORAN KEUANGAN', '']);
    csvData.push(['Tanggal Export', data.summary.exportDate]);
    csvData.push(['Total Transaksi', data.summary.totalTransactions]);
    csvData.push(['Total Pemasukan', this.formatCurrency(data.summary.totalIncome)]);
    csvData.push(['Total Pengeluaran', this.formatCurrency(data.summary.totalExpense)]);
    csvData.push(['Saldo', this.formatCurrency(data.summary.balance)]);
    csvData.push(['Tingkat Tabungan', `${data.summary.savingsRate.toFixed(2)}%`]);
    csvData.push(['']);

    // Add transactions
    if (data.transactions.length > 0) {
      csvData.push(['TRANSAKSI', '']);
      csvData.push(['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah']);
      
      data.transactions.forEach(transaction => {
        csvData.push([
          transaction.date.toLocaleDateString('id-ID'),
          transaction.description,
          transaction.category?.name || 'Tanpa Kategori',
          transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          this.formatCurrency(transaction.amount)
        ]);
      });
      csvData.push(['']);
    }

    // Add budgets
    if (data.budgets.length > 0) {
      csvData.push(['ANGGARAN', '']);
      csvData.push(['Kategori', 'Jumlah', 'Terpakai', 'Sisa', 'Periode', 'Status']);
      
      data.budgets.forEach(budget => {
        const remaining = budget.amount - budget.spent;
        const status = budget.isActive ? 'Aktif' : 'Nonaktif';
        csvData.push([
          budget.category?.name || 'Total',
          this.formatCurrency(budget.amount),
          this.formatCurrency(budget.spent),
          this.formatCurrency(remaining),
          budget.period,
          status
        ]);
      });
      csvData.push(['']);
    }

    // Add goals
    if (data.goals.length > 0) {
      csvData.push(['TUJUAN KEUANGAN', '']);
      csvData.push(['Judul', 'Target', 'Terkumpul', 'Progress', 'Status']);
      
      data.goals.forEach(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const status = goal.isCompleted ? 'Selesai' : 'Aktif';
        csvData.push([
          goal.title,
          this.formatCurrency(goal.targetAmount),
          this.formatCurrency(goal.currentAmount),
          `${progress.toFixed(2)}%`,
          status
        ]);
      });
    }

    const parser = new Parser();
    const csv = parser.parse(csvData);
    
    const filename = `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    
    return {
      data: csv,
      filename,
      contentType: 'text/csv'
    };
  }

  // Export to PDF
  private async exportToPDF(data: ExportData, options: ExportOptions): Promise<{ data: Buffer, filename: string, contentType: string }> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const filename = `laporan_keuangan_${new Date().toISOString().split('T')[0]}.pdf`;
          
          resolve({
            data: buffer,
            filename,
            contentType: 'application/pdf'
          });
        });

        // Header
        doc.fontSize(24).text('LAPORAN KEUANGAN', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Tanggal Export: ${data.summary.exportDate}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        doc.fontSize(16).text('RINGKASAN', { underline: true });
        doc.moveDown();
        doc.fontSize(10).text(`Total Transaksi: ${data.summary.totalTransactions}`);
        doc.text(`Total Pemasukan: ${this.formatCurrency(data.summary.totalIncome)}`);
        doc.text(`Total Pengeluaran: ${this.formatCurrency(data.summary.totalExpense)}`);
        doc.text(`Saldo: ${this.formatCurrency(data.summary.balance)}`);
        doc.text(`Tingkat Tabungan: ${data.summary.savingsRate.toFixed(2)}%`);
        doc.moveDown(2);

        // Transactions
        if (data.transactions.length > 0) {
          doc.fontSize(16).text('TRANSAKSI', { underline: true });
          doc.moveDown();
          
          data.transactions.slice(0, 20).forEach((transaction, index) => {
            doc.fontSize(10).text(
              `${index + 1}. ${transaction.date.toLocaleDateString('id-ID')} - ${transaction.description}`,
              { continued: true }
            );
            doc.text(` ${this.formatCurrency(transaction.amount)}`, { align: 'right' });
          });
          
          if (data.transactions.length > 20) {
            doc.moveDown();
            doc.text(`... dan ${data.transactions.length - 20} transaksi lainnya`);
          }
          doc.moveDown(2);
        }

        // Budgets
        if (data.budgets.length > 0) {
          doc.fontSize(16).text('ANGGARAN', { underline: true });
          doc.moveDown();
          
          data.budgets.forEach(budget => {
            const remaining = budget.amount - budget.spent;
            doc.fontSize(10).text(
              `${budget.category?.name || 'Total'}: ${this.formatCurrency(budget.amount)}`,
              { continued: true }
            );
            doc.text(` (Sisa: ${this.formatCurrency(remaining)})`, { align: 'right' });
          });
          doc.moveDown(2);
        }

        // Goals
        if (data.goals.length > 0) {
          doc.fontSize(16).text('TUJUAN KEUANGAN', { underline: true });
          doc.moveDown();
          
          data.goals.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            doc.fontSize(10).text(
              `${goal.title}: ${this.formatCurrency(goal.currentAmount)} / ${this.formatCurrency(goal.targetAmount)}`,
              { continued: true }
            );
            doc.text(` (${progress.toFixed(1)}%)`, { align: 'right' });
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Export to Excel (simplified - returns CSV for now)
  private async exportToExcel(data: ExportData, options: ExportOptions): Promise<{ data: string, filename: string, contentType: string }> {
    // For now, return CSV format as Excel can read CSV
    return await this.exportToCSV(data, options);
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export default new ExportService(); 