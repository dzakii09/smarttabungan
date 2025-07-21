import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Lightbulb } from 'lucide-react';
import { ChatMessage } from '../../types';
import { filterFinancialTopic, validateChatbotInput } from '../../utils/chatbotFilters';
import { AIResponseGenerator } from '../../utils/aiResponseGenerator';
import chatbotService from '../../services/chatbotService';
import { useApp } from '../../contexts/AppContext';
import api from '../../api';

const ChatInterface: React.FC = () => {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Halo! Saya adalah asisten keuangan pintar SmartWealth. Saya siap membantu Anda dengan pertanyaan seputar keuangan pribadi, budgeting, investasi, dan perencanaan keuangan. Apa yang ingin Anda tanyakan hari ini?',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filterWarning, setFilterWarning] = useState<string | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiGenerator = useRef(new AIResponseGenerator());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize AI generator with user context
    if (user && token) {
      initializeUserContext();
    }
  }, [user, token]);

  const initializeUserContext = async () => {
    try {
      const [context, recommendations] = await Promise.all([
        chatbotService.getUserContext(),
        api.get('/ai/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const recommendationsData = (recommendations.data as any).data || recommendations.data;

      const enhancedContext = {
        userId: user?.id || '',
        userData: context,
        recommendations: recommendationsData || []
      };

      setUserContext(enhancedContext);

      aiGenerator.current.setUserContext(context);

      // Add personalized welcome message if user has data
      if (recommendationsData && recommendationsData.length > 0) {
        const personalizedMessage: ChatMessage = {
          id: '2',
          message: `Saya melihat Anda memiliki ${recommendationsData.length} rekomendasi keuangan yang bisa saya bantu jelaskan. Anda juga bisa bertanya tentang situasi keuangan Anda secara spesifik.`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, personalizedMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize user context:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Validate input
    const validationResult = validateChatbotInput(inputMessage);
    if (!validationResult.isValid) {
      setValidationError(validationResult.error || 'Input tidak valid');
      return;
    }

    // Check topic filter
    const filterResult = filterFinancialTopic(inputMessage);
    if (!filterResult.isFinancialTopic) {
      setFilterWarning(filterResult.warning || 'Topik tidak terkait keuangan');
      return;
    }

    // Clear previous errors/warnings
    setValidationError(null);
    setFilterWarning(null);
    setSuggestedTopics([]);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Generate AI response with enhanced context
      const aiResponse = await generateEnhancedResponse(inputMessage);
      
      // Simulate typing delay
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: aiResponse.message,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // Set suggestions if available
        if (aiResponse.suggestions) {
          setSuggestedTopics(aiResponse.suggestions);
        }

      }, 1500);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Maaf, terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const generateEnhancedResponse = async (message: string) => {
    // Check if message is about recommendations
    if (message.toLowerCase().includes('rekomendasi') || message.toLowerCase().includes('saran')) {
      return generateRecommendationResponse();
    }

    // Check if message is about financial health
    if (message.toLowerCase().includes('kesehatan') || message.toLowerCase().includes('score') || message.toLowerCase().includes('skor')) {
      return generateFinancialHealthResponse();
    }

    // Check if message is about spending patterns
    if (message.toLowerCase().includes('pengeluaran') || message.toLowerCase().includes('spending')) {
      return generateSpendingAnalysisResponse();
    }

    // Default: Call backend AI API
    try {
      const response = await chatbotService.sendMessage(message, userContext);
      return {
        message: response.message,
        suggestions: response.suggestions || []
      };
    } catch (error) {
      console.error('Error calling AI API:', error);
      // Fallback to local AI generator
      return aiGenerator.current.generateResponse(message);
    }
  };

  const generateRecommendationResponse = () => {
    if (!userContext?.recommendations || userContext.recommendations.length === 0) {
      return {
        message: 'Saat ini belum ada rekomendasi khusus untuk Anda. Coba tambahkan lebih banyak transaksi dan data keuangan untuk mendapatkan rekomendasi yang personal.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Apa itu budget?', 'Bagaimana cara menabung efektif?']
      };
    }

    const topRecommendations = userContext.recommendations.slice(0, 3);
    const recommendationText = topRecommendations.map((rec: any, index: number) => 
      `${index + 1}. ${rec.title}: ${rec.description}`
    ).join('\n\n');

    return {
      message: `Berikut adalah rekomendasi teratas untuk Anda:\n\n${recommendationText}\n\nApakah Anda ingin saya jelaskan lebih detail tentang salah satu rekomendasi di atas?`,
      suggestions: ['Jelaskan rekomendasi pertama', 'Bagaimana cara menerapkan rekomendasi ini?', 'Rekomendasi lainnya']
    };
  };

  const generateFinancialHealthResponse = () => {
    if (!userContext?.userData) {
      return {
        message: 'Saya belum bisa menganalisis kesehatan keuangan Anda karena data yang terbatas. Coba tambahkan lebih banyak transaksi untuk mendapatkan analisis yang akurat.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Apa itu kesehatan keuangan?']
      };
    }

    const stats = userContext.userData.stats;
    const savingsRate = stats.savingsRate;
    
    let healthStatus = '';
    let recommendations = '';

    if (savingsRate >= 20) {
      healthStatus = 'Excellent';
      recommendations = 'Anda memiliki kesehatan keuangan yang sangat baik. Pertimbangkan untuk berinvestasi.';
    } else if (savingsRate >= 10) {
      healthStatus = 'Good';
      recommendations = 'Kesehatan keuangan Anda baik. Coba tingkatkan tabungan ke 20%.';
    } else if (savingsRate >= 5) {
      healthStatus = 'Fair';
      recommendations = 'Kesehatan keuangan Anda cukup. Fokus pada peningkatan tabungan.';
    } else {
      healthStatus = 'Poor';
      recommendations = 'Kesehatan keuangan Anda perlu diperbaiki. Mulai dengan menabung minimal 10% dari penghasilan.';
    }

    return {
      message: `Skor Kesehatan Keuangan Anda: ${healthStatus}\n\nTingkat Tabungan: ${savingsRate.toFixed(1)}%\n\nRekomendasi: ${recommendations}`,
      suggestions: ['Bagaimana cara meningkatkan skor?', 'Tips menabung efektif', 'Analisis pengeluaran']
    };
  };

  const generateSpendingAnalysisResponse = () => {
    if (!userContext?.userData) {
      return {
        message: 'Saya belum bisa menganalisis pola pengeluaran Anda karena data yang terbatas. Coba tambahkan lebih banyak transaksi untuk mendapatkan analisis yang akurat.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Apa itu analisis pengeluaran?']
      };
    }

    const transactions = userContext.userData.transactions;
    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
      return {
        message: 'Belum ada data pengeluaran yang bisa dianalisis. Mulai dengan mencatat transaksi pengeluaran Anda.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Kategori pengeluaran apa saja?']
      };
    }

    const totalExpenses = expenseTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    const avgExpense = totalExpenses / expenseTransactions.length;
    
    // Simple category analysis
    const categorySpending = expenseTransactions.reduce((acc: any, t: any) => {
      const category = t.category?.name || 'Lainnya';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categorySpending)
      .sort(([,a]: any, [,b]: any) => b - a)[0];

    return {
      message: `Analisis Pengeluaran Anda:\n\nTotal Pengeluaran: Rp ${totalExpenses.toLocaleString()}\nRata-rata per Transaksi: Rp ${avgExpense.toLocaleString()}\nKategori Terbesar: ${topCategory?.[0] || 'Tidak ada data'} (${topCategory ? ((topCategory[1] as number) / totalExpenses * 100).toFixed(1) : 0}%)\n\nJumlah Transaksi: ${expenseTransactions.length}`,
      suggestions: ['Bagaimana cara mengurangi pengeluaran?', 'Tips mengatur budget', 'Analisis kategori lainnya']
    };
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const clearWarnings = () => {
    setValidationError(null);
    setFilterWarning(null);
    setSuggestedTopics([]);
  };

  const quickQuestions = [
    'Bagaimana cara menabung efektif?',
    'Apa itu dana darurat?',
    'Bagaimana cara membuat budget?',
    'Tips investasi untuk pemula',
    'Bagaimana cara mengurangi pengeluaran?'
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            <p className="text-sm text-gray-500">Asisten keuangan pintar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-gray-500">Powered by AI</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.sender === 'bot' && (
                  <Bot className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                )}
                <div className="whitespace-pre-wrap">{message.message}</div>
                {message.sender === 'user' && (
                  <User className="w-4 h-4 text-white mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error/Warning Messages */}
      {validationError && (
        <div className="p-4 bg-red-50 border-t border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{validationError}</span>
            <button
              onClick={clearWarnings}
              className="ml-auto text-xs text-red-600 hover:text-red-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {filterWarning && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-700">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm">{filterWarning}</span>
            <button
              onClick={clearWarnings}
              className="ml-auto text-xs text-yellow-600 hover:text-yellow-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Pertanyaan Cepat:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Topics */}
      {suggestedTopics.length > 0 && (
        <div className="p-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 mb-2">Saran Pertanyaan:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(topic)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ketik pertanyaan Anda di sini..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;