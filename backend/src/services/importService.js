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
exports.ImportService = void 0;
const XLSX = __importStar(require("xlsx"));
const csv = __importStar(require("csv-parser"));
const fs = __importStar(require("fs"));
const database_1 = __importDefault(require("../utils/database"));
class ImportService {
    static importFromCSV(filePath, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const errors = [];
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
                    }
                    catch (error) {
                        errors.push(`Row ${rowNumber}: ${error}`);
                    }
                })
                    .on('end', () => __awaiter(this, void 0, void 0, function* () {
                    const importResult = yield this.saveTransactions(results, userId);
                    importResult.totalRows = rowNumber;
                    importResult.errors = [...importResult.errors, ...errors];
                    // Clean up file
                    fs.unlinkSync(filePath);
                    resolve(importResult);
                }))
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
        });
    }
    static importFromExcel(filePath, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);
                const results = [];
                const errors = [];
                data.forEach((row, index) => {
                    try {
                        const parsedRow = this.parseExcelRow(row, index + 1);
                        if (parsedRow) {
                            results.push(parsedRow);
                        }
                    }
                    catch (error) {
                        errors.push(`Row ${index + 1}: ${error}`);
                    }
                });
                const importResult = yield this.saveTransactions(results, userId);
                importResult.totalRows = data.length;
                importResult.errors = [...importResult.errors, ...errors];
                // Clean up file
                fs.unlinkSync(filePath);
                return importResult;
            }
            catch (error) {
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
        });
    }
    static parseCSVRow(data, rowNumber) {
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
            type: parsedType,
            category: category === null || category === void 0 ? void 0 : category.trim(),
            tags: tags === null || tags === void 0 ? void 0 : tags.trim()
        };
    }
    static parseExcelRow(data, rowNumber) {
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
        let parsedDate;
        if (typeof date === 'number') {
            // Excel date as number
            parsedDate = new Date((date - 25569) * 86400 * 1000);
        }
        else {
            parsedDate = new Date(date);
        }
        if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date: ${date}`);
        }
        return {
            date: parsedDate.toISOString(),
            description: description.toString().trim(),
            amount: parsedAmount,
            type: parsedType,
            category: category === null || category === void 0 ? void 0 : category.toString().trim(),
            tags: tags === null || tags === void 0 ? void 0 : tags.toString().trim()
        };
    }
    static saveTransactions(transactions, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            let importedCount = 0;
            for (const transaction of transactions) {
                try {
                    // Find or create category if provided
                    let categoryId;
                    if (transaction.category) {
                        const category = yield database_1.default.category.findFirst({
                            where: {
                                name: transaction.category,
                                type: transaction.type
                            }
                        });
                        if (!category) {
                            // Create new category
                            const newCategory = yield database_1.default.category.create({
                                data: {
                                    name: transaction.category,
                                    type: transaction.type,
                                    icon: '📁', // Default icon
                                    color: transaction.type === 'income' ? '#10B981' : '#EF4444'
                                }
                            });
                            categoryId = newCategory.id;
                        }
                        else {
                            categoryId = category.id;
                        }
                    }
                    // Create transaction
                    yield database_1.default.transaction.create({
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
                }
                catch (error) {
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
        });
    }
}
exports.ImportService = ImportService;
