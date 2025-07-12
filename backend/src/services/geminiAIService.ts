import { GoogleGenerativeAI } from '@google/generative-ai';

interface FinancialData {
  transactions: any[];
  goals: any[];
  budgets: any[];
  preferences: any;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  insights?: string[];
  recommendations?: any[];
  confidence?: number;
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Check if Gemini is available
  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY && !!this.model;
  }

  // Generate financial insights using Gemini
  async generateFinancialInsights(userId: string, financialData: FinancialData): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackResponse();
    }

    try {
      const prompt = this.buildFinancialInsightsPrompt(financialData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating financial insights with Gemini:', error);
      return this.getFallbackResponse();
    }
  }

  // Generate personalized recommendations
  async generatePersonalizedRecommendations(userId: string, financialData: FinancialData): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackResponse();
    }

    try {
      const prompt = this.buildRecommendationsPrompt(financialData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating recommendations with Gemini:', error);
      return this.getFallbackResponse();
    }
  }

  // Generate chatbot response
  async generateChatbotResponse(message: string, userContext: any): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackChatResponse(message);
    }

    try {
      const prompt = this.buildChatbotPrompt(message, userContext);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating chatbot response with Gemini:', error);
      return this.getFallbackChatResponse(message);
    }
  }

  // Generate budget suggestions
  async generateBudgetSuggestions(userId: string, financialData: FinancialData): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackResponse();
    }

    try {
      const prompt = this.buildBudgetPrompt(financialData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating budget suggestions with Gemini:', error);
      return this.getFallbackResponse();
    }
  }

  // Generate investment advice
  async generateInvestmentAdvice(userId: string, financialData: FinancialData): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackResponse();
    }

    try {
      const prompt = this.buildInvestmentPrompt(financialData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating investment advice with Gemini:', error);
      return this.getFallbackResponse();
    }
  }

  // Build prompts for different use cases
  private buildFinancialInsightsPrompt(data: FinancialData): string {
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
    - Mata uang: ${preferences?.defaultCurrency || 'IDR'}
    - Tema: ${preferences?.theme || 'light'}
    - Bahasa: ${preferences?.language || 'id'}

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

  private buildRecommendationsPrompt(data: FinancialData): string {
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

  private buildChatbotPrompt(message: string, userContext: any): string {
    return `
    Sebagai asisten keuangan AI yang ramah dan membantu, jawab pertanyaan pengguna dengan bijak dan praktis.

    PERTANYAAN PENGGUNA: "${message}"

    KONTEKS PENGGUNA:
    - Pendapatan bulanan: Rp ${userContext.monthlyIncome?.toLocaleString() || 'Tidak tersedia'}
    - Pengeluaran bulanan: Rp ${userContext.monthlyExpenses?.toLocaleString() || 'Tidak tersedia'}
    - Tingkat tabungan: ${userContext.savingsRate?.toFixed(1) || '0'}%
    - Jumlah tujuan: ${userContext.goals?.length || 0}
    - Total transaksi: ${userContext.transactions?.length || 0}

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

  private buildBudgetPrompt(data: FinancialData): string {
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

  private buildInvestmentPrompt(data: FinancialData): string {
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
  private parseAIResponse(text: string): AIResponse {
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
    } catch (error) {
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
  private getFallbackResponse(): AIResponse {
    return {
      message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
      suggestions: ['Cek koneksi internet', 'Hubungi support'],
      confidence: 0.0
    };
  }

  private getFallbackChatResponse(message: string): AIResponse {
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

export default new GeminiAIService(); 