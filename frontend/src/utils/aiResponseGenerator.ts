import { Transaction, Goal, DashboardStats } from '../types';

export interface UserContext {
  transactions: Transaction[];
  goals: Goal[];
  stats: DashboardStats;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  insights?: string[];
  actionable?: string[];
}

export class AIResponseGenerator {
  private userContext: UserContext | null = null;

  setUserContext(context: UserContext) {
    this.userContext = context;
  }

  generateResponse(userInput: string): AIResponse {
    const input = userInput.toLowerCase();
    
    // Check for specific financial topics
    if (input.includes('budget') || input.includes('anggaran')) {
      return this.generateBudgetResponse();
    }
    
    if (input.includes('tabung') || input.includes('saving')) {
      return this.generateSavingResponse();
    }
    
    if (input.includes('investasi') || input.includes('invest')) {
      return this.generateInvestmentResponse();
    }
    
    if (input.includes('utang') || input.includes('debt')) {
      return this.generateDebtResponse();
    }
    
    if (input.includes('dana darurat') || input.includes('emergency fund')) {
      return this.generateEmergencyFundResponse();
    }
    
    if (input.includes('analisis') || input.includes('laporan') || input.includes('statistik')) {
      return this.generateAnalysisResponse();
    }
    
    if (input.includes('tujuan') || input.includes('goal')) {
      return this.generateGoalResponse();
    }
    
    // Default response
    return this.generateDefaultResponse();
  }

  private generateBudgetResponse(): AIResponse {
    if (this.userContext) {
      const { monthlyIncome, monthlyExpenses, savingsRate } = this.userContext;
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
      } else if (spendingRatio > 60) {
        message += `✅ Pengeluaran Anda dalam batas wajar. Tips untuk optimalisasi:\n`;
        message += `• Pertimbangkan menambah alokasi investasi\n`;
        message += `• Review pengeluaran diskresioner\n`;
        message += `• Tingkatkan dana darurat`;
      } else {
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
    
    return {
      message: 'Untuk membuat anggaran yang efektif, saya sarankan menggunakan aturan 50/30/20: 50% untuk kebutuhan pokok, 30% untuk keinginan, dan 20% untuk tabungan dan investasi. Apakah Anda ingin saya bantu menghitung anggaran berdasarkan penghasilan Anda?',
      suggestions: [
        'Hitung pengeluaran rutin bulanan',
        'Identifikasi pengeluaran diskresioner',
        'Set target tabungan bulanan'
      ]
    };
  }

  private generateSavingResponse(): AIResponse {
    if (this.userContext) {
      const { savingsRate, monthlyIncome } = this.userContext;
      const currentSavings = (savingsRate / 100) * monthlyIncome;
      
      let message = `Analisis tabungan Anda:\n\n`;
      message += `💰 Tabungan bulanan saat ini: Rp ${currentSavings.toLocaleString()}\n`;
      message += `📊 Tingkat tabungan: ${savingsRate.toFixed(1)}%\n\n`;
      
      if (savingsRate < 10) {
        message += `⚠️ Tingkat tabungan Anda rendah. Saya sarankan:\n`;
        message += `• Mulai dengan target 10% dari penghasilan\n`;
        message += `• Otomatisasi tabungan dengan auto-debit\n`;
        message += `• Review pengeluaran untuk menghemat lebih`;
      } else if (savingsRate < 20) {
        message += `✅ Tabungan Anda sudah baik. Tips meningkatkan:\n`;
        message += `• Tingkatkan target ke 20% penghasilan\n`;
        message += `• Pisahkan rekening tabungan\n`;
        message += `• Pertimbangkan investasi untuk pertumbuhan`;
      } else {
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
    
    return {
      message: 'Tips menabung yang efektif: 1) Otomatisasi tabungan dengan auto-debit, 2) Gunakan metode "bayar diri sendiri terlebih dahulu", 3) Pisahkan rekening tabungan dari rekening harian, 4) Tetapkan tujuan tabungan yang spesifik dan terukur. Berapa persen dari penghasilan yang ingin Anda tabung?',
      suggestions: [
        'Mulai dengan 10% penghasilan',
        'Buat multiple rekening tabungan',
        'Set target tabungan bulanan'
      ]
    };
  }

  private generateInvestmentResponse(): AIResponse {
    if (this.userContext) {
      const { savingsRate, monthlyIncome } = this.userContext;
      
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
      } else {
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
    
    return {
      message: 'Untuk pemula, saya sarankan mulai dengan: 1) Reksadana campuran atau saham untuk jangka panjang, 2) Deposito atau obligasi untuk yang konservatif, 3) Diversifikasi portfolio, 4) Investasi berkala dengan nominal tetap. Pastikan Anda sudah memiliki dana darurat sebelum berinvestasi ya!',
      suggestions: [
        'Pelajari reksadana untuk pemula',
        'Set up investasi berkala',
        'Diversifikasi portfolio'
      ]
    };
  }

  private generateDebtResponse(): AIResponse {
    return {
      message: 'Strategi melunasi utang: 1) Buat daftar semua utang beserta bunganya, 2) Prioritaskan utang dengan bunga tertinggi (debt avalanche) atau utang terkecil (debt snowball), 3) Negosiasi dengan kreditur jika perlu, 4) Hindari utang baru. Apakah Anda butuh bantuan menyusun rencana pelunasan utang?',
      suggestions: [
        'Buat daftar semua utang',
        'Prioritaskan utang dengan bunga tinggi',
        'Set up rencana pelunasan sistematis'
      ]
    };
  }

  private generateEmergencyFundResponse(): AIResponse {
    if (this.userContext) {
      const { monthlyExpenses } = this.userContext;
      const targetEmergencyFund = monthlyExpenses * 6;
      
      let message = `Dana darurat ideal untuk Anda:\n\n`;
      message += `💸 Pengeluaran bulanan: Rp ${monthlyExpenses.toLocaleString()}\n`;
      message += `🎯 Target dana darurat (6 bulan): Rp ${targetEmergencyFund.toLocaleString()}\n\n`;
      message += `Tips mengumpulkan dana darurat:\n`;
      message += `• Mulai dengan target 1 bulan pengeluaran\n`;
      message += `• Simpan di rekening terpisah\n`;
      message += `• Top up secara berkala\n`;
      message += `• Hanya gunakan untuk keperluan darurat`;
      
      return {
        message,
        suggestions: [
          'Buat rekening khusus dana darurat',
          'Set target 1 bulan pengeluaran dulu',
          'Top up dana darurat setiap bulan'
        ]
      };
    }
    
    return {
      message: 'Dana darurat ideal adalah 6-12 bulan pengeluaran bulanan Anda. Simpan di rekening yang mudah diakses tapi terpisah dari rekening harian. Mulai dengan target 1 bulan pengeluaran dulu, kemudian tingkatkan bertahap. Dana darurat harus liquid dan low-risk ya!',
      suggestions: [
        'Hitung pengeluaran bulanan Anda',
        'Buat rekening khusus dana darurat',
        'Set target bertahap'
      ]
    };
  }

  private generateAnalysisResponse(): AIResponse {
    if (this.userContext) {
      const { transactions, stats } = this.userContext;
      
      // Analyze spending patterns
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Group by category
      const categorySpending = expenseTransactions.reduce((acc, t) => {
        const category = t.category?.name || 'Lainnya';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
      
      const topCategories = Object.entries(categorySpending)
        .sort(([,a], [,b]) => b - a)
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
          `Kategori terbesar: ${topCategories[0]?.[0] || 'N/A'}`,
          `Total transaksi: ${transactions.length}`
        ],
        suggestions: [
          'Review pengeluaran kategori terbesar',
          'Set budget untuk setiap kategori',
          'Monitor cash flow bulanan'
        ]
      };
    }
    
    return {
      message: 'Untuk analisis keuangan yang mendalam, saya perlu melihat data transaksi Anda. Silakan tambahkan beberapa transaksi terlebih dahulu agar saya bisa memberikan analisis yang lebih akurat.',
      suggestions: [
        'Tambahkan transaksi income dan expense',
        'Kategorikan setiap transaksi',
        'Monitor pengeluaran rutin'
      ]
    };
  }

  private generateGoalResponse(): AIResponse {
    if (this.userContext && this.userContext.goals.length > 0) {
      const { goals } = this.userContext;
      
      let message = `🎯 Progress Tujuan Keuangan Anda:\n\n`;
      
      goals.forEach((goal, index) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        message += `${index + 1}. ${goal.name}\n`;
        message += `   Target: Rp ${goal.targetAmount.toLocaleString()}\n`;
        message += `   Progress: Rp ${goal.currentAmount.toLocaleString()} (${progress.toFixed(1)}%)\n`;
        message += `   Sisa: Rp ${remaining.toLocaleString()}\n`;
        message += `   Deadline: ${daysLeft} hari lagi\n\n`;
      });
      
      // Find goals that need attention
      const urgentGoals = goals.filter(g => {
        const progress = (g.currentAmount / g.targetAmount) * 100;
        const daysLeft = Math.ceil((new Date(g.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return progress < 50 && daysLeft < 90;
      });
      
      if (urgentGoals.length > 0) {
        message += `⚠️ Tujuan yang perlu perhatian:\n`;
        urgentGoals.forEach(goal => {
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
    
    return {
      message: 'Untuk membantu dengan tujuan keuangan, silakan buat beberapa tujuan terlebih dahulu. Saya bisa membantu menganalisis progress dan memberikan saran untuk mencapai target Anda.',
      suggestions: [
        'Buat tujuan keuangan yang SMART',
        'Set target amount dan deadline',
        'Monitor progress secara berkala'
      ]
    };
  }

  private generateDefaultResponse(): AIResponse {
    return {
      message: 'Terima kasih atas pertanyaan Anda! Saya fokus membantu topik keuangan seperti budgeting, tabungan, investasi, perencanaan keuangan, dan manajemen utang. Bisakah Anda berikan pertanyaan yang lebih spesifik tentang keuangan pribadi Anda?',
      suggestions: [
        'Bagaimana cara membuat budget yang efektif?',
        'Tips menabung untuk pemula',
        'Investasi apa yang cocok untuk pemula?',
        'Cara mengatur dana darurat'
      ]
    };
  }
} 