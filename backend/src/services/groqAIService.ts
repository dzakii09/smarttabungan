import Groq from 'groq-sdk';

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

class GroqAIService {
  private groq: Groq;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('GROQ_API_KEY not found in environment variables');
      return;
    }

    this.groq = new Groq({
      apiKey: apiKey,
    });
    this.model = 'llama3-8b-8192'; // Fast and accurate model
  }

  // Check if GROQ is available
  isAvailable(): boolean {
    return !!process.env.GROQ_API_KEY && !!this.groq;
  }

  // Generate financial insights using GROQ
  async generateFinancialInsights(userId: string, financialData: FinancialData): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackResponse();
    }

    try {
      const prompt = this.buildFinancialInsightsPrompt(financialData);
      const completion = await this.groq.chat.completions.create({
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

      const text = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating financial insights with GROQ:', error);
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
      const completion = await this.groq.chat.completions.create({
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

      const text = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating recommendations with GROQ:', error);
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
      const completion = await this.groq.chat.completions.create({
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

      const text = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating chatbot response with GROQ:', error);
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
      const completion = await this.groq.chat.completions.create({
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

      const text = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating budget suggestions with GROQ:', error);
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
      const completion = await this.groq.chat.completions.create({
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

      const text = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating investment advice with GROQ:', error);
      return this.getFallbackResponse();
    }
  }

  // Classify receipt items
  async classifyReceipt(ocrText: string) {
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
      
      const completion = await this.groq.chat.completions.create({
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

      const text = completion.choices[0]?.message?.content || '';
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (error) {
      console.error('Error classifying receipt with GROQ:', error);
      return [];
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

  private buildInvestmentPrompt(data: FinancialData): string {
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

  private parseAIResponse(text: string): AIResponse {
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
    } catch (error) {
      // If JSON parsing fails, treat as plain text
      return {
        message: text,
        suggestions: [],
        insights: [],
        confidence: 0.6
      };
    }
  }

  private getFallbackResponse(): AIResponse {
    return {
      message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
      suggestions: [],
      insights: [],
      confidence: 0.5
    };
  }

  private getFallbackChatResponse(message: string): AIResponse {
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

export default new GroqAIService(); 