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



  async getPersonalizedSuggestions(): Promise<string[]> {
    try {
      const context = await this.getUserContext();
      
      const recommendations: string[] = [];
      
      if (context.savingsRate < 10) {
        recommendations.push('Tingkatkan tingkat tabungan minimal 10% dari penghasilan');
      }
      
      if (context.savingsRate < 20) {
        recommendations.push('Pertimbangkan investasi untuk pertumbuhan kekayaan');
      }
      
      if (context.goals.length === 0) {
        recommendations.push('Buat tujuan keuangan yang spesifik');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Mulai dengan mencatat semua transaksi');
        recommendations.push('Set target tabungan bulanan');
      }
      
      return recommendations;
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