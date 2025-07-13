import { Request, Response } from 'express';
import Tesseract from 'tesseract.js';
import groqAIService from '../services/groqAIService';

export const scanReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // OCR dengan Tesseract
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');

    // Kirim ke GROQ untuk parsing & klasifikasi
    const result = await groqAIService.classifyReceipt(text);

    res.json({ ocrText: text, items: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
};