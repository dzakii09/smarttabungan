import { Request, Response } from 'express';
import analyticsService from '../services/analyticsService';

interface AuthRequest extends Request {
  user?: any;
}

class AnalyticsController {
  // Get comprehensive financial insights
  async getFinancialInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate, categoryId, type } = req.query;

      const filters: any = {};
      
      if (startDate && endDate) {
        filters.startDate = new Date(startDate as string);
        filters.endDate = new Date(endDate as string);
      }

      if (categoryId) {
        filters.categoryId = categoryId as string;
      }

      if (type && ['income', 'expense', 'all'].includes(type as string)) {
        filters.type = type as 'income' | 'expense' | 'all';
      }

      const insights = await analyticsService.getFinancialInsights(userId, filters);

      res.json({
        success: true,
        data: insights
      });

    } catch (error: any) {
      console.error('Error getting financial insights:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get spending trends
  async getSpendingTrends(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate, groupBy = 'day' } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate dan endDate diperlukan'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const trends = await analyticsService.getSpendingTrends(
        userId, 
        dateRange, 
        groupBy as 'day' | 'week' | 'month'
      );

      res.json({
        success: true,
        data: trends
      });

    } catch (error: any) {
      console.error('Error getting spending trends:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get category analytics
  async getCategoryAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate, type = 'expense' } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate dan endDate diperlukan'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const analytics = await analyticsService.getCategoryAnalytics(
        userId,
        dateRange,
        type as 'income' | 'expense'
      );

      res.json({
        success: true,
        data: analytics
      });

    } catch (error: any) {
      console.error('Error getting category analytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get monthly comparison
  async getMonthlyComparison(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { months = 6 } = req.query;

      const comparison = await analyticsService.getMonthlyComparison(
        userId,
        parseInt(months as string)
      );

      res.json({
        success: true,
        data: comparison
      });

    } catch (error: any) {
      console.error('Error getting monthly comparison:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get spending patterns
  async getSpendingPatterns(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate dan endDate diperlukan'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const patterns = await analyticsService.getSpendingPatterns(userId, dateRange);

      res.json({
        success: true,
        data: patterns
      });

    } catch (error: any) {
      console.error('Error getting spending patterns:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get top spending days
  async getTopSpendingDays(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate, limit = 10 } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate dan endDate diperlukan'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const topDays = await analyticsService.getTopSpendingDays(
        userId,
        dateRange,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: topDays
      });

    } catch (error: any) {
      console.error('Error getting top spending days:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get savings analysis
  async getSavingsAnalysis(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate dan endDate diperlukan'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const analysis = await analyticsService.getSavingsAnalysis(userId, dateRange);

      res.json({
        success: true,
        data: analysis
      });

    } catch (error: any) {
      console.error('Error getting savings analysis:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get budget performance
  async getBudgetPerformance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate dan endDate diperlukan'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const performance = await analyticsService.getBudgetPerformance(userId, dateRange);

      res.json({
        success: true,
        data: performance
      });

    } catch (error: any) {
      console.error('Error getting budget performance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get comprehensive analytics report
  async getComprehensiveReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date dan end date harus diisi'
        });
      }

      const dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const [
        spendingTrends,
        categoryAnalytics,
        monthlyComparison,
        spendingPatterns,
        savingsAnalysis,
        budgetPerformance
      ] = await Promise.all([
        analyticsService.getSpendingTrends(userId, dateRange),
        analyticsService.getCategoryAnalytics(userId, dateRange, 'expense'),
        analyticsService.getMonthlyComparison(userId, 6),
        analyticsService.getSpendingPatterns(userId, dateRange),
        analyticsService.getSavingsAnalysis(userId, dateRange),
        analyticsService.getBudgetPerformance(userId, dateRange)
      ]);

      res.json({
        success: true,
        data: {
          spendingTrends,
          categoryAnalytics,
          monthlyComparison,
          spendingPatterns,
          savingsAnalysis,
          budgetPerformance,
          reportDate: new Date().toISOString(),
          dateRange: {
            start: dateRange.startDate.toISOString(),
            end: dateRange.endDate.toISOString()
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get dashboard analytics summary
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Get last 30 days data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const dateRange = { startDate, endDate };

      const [
        spendingTrends,
        categoryAnalytics,
        savingsAnalysis,
        budgetPerformance
      ] = await Promise.all([
        analyticsService.getSpendingTrends(userId, dateRange, 'day'),
        analyticsService.getCategoryAnalytics(userId, dateRange, 'expense'),
        analyticsService.getSavingsAnalysis(userId, dateRange),
        analyticsService.getBudgetPerformance(userId, dateRange)
      ]);

      // Get top 5 categories
      const topCategories = categoryAnalytics.slice(0, 5);

      // Calculate summary stats
      const totalSpent = categoryAnalytics.reduce((sum, cat) => sum + cat.totalAmount, 0);
      const averageDailySpending = savingsAnalysis.averageDailySpending;
      const budgetAlerts = budgetPerformance.filter(b => b.status === 'exceeded' || b.status === 'warning');

      res.json({
        success: true,
        data: {
          spendingTrends: spendingTrends.slice(-7), // Last 7 days
          topCategories,
          summary: {
            totalSpent,
            averageDailySpending,
            savingsRate: savingsAnalysis.savingsRate,
            budgetAlerts: budgetAlerts.length
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AnalyticsController(); 