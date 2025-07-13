"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const XLSX = __importStar(require("xlsx"));
const database_1 = __importDefault(require("../utils/database"));
const json2csv_1 = require("json2csv");
const pdfkit_1 = __importDefault(require("pdfkit"));
class ExportService {
    static exportTransactions(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Build query filters
                const where = { userId };
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
                const transactions = yield database_1.default.transaction.findMany({
                    where,
                    include: {
                        category: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                });
                // Transform data for export
                const exportData = transactions.map(t => {
                    var _a;
                    return ({
                        Date: t.date.toISOString().split('T')[0],
                        Description: t.description,
                        Amount: t.amount,
                        Type: t.type,
                        Category: ((_a = t.category) === null || _a === void 0 ? void 0 : _a.name) || 'Uncategorized',
                        Created: t.createdAt.toISOString().split('T')[0]
                    });
                });
                if (options.format === 'csv') {
                    return this.generateCSV(exportData, 'transactions');
                }
                else if (options.format === 'excel') {
                    return this.generateExcel(exportData, 'transactions');
                }
                else if (options.format === 'pdf') {
                    return this.generatePDF(exportData, 'transactions');
                }
                throw new Error('Unsupported export format');
            }
            catch (error) {
                console.error('Export error:', error);
                throw new Error('Failed to export transactions');
            }
        });
    }
    static exportGoals(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const goals = yield database_1.default.goal.findMany({
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
                }
                else if (options.format === 'excel') {
                    return this.generateExcel(exportData, 'goals');
                }
                else if (options.format === 'pdf') {
                    return this.generatePDF(exportData, 'goals');
                }
                throw new Error('Unsupported export format');
            }
            catch (error) {
                console.error('Export error:', error);
                throw new Error('Failed to export goals');
            }
        });
    }
    static exportFinancialReport(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get date range
                const dateFrom = options.dateFrom ? new Date(options.dateFrom) : new Date(new Date().getFullYear(), 0, 1); // Start of year
                const dateTo = options.dateTo ? new Date(options.dateTo) : new Date();
                // Fetch transactions
                const transactions = yield database_1.default.transaction.findMany({
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
                    var _a;
                    const categoryName = ((_a = t.category) === null || _a === void 0 ? void 0 : _a.name) || 'Uncategorized';
                    acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
                    return acc;
                }, {});
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
                    transactions: transactions.map(t => {
                        var _a;
                        return ({
                            Date: t.date.toISOString().split('T')[0],
                            Description: t.description,
                            Amount: t.amount,
                            Type: t.type,
                            Category: ((_a = t.category) === null || _a === void 0 ? void 0 : _a.name) || 'Uncategorized'
                        });
                    })
                };
                if (options.format === 'csv') {
                    return this.generateCSV(reportData.transactions, 'financial_report');
                }
                else if (options.format === 'excel') {
                    return this.generateExcel(reportData.transactions, 'financial_report');
                }
                else if (options.format === 'pdf') {
                    return this.generatePDF(reportData.transactions, 'financial_report');
                }
                throw new Error('Unsupported export format');
            }
            catch (error) {
                console.error('Export error:', error);
                throw new Error('Failed to export financial report');
            }
        });
    }
    static generateCSV(data, filename) {
        if (data.length === 0) {
            throw new Error('No data to export');
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ].join('\n');
        return {
            content: csvContent,
            filename: `${filename}_${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv'
        };
    }
    static generateExcel(data, filename) {
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
    static generatePDF(data, filename) {
        // For now, we'll return a simple text representation
        // In a real implementation, you'd use a library like puppeteer or jsPDF
        const pdfContent = `Financial Report\n\n${data.map(row => Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')).join('\n')}`;
        return {
            content: pdfContent,
            filename: `${filename}_${new Date().toISOString().split('T')[0]}.txt`,
            contentType: 'text/plain'
        };
    }
    // Export user data
    exportUserData(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exportData = yield this.gatherExportData(userId, options);
                switch (options.format) {
                    case 'csv':
                        return yield this.exportToCSV(exportData, options);
                    case 'pdf':
                        return yield this.exportToPDF(exportData, options);
                    case 'excel':
                        return yield this.exportToExcel(exportData, options);
                    default:
                        throw new Error('Format tidak didukung');
                }
            }
            catch (error) {
                console.error('Error exporting data:', error);
                throw error;
            }
        });
    }
    // Gather all export data
    gatherExportData(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId };
            if (options.dateRange) {
                whereClause.date = {
                    gte: options.dateRange.start,
                    lte: options.dateRange.end
                };
            }
            const [transactions, budgets, goals, analytics] = yield Promise.all([
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
        });
    }
    // Get transactions for export
    getTransactions(userId, whereClause) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.transaction.findMany({
                where: whereClause,
                include: {
                    category: true
                },
                orderBy: { date: 'desc' }
            });
        });
    }
    // Get budgets for export
    getBudgets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.budget.findMany({
                where: { userId },
                include: {
                    category: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // Get goals for export
    getGoals(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.goal.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // Get analytics data
    getAnalytics(userId, dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId };
            if (dateRange) {
                whereClause.date = {
                    gte: dateRange.start,
                    lte: dateRange.end
                };
            }
            const [totalIncome, totalExpense, categoryStats, monthlyStats] = yield Promise.all([
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
        });
    }
    // Get total income
    getTotalIncome(userId, whereClause) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.default.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereClause), { type: 'income' }),
                _sum: { amount: true }
            });
            return result._sum.amount || 0;
        });
    }
    // Get total expense
    getTotalExpense(userId, whereClause) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.default.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereClause), { type: 'expense' }),
                _sum: { amount: true }
            });
            return result._sum.amount || 0;
        });
    }
    // Get category statistics
    getCategoryStats(userId, whereClause) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield database_1.default.transaction.findMany({
                where: Object.assign(Object.assign({}, whereClause), { type: 'expense' }),
                include: { category: true }
            });
            const categoryMap = new Map();
            transactions.forEach(transaction => {
                var _a;
                const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Tanpa Kategori';
                const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
                existing.amount += transaction.amount;
                existing.count += 1;
                categoryMap.set(categoryName, existing);
            });
            return Array.from(categoryMap.entries()).map(([name, data]) => ({
                category: name,
                amount: data.amount,
                count: data.count,
                percentage: 0 // Will be calculated in summary
            }));
        });
    }
    // Get monthly statistics
    getMonthlyStats(userId, dateRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { userId };
            if (dateRange) {
                whereClause.date = {
                    gte: dateRange.start,
                    lte: dateRange.end
                };
            }
            const transactions = yield database_1.default.transaction.findMany({
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
                }
                else {
                    existing.expense += transaction.amount;
                }
                monthlyMap.set(month, existing);
            });
            return Array.from(monthlyMap.entries()).map(([month, data]) => ({
                month,
                income: data.income,
                expense: data.expense,
                balance: data.income - data.expense
            }));
        });
    }
    // Generate summary
    generateSummary(transactions, budgets, goals, analytics) {
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
    exportToCSV(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const csvData = [];
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
                    var _a;
                    csvData.push([
                        transaction.date.toLocaleDateString('id-ID'),
                        transaction.description,
                        ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Tanpa Kategori',
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
                    var _a;
                    const remaining = budget.amount - budget.spent;
                    const status = budget.isActive ? 'Aktif' : 'Nonaktif';
                    csvData.push([
                        ((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total',
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
            const parser = new json2csv_1.Parser();
            const csv = parser.parse(csvData);
            const filename = `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`;
            return {
                data: csv,
                filename,
                contentType: 'text/csv'
            };
        });
    }
    // Export to PDF
    exportToPDF(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const doc = new pdfkit_1.default();
                    const chunks = [];
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
                            doc.fontSize(10).text(`${index + 1}. ${transaction.date.toLocaleDateString('id-ID')} - ${transaction.description}`, { continued: true });
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
                            var _a;
                            const remaining = budget.amount - budget.spent;
                            doc.fontSize(10).text(`${((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total'}: ${this.formatCurrency(budget.amount)}`, { continued: true });
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
                            doc.fontSize(10).text(`${goal.title}: ${this.formatCurrency(goal.currentAmount)} / ${this.formatCurrency(goal.targetAmount)}`, { continued: true });
                            doc.text(` (${progress.toFixed(1)}%)`, { align: 'right' });
                        });
                    }
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    // Export to Excel (simplified - returns CSV for now)
    exportToExcel(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // For now, return CSV format as Excel can read CSV
            return yield this.exportToCSV(data, options);
        });
    }
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}
exports.ExportService = ExportService;
exports.default = new ExportService();
