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
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
class GeminiAIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not found in environment variables');
            return;
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    // Check if Gemini is available
    isAvailable() {
        return !!process.env.GEMINI_API_KEY && !!this.model;
    }
    // Generate financial insights using Gemini
    generateFinancialInsights(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildFinancialInsightsPrompt(financialData);
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating financial insights with Gemini:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Generate personalized recommendations
    generatePersonalizedRecommendations(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildRecommendationsPrompt(financialData);
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating recommendations with Gemini:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Generate chatbot response
    generateChatbotResponse(message, userContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAvailable()) {
                return this.getFallbackChatResponse(message);
            }
            try {
                const prompt = this.buildChatbotPrompt(message, userContext);
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating chatbot response with Gemini:', error);
                return this.getFallbackChatResponse(message);
            }
        });
    }
    // Generate budget suggestions
    generateBudgetSuggestions(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildBudgetPrompt(financialData);
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating budget suggestions with Gemini:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Generate investment advice
    generateInvestmentAdvice(userId, financialData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAvailable()) {
                return this.getFallbackResponse();
            }
            try {
                const prompt = this.buildInvestmentPrompt(financialData);
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                return this.parseAIResponse(text);
            }
            catch (error) {
                console.error('Error generating investment advice with Gemini:', error);
                return this.getFallbackResponse();
            }
        });
    }
    // Tambahkan di dalam class GeminiAIService
    classifyReceipt(ocrText) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                try {
                    return JSON.parse(text);
                }
                catch (_a) {
                    return text;
                }
            }
            catch (error) {
                console.error('Error classifying receipt with Gemini:', error);
                return [];
            }
        });
    }
    // Build prompts for different use cases
    buildFinancialInsightsPrompt(data) {
        const { transactions, goals, budgets } = data;
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

    // PREFERENSI PENGGUNA: (sudah tidak digunakan)

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
    Sebagai asisten keuangan AI, berikan saran budget yang optimal berdasarkan pola pengeluaran pengguna.

    DATA KEUANGAN:
    ${JSON.stringify(data, null, 2)}

    TUGAS:
    1. Analisis pola pengeluaran per kategori
    2. Identifikasi kategori yang membutuhkan budget
    3. Berikan saran alokasi budget yang optimal
    4. Sertakan tips untuk mengelola budget
    5. Berikan strategi untuk mencapai target budget

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Ringkasan saran budget",
      "recommendations": [
        {
          "category": "Nama kategori",
          "suggestedAmount": 1000000,
          "reason": "Alasan alokasi",
          "tips": ["Tip 1", "Tip 2", "Tip 3"]
        }
      ],
      "insights": ["Insight budget 1", "Insight budget 2"],
      "suggestions": ["Saran implementasi 1", "Saran implementasi 2"]
    }
    `;
    }
    buildInvestmentPrompt(data) {
        return `
    Sebagai asisten keuangan AI, berikan saran investasi yang sesuai dengan profil risiko dan tujuan keuangan pengguna.

    DATA KEUANGAN:
    ${JSON.stringify(data, null, 2)}

    TUGAS:
    1. Analisis profil risiko berdasarkan data keuangan
    2. Identifikasi tujuan investasi
    3. Berikan rekomendasi produk investasi yang sesuai
    4. Sertakan strategi diversifikasi
    5. Berikan tips manajemen risiko

    RESPONSE FORMAT:
    Berikan response dalam format JSON dengan struktur:
    {
      "message": "Ringkasan saran investasi",
      "recommendations": [
        {
          "product": "Nama produk investasi",
          "allocation": 30,
          "risk": "low/medium/high",
          "expectedReturn": "5-8% per tahun",
          "description": "Deskripsi produk",
          "pros": ["Keuntungan 1", "Keuntungan 2"],
          "cons": ["Risiko 1", "Risiko 2"]
        }
      ],
      "insights": ["Insight investasi 1", "Insight investasi 2"],
      "suggestions": ["Saran implementasi 1", "Saran implementasi 2"]
    }
    `;
    }
    // Parse AI response
    parseAIResponse(text) {
        try {
            // Try to parse as JSON first
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    message: parsed.message || text,
                    suggestions: parsed.suggestions || [],
                    insights: parsed.insights || [],
                    recommendations: parsed.recommendations || [],
                    confidence: parsed.confidence || 0.8
                };
            }
            // Fallback to simple text response
            return {
                message: text,
                suggestions: [],
                insights: [],
                confidence: 0.7
            };
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            return {
                message: text,
                suggestions: [],
                insights: [],
                confidence: 0.6
            };
        }
    }
    // Fallback responses when Gemini is not available
    getFallbackResponse() {
        return {
            message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
            suggestions: ['Cek koneksi internet', 'Hubungi support'],
            confidence: 0.0
        };
    }
    getFallbackChatResponse(message) {
        const input = message.toLowerCase();
        if (input.includes('budget') || input.includes('anggaran')) {
            return {
                message: 'Untuk membuat budget yang efektif, saya sarankan:\n\n1. Catat semua pengeluaran rutin\n2. Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan\n3. Review budget secara berkala\n4. Gunakan fitur budget di aplikasi ini untuk tracking',
                suggestions: ['Buat budget bulanan', 'Set up budget alerts', 'Review pengeluaran mingguan'],
                confidence: 0.8
            };
        }
        if (input.includes('tabung') || input.includes('saving')) {
            return {
                message: 'Tips menabung yang efektif:\n\n1. Pay yourself first - sisihkan 20% dari gaji\n2. Otomatisasi transfer ke rekening tabungan\n3. Buat dana darurat 3-6 bulan pengeluaran\n4. Investasikan kelebihan dana untuk pertumbuhan',
                suggestions: ['Set target tabungan bulanan', 'Buat dana darurat', 'Review pengeluaran'],
                confidence: 0.8
            };
        }
        return {
            message: 'Terima kasih atas pertanyaan Anda! Saya fokus membantu topik keuangan seperti budgeting, tabungan, investasi, dan perencanaan keuangan. Bisakah Anda berikan pertanyaan yang lebih spesifik?',
            suggestions: ['Cara membuat budget', 'Tips menabung', 'Investasi untuk pemula', 'Perencanaan keuangan'],
            confidence: 0.7
        };
    }
}
exports.default = new GeminiAIService();
