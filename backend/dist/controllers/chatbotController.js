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
exports.getFinancialInsights = exports.getConversationHistory = exports.sendMessage = void 0;
const database_1 = __importDefault(require("../utils/database"));
const groqAIService_1 = __importDefault(require("../services/groqAIService"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { message, timestamp } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }
        // Get user context for personalized responses
        const userContext = yield getUserContext(userId);
        // Generate AI response using GROQ
        const aiResponse = yield groqAIService_1.default.generateChatbotResponse(message, userContext);
        // Store conversation in database (optional)
        yield database_1.default.chatMessage.create({
            data: {
                userId,
                message,
                response: aiResponse.message,
                timestamp: new Date(timestamp || Date.now())
            }
        });
        res.json(aiResponse);
    }
    catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendMessage = sendMessage;
const getConversationHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const limit = parseInt(req.query.limit) || 50;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const messages = yield database_1.default.chatMessage.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
        res.json({ messages: messages.reverse() });
    }
    catch (error) {
        console.error('Error fetching conversation history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getConversationHistory = getConversationHistory;
const getFinancialInsights = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const insights = yield generateFinancialInsights(userId);
        res.json(insights);
    }
    catch (error) {
        console.error('Error generating financial insights:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getFinancialInsights = getFinancialInsights;
function getUserContext(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get user's financial data
        const [transactions, goals, categories] = yield Promise.all([
            database_1.default.transaction.findMany({
                where: { userId },
                include: { category: true },
                orderBy: { date: 'desc' },
                take: 100
            }),
            database_1.default.goal.findMany({
                where: { userId }
            }),
            database_1.default.category.findMany()
        ]);
        // Calculate financial metrics
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= currentMonth);
        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const savingsRate = monthlyIncome > 0
            ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
            : 0;
        return {
            transactions,
            goals,
            categories,
            monthlyIncome,
            monthlyExpenses,
            savingsRate,
            totalBalance: monthlyIncome - monthlyExpenses
        };
    });
}
function generateAIResponse(message, userContext) {
    return __awaiter(this, void 0, void 0, function* () {
        // Hanya gunakan Gemini AI, tanpa fallback manual
        if (groqAIService_1.default.isAvailable()) {
            try {
                const aiResponse = yield groqAIService_1.default.generateChatbotResponse(message, userContext);
                return {
                    message: aiResponse.message,
                    suggestions: aiResponse.suggestions || [],
                    insights: aiResponse.insights || []
                };
            }
            catch (error) {
                console.error('Error with GROQ AI:', error);
                return {
                    message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
                    suggestions: [],
                    insights: []
                };
            }
        }
        else {
            return {
                message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
                suggestions: [],
                insights: []
            };
        }
    });
}
function generateBudgetResponse(userContext) {
    const { monthlyIncome, monthlyExpenses, savingsRate } = userContext;
    const spendingRatio = (monthlyExpenses / monthlyIncome) * 100;
    let message = `Berdasarkan data keuangan Anda:\n\n`;
    message += `💰 Pendapatan bulanan: Rp ${monthlyIncome.toLocaleString()}\n`;
    message += `💸 Pengeluaran bulanan: Rp ${monthlyExpenses.toLocaleString()}\n`;
    message += `📊 Rasio pengeluaran: ${spendingRatio.toFixed(1)}%\n`;
    message += `💎 Tingkat tabungan: ${savingsRate.toFixed(1)}%\n\n`;
    if (spendingRatio > 80) {
        message += `⚠️ Pengeluaran Anda cukup tinggi. Saya sarankan:\n`;
        message += `• Review pengeluaran rutin bulanan\n`;
        message += `• Identifikasi pengeluaran yang bisa dikurangi\n`;
        message += `• Targetkan rasio pengeluaran di bawah 70%`;
    }
    else if (spendingRatio > 60) {
        message += `✅ Pengeluaran Anda dalam batas wajar. Tips untuk optimalisasi:\n`;
        message += `• Pertimbangkan menambah alokasi investasi\n`;
        message += `• Review pengeluaran diskresioner\n`;
        message += `• Tingkatkan dana darurat`;
    }
    else {
        message += `🎉 Excellent! Pengeluaran Anda sangat efisien. Lanjutkan dengan:\n`;
        message += `• Tingkatkan investasi untuk pertumbuhan kekayaan\n`;
        message += `• Pertimbangkan diversifikasi portfolio\n`;
        message += `• Review tujuan keuangan jangka panjang`;
    }
    return {
        message,
        suggestions: [
            'Buat kategori pengeluaran yang lebih detail',
            'Set up budget alerts untuk monitoring',
            'Review pengeluaran mingguan'
        ],
        insights: [
            `Rasio pengeluaran Anda ${spendingRatio > 70 ? 'perlu dioptimalkan' : 'sudah baik'}`,
            `Tingkat tabungan ${savingsRate > 20 ? 'excellent' : 'bisa ditingkatkan'}`
        ]
    };
}
function generateSavingResponse(userContext) {
    const { savingsRate, monthlyIncome } = userContext;
    const currentSavings = (savingsRate / 100) * monthlyIncome;
    let message = `Analisis tabungan Anda:\n\n`;
    message += `💰 Tabungan bulanan saat ini: Rp ${currentSavings.toLocaleString()}\n`;
    message += `📊 Tingkat tabungan: ${savingsRate.toFixed(1)}%\n\n`;
    if (savingsRate < 10) {
        message += `⚠️ Tingkat tabungan Anda rendah. Saya sarankan:\n`;
        message += `• Mulai dengan target 10% dari penghasilan\n`;
        message += `• Otomatisasi tabungan dengan auto-debit\n`;
        message += `• Review pengeluaran untuk menghemat lebih`;
    }
    else if (savingsRate < 20) {
        message += `✅ Tabungan Anda sudah baik. Tips meningkatkan:\n`;
        message += `• Tingkatkan target ke 20% penghasilan\n`;
        message += `• Pisahkan rekening tabungan\n`;
        message += `• Pertimbangkan investasi untuk pertumbuhan`;
    }
    else {
        message += `🎉 Excellent! Tabungan Anda sangat baik. Lanjutkan dengan:\n`;
        message += `• Diversifikasi ke instrumen investasi\n`;
        message += `• Review tujuan keuangan jangka panjang\n`;
        message += `• Pertimbangkan asuransi untuk proteksi`;
    }
    return {
        message,
        suggestions: [
            'Set up auto-debit untuk tabungan otomatis',
            'Buat multiple rekening untuk tujuan berbeda',
            'Review dan tingkatkan target tabungan'
        ]
    };
}
function generateInvestmentResponse(userContext) {
    const { savingsRate, monthlyIncome } = userContext;
    let message = `Berdasarkan profil keuangan Anda:\n\n`;
    message += `💰 Penghasilan bulanan: Rp ${monthlyIncome.toLocaleString()}\n`;
    message += `💎 Tingkat tabungan: ${savingsRate.toFixed(1)}%\n\n`;
    if (savingsRate < 15) {
        message += `⚠️ Sebelum berinvestasi, pastikan:\n`;
        message += `• Dana darurat sudah 6 bulan pengeluaran\n`;
        message += `• Tingkatkan tabungan minimal 20%\n`;
        message += `• Lunasi utang dengan bunga tinggi\n\n`;
        message += `Setelah itu, bisa mulai dengan:\n`;
        message += `• Reksadana pasar uang (low risk)\n`;
        message += `• Deposito berjangka\n`;
        message += `• Reksadana campuran`;
    }
    else {
        message += `✅ Siap untuk investasi! Rekomendasi:\n`;
        message += `• Reksadana saham (60-70% portfolio)\n`;
        message += `• Reksadana campuran (20-30%)\n`;
        message += `• Reksadana pasar uang (10-20%)\n\n`;
        message += `Tips: Investasi berkala (DCA) untuk mengurangi risiko`;
    }
    return {
        message,
        suggestions: [
            'Mulai dengan reksadana untuk pemula',
            'Diversifikasi portfolio',
            'Investasi berkala dengan nominal tetap'
        ]
    };
}
function generateAnalysisResponse(userContext) {
    var _a;
    const { transactions, monthlyIncome, monthlyExpenses } = userContext;
    // Analyze spending patterns
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    // Group by category
    const categorySpending = expenseTransactions.reduce((acc, t) => {
        var _a;
        const category = ((_a = t.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
        acc[category] = (acc[category] || 0) + Number(t.amount);
        return acc;
    }, {});
    const topCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
    let message = `📊 Analisis Keuangan Anda:\n\n`;
    message += `💰 Total Pendapatan: Rp ${totalIncome.toLocaleString()}\n`;
    message += `💸 Total Pengeluaran: Rp ${totalExpenses.toLocaleString()}\n`;
    message += `📈 Net Cash Flow: Rp ${(totalIncome - totalExpenses).toLocaleString()}\n\n`;
    if (topCategories.length > 0) {
        message += `🏆 Top 3 Kategori Pengeluaran:\n`;
        topCategories.forEach(([category, amount], index) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            message += `${index + 1}. ${category}: Rp ${amount.toLocaleString()} (${percentage}%)\n`;
        });
    }
    return {
        message,
        insights: [
            `Cash flow ${totalIncome > totalExpenses ? 'positif' : 'negatif'}`,
            `Kategori terbesar: ${((_a = topCategories[0]) === null || _a === void 0 ? void 0 : _a[0]) || 'N/A'}`,
            `Total transaksi: ${transactions.length}`
        ],
        suggestions: [
            'Review pengeluaran kategori terbesar',
            'Set budget untuk setiap kategori',
            'Monitor cash flow bulanan'
        ]
    };
}
function generateGoalResponse(userContext) {
    const { goals } = userContext;
    if (goals.length === 0) {
        return {
            message: 'Untuk membantu dengan tujuan keuangan, silakan buat beberapa tujuan terlebih dahulu. Saya bisa membantu menganalisis progress dan memberikan saran untuk mencapai target Anda.',
            suggestions: [
                'Buat tujuan keuangan yang SMART',
                'Set target amount dan deadline',
                'Monitor progress secara berkala'
            ]
        };
    }
    let message = `🎯 Progress Tujuan Keuangan Anda:\n\n`;
    goals.forEach((goal, index) => {
        const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
        const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        message += `${index + 1}. ${goal.name}\n`;
        message += `   Target: Rp ${Number(goal.targetAmount).toLocaleString()}\n`;
        message += `   Progress: Rp ${Number(goal.currentAmount).toLocaleString()} (${progress.toFixed(1)}%)\n`;
        message += `   Sisa: Rp ${remaining.toLocaleString()}\n`;
        message += `   Deadline: ${daysLeft} hari lagi\n\n`;
    });
    // Find goals that need attention
    const urgentGoals = goals.filter((g) => {
        const progress = (Number(g.currentAmount) / Number(g.targetAmount)) * 100;
        const daysLeft = Math.ceil((new Date(g.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return progress < 50 && daysLeft < 90;
    });
    if (urgentGoals.length > 0) {
        message += `⚠️ Tujuan yang perlu perhatian:\n`;
        urgentGoals.forEach((goal) => {
            message += `• ${goal.name} - perlu percepatan\n`;
        });
    }
    return {
        message,
        suggestions: [
            'Review progress tujuan bulanan',
            'Tingkatkan kontribusi untuk tujuan tertinggal',
            'Set reminder untuk deadline'
        ]
    };
}
function generateFinancialInsights(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userContext = yield getUserContext(userId);
        // Analyze spending patterns
        const expenseTransactions = userContext.transactions.filter((t) => t.type === 'expense');
        const categorySpending = expenseTransactions.reduce((acc, t) => {
            var _a;
            const category = ((_a = t.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
            acc[category] = (acc[category] || 0) + Number(t.amount);
            return acc;
        }, {});
        // Analyze saving trends
        const incomeTransactions = userContext.transactions.filter((t) => t.type === 'income');
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const netSavings = totalIncome - totalExpenses;
        // Analyze goal progress
        const goalProgress = userContext.goals.map((goal) => ({
            name: goal.name,
            progress: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
            daysLeft: Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }));
        // Generate recommendations
        const recommendations = [];
        if (userContext.savingsRate < 10) {
            recommendations.push('Tingkatkan tingkat tabungan minimal 10% dari penghasilan');
        }
        if (userContext.savingsRate < 20) {
            recommendations.push('Pertimbangkan investasi untuk pertumbuhan kekayaan');
        }
        const urgentGoals = goalProgress.filter((g) => g.progress < 50 && g.daysLeft < 90);
        if (urgentGoals.length > 0) {
            recommendations.push(`Percepat progress untuk tujuan: ${urgentGoals.map((g) => g.name).join(', ')}`);
        }
        return {
            spendingPatterns: categorySpending,
            savingTrends: {
                totalIncome,
                totalExpenses,
                netSavings,
                savingsRate: userContext.savingsRate
            },
            goalProgress,
            recommendations
        };
    });
}
