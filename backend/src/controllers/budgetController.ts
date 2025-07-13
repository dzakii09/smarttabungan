import { Request, Response } from 'express';
import budgetService from '../services/budgetService';
import aiService from '../services/aiService';
import notificationService from '../services/notificationService';

interface AuthRequest extends Request {
  user?: any;
}

class BudgetController {
  // Create new budget
  async createBudget(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Debug: log user info
      console.log('User info:', req.user);
      console.log('User ID:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan. Silakan login ulang.'
        });
      }

      const { amount, period, startDate, categoryId } = req.body;

      if (!amount || !period || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'Amount, period, dan startDate harus diisi'
        });
      }

      const budget = await budgetService.createBudget(userId, {
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        categoryId: categoryId || null
      });

      // Create notification for new budget
      try {
        const categoryName = budget.category?.name || 'total';
        await notificationService.createSystemNotification(
          userId,
          '💰 Budget Baru Dibuat',
          `Budget ${categoryName} sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')} untuk periode ${period} telah dibuat`,
          'low'
        );
      } catch (notificationError) {
        console.error('Error creating budget notification:', notificationError);
      }

      res.status(201).json({
        success: true,
        message: 'Budget berhasil dibuat',
        data: budget
      });
    } catch (error: any) {
      console.error('Create budget error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get all budgets
  async getBudgets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const budgets = await budgetService.getBudgets(userId);

      res.json({
        success: true,
        data: budgets
      });
    } catch (error: any) {
      console.error('Get budgets error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get budget by ID
  async getBudgetById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const budget = await budgetService.getBudgetById(userId, id);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: budget
      });
    } catch (error: any) {
      console.error('Get budget by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Update budget
  async updateBudget(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const updateData = req.body;

      // Convert amount to number if provided
      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }

      // Convert startDate to Date if provided
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }

      const budget = await budgetService.updateBudget(userId, id, updateData);

      res.json({
        success: true,
        message: 'Budget berhasil diperbarui',
        data: budget
      });
    } catch (error: any) {
      console.error('Update budget error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Delete budget
  async deleteBudget(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      await budgetService.deleteBudget(userId, id);

      res.json({
        success: true,
        message: 'Budget berhasil dihapus'
      });
    } catch (error: any) {
      console.error('Delete budget error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Toggle budget status
  async toggleBudgetStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const budget = await budgetService.toggleBudgetStatus(userId, id);

      res.json({
        success: true,
        message: `Budget berhasil ${budget.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        data: budget
      });
    } catch (error: any) {
      console.error('Toggle budget status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get budget alerts
  async getBudgetAlerts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const alerts = await budgetService.getBudgetAlerts(userId);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error: any) {
      console.error('Get budget alerts error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get budget statistics
  async getBudgetStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const stats = await budgetService.getBudgetStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get budget stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get AI budget recommendations
  async getBudgetRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const recommendations = await aiService.getBudgetRecommendations(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      console.error('Get budget recommendations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Create budget from AI recommendation
  async createBudgetFromRecommendation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { categoryId, recommendedAmount } = req.body;

      if (!categoryId || !recommendedAmount) {
        return res.status(400).json({
          success: false,
          message: 'CategoryId dan recommendedAmount harus diisi'
        });
      }

      const budget = await budgetService.createBudgetFromRecommendation(
        userId,
        categoryId,
        parseFloat(recommendedAmount)
      );

      res.status(201).json({
        success: true,
        message: 'Budget berhasil dibuat dari rekomendasi AI',
        data: budget
      });
    } catch (error: any) {
      console.error('Create budget from recommendation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get budget insights
  async getBudgetInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const insights = await aiService.getBudgetInsights(userId);

      res.json({
        success: true,
        data: insights
      });
    } catch (error: any) {
      console.error('Get budget insights error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }
}

export default new BudgetController(); 