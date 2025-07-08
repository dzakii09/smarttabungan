import prisma from '../utils/database';

export interface CreateRecurringTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  categoryId?: string;
}

export interface UpdateRecurringTransactionData {
  description?: string;
  amount?: number;
  type?: 'income' | 'expense';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  isActive?: boolean;
}

export class RecurringTransactionService {
  static async createRecurringTransaction(userId: string, data: CreateRecurringTransactionData) {
    const nextDueDate = this.calculateNextDueDate(data.startDate, data.frequency);
    
    return await prisma.recurringTransaction.create({
      data: {
        ...data,
        userId,
        nextDueDate,
        amount: Number(data.amount)
      },
      include: {
        category: true
      }
    });
  }

  static async updateRecurringTransaction(id: string, userId: string, data: UpdateRecurringTransactionData) {
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new Error('Recurring transaction not found');
    }

    const updateData: any = { ...data };
    
    // Recalculate next due date if frequency or start date changed
    if (data.frequency || data.startDate) {
      const startDate = data.startDate || existing.startDate;
      const frequency = data.frequency || existing.frequency;
      updateData.nextDueDate = this.calculateNextDueDate(startDate, frequency);
    }

    if (data.amount) {
      updateData.amount = Number(data.amount);
    }

    return await prisma.recurringTransaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });
  }

  static async deleteRecurringTransaction(id: string, userId: string) {
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new Error('Recurring transaction not found');
    }

    return await prisma.recurringTransaction.delete({
      where: { id }
    });
  }

  static async getUserRecurringTransactions(userId: string) {
    return await prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        category: true
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    });
  }

  static async getRecurringTransactionById(id: string, userId: string) {
    return await prisma.recurringTransaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        transactions: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    });
  }

  static async generateRecurringTransactions() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find all active recurring transactions that are due
    const dueRecurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: today
        },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      },
      include: {
        category: true,
        user: true
      }
    });

    const generatedTransactions = [];

    for (const recurring of dueRecurringTransactions) {
      try {
        // Generate transaction
        const transaction = await prisma.transaction.create({
          data: {
            description: recurring.description,
            amount: recurring.amount,
            type: recurring.type,
            date: recurring.nextDueDate,
            userId: recurring.userId,
            categoryId: recurring.categoryId,
            recurringTransactionId: recurring.id
          }
        });

        // Update recurring transaction
        const nextDueDate = this.calculateNextDueDate(recurring.nextDueDate, recurring.frequency);
        
        await prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: {
            lastGenerated: now,
            nextDueDate
          }
        });

        generatedTransactions.push(transaction);
      } catch (error) {
        console.error(`Failed to generate transaction for recurring ${recurring.id}:`, error);
      }
    }

    return generatedTransactions;
  }

  static async toggleRecurringTransaction(id: string, userId: string) {
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new Error('Recurring transaction not found');
    }

    return await prisma.recurringTransaction.update({
      where: { id },
      data: {
        isActive: !existing.isActive
      },
      include: {
        category: true
      }
    });
  }

  private static calculateNextDueDate(currentDate: Date, frequency: string): Date {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid frequency');
    }
    
    return date;
  }

  static getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      case 'yearly':
        return 'Tahunan';
      default:
        return frequency;
    }
  }

  static getFrequencyOptions() {
    return [
      { value: 'daily', label: 'Harian' },
      { value: 'weekly', label: 'Mingguan' },
      { value: 'monthly', label: 'Bulanan' },
      { value: 'yearly', label: 'Tahunan' }
    ];
  }
} 