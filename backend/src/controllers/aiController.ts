import { Request, Response } from 'express';
import aiService from '../services/aiService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const getSpendingInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const insights = await aiService.getSpendingInsights(userId);
    res.json({ insights });
  } catch (error) {
    console.error('Get spending insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSavingsTips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tips = await aiService.getSavingsTips(userId);
    res.json({ tips });
  } catch (error) {
    console.error('Get savings tips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFinancialAdvice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const advice = await aiService.getFinancialAdvice(userId);
    res.json({ advice });
  } catch (error) {
    console.error('Get financial advice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await aiService.chatWithAI(userId, message);
    res.json({ message: response });
  } catch (error) {
    console.error('Chat with AI error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const insightDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { months } = req.body;
    if (!months || !Array.isArray(months)) {
      return res.status(400).json({ message: 'Months data is required' });
    }

    const insights = await aiService.getDashboardInsights(userId, months);
    res.json(insights);
  } catch (error) {
    console.error('Dashboard insight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 