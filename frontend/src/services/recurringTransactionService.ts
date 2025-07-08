import api from '../api';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  lastGenerated?: string;
  isActive: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  transactions?: Array<{
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
}

export interface CreateRecurringTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  categoryId?: string;
}

export interface UpdateRecurringTransactionData {
  description?: string;
  amount?: number;
  type?: 'income' | 'expense';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  isActive?: boolean;
}

class RecurringTransactionService {
  private baseUrl = '/api/recurring-transactions';

  // Get all recurring transactions
  async getAll(): Promise<RecurringTransaction[]> {
    const response = await api.get(this.baseUrl);
    return (response.data as any).data;
  }

  // Get single recurring transaction
  async getById(id: string): Promise<RecurringTransaction> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return (response.data as any).data;
  }

  // Create recurring transaction
  async create(data: CreateRecurringTransactionData): Promise<RecurringTransaction> {
    const response = await api.post(this.baseUrl, data);
    return (response.data as any).data;
  }

  // Update recurring transaction
  async update(id: string, data: UpdateRecurringTransactionData): Promise<RecurringTransaction> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return (response.data as any).data;
  }

  // Delete recurring transaction
  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Toggle recurring transaction status
  async toggleStatus(id: string): Promise<RecurringTransaction> {
    const response = await api.patch(`${this.baseUrl}/${id}/toggle`);
    return (response.data as any).data;
  }

  // Generate transactions from recurring transactions
  async generateTransactions(): Promise<any[]> {
    const response = await api.post(`${this.baseUrl}/generate`);
    return (response.data as any).data;
  }

  // Get frequency options
  getFrequencyOptions() {
    return [
      { value: 'daily', label: 'Harian' },
      { value: 'weekly', label: 'Mingguan' },
      { value: 'monthly', label: 'Bulanan' },
      { value: 'yearly', label: 'Tahunan' }
    ];
  }

  // Get frequency label
  getFrequencyLabel(frequency: string): string {
    const options = this.getFrequencyOptions();
    const option = options.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  }

  // Format next due date
  formatNextDueDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Check if recurring transaction is overdue
  isOverdue(nextDueDate: string): boolean {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    return dueDate < today;
  }
}

export const recurringTransactionService = new RecurringTransactionService(); 