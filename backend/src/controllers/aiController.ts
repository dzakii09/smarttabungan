import { Request, Response } from 'express';
import aiService from '../services/aiService';

interface AuthRequest extends Request {
  user?: any;
}

export const getAIRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const recommendations = await aiService.getBudgetRecommendations(userId)
    // Map ke format frontend
    const mapped = recommendations.map((rec, idx) => ({
      id: rec.categoryId || idx.toString(),
      type: 'budget',
      title: `Rekomendasi Budget untuk ${rec.categoryName}`,
      description: `Disarankan anggaran bulanan: Rp ${rec.recommendedAmount.toLocaleString('id-ID')} (${rec.reason})`,
      priority: 'medium',
      impact: 'medium',
      estimatedSavings: undefined,
      estimatedTime: undefined,
      difficulty: 'medium',
      category: rec.categoryName,
      actionable: true,
      metadata: rec
    }))
    res.json({ data: mapped })
  } catch (error) {
    console.error('Get AI recommendations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getSpendingInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const insights = await aiService.getSpendingInsights(userId)
    res.json(insights)
  } catch (error) {
    console.error('Get spending insights error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getBudgetSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const suggestions = await aiService.getBudgetRecommendations(userId)
    res.json(suggestions)
  } catch (error) {
    console.error('Get budget suggestions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getSavingsTips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const tips = await aiService.getSpendingInsights(userId)
    res.json(tips)
  } catch (error) {
    console.error('Get savings tips error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getFinancialAdvice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const advice = await aiService.getBudgetInsights(userId)
    res.json(advice)
  } catch (error) {
    console.error('Get financial advice error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 