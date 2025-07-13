"use strict";
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
exports.upload = exports.getImportTemplate = exports.importTransactions = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const importService_1 = require("../services/importService");
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.csv', '.xlsx', '.xls'];
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
exports.upload = upload;
const importTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = req.file.path;
        const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
        let importResult;
        if (fileExtension === '.csv') {
            importResult = yield importService_1.ImportService.importFromCSV(filePath, userId);
        }
        else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            importResult = yield importService_1.ImportService.importFromExcel(filePath, userId);
        }
        else {
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
    }
    catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            error: 'Import failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.importTransactions = importTransactions;
const getImportTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const format = req.query.format || 'csv';
        if (format === 'csv') {
            const csvTemplate = `date,description,amount,type,category,tags
2024-01-01,Gaji Bulanan,5000000,income,Gaji,
2024-01-02,Makan Siang,50000,expense,Makanan,
2024-01-03,Bensin,100000,expense,Transportasi,`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transaction_template.csv');
            res.send(csvTemplate);
        }
        else if (format === 'excel') {
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
        }
        else {
            res.status(400).json({ error: 'Unsupported format. Use "csv" or "excel"' });
        }
    }
    catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Failed to generate template' });
    }
});
exports.getImportTemplate = getImportTemplate;
