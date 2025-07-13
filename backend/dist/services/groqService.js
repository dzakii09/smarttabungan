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
exports.generateChatResponse = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
// Debug logging
console.log('🔍 GroqService: Checking GROQ_API_KEY...');
console.log('🔍 GroqService: GROQ_API_KEY exists?', !!process.env.GROQ_API_KEY);
console.log('🔍 GroqService: GROQ_API_KEY preview:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
// Initialize Groq client
let groqClient = null;
try {
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GroqService: GROQ_API_KEY not found in environment variables!');
        console.error('❌ GroqService: Make sure .env file is in the backend folder and contains GROQ_API_KEY');
    }
    else {
        groqClient = new groq_sdk_1.default({
            apiKey: process.env.GROQ_API_KEY
        });
        console.log('✅ GroqService: Groq client initialized successfully');
    }
}
catch (error) {
    console.error('❌ GroqService: Error initializing Groq client:', error);
}
const generateChatResponse = (message, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('🤖 GroqService: Generating response for message:', message);
    if (!groqClient) {
        console.error('❌ GroqService: Groq client not initialized');
        throw new Error('AI service is not properly configured. Please check API key.');
    }
    try {
        const systemPrompt = `Anda adalah asisten keuangan pintar yang membantu pengguna dengan pertanyaan seputar keuangan pribadi, budgeting, investasi, dan perencanaan keuangan. 
    Berikan jawaban yang informatif, praktis, dan mudah dipahami dalam Bahasa Indonesia.
    ${context ? `\nKonteks pengguna: ${JSON.stringify(context)}` : ''}`;
        console.log('🤖 GroqService: Sending request to Groq API...');
        const completion = yield groqClient.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama3-8b-8192", // atau model lain yang tersedia
            temperature: 0.7,
            max_tokens: 1000
        });
        console.log('✅ GroqService: Response received from Groq API');
        const response = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'Maaf, saya tidak dapat menghasilkan respons.';
        return response;
    }
    catch (error) {
        console.error('❌ GroqService: Error calling Groq API:', error);
        console.error('❌ GroqService: Error details:', error.message);
        console.error('❌ GroqService: Error status:', error.status);
        if (error.status === 401) {
            throw new Error('API key tidak valid. Silakan periksa konfigurasi.');
        }
        else if (error.status === 429) {
            throw new Error('Batas penggunaan API tercapai. Silakan coba lagi nanti.');
        }
        else {
            throw new Error('Terjadi kesalahan saat memproses permintaan.');
        }
    }
});
exports.generateChatResponse = generateChatResponse;
exports.default = {
    generateChatResponse: exports.generateChatResponse
};
