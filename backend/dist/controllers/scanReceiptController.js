"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanReceipt = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const geminiAIService_1 = __importDefault(require("../services/geminiAIService"));
const scanReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // OCR dengan Tesseract
        const { data: { text } } = yield tesseract_js_1.default.recognize(req.file.buffer, 'eng');
        // Kirim ke Gemini untuk parsing & klasifikasi
        const result = yield geminiAIService_1.default.classifyReceipt(text);
        res.json({ ocrText: text, items: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process receipt' });
    }
});
exports.scanReceipt = scanReceipt;
