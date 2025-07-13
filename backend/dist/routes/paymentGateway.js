"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentGatewayController_1 = __importDefault(require("../controllers/paymentGatewayController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get available payment methods
router.get('/methods', auth_1.auth, paymentGatewayController_1.default.getPaymentMethods);
// Process payment
router.post('/process', auth_1.auth, paymentGatewayController_1.default.processPayment);
// Get payment history
router.get('/history', auth_1.auth, paymentGatewayController_1.default.getPaymentHistory);
// Get payment analytics
router.get('/analytics', auth_1.auth, paymentGatewayController_1.default.getPaymentAnalytics);
// Check payment status
router.get('/status/:transactionId', auth_1.auth, paymentGatewayController_1.default.checkPaymentStatus);
exports.default = router;
