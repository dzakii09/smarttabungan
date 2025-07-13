"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const importController_1 = require("../controllers/importController");
const exportController_1 = __importDefault(require("../controllers/exportController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Import routes
router.post('/transactions', auth_1.auth, importController_1.upload.single('file'), importController_1.importTransactions);
router.get('/template', auth_1.auth, importController_1.getImportTemplate);
// Export routes
router.get('/transactions', auth_1.auth, exportController_1.default.exportTransactions.bind(exportController_1.default));
// router.get('/goals', auth as any, exportController.exportGoals.bind(exportController));
// router.get('/financial-report', auth as any, exportController.exportFinancialReport.bind(exportController));
exports.default = router;
