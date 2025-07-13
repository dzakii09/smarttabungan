"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dataImportExportController_1 = __importDefault(require("../controllers/dataImportExportController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get import templates
router.get('/templates', auth_1.auth, dataImportExportController_1.default.getImportTemplates);
// Import data from file
router.post('/import', auth_1.auth, dataImportExportController_1.default.importData);
// Export data
router.post('/export', auth_1.auth, dataImportExportController_1.default.exportData);
// Validate import data
router.post('/validate', auth_1.auth, dataImportExportController_1.default.validateImportData);
// Get import history
router.get('/import-history', auth_1.auth, dataImportExportController_1.default.getImportHistory);
// Bulk operations
router.post('/bulk', auth_1.auth, dataImportExportController_1.default.bulkOperations);
exports.default = router;
