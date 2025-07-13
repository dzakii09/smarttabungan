"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get AI recommendations
router.get('/recommendations', auth_1.auth, aiController_1.getAIRecommendations);
// Get AI insights
router.get('/insights', auth_1.auth, aiController_1.getSpendingInsights);
// Get budget suggestions
router.get('/budget-suggestions', auth_1.auth, aiController_1.getBudgetSuggestions);
// Get spending insights
router.get('/spending-insights', auth_1.auth, aiController_1.getSpendingInsights);
// Get savings tips
router.get('/savings-tips', auth_1.auth, aiController_1.getSavingsTips);
// Get financial advice
router.get('/financial-advice', auth_1.auth, aiController_1.getFinancialAdvice);
exports.default = router;
