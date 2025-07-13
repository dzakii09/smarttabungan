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
const database_1 = __importDefault(require("../utils/database"));
class AIService {
    constructor() {
        // Simple keyword-based categorization
        this.categoryKeywords = {
            'Makanan & Minuman': [
                'makan', 'minum', 'restoran', 'warung', 'cafe', 'kopi', 'nasi', 'ayam', 'bakso',
                'mie', 'sate', 'goreng', 'tahu', 'tempe', 'sayur', 'buah', 'snack', 'jajan',
                'food', 'drink', 'restaurant', 'coffee', 'rice', 'chicken', 'noodle'
            ],
            'Transportasi': [
                'transport', 'bus', 'kereta', 'taxi', 'grab', 'gojek', 'ojek', 'bensin',
                'bensin', 'pertamax', 'pertalite', 'parkir', 'tol', 'angkot', 'mrt', 'lrt',
                'transportation', 'gas', 'fuel', 'parking', 'toll'
            ],
            'Belanja': [
                'belanja', 'shopping', 'mall', 'supermarket', 'market', 'toko', 'shop',
                'pakaian', 'baju', 'celana', 'sepatu', 'tas', 'aksesoris', 'fashion',
                'clothes', 'shoes', 'bag', 'accessories'
            ],
            'Tagihan': [
                'tagihan', 'bill', 'listrik', 'air', 'internet', 'wifi', 'pulsa', 'token',
                'electricity', 'water', 'internet', 'phone', 'credit'
            ],
            'Hiburan': [
                'hiburan', 'entertainment', 'film', 'movie', 'bioskop', 'cinema', 'game',
                'konser', 'concert', 'tiket', 'ticket', 'hobi', 'hobby'
            ],
            'Investasi': [
                'investasi', 'investment', 'saham', 'stock', 'reksadana', 'mutual fund',
                'emas', 'gold', 'deposito', 'deposit', 'crypto', 'bitcoin'
            ]
        };
    }
    // Auto-categorization based on description
    predictCategory(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transaction.type === 'income') {
                return null; // Income categories are simpler, skip AI for now
            }
            const description = transaction.description.toLowerCase();
            let bestMatch = null;
            let highestConfidence = 0;
            // Get all expense categories
            const categories = yield database_1.default.category.findMany({
                where: { type: 'expense' }
            });
            for (const category of categories) {
                const keywords = this.categoryKeywords[category.name] || [];
                let confidence = 0;
                // Check keyword matches
                for (const keyword of keywords) {
                    if (description.includes(keyword.toLowerCase())) {
                        confidence += 0.3; // Base confidence for keyword match
                        // Bonus for exact word match
                        if (description.includes(` ${keyword.toLowerCase()} `) ||
                            description.startsWith(keyword.toLowerCase()) ||
                            description.endsWith(keyword.toLowerCase())) {
                            confidence += 0.2;
                        }
                    }
                }
                // Amount-based heuristics
                if (category.name === 'Makanan & Minuman' && transaction.amount <= 100000) {
                    confidence += 0.1;
                }
                if (category.name === 'Transportasi' && transaction.amount <= 50000) {
                    confidence += 0.1;
                }
                if (category.name === 'Tagihan' && transaction.amount >= 100000) {
                    confidence += 0.1;
                }
                if (confidence > highestConfidence) {
                    highestConfidence = confidence;
                    bestMatch = {
                        categoryId: category.id,
                        categoryName: category.name,
                        confidence: Math.min(confidence, 1.0)
                    };
                }
            }
            // Only return prediction if confidence is above threshold
            return highestConfidence >= 0.3 ? bestMatch : null;
        });
    }
    // Smart budget recommendations based on historical data
    getBudgetRecommendations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // Get user's transaction history for the last 3 months
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: threeMonthsAgo
                    },
                    categoryId: {
                        not: null
                    }
                },
                include: {
                    category: true
                }
            });
            // Group transactions by category
            const categoryStats = new Map();
            transactions.forEach(transaction => {
                if (transaction.category) {
                    const existing = categoryStats.get(transaction.categoryId);
                    if (existing) {
                        existing.total += transaction.amount;
                        existing.count += 1;
                    }
                    else {
                        categoryStats.set(transaction.categoryId, {
                            total: transaction.amount,
                            count: 1,
                            category: transaction.category
                        });
                    }
                }
            });
            // Calculate recommendations
            for (const [categoryId, stats] of categoryStats) {
                const averageMonthly = stats.total / 3; // 3 months
                const recommendedAmount = Math.round(averageMonthly * 1.1); // 10% buffer
                let reason = '';
                if (stats.count >= 10) {
                    reason = 'Berdasarkan pola pengeluaran yang konsisten';
                }
                else if (stats.count >= 5) {
                    reason = 'Berdasarkan beberapa transaksi terakhir';
                }
                else {
                    reason = 'Berdasarkan transaksi yang ada';
                }
                recommendations.push({
                    categoryId,
                    categoryName: stats.category.name,
                    recommendedAmount,
                    reason
                });
            }
            // Sort by recommended amount (highest first)
            return recommendations.sort((a, b) => b.recommendedAmount - a.recommendedAmount);
        });
    }
    // Get spending insights
    getSpendingInsights(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            // Get last month's transactions
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: lastMonth
                    }
                },
                include: {
                    category: true
                }
            });
            if (transactions.length === 0) {
                insights.push('Belum ada data pengeluaran yang cukup untuk analisis');
                return insights;
            }
            // Calculate total spending
            const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
            // Find top spending category
            const categorySpending = new Map();
            transactions.forEach(t => {
                if (t.category) {
                    const current = categorySpending.get(t.category.name) || 0;
                    categorySpending.set(t.category.name, current + t.amount);
                }
            });
            const topCategory = Array.from(categorySpending.entries())
                .sort((a, b) => b[1] - a[1])[0];
            if (topCategory) {
                const percentage = Math.round((topCategory[1] / totalSpending) * 100);
                insights.push(`Pengeluaran terbesar Anda adalah ${topCategory[0]} (${percentage}% dari total)`);
            }
            // Check for unusual spending patterns
            const averageAmount = totalSpending / transactions.length;
            const highAmountTransactions = transactions.filter(t => t.amount > averageAmount * 2);
            if (highAmountTransactions.length > 0) {
                insights.push(`Anda memiliki ${highAmountTransactions.length} transaksi dengan nilai tinggi`);
            }
            // Spending frequency insight
            const dailySpending = new Map();
            transactions.forEach(t => {
                const date = t.date.toISOString().split('T')[0];
                dailySpending.set(date, (dailySpending.get(date) || 0) + 1);
            });
            const averageDailyTransactions = transactions.length / 30;
            if (averageDailyTransactions > 3) {
                insights.push('Anda melakukan transaksi lebih dari 3 kali per hari rata-rata');
            }
            return insights;
        });
    }
    // Predict next month's spending
    predictNextMonthSpending(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get last 3 months data
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const transactions = yield database_1.default.transaction.findMany({
                where: {
                    userId,
                    type: 'expense',
                    date: {
                        gte: threeMonthsAgo
                    },
                    categoryId: {
                        not: null
                    }
                },
                include: {
                    category: true
                }
            });
            // Group by category and calculate monthly average
            const categoryAverages = new Map();
            transactions.forEach(transaction => {
                if (transaction.category) {
                    const existing = categoryAverages.get(transaction.categoryId);
                    if (existing) {
                        existing.total += transaction.amount;
                        existing.count += 1;
                    }
                    else {
                        categoryAverages.set(transaction.categoryId, {
                            total: transaction.amount,
                            count: 1,
                            category: transaction.category
                        });
                    }
                }
            });
            let totalPredicted = 0;
            const breakdown = [];
            for (const [categoryId, stats] of categoryAverages) {
                const monthlyAverage = stats.total / 3; // 3 months
                const predicted = Math.round(monthlyAverage * 1.05); // 5% growth assumption
                breakdown.push({
                    categoryId,
                    categoryName: stats.category.name,
                    predictedAmount: predicted,
                    confidence: Math.min(stats.count / 10, 1.0) // More data = higher confidence
                });
                totalPredicted += predicted;
            }
            return {
                total: totalPredicted,
                breakdown: breakdown.sort((a, b) => b.predictedAmount - a.predictedAmount)
            };
        });
    }
    // Get budget insights
    getBudgetInsights(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield database_1.default.transaction.findMany({
                where: { userId, type: 'expense' },
                include: { category: true },
                orderBy: { date: 'desc' },
                take: 100
            });
            if (transactions.length === 0) {
                return {
                    message: 'Belum ada data transaksi untuk dianalisis',
                    insights: []
                };
            }
            const insights = [];
            // Analyze spending trends
            const monthlyData = transactions.reduce((acc, transaction) => {
                const month = transaction.date.toISOString().slice(0, 7);
                if (!acc[month]) {
                    acc[month] = { total: 0, count: 0 };
                }
                acc[month].total += transaction.amount;
                acc[month].count += 1;
                return acc;
            }, {});
            const monthlyTotals = Object.values(monthlyData).map(m => m.total);
            if (monthlyTotals.length > 1) {
                const avgMonthly = monthlyTotals.reduce((sum, val) => sum + val, 0) / monthlyTotals.length;
                const latestMonth = monthlyTotals[monthlyTotals.length - 1];
                if (latestMonth > avgMonthly * 1.3) {
                    insights.push({
                        type: 'high_spending_alert',
                        title: 'Peringatan Pengeluaran Tinggi',
                        message: 'Pengeluaran bulan ini 30% lebih tinggi dari rata-rata. Pertimbangkan untuk mengatur budget yang lebih ketat.',
                        severity: 'high'
                    });
                }
            }
            // Analyze category spending
            const categoryTotals = transactions.reduce((acc, transaction) => {
                var _a;
                const categoryName = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
                acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
                return acc;
            }, {});
            const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
            const topCategory = Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)[0];
            if (topCategory) {
                const [categoryName, amount] = topCategory;
                const percentage = (amount / totalSpending) * 100;
                if (percentage > 50) {
                    insights.push({
                        type: 'category_concentration',
                        title: 'Konsentrasi Pengeluaran Tinggi',
                        message: `${categoryName} mengambil ${percentage.toFixed(1)}% dari total pengeluaran. Pertimbangkan untuk mendiversifikasi pengeluaran.`,
                        severity: 'medium'
                    });
                }
            }
            return {
                message: 'Insight budget berhasil dibuat',
                insights
            };
        });
    }
}
exports.default = new AIService();
