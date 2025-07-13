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
exports.getFinancialAdvice = exports.getSavingsTips = exports.getBudgetSuggestions = exports.getSpendingInsights = exports.getAIRecommendations = exports.chatWithAI = void 0;
const aiService_1 = __importDefault(require("../services/aiService"));
const groqService_1 = __importDefault(require("../services/groqService")); // Add this import
// Add this new function for chatbot
const chatWithAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('🤖 ChatWithAI: Received request');
        const { message, context } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }
        console.log('🤖 ChatWithAI: Processing message:', message);
        console.log('🤖 ChatWithAI: User ID:', userId);
        // Get user context if not provided
        let userContext = context;
        if (!userContext && userId) {
            try {
                const insights = yield aiService_1.default.getSpendingInsights(userId);
                userContext = { insights };
            }
            catch (err) {
                console.log('⚠️ ChatWithAI: Could not get user context:', err);
            }
        }
        // Generate response using Groq
        const aiResponse = yield groqService_1.default.generateChatResponse(message, userContext);
        console.log('✅ ChatWithAI: Response generated successfully');
        res.json({
            message: aiResponse,
            suggestions: [], // You can add suggestions based on the message
            insights: [] // You can add insights if needed
        });
    }
    catch (error) {
        console.error('❌ ChatWithAI error:', error);
        console.error('❌ ChatWithAI error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to process chat message',
            message: error.message || 'Internal server error'
        });
    }
});
exports.chatWithAI = chatWithAI;
const getAIRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const recommendations = yield aiService_1.default.getBudgetRecommendations(userId);
        // Map ke format frontend
        const mapped = recommendations.map((rec, idx) => ({
            id: rec.categoryId || idx.toString(),
            type: 'budget',
            title: `Rekomendasi Budget untuk ${rec.categoryName}`,
            description: `Disarankan anggaran bulanan: Rp ${rec.recommendedAmount.toLocaleString('id-ID')} (${rec.reason})`,
            priority: 'medium',
            impact: 'medium',
            estimatedSavings: undefined,
            estimatedTime: undefined,
            difficulty: 'medium',
            category: rec.categoryName,
            actionable: true,
            metadata: rec
        }));
        res.json({ data: mapped });
    }
    catch (error) {
        console.error('Get AI recommendations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAIRecommendations = getAIRecommendations;
const getSpendingInsights = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const insights = yield aiService_1.default.getSpendingInsights(userId);
        res.json(insights);
    }
    catch (error) {
        console.error('Get spending insights error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSpendingInsights = getSpendingInsights;
const getBudgetSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const suggestions = yield aiService_1.default.getBudgetRecommendations(userId);
        res.json(suggestions);
    }
    catch (error) {
        console.error('Get budget suggestions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getBudgetSuggestions = getBudgetSuggestions;
const getSavingsTips = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const tips = yield aiService_1.default.getSpendingInsights(userId);
        res.json(tips);
    }
    catch (error) {
        console.error('Get savings tips error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSavingsTips = getSavingsTips;
const getFinancialAdvice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const advice = yield aiService_1.default.getBudgetInsights(userId);
        res.json(advice);
    }
    catch (error) {
        console.error('Get financial advice error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getFinancialAdvice = getFinancialAdvice;
