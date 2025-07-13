"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const budgetController_1 = __importDefault(require("../controllers/budgetController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Budget analytics and insights (harus sebelum /:id)
router.get('/alerts', auth_1.auth, budgetController_1.default.getBudgetAlerts);
router.get('/stats', auth_1.auth, budgetController_1.default.getBudgetStats);
router.get('/recommendations', auth_1.auth, budgetController_1.default.getBudgetRecommendations);
router.get('/insights', auth_1.auth, budgetController_1.default.getBudgetInsights);
// AI-powered budget features
router.post('/from-recommendation', auth_1.auth, budgetController_1.default.createBudgetFromRecommendation);
// Budget CRUD operations
router.post('/', auth_1.auth, budgetController_1.default.createBudget);
router.get('/', auth_1.auth, budgetController_1.default.getBudgets);
router.get('/:id', auth_1.auth, budgetController_1.default.getBudgetById);
router.put('/:id', auth_1.auth, budgetController_1.default.updateBudget);
router.delete('/:id', auth_1.auth, budgetController_1.default.deleteBudget);
// Budget status management
router.patch('/:id/toggle', auth_1.auth, budgetController_1.default.toggleBudgetStatus);
exports.default = router;
