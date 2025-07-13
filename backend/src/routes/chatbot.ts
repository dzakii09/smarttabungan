import express from 'express';
import { sendMessage, getConversationHistory } from '../controllers/chatbotController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Kirim pesan ke chatbot (AI)
router.post('/message', auth as any, sendMessage as any);

// (Opsional) Ambil riwayat percakapan
router.get('/history', auth as any, getConversationHistory as any);

export default router; 