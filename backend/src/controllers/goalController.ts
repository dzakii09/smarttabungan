import { Request, Response } from 'express'
import prisma from '../utils/database'
import notificationService from '../services/notificationService'

interface AuthRequest extends Request {
  user?: any
}

export const createGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, targetAmount, targetDate } = req.body
    const userId = req.user?.id

    // Validasi userId
    if (!userId) {
      return res.status(401).json({ message: 'Gagal menyimpan goal' })
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate ? new Date(targetDate) : null,
        userId
      }
    })

    // Create notification for new goal
    try {
      await notificationService.createSystemNotification(
        userId,
        '🎯 Tujuan Baru Dibuat',
        `Tujuan "${title}" dengan target Rp ${parseFloat(targetAmount).toLocaleString('id-ID')} telah dibuat`,
        'low'
      );
    } catch (notificationError) {
      console.error('Error creating goal notification:', notificationError);
    }

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    })
  } catch (error) {
    console.error('Create goal error:', error)
    res.status(500).json({ message: 'Gagal menyimpan goal' })
  }
}

export const getGoals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(goals)
  } catch (error) {
    console.error('Get goals error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getGoalById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!goal) {
      res.status(404).json({ message: 'Goal not found' })
      return
    }

    res.json(goal)
  } catch (error) {
    console.error('Get goal error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, targetAmount, targetDate, currentAmount, isCompleted } = req.body
    const userId = req.user?.id

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!goal) {
      res.status(404).json({ message: 'Goal not found' })
      return
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        title,
        description,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
        isCompleted
      }
    })

    res.json({
      message: 'Goal updated successfully',
      goal: updatedGoal
    })
  } catch (error) {
    console.error('Update goal error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!goal) {
      res.status(404).json({ message: 'Goal not found' })
      return
    }

    await prisma.goal.delete({
      where: { id }
    })

    res.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Delete goal error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateGoalProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { currentAmount } = req.body
    const userId = req.user?.id

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!goal) {
      res.status(404).json({ message: 'Goal not found' })
      return
    }

    const newCurrentAmount = parseFloat(currentAmount)
    const isCompleted = newCurrentAmount >= goal.targetAmount
    const wasCompleted = goal.isCompleted

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
        isCompleted
      }
    })

    // Create notifications for goal progress
    try {
      const progress = (newCurrentAmount / goal.targetAmount) * 100;
      
      if (isCompleted && !wasCompleted) {
        // Goal completed
        await notificationService.createSystemNotification(
          userId,
          '🎉 Tujuan Tercapai!',
          `Selamat! Anda telah mencapai tujuan "${goal.title}"`,
          'high'
        );
      } else if (progress >= 75 && progress < 100) {
        // Near completion
        await notificationService.createSystemNotification(
          userId,
          '🎯 Hampir Tercapai!',
          `Tujuan "${goal.title}" sudah ${Math.round(progress)}% tercapai`,
          'medium'
        );
      }
    } catch (notificationError) {
      console.error('Error creating goal progress notification:', notificationError);
    }

    res.json({
      message: 'Goal progress updated successfully',
      goal: updatedGoal
    })
  } catch (error) {
    console.error('Update goal progress error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 