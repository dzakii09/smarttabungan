"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const goals_1 = __importDefault(require("./routes/goals"));
const categories_1 = __importDefault(require("./routes/categories"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const import_1 = __importDefault(require("./routes/import"));
const ai_1 = __importDefault(require("./routes/ai"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const scheduledNotifications_1 = __importDefault(require("./routes/scheduledNotifications"));
const export_1 = __importDefault(require("./routes/export"));
const bankIntegration_1 = __importDefault(require("./routes/bankIntegration"));
const paymentGateway_1 = __importDefault(require("./routes/paymentGateway"));
const dataImportExport_1 = __importDefault(require("./routes/dataImportExport"));
const externalAPI_1 = __importDefault(require("./routes/externalAPI"));
const groupBudgets_1 = __importDefault(require("./routes/groupBudgets"));
const settings_1 = __importDefault(require("./routes/settings"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
dotenv_1.default.config();
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/goals', goals_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/budgets', budgets_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/import-export', import_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/scheduled-notifications', scheduledNotifications_1.default);
app.use('/api/export', export_1.default);
app.use('/api/bank', bankIntegration_1.default);
app.use('/api/payment', paymentGateway_1.default);
app.use('/api/data', dataImportExport_1.default);
app.use('/api/external', externalAPI_1.default);
app.use('/api/group-budgets', groupBudgets_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/chatbot', chatbot_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
