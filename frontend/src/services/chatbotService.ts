import api from '../api';
import { Transaction, Goal, DashboardStats } from '../types';
import { UserContext } from '../utils/aiResponseGenerator';

export interface ChatbotRequest {
  message: string;
  userId: string;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  insights?: string[];
  actionable?: string[];
  confidence?: number;
}

export class ChatbotService {
  private static instance: ChatbotService;
  private userContext: UserContext | null = null;

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  async sendMessage(message: string, context?: any): Promise<ChatbotResponse> {
    try {
      // Update endpoint to match backend route
      const response = await api.post('/ai/chat', {
        message,
        context: context || this.userContext,
        timestamp: new Date().toISOString()
      });
      
      return response.data as ChatbotResponse;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw new Error('Gagal mengirim pesan ke chatbot');
    }
  }

  async getUserContext(): Promise<UserContext> {
    try {
      // Fetch user data for context
      const [transactionsRes, goalsRes, statsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/goals'),
        api.get('/dashboard/stats')
      ]);

      const transactions: Transaction[] = transactionsRes.data as Transaction[];
      const goals: Goal[] = goalsRes.data as Goal[];
      const stats: DashboardStats = statsRes.data as DashboardStats;

      // Calculate additional metrics
      const monthlyIncome = stats.monthlyIncome;
      const monthlyExpenses = stats.monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

      this.userContext = {
        transactions,
        goals,
        stats,
        monthlyIncome,
        monthlyExpenses,
        savingsRate
      };

      return this.userContext;
    } catch (error) {
      console.error('Error fetching user context:', error);
      throw new Error('Gagal mengambil data konteks pengguna');
    }
  }

  async getFinancialInsights(): Promise<{
    spendingPatterns: any;
    savingTrends: any;
    goalProgress: any;
    recommendations: string[];
  }> {
    try {
      const context = await this.getUserContext();
      
      // Analyze spending patterns
      const expenseTransactions = context.transactions.filter(t => t.type === 'expense');
      const categorySpending = expenseTransactions.reduce((acc, t) => {
        const category = t.category?.name || 'Lainnya';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      // Analyze saving trends
      const incomeTransactions = context.transactions.filter(t => t.type === 'income');
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const netSavings = totalIncome - totalExpenses;

      // Analyze goal progress
      const goalProgress = context.goals.map(goal => ({
        name: goal.name,
        progress: (goal.currentAmount / goal.targetAmount) * 100,
        daysLeft: Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }));

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (context.savingsRate < 10) {
        recommendations.push('Tingkatkan tingkat tabungan minimal 10% dari penghasilan');
      }
      
      if (context.savingsRate < 20) {
        recommendations.push('Pertimbangkan investasi untuk pertumbuhan kekayaan');
      }
      
      const urgentGoals = goalProgress.filter(g => g.progress < 50 && g.daysLeft < 90);
      if (urgentGoals.length > 0) {
        recommendations.push(`Percepat progress untuk tujuan: ${urgentGoals.map(g => g.name).join(', ')}`);
      }

      return {
        spendingPatterns: categorySpending,
        savingTrends: {
          totalIncome,
          totalExpenses,
          netSavings,
          savingsRate: context.savingsRate
        },
        goalProgress,
        recommendations
      };
    } catch (error) {
      console.error('Error getting financial insights:', error);
      throw new Error('Gagal menganalisis insight keuangan');
    }
  }

  async getPersonalizedSuggestions(): Promise<string[]> {
    try {
      const insights = await this.getFinancialInsights();
      return insights.recommendations;
    } catch (error) {
      console.error('Error getting personalized suggestions:', error);
      return [
        'Mulai dengan mencatat semua transaksi',
        'Set target tabungan bulanan',
        'Buat tujuan keuangan yang spesifik'
      ];
    }
  }

  getUserContextSync(): UserContext | null {
    return this.userContext;
  }

  setUserContext(context: UserContext) {
    this.userContext = context;
  }
}

export default ChatbotService.getInstance();