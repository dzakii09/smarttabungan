import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Lightbulb, TrendingUp, Target, PiggyBank } from 'lucide-react';
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
  const [insights, setInsights] = useState<string[]>([]);
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
      const [context, recommendations, insights] = await Promise.all([
        chatbotService.getUserContext(),
        api.get('/ai/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/ai/insights', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const recommendationsData = (recommendations.data as any).data || recommendations.data;
      const insightsData = (insights.data as any).data || insights.data;

      const enhancedContext = {
        userId: user?.id || '',
        userData: context,
        recommendations: recommendationsData || [],
        insights: insightsData || null
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
    const validation = validateChatbotInput(inputMessage);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Input tidak valid');
      return;
    }

    // Filter financial topic
    const greetings = ['halo', 'hai', 'hello', 'selamat pagi', 'selamat siang', 'selamat malam'];
    if (!greetings.some(greet => inputMessage.toLowerCase().includes(greet))) {
      const filter = filterFinancialTopic(inputMessage);
      if (!filter.isFinancialTopic) {
        setFilterWarning(filter.warning || 'Topik tidak terkait keuangan');
        setSuggestedTopics(filter.suggestedTopics || []);
        return;
      }
    }

    // Clear previous errors/warnings
    setValidationError(null);
    setFilterWarning(null);
    setSuggestedTopics([]);
    setInsights([]);

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
        
        // Set suggestions and insights if available
        if (aiResponse.suggestions) {
          setSuggestedTopics(aiResponse.suggestions);
        }
        if (aiResponse.insights) {
          setInsights(aiResponse.insights);
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

    // Default AI response
    return aiGenerator.current.generateResponse(message);
  };

  const generateRecommendationResponse = () => {
    if (!userContext?.recommendations || userContext.recommendations.length === 0) {
      return {
        message: 'Saat ini belum ada rekomendasi khusus untuk Anda. Coba tambahkan lebih banyak transaksi dan data keuangan untuk mendapatkan rekomendasi yang personal.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Apa itu budget?', 'Bagaimana cara menabung efektif?'],
        insights: []
      };
    }

    const topRecommendations = userContext.recommendations.slice(0, 3);
    const recommendationText = topRecommendations.map((rec: any, index: number) => 
      `${index + 1}. ${rec.title}: ${rec.description}`
    ).join('\n\n');

    return {
      message: `Berikut adalah rekomendasi teratas untuk Anda:\n\n${recommendationText}\n\nApakah Anda ingin saya jelaskan lebih detail tentang salah satu rekomendasi di atas?`,
      suggestions: topRecommendations.map((rec: any) => `Jelaskan tentang ${rec.title}`),
      insights: []
    };
  };

  const generateFinancialHealthResponse = () => {
    if (!userContext?.insights) {
      return {
        message: 'Saya belum bisa menganalisis kesehatan keuangan Anda karena data yang terbatas. Coba tambahkan lebih banyak transaksi untuk mendapatkan analisis yang akurat.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Apa itu kesehatan keuangan?'],
        insights: []
      };
    }

    const health = userContext.insights.financialHealth;
    const score = health.score;
    let status = '';
    let advice = '';

    if (score >= 80) {
      status = 'Sangat Baik';
      advice = 'Anda memiliki kesehatan keuangan yang sangat baik! Pertahankan kebiasaan keuangan yang sudah ada.';
    } else if (score >= 60) {
      status = 'Baik';
      advice = 'Kesehatan keuangan Anda baik, namun masih ada ruang untuk perbaikan.';
    } else {
      status = 'Perlu Perbaikan';
      advice = 'Kesehatan keuangan Anda perlu perbaikan. Fokus pada menabung dan mengurangi pengeluaran.';
    }

    return {
      message: `Skor Kesehatan Keuangan Anda: ${score}/100 (${status})\n\n${advice}\n\nRekomendasi:\n${health.recommendations.slice(0, 3).map((rec: string) => `• ${rec}`).join('\n')}`,
      suggestions: ['Bagaimana cara meningkatkan skor?', 'Apa arti skor ini?', 'Rekomendasi lainnya'],
      insights: health.recommendations
    };
  };

  const generateSpendingAnalysisResponse = () => {
    if (!userContext?.insights) {
      return {
        message: 'Saya belum bisa menganalisis pola pengeluaran Anda karena data yang terbatas. Coba tambahkan lebih banyak transaksi untuk mendapatkan analisis yang akurat.',
        suggestions: ['Bagaimana cara menambah transaksi?', 'Apa itu analisis pengeluaran?'],
        insights: []
      };
    }

    const patterns = userContext.insights.spendingPatterns;
    const topCategory = patterns.topCategories[0];
    const trend = patterns.spendingTrend;

    let trendText = '';
    if (trend === 'increasing') {
      trendText = 'Pengeluaran Anda cenderung meningkat.';
    } else if (trend === 'decreasing') {
      trendText = 'Pengeluaran Anda cenderung menurun - bagus!';
    } else {
      trendText = 'Pengeluaran Anda relatif stabil.';
    }

    return {
      message: `Analisis Pengeluaran Anda:\n\n${trendText}\n\nKategori pengeluaran terbesar: ${topCategory?.category || 'Tidak ada data'} (${topCategory?.percentage?.toFixed(1) || 0}%)\n\nRata-rata pengeluaran harian: Rp ${patterns.averageDailySpending?.toLocaleString() || 0}\nRata-rata pengeluaran bulanan: Rp ${patterns.averageMonthlySpending?.toLocaleString() || 0}`,
      suggestions: ['Bagaimana cara mengurangi pengeluaran?', 'Tips mengatur budget', 'Analisis kategori lainnya'],
      insights: []
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
    setInsights([]);
  };

  const quickQuestions = [
    'Bagaimana cara menabung efektif?',
    'Apa itu dana darurat?',
    'Bagaimana cara membuat budget?',
    'Tips investasi untuk pemula',
    'Bagaimana cara mengurangi pengeluaran?'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 font-inter">Asisten Keuangan AI</h3>
            <p className="text-sm text-neutral-600">Siap membantu pertanyaan keuangan Anda</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-primary-500 ml-2' 
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 mr-2'
              }`}>
                {message.sender === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              <div className={`p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-neutral-100 p-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="p-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 mb-2">Pertanyaan Cepat:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
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

      {/* Insights */}
      {insights.length > 0 && (
        <div className="p-4 border-t border-neutral-100 bg-yellow-50">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb size={16} className="text-yellow-600" />
            <p className="text-xs font-medium text-yellow-800">Insights:</p>
          </div>
          <div className="space-y-1">
            {insights.slice(0, 3).map((insight, index) => (
              <p key={index} className="text-xs text-yellow-700">• {insight}</p>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-100">
        {/* Error/Warning Messages */}
        {validationError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
            <button
              onClick={clearWarnings}
              className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {filterWarning && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <p className="text-sm text-yellow-700">{filterWarning}</p>
            </div>
            <button
              onClick={clearWarnings}
              className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Input Field */}
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tanyakan tentang keuangan Anda..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;