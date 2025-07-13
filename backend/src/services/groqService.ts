import Groq from 'groq-sdk';

// Debug logging
console.log('🔍 GroqService: Checking GROQ_API_KEY...');
console.log('🔍 GroqService: GROQ_API_KEY exists?', !!process.env.GROQ_API_KEY);
console.log('🔍 GroqService: GROQ_API_KEY preview:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

// Initialize Groq client
let groqClient: Groq | null = null;

try {
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GroqService: GROQ_API_KEY not found in environment variables!');
    console.error('❌ GroqService: Make sure .env file is in the backend folder and contains GROQ_API_KEY');
  } else {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('✅ GroqService: Groq client initialized successfully');
  }
} catch (error) {
  console.error('❌ GroqService: Error initializing Groq client:', error);
}

export const generateChatResponse = async (message: string, context?: any): Promise<string> => {
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
    
    const completion = await groqClient.chat.completions.create({
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
    
    const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat menghasilkan respons.';
    return response;
  } catch (error: any) {
    console.error('❌ GroqService: Error calling Groq API:', error);
    console.error('❌ GroqService: Error details:', error.message);
    console.error('❌ GroqService: Error status:', error.status);
    
    if (error.status === 401) {
      throw new Error('API key tidak valid. Silakan periksa konfigurasi.');
    } else if (error.status === 429) {
      throw new Error('Batas penggunaan API tercapai. Silakan coba lagi nanti.');
    } else {
      throw new Error('Terjadi kesalahan saat memproses permintaan.');
    }
  }
};

export default {
  generateChatResponse
};