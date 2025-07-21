import express from 'express';
import { 
  getSpendingInsights,
  getSavingsTips,
  getFinancialAdvice,
  chatWithAI,
  insightDashboard
} from '../controllers/aiController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Debug middleware untuk AI routes
router.use((req, res, next) => {
  console.log('🤖 AI Route accessed:', req.path);
  console.log('🔑 GROQ_API_KEY exists in AI route:', !!process.env.GROQ_API_KEY);
  next();
});

// Chat with AI
router.post('/chat', auth as any, chatWithAI as any);

// Endpoint insight dashboard (AI insight untuk chart perbandingan bulanan)
router.post('/insight-dashboard', auth as any, insightDashboard as any);

// Get AI insights
router.get('/insights', auth as any, getSpendingInsights as any);

// Get savings tips
router.get('/tips', auth as any, getSavingsTips as any);

// Get financial advice
router.get('/advice', auth as any, getFinancialAdvice as any);

export default router; 