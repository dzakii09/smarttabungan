import { Request, Response } from 'express';
import userPersonalizationService from '../services/userPersonalizationService';
import aiRecommendationService from '../services/aiRecommendationService';

interface AuthRequest extends Request {
  user?: any;
}

export class PersonalizationController {
  // Get user preferences
  async getUserPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const preferences = await userPersonalizationService.getUserPreferences(userId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error: any) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Update user preferences
  async updateUserPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const updates = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const preferences = await userPersonalizationService.updateUserPreferences(userId, updates);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences
      });
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get personalized dashboard
  async getPersonalizedDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const dashboard = await userPersonalizationService.getPersonalizedDashboard(userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      console.error('Error getting personalized dashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get user insights
  async getUserInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const insights = await userPersonalizationService.getUserInsights(userId);

      res.json({
        success: true,
        data: insights
      });
    } catch (error: any) {
      console.error('Error getting user insights:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const recommendations = await aiRecommendationService.getPersonalizedRecommendations(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get smart budget suggestions
  async getSmartBudgetSuggestions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const suggestions = await aiRecommendationService.getSmartBudgetSuggestions(userId);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      console.error('Error getting smart budget suggestions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get financial insights
  async getFinancialInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const insights = await aiRecommendationService.getFinancialInsights(userId);

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

  // Get AI recommendations summary
  async getAIRecommendationsSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const [recommendations, insights, preferences] = await Promise.all([
        aiRecommendationService.getPersonalizedRecommendations(userId),
        userPersonalizationService.getUserInsights(userId),
        userPersonalizationService.getUserPreferences(userId)
      ]);

      const summary = {
        totalRecommendations: recommendations.length,
        highPriorityRecommendations: recommendations.filter(r => r.priority === 'high').length,
        topRecommendations: recommendations.slice(0, 3),
        financialHealthScore: insights.financialHealth.score,
        riskLevel: insights.financialHealth.riskLevel,
        savingsRate: insights.savingHabits.monthlySavingsRate,
        spendingTrend: insights.spendingPatterns.spendingTrend,
        preferences: {
          theme: preferences.theme,
          currency: preferences.defaultCurrency,
          favoriteFeatures: preferences.favoriteFeatures
        }
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      console.error('Error getting AI recommendations summary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Apply recommendation (mark as applied)
  async applyRecommendation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { recommendationId, action } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      // Here you could implement logic to track applied recommendations
      // For now, we'll just return success
      
      res.json({
        success: true,
        message: 'Recommendation applied successfully',
        data: { recommendationId, action }
      });
    } catch (error: any) {
      console.error('Error applying recommendation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Get user financial profile
  async getUserFinancialProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID tidak ditemukan'
        });
      }

      const [insights, preferences, recommendations] = await Promise.all([
        userPersonalizationService.getUserInsights(userId),
        userPersonalizationService.getUserPreferences(userId),
        aiRecommendationService.getPersonalizedRecommendations(userId)
      ]);

      const profile = {
        financialHealth: insights.financialHealth,
        spendingPatterns: insights.spendingPatterns,
        savingHabits: insights.savingHabits,
        preferences: {
          theme: preferences.theme,
          currency: preferences.defaultCurrency,
          language: preferences.language,
          favoriteFeatures: preferences.favoriteFeatures
        },
        recommendations: recommendations.slice(0, 5),
        riskProfile: this.calculateRiskProfile(insights),
        financialGoals: preferences.financialGoals
      };

      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Error getting user financial profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Calculate risk profile based on insights
  private calculateRiskProfile(insights: any) {
    const { financialHealth, spendingPatterns, savingHabits } = insights;
    
    let riskScore = 0;
    
    // Financial health score (0-40 points)
    riskScore += (100 - financialHealth.score) * 0.4;
    
    // Spending trend (0-30 points)
    if (spendingPatterns.spendingTrend === 'increasing') {
      riskScore += 30;
    } else if (spendingPatterns.spendingTrend === 'stable') {
      riskScore += 15;
    }
    
    // Savings rate (0-30 points)
    if (savingHabits.monthlySavingsRate < 10) {
      riskScore += 30;
    } else if (savingHabits.monthlySavingsRate < 20) {
      riskScore += 15;
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore <= 30) {
      riskLevel = 'low';
    } else if (riskScore <= 60) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }
    
    return {
      score: Math.round(riskScore),
      level: riskLevel,
      factors: this.getRiskFactors(insights)
    };
  }

  // Get risk factors
  private getRiskFactors(insights: any): string[] {
    const factors: string[] = [];
    
    if (insights.financialHealth.score < 60) {
      factors.push('Skor kesehatan finansial rendah');
    }
    
    if (insights.spendingPatterns.spendingTrend === 'increasing') {
      factors.push('Tren pengeluaran meningkat');
    }
    
    if (insights.savingHabits.monthlySavingsRate < 10) {
      factors.push('Rasio tabungan rendah');
    }
    
    if (insights.financialHealth.riskLevel === 'high') {
      factors.push('Tingkat risiko tinggi');
    }
    
    return factors;
  }
}

export default new PersonalizationController(); 