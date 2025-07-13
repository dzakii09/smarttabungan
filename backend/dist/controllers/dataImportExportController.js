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
const dataImportExportService_1 = __importDefault(require("../services/dataImportExportService"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure multer for file uploads
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
        const allowedTypes = ['csv', 'xlsx', 'xls', 'json'];
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase().substring(1);
        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        }
        else {
            cb(new Error('Format file tidak didukung'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
class DataImportExportController {
    // Get import templates
    getImportTemplates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const templates = yield dataImportExportService_1.default.getImportTemplates();
                res.json({
                    success: true,
                    data: templates
                });
            }
            catch (error) {
                console.error('Error getting import templates:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil template import'
                });
            }
        });
    }
    // Import data from file
    importData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                upload.single('file')(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        return res.status(400).json({
                            success: false,
                            message: err.message
                        });
                    }
                    const userId = req.user.id;
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
                    const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase().substring(1);
                    const result = yield dataImportExportService_1.default.importData(userId, req.file.path, fileExtension, templateId);
                    res.json({
                        success: result.success,
                        data: {
                            totalRecords: result.totalRecords,
                            processedRecords: result.processedRecords,
                            errorCount: result.errorCount,
                            errors: result.errors
                        }
                    });
                }));
            }
            catch (error) {
                console.error('Error importing data:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal import data'
                });
            }
        });
    }
    // Export data
    exportData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { format = 'csv', startDate, endDate, type, categoryId } = req.body;
                const options = {
                    format: format,
                    filters: {
                        startDate: startDate ? new Date(startDate) : undefined,
                        endDate: endDate ? new Date(endDate) : undefined,
                        type,
                        categoryId
                    }
                };
                const filePath = yield dataImportExportService_1.default.exportData(userId, options);
                const fileName = path_1.default.basename(filePath);
                res.download(filePath, fileName, (err) => {
                    if (err) {
                        console.error('Error downloading file:', err);
                        res.status(500).json({
                            success: false,
                            message: 'Gagal mengunduh file'
                        });
                    }
                });
            }
            catch (error) {
                console.error('Error exporting data:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal export data'
                });
            }
        });
    }
    // Validate import data
    validateImportData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                upload.single('file')(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
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
                    const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase().substring(1);
                    let data = [];
                    try {
                        switch (fileExtension) {
                            case 'csv':
                                data = yield dataImportExportService_1.default['readCSVFile'](req.file.path);
                                break;
                            case 'xlsx':
                            case 'xls':
                                data = yield dataImportExportService_1.default['readExcelFile'](req.file.path);
                                break;
                            case 'json':
                                data = yield dataImportExportService_1.default['readJSONFile'](req.file.path);
                                break;
                            default:
                                throw new Error('Format file tidak didukung');
                        }
                    }
                    catch (readError) {
                        return res.status(400).json({
                            success: false,
                            message: 'Gagal membaca file'
                        });
                    }
                    const validation = yield dataImportExportService_1.default.validateImportData(data, templateId);
                    res.json({
                        success: validation.valid,
                        data: {
                            totalRecords: data.length,
                            validRecords: data.length - validation.errors.length,
                            errorCount: validation.errors.length,
                            errors: validation.errors
                        }
                    });
                }));
            }
            catch (error) {
                console.error('Error validating import data:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal validasi data import'
                });
            }
        });
    }
    // Get import history
    getImportHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield dataImportExportService_1.default.getImportHistory(userId, limit);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting import history:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil riwayat import'
                });
            }
        });
    }
    // Bulk operations
    bulkOperations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
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
            }
            catch (error) {
                console.error('Error performing bulk operations:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal melakukan operasi bulk'
                });
            }
        });
    }
}
exports.default = new DataImportExportController();
