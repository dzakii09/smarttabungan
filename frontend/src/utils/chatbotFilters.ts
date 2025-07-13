export interface ChatbotFilter {
  isFinancialTopic: boolean;
  confidence: number;
  suggestedTopics?: string[];
  warning?: string;
}

// Kata kunci yang terkait dengan keuangan
const FINANCIAL_KEYWORDS = [
  // Budgeting & Planning
  'budget', 'anggaran', 'perencanaan', 'planning', 'cashflow', 'aliran kas',
  'pengeluaran', 'expense', 'pendapatan', 'income', 'gaji', 'salary',
  
  // Saving & Investment
  'tabung', 'menabung', 'tabungan', 'saving', 'menyimpan', 'uang saku', 'anak-anak', 'anak', 'edukasi keuangan',
  'investasi', 'investment', 'deposito', 'deposit',
  'reksadana', 'mutual fund', 'saham', 'stock', 'obligasi', 'bond',
  'emas', 'gold', 'properti', 'property', 'crypto', 'bitcoin',
  
  // Debt & Credit
  'utang', 'debt', 'kredit', 'credit', 'cicilan', 'installment',
  'kartu kredit', 'credit card', 'pinjaman', 'loan', 'bunga', 'interest',
  
  // Emergency & Insurance
  'dana darurat', 'emergency fund', 'asuransi', 'insurance',
  'proteksi', 'protection', 'risiko', 'risk',
  
  // Financial Goals
  'tujuan', 'goal', 'target', 'impian', 'dream', 'rencana', 'plan',
  'pensiun', 'retirement', 'rumah', 'house', 'mobil', 'car',
  
  // Financial Analysis
  'analisis', 'analysis', 'laporan', 'report', 'statistik', 'statistics',
  'trend', 'tren', 'perbandingan', 'comparison', 'rasio', 'ratio',
  
  // Common Financial Terms
  'keuangan', 'finance', 'uang', 'duit', 'money', 'harga', 'price', 'biaya', 'cost',
  'untung', 'profit', 'rugi', 'loss', 'modal', 'capital', 'aset', 'asset',
  // Everyday terms
  'habis', 'boros', 'hemat', 'belanja', 'gaji', 'pengeluaran', 'tabungan', 'pendapatan', 'pemasukan', 'keluar', 'masuk', 'sisa', 'saldo', 'dompet', 'tips', 'cara', 'kenapa', 'mengapa', 'kenapa uang', 'kenapa cepat habis', 'kenapa boros', 'kenapa saldo', 'kenapa pengeluaran', 'kenapa tabungan', 'kenapa gaji', 'kenapa pendapatan', 'kenapa pemasukan', 'kenapa keluar', 'kenapa masuk', 'kenapa sisa', 'kenapa dompet', 'kenapa keuangan', 'kenapa budget', 'kenapa anggaran', 'kenapa hemat', 'kenapa tips', 'mengatur', 'mengelola', 'menghemat', 'menghabiskan', 'mengelola uang', 'mengatur uang', 'mengatur pengeluaran', 'mengatur tabungan', 'mengatur gaji', 'mengatur pendapatan', 'mengatur pemasukan', 'mengatur keluar', 'mengatur masuk', 'mengatur sisa', 'mengatur saldo', 'mengatur dompet', 'mengatur keuangan', 'mengatur budget', 'mengatur anggaran', 'mengatur hemat', 'mengatur tips', 'cara hemat', 'cara menabung', 'cara investasi', 'cara mengatur', 'cara mengelola', 'cara menghemat', 'cara menghabiskan', 'cara mengelola uang', 'cara mengatur uang', 'cara mengatur pengeluaran', 'cara mengatur tabungan', 'cara mengatur gaji', 'cara mengatur pendapatan', 'cara mengatur pemasukan', 'cara mengatur keluar', 'cara mengatur masuk', 'cara mengatur sisa', 'cara mengatur saldo', 'cara mengatur dompet', 'cara mengatur keuangan', 'cara mengatur budget', 'cara mengatur anggaran', 'cara mengatur hemat', 'cara mengatur tips'
];

// Kata kunci yang TIDAK terkait keuangan (untuk filtering)
const NON_FINANCIAL_KEYWORDS = [
  'game', 'film', 'movie', 'musik', 'music', 'olahraga', 'sport',
  'politik', 'politics', 'gossip', 'selebriti', 'celebrity',
  'resep', 'recipe', 'masak', 'cooking', 'travel', 'wisata',
  'teknologi', 'technology', 'programming', 'coding'
];

export function filterFinancialTopic(input: string): ChatbotFilter {
  const lowerInput = input.toLowerCase();
  const words = lowerInput.split(/\s+/);
  
  let financialScore = 0;
  let nonFinancialScore = 0;
  const foundFinancialKeywords: string[] = [];
  const foundNonFinancialKeywords: string[] = [];
  
  // Check financial keywords
  FINANCIAL_KEYWORDS.forEach(keyword => {
    if (lowerInput.includes(keyword)) {
      financialScore += 1;
      foundFinancialKeywords.push(keyword);
    }
  });
  
  // Check non-financial keywords
  NON_FINANCIAL_KEYWORDS.forEach(keyword => {
    if (lowerInput.includes(keyword)) {
      nonFinancialScore += 1;
      foundNonFinancialKeywords.push(keyword);
    }
  });
  
  // Calculate confidence
  const totalScore = financialScore + nonFinancialScore;
  const confidence = totalScore > 0 ? financialScore / totalScore : 0;
  
  // PERMISSIVE: Blokir hanya jika ada kata non-finansial DAN tidak ada kata finansial sama sekali
  const isFinancialTopic = nonFinancialScore === 0 || financialScore > 0;
  
  // Logging for debug
  if (typeof window !== 'undefined') {
    console.log('[ChatbotFilter-Permissive]', {input, financialScore, foundFinancialKeywords, nonFinancialScore, foundNonFinancialKeywords, isFinancialTopic});
  }
  
  // Generate suggestions if not financial
  let suggestedTopics: string[] = [];
  let warning: string | undefined;
  
  if (!isFinancialTopic && confidence < 0.5) {
    suggestedTopics = [
      'Bagaimana cara membuat budget bulanan?',
      'Tips menabung untuk pemula',
      'Investasi apa yang cocok untuk pemula?',
      'Cara mengatur dana darurat',
      'Strategi melunasi utang dengan cepat'
    ];
    
    warning = 'Saya fokus membantu topik keuangan pribadi. Silakan tanyakan tentang budgeting, tabungan, investasi, atau perencanaan keuangan Anda.';
  }
  
  return {
    isFinancialTopic,
    confidence,
    suggestedTopics,
    warning
  };
}

export function validateChatbotInput(input: string): { isValid: boolean; error?: string } {
  if (!input.trim()) {
    return { isValid: false, error: 'Pesan tidak boleh kosong' };
  }
  
  if (input.length > 500) {
    return { isValid: false, error: 'Pesan terlalu panjang (maksimal 500 karakter)' };
  }
  
  // Check for inappropriate content
  const inappropriateWords = ['kasar', 'spam', 'promosi'];
  const lowerInput = input.toLowerCase();
  
  for (const word of inappropriateWords) {
    if (lowerInput.includes(word)) {
      return { isValid: false, error: 'Pesan mengandung konten yang tidak sesuai' };
    }
  }
  
  return { isValid: true };
} 