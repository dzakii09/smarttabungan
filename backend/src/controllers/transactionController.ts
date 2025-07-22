import { Request, Response } from 'express'
import prisma from '../utils/database'
import notificationService from '../services/notificationService'
import smartAlertService from '../services/smartAlertService'

interface AuthRequest extends Request {
  user?: any
}

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, description, categoryId, type, date } = req.body
    const userId = req.user?.id

    // Validasi userId
    if (!userId) {
      return res.status(401).json({ message: 'Gagal menyimpan transaksi' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: date ? new Date(date) : new Date(),
        userId,
        categoryId
      },
      include: {
        category: true
      }
    })

    // Create notification for new transaction
    try {
      if (type === 'expense') {
        // Check for budget alerts
        await notificationService.checkAndCreateNotifications(userId);
        
        // Create transaction notification
        await notificationService.createSystemNotification(
          userId,
          '💰 Transaksi Baru',
          `Pengeluaran ${transaction.category?.name || 'tanpa kategori'} sebesar Rp ${amount.toLocaleString('id-ID')} telah ditambahkan`,
          'low'
        );

        // Run smart alerts for unusual spending detection
        await smartAlertService.detectUnusualSpending(userId, transaction.id);
      } else {
        // Income notification
        await notificationService.createSystemNotification(
          userId,
          '💵 Pemasukan Baru',
          `Pemasukan ${transaction.category?.name || 'tanpa kategori'} sebesar Rp ${amount.toLocaleString('id-ID')} telah ditambahkan`,
          'low'
        );
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the transaction if notification fails
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    res.status(500).json({ message: 'Gagal menyimpan transaksi' })
  }
}

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { page = 1, limit = 10, type, categoryId, startDate, endDate } = req.query

    console.log('🔍 Debug: getTransactions called')
    console.log('🔍 Debug: User ID:', userId)
    console.log('🔍 Debug: Query params:', { page, limit, type, categoryId, startDate, endDate })

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = { userId }

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }

    console.log('🔍 Debug: Where clause:', where)

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: parseInt(limit as string)
    })

    const total = await prisma.transaction.count({ where })

    console.log('🔍 Debug: Found transactions:', transactions.length)
    console.log('🔍 Debug: Total transactions:', total)
    console.log('🔍 Debug: Sample transaction:', transactions[0])

    res.json({
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      },
      include: {
        category: true
      }
    })

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' })
      return
    }

    res.json(transaction)
  } catch (error) {
    console.error('Get transaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { amount, description, categoryId, type, date } = req.body
    const userId = req.user?.id

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' })
      return
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        description,
        type,
        date: date ? new Date(date) : undefined,
        categoryId
      },
      include: {
        category: true
      }
    })

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    })
  } catch (error) {
    console.error('Update transaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' })
      return
    }

    await prisma.transaction.delete({
      where: { id }
    })

    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getTransactionStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { startDate, endDate } = req.query

    const where: any = { userId }

    // Default to current month if no date range provided
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    } else {
      // Get current month data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }

    console.log('TransactionStats Query:', JSON.stringify(where, null, 2));

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true }
      })
    ])

    console.log('Income aggregate:', income);
    console.log('Expense aggregate:', expense);

    const totalIncome = income._sum.amount || 0
    const totalExpense = expense._sum.amount || 0
    const balance = totalIncome - totalExpense

    res.json({
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance
    })
  } catch (error) {
    console.error('Get transaction stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getTransactionsByCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { startDate, endDate } = req.query

    const where: any = { userId }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }

    const transactions = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const categoryStats = await Promise.all(
      transactions.map(async (transaction) => {
        const category = await prisma.category.findUnique({
          where: { id: transaction.categoryId }
        })

        return {
          category,
          totalAmount: transaction._sum.amount,
          count: transaction._count.id
        }
      })
    )

    res.json(categoryStats)
  } catch (error) {
    console.error('Get transactions by category error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 