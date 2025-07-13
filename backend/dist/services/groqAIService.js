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
const groq_sdk_1 = __importDefault(require("groq-sdk"));
class GroqAIService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('GROQ_API_KEY not found in environment variables');
            return;
        }
        this.groq = new groq_sdk_1.default({
            apiKey: apiKey,
        });
        this.model = 'llama3-8b-8192'; // Fast and accurate model
    }
    // Check if GROQ is available
    isAvailable() {
        return !!process.env.GROQ_API_KEY && !!this.groq;
    }
    // Generate financial insights using GROQ
    generateFinancialInsights(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildFinancialInsightsPrompt(financialData);
                const completion = yield this.groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a financial AI assistant. Provide insights in Indonesian language. Always respond in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.7,
                    max_tokens: 1000,
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating financial insights with GROQ:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Generate personalized recommendations
    generatePersonalizedRecommendations(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildRecommendationsPrompt(financialData);
                const completion = yield this.groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a financial AI assistant. Provide personalized recommendations in Indonesian language. Always respond in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.7,
                    max_tokens: 1500,
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating recommendations with GROQ:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Generate chatbot response
    generateChatbotResponse(message, userContext) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isAvailable()) {
                return this.getFallbackChatResponse(message);
            }
            try {
                const prompt = this.buildChatbotPrompt(message, userContext);
                const completion = yield this.groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a friendly financial AI assistant. Respond in Indonesian language. Be helpful and practical.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.8,
                    max_tokens: 800,
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating chatbot response with GROQ:', error);
                return this.getFallbackChatResponse(message);
            }
        });
    }
    // Generate budget suggestions
    generateBudgetSuggestions(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildBudgetPrompt(financialData);
                const completion = yield this.groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a financial AI assistant. Provide budget suggestions in Indonesian language. Always respond in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.6,
                    max_tokens: 1000,
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating budget suggestions with GROQ:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Generate investment advice
    generateInvestmentAdvice(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildInvestmentPrompt(financialData);
                const completion = yield this.groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a financial AI assistant. Provide investment advice in Indonesian language. Always respond in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.5,
                    max_tokens: 1200,
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating investment advice with GROQ:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Classify receipt items
    classifyReceipt(ocrText) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.isAvailable()) {
                return [];
            }
            try {
                const prompt = `
        Berikut adalah hasil OCR dari struk belanja:
        "${ocrText}"

        Tolong ekstrak daftar item, harga, dan klasifikasikan setiap item ke kategori (misal: makanan/minuman, kebutuhan rumah, kebersihan, dll).
        Format output JSON: [{ "item": "...", "price": ..., "category": "..." }, ...]
      `;
                const completion = yield this.groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a receipt classification AI. Extract items and categorize them. Always respond in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: this.model,
                    temperature: 0.3,
                    max_tokens: 500,
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                try {
                    return JSON.parse(text);
                }
                catch (_c) {
                    return text;
                }
            }
            catch (error) {
                console.error('Error classifying receipt with GROQ:', error);
                return [];
            }
        });
    }
    // Build prompts for different use cases
    buildFinancialInsightsPrompt(data) {
        const { transactions, goals, budgets, preferences } = data;
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
        return `
    Sebagai asisten keuangan AI, analisis data keuangan berikut dan berikan insight yang berguna:

    DATA KEUANGAN:
    - Total pendapatan: Rp ${totalIncome.toLocaleString()}
    - Total pengeluaran: Rp ${totalExpenses.toLocaleString()}
    - Tingkat tabungan: ${savingsRate.toFixed(1)}%
    - Jumlah transaksi: ${transactions.length}
    - Tujuan keuangan: ${goals.length} tujuan
    - Budget aktif: ${budgets.length} budget

    PREFERENSI PENGGUNA:
    - Mata uang: ${(preferences === null || preferences === void 0 ? void 0 : preferences.defaultCurrency) || 'IDR'}
    - Tema: ${(preferences === null || preferences === void 0 ? void 0 : preferences.theme) || 'light'}
    - Bahasa: ${(preferences === null || preferences === void 0 ? void 0 : preferences.language) || 'id'}

    TUGAS:
    1. Analisis pola pengeluaran dan pendapatan
    2. Identifikasi area yang bisa dioptimalkan
    3. Berikan 3-5 insight yang actionable
    4. Sertakan saran untuk meningkatkan kesehatan keuangan
    5. Berikan estimasi potensi penghematan

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Pesan utama insight",
      "insights": ["Insight 1", "Insight 2", "Insight 3"],
      "recommendations": [
        {
          "title": "Judul rekomendasi",
          "description": "Deskripsi",
          "estimatedSavings": 1000000,
          "difficulty": "easy/medium/hard"
        }
      ],
      "suggestions": ["Saran 1", "Saran 2", "Saran 3"]
    }
    `;
    }
    buildRecommendationsPrompt(data) {
        return `
    Sebagai asisten keuangan AI, berikan rekomendasi personal yang spesifik berdasarkan data keuangan pengguna.

    DATA KEUANGAN:
    ${JSON.stringify(data, null, 2)}

    TUGAS:
    1. Analisis pola keuangan pengguna
    2. Identifikasi peluang perbaikan
    3. Berikan 5-7 rekomendasi yang actionable
    4. Prioritaskan berdasarkan impact dan kemudahan implementasi
    5. Sertakan estimasi penghematan/peningkatan

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Ringkasan rekomendasi utama",
      "recommendations": [
        {
          "id": "rec_1",
          "type": "budget/savings/investment/spending/goal",
          "title": "Judul rekomendasi",
          "description": "Deskripsi detail",
          "priority": "low/medium/high",
          "impact": "low/medium/high",
          "estimatedSavings": 500000,
          "estimatedTime": "1-3 bulan",
          "difficulty": "easy/medium/hard",
          "actionable": true
        }
      ],
      "insights": ["Insight 1", "Insight 2"],
      "suggestions": ["Saran implementasi 1", "Saran implementasi 2"]
    }
    `;
    }
    buildChatbotPrompt(message, userContext) {
        var _a, _b, _c, _d, _e;
        return `
    Sebagai asisten keuangan AI yang ramah dan membantu, jawab pertanyaan pengguna dengan bijak dan praktis.

    PERTANYAAN PENGGUNA: "${message}"

    KONTEKS PENGGUNA:
    - Pendapatan bulanan: Rp ${((_a = userContext.monthlyIncome) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 'Tidak tersedia'}
    - Pengeluaran bulanan: Rp ${((_b = userContext.monthlyExpenses) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || 'Tidak tersedia'}
    - Tingkat tabungan: ${((_c = userContext.savingsRate) === null || _c === void 0 ? void 0 : _c.toFixed(1)) || '0'}%
    - Jumlah tujuan: ${((_d = userContext.goals) === null || _d === void 0 ? void 0 : _d.length) || 0}
    - Total transaksi: ${((_e = userContext.transactions) === null || _e === void 0 ? void 0 : _e.length) || 0}

    INSTRUKSI:
    1. Jawab dengan ramah dan profesional
    2. Berikan saran yang praktis dan actionable
    3. Gunakan bahasa Indonesia yang mudah dipahami
    4. Sertakan contoh konkret jika relevan
    5. Berikan 3-4 saran follow-up yang relevan

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Jawaban utama yang informatif dan membantu",
      "suggestions": ["Saran follow-up 1", "Saran follow-up 2", "Saran follow-up 3"],
      "insights": ["Insight tambahan jika relevan"],
      "confidence": 0.9
    }
    `;
    }
    buildBudgetPrompt(data) {
        return `
    Sebagai asisten keuangan AI, berikan saran budget yang optimal berdasarkan data keuangan pengguna.

    DATA KEUANGAN:
    ${JSON.stringify(data, null, 2)}

    TUGAS:
    1. Analisis pola pengeluaran per kategori
    2. Berikan saran alokasi budget yang optimal
    3. Sertakan tips mengelola budget
    4. Berikan peringatan untuk kategori yang berisiko over-spending

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Ringkasan saran budget",
      "budgetSuggestions": [
        {
          "category": "Makanan & Minuman",
          "recommendedAmount": 2000000,
          "currentAverage": 1800000,
          "reason": "Alasan rekomendasi",
          "tips": ["Tip 1", "Tip 2"]
        }
      ],
      "warnings": ["Peringatan 1", "Peringatan 2"],
      "tips": ["Tip umum 1", "Tip umum 2"]
    }
    `;
    }
    buildInvestmentPrompt(data) {
        return `
    Sebagai asisten keuangan AI, berikan saran investasi yang sesuai dengan profil pengguna.

    DATA KEUANGAN:
    ${JSON.stringify(data, null, 2)}

    TUGAS:
    1. Analisis profil risiko pengguna
    2. Berikan saran investasi yang sesuai
    3. Sertakan estimasi return dan risiko
    4. Berikan timeline investasi yang realistis

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Ringkasan saran investasi",
      "investmentSuggestions": [
        {
          "type": "Reksadana",
          "name": "Reksadana Saham",
          "expectedReturn": "12-15% per tahun",
          "risk": "medium",
          "minimumAmount": 100000,
          "description": "Deskripsi investasi"
        }
      ],
      "riskProfile": "conservative/moderate/aggressive",
      "tips": ["Tip investasi 1", "Tip investasi 2"]
    }
    `;
    }
    parseAIResponse(text) {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(text);
            return {
                message: parsed.message || 'Response dari AI',
                suggestions: parsed.suggestions || [],
                insights: parsed.insights || [],
                recommendations: parsed.recommendations || [],
                confidence: parsed.confidence || 0.8
            };
        }
        catch (error) {
            // If JSON parsing fails, treat as plain text
            return {
                message: text,
                suggestions: [],
                insights: [],
                confidence: 0.6
            };
        }
    }
    getFallbackResponse() {
        return {
            message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
            suggestions: [],
            insights: [],
            confidence: 0.5
        };
    }
    getFallbackChatResponse(message) {
        const responses = [
            'Maaf, saya sedang mengalami gangguan teknis. Silakan coba lagi nanti.',
            'Layanan AI sedang tidak tersedia. Apakah ada yang bisa saya bantu dengan fitur lain?',
            'Terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi.'
        ];
        return {
            message: responses[Math.floor(Math.random() * responses.length)],
            suggestions: ['Coba lagi nanti', 'Gunakan fitur lain', 'Hubungi support'],
            confidence: 0.3
        };
    }
}
exports.default = new GroqAIService();
