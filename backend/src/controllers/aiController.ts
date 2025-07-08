import { Request, Response } from 'express';
import aiService from '../services/aiService';

interface AuthRequest extends Request {
  user?: any;
}

// Auto-categorize transaction
export const predictCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { description, amount, date, type } = req.body;
    const userId = req.user.userId;

    const prediction = await aiService.predictCategory({
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      type
    });

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Predict category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get budget recommendations
export const getBudgetRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const recommendations = await aiService.getBudgetRecommendations(userId);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Get budget recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get spending insights
export const getSpendingInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const insights = await aiService.getSpendingInsights(userId);

    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Get spending insights error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Predict next month spending
export const predictNextMonthSpending = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const prediction = await aiService.predictNextMonthSpending(userId);

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Predict next month spending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get AI dashboard data
export const getAIDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const [recommendations, insights, prediction] = await Promise.all([
      aiService.getBudgetRecommendations(userId),
      aiService.getSpendingInsights(userId),
      aiService.predictNextMonthSpending(userId)
    ]);

    res.json({
      success: true,
      data: {
        recommendations,
        insights,
        prediction
      }
    });
  } catch (error) {
    console.error('Get AI dashboard data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}; 