import { Request, Response } from 'express'
import prisma from '../utils/database'
import notificationService from '../services/notificationService'
import smartAlertService from '../services/smartAlertService'

interface AuthRequest extends Request {
  user?: any
}

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, description, type, categoryId, date } = req.body
    const userId = req.user.userId

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        categoryId,
        date: date ? new Date(date) : new Date(),
        userId
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
    res.status(500).json({ message: 'Server error' })
  }
}

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId
    const { type, limit = 10, offset = 0 } = req.query

    const where: any = { userId }
    if (type) {
      where.type = type
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await prisma.transaction.count({ where })

    res.json({
      transactions,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

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
    const { amount, description, type, categoryId, date } = req.body
    const userId = req.user.userId

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
        categoryId,
        date: date ? new Date(date) : undefined
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
    const userId = req.user.userId

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
    const userId = req.user.userId
    const { startDate, endDate } = req.query

    const where: any = { userId }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }

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

    const totalIncome = income._sum.amount || 0
    const totalExpense = expense._sum.amount || 0
    const balance = totalIncome - totalExpense

    res.json({
      totalIncome,
      totalExpense,
      balance
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 