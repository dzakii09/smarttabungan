"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exportController_1 = __importDefault(require("../controllers/exportController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Export options
router.get('/options', auth_1.auth, exportController_1.default.getExportOptions);
// Export all data
router.post('/all', auth_1.auth, exportController_1.default.exportData);
// Export specific data types
router.post('/transactions', auth_1.auth, exportController_1.default.exportTransactions);
router.post('/budgets', auth_1.auth, exportController_1.default.exportBudgets);
router.post('/goals', auth_1.auth, exportController_1.default.exportGoals);
exports.default = router;
