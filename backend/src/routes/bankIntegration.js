"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bankIntegrationController_1 = __importDefault(require("../controllers/bankIntegrationController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get supported banks
router.get('/supported-banks', auth_1.auth, bankIntegrationController_1.default.getSupportedBanks);
// Get user's bank accounts
router.get('/accounts', auth_1.auth, bankIntegrationController_1.default.getUserBankAccounts);
// Connect bank account
router.post('/connect', auth_1.auth, bankIntegrationController_1.default.connectBankAccount);
// Sync bank account
router.post('/sync/:accountId', auth_1.auth, bankIntegrationController_1.default.syncBankAccount);
// Get bank transactions
router.get('/transactions/:accountId', auth_1.auth, bankIntegrationController_1.default.getBankTransactions);
// Get account balance
router.get('/balance/:accountId', auth_1.auth, bankIntegrationController_1.default.getAccountBalance);
// Disconnect bank account
router.delete('/disconnect/:accountId', auth_1.auth, bankIntegrationController_1.default.disconnectBankAccount);
// Update sync frequency
router.put('/sync-frequency/:accountId', auth_1.auth, bankIntegrationController_1.default.updateSyncFrequency);
exports.default = router;
