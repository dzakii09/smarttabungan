import { Request, Response } from 'express';
import aiService from '../services/aiService';
import groqService from '../services/groqService'; // Add this import

interface AuthRequest extends Request {
  user?: any;
}

// Add this new function for chatbot
export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🤖 ChatWithAI: Received request');
    const { message, context } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 ChatWithAI: Processing message:', message);
    console.log('🤖 ChatWithAI: User ID:', userId);

    // Get user context if not provided
    let userContext = context;
    if (!userContext && userId) {
      try {
        const insights = await aiService.getSpendingInsights(userId);
        userContext = { insights };
      } catch (err) {
        console.log('⚠️ ChatWithAI: Could not get user context:', err);
      }
    }

    // Generate response using Groq
    const aiResponse = await groqService.generateChatResponse(message, userContext);

    console.log('✅ ChatWithAI: Response generated successfully');

    res.json({
      message: aiResponse,
      suggestions: [], // You can add suggestions based on the message
      insights: []     // You can add insights if needed
    });

  } catch (error: any) {
    console.error('❌ ChatWithAI error:', error);
    console.error('❌ ChatWithAI error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message || 'Internal server error'
    });
  }
};

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