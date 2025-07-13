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
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../generated/prisma");
const XLSX = __importStar(require("xlsx"));
const csv = __importStar(require("csv-parser"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new prisma_1.PrismaClient();
class DataImportExportService {
    constructor() {
        this.importTemplates = [
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
    }
    // Get import templates
    getImportTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.importTemplates;
        });
    }
    // Import data from file
    importData(userId, filePath, fileType, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create import record
                const importRecord = yield prisma.dataImport.create({
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
                let data = [];
                const errors = [];
                // Read file based on type
                switch (fileType.toLowerCase()) {
                    case 'csv':
                        data = yield this.readCSVFile(filePath);
                        break;
                    case 'xlsx':
                    case 'xls':
                        data = yield this.readExcelFile(filePath);
                        break;
                    case 'json':
                        data = yield this.readJSONFile(filePath);
                        break;
                    default:
                        throw new Error('Format file tidak didukung');
                }
                // Validate and process data
                const processedData = yield this.processImportData(data, templateId, userId, errors);
                // Update import record
                yield prisma.dataImport.update({
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
            }
            catch (error) {
                console.error('Error importing data:', error);
                throw new Error(`Gagal import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Read CSV file
    readCSVFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(filePath)
                    .pipe(csv.default())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', reject);
            });
        });
    }
    // Read Excel file
    readExcelFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            return XLSX.utils.sheet_to_json(worksheet);
        });
    }
    // Read JSON file
    readJSONFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            return Array.isArray(data) ? data : [data];
        });
    }
    // Process import data
    processImportData(data, templateId, userId, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            const processedData = [];
            for (let i = 0; i < data.length; i++) {
                try {
                    const row = data[i];
                    let processedRow = {};
                    switch (templateId) {
                        case 'transactions':
                            processedRow = yield this.processTransactionRow(row, userId);
                            break;
                        case 'bank-statement':
                            processedRow = yield this.processBankStatementRow(row, userId);
                            break;
                        default:
                            throw new Error(`Template ${templateId} tidak dikenali`);
                    }
                    if (processedRow) {
                        processedData.push(processedRow);
                    }
                }
                catch (error) {
                    const errorMessage = `Baris ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    errors.push(errorMessage);
                }
            }
            return processedData;
        });
    }
    // Process transaction row
    processTransactionRow(row, userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const category = yield prisma.category.findFirst({
                    where: {
                        name: row.category,
                        type: row.type
                    }
                });
                if (category) {
                    categoryId = category.id;
                }
                else {
                    // Create new category
                    const newCategory = yield prisma.category.create({
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
            const transaction = yield prisma.transaction.create({
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
        });
    }
    // Process bank statement row
    processBankStatementRow(row, userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else if (row.credit && parseFloat(row.credit) > 0) {
                amount = parseFloat(row.credit);
                type = 'income';
            }
            else {
                throw new Error('Data debit atau credit diperlukan');
            }
            // Create transaction
            const transaction = yield prisma.transaction.create({
                data: {
                    userId,
                    amount,
                    type,
                    description: row.description,
                    date
                }
            });
            return transaction;
        });
    }
    // Get random color for category
    getRandomColor() {
        const colors = [
            '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    // Export data
    exportData(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Build query filters
                const where = { userId };
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
                const transactions = yield prisma.transaction.findMany({
                    where,
                    include: {
                        category: true
                    },
                    orderBy: { date: 'desc' }
                });
                // Transform data
                const exportData = transactions.map(tx => {
                    var _a;
                    return ({
                        id: tx.id,
                        date: tx.date.toISOString().split('T')[0],
                        amount: tx.amount,
                        type: tx.type,
                        description: tx.description,
                        category: ((_a = tx.category) === null || _a === void 0 ? void 0 : _a.name) || '',
                        createdAt: tx.createdAt.toISOString()
                    });
                });
                // Export based on format
                const fileName = `export_${Date.now()}`;
                let filePath = '';
                switch (options.format) {
                    case 'csv':
                        filePath = yield this.exportToCSV(exportData, fileName);
                        break;
                    case 'excel':
                        filePath = yield this.exportToExcel(exportData, fileName);
                        break;
                    case 'json':
                        filePath = yield this.exportToJSON(exportData, fileName);
                        break;
                    case 'pdf':
                        filePath = yield this.exportToPDF(exportData, fileName);
                        break;
                    default:
                        throw new Error('Format export tidak didukung');
                }
                return filePath;
            }
            catch (error) {
                console.error('Error exporting data:', error);
                throw new Error(`Gagal export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Export to CSV
    exportToCSV(data, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(process.cwd(), 'uploads', `${fileName}.csv`);
            // Convert data to CSV format
            const headers = Object.keys(data[0] || {});
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');
            fs.writeFileSync(filePath, csvContent, 'utf8');
            return filePath;
        });
    }
    // Export to Excel
    exportToExcel(data, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(process.cwd(), 'uploads', `${fileName}.xlsx`);
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
            XLSX.writeFile(workbook, filePath);
            return filePath;
        });
    }
    // Export to JSON
    exportToJSON(data, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(process.cwd(), 'uploads', `${fileName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return filePath;
        });
    }
    // Export to PDF (simplified)
    exportToPDF(data, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            // For now, return JSON file as PDF is complex to implement
            // In real implementation, use libraries like puppeteer or jsPDF
            return this.exportToJSON(data, fileName);
        });
    }
    // Get import history
    getImportHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 20) {
            try {
                const imports = yield prisma.dataImport.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: limit
                });
                return {
                    success: true,
                    data: imports
                };
            }
            catch (error) {
                console.error('Error getting import history:', error);
                throw new Error('Gagal mengambil riwayat import');
            }
        });
    }
    // Validate import data
    validateImportData(data, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
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
                }
                catch (error) {
                    errors.push(`Baris ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            return {
                valid: errors.length === 0,
                errors
            };
        });
    }
    // Validate transaction row
    validateTransactionRow(row, rowNumber, errors) {
        if (!row.date) {
            errors.push(`Baris ${rowNumber}: Tanggal diperlukan`);
        }
        else {
            const date = new Date(row.date);
            if (isNaN(date.getTime())) {
                errors.push(`Baris ${rowNumber}: Format tanggal tidak valid`);
            }
        }
        if (!row.amount) {
            errors.push(`Baris ${rowNumber}: Jumlah diperlukan`);
        }
        else if (isNaN(parseFloat(row.amount))) {
            errors.push(`Baris ${rowNumber}: Jumlah tidak valid`);
        }
        if (!row.type) {
            errors.push(`Baris ${rowNumber}: Tipe diperlukan`);
        }
        else if (!['income', 'expense'].includes(row.type)) {
            errors.push(`Baris ${rowNumber}: Tipe harus income atau expense`);
        }
        if (!row.description) {
            errors.push(`Baris ${rowNumber}: Deskripsi diperlukan`);
        }
    }
    // Validate bank statement row
    validateBankStatementRow(row, rowNumber, errors) {
        if (!row.date) {
            errors.push(`Baris ${rowNumber}: Tanggal diperlukan`);
        }
        else {
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
exports.default = new DataImportExportService();
