import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { ChatMessage } from '../../types';
import { filterFinancialTopic, validateChatbotInput } from '../../utils/chatbotFilters';
import { AIResponseGenerator } from '../../utils/aiResponseGenerator';
import chatbotService from '../../services/chatbotService';
import { useApp } from '../../contexts/AppContext';

const ChatInterface: React.FC = () => {
  const { user } = useApp();
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
    if (user) {
      initializeUserContext();
    }
  }, [user]);

  const initializeUserContext = async () => {
    try {
      const context = await chatbotService.getUserContext();
      aiGenerator.current.setUserContext(context);
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
    const filter = filterFinancialTopic(inputMessage);
    if (!filter.isFinancialTopic) {
      setFilterWarning(filter.warning || 'Topik tidak terkait keuangan');
      setSuggestedTopics(filter.suggestedTopics || []);
      return;
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
      // Generate AI response with context
      const aiResponse = aiGenerator.current.generateResponse(inputMessage);
      
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

      {/* Validation Error */}
      {validationError && (
        <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-400" />
            <p className="text-sm text-red-700">{validationError}</p>
            <button
              onClick={clearWarnings}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filter Warning */}
      {filterWarning && (
        <div className="px-4 py-2 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <p className="text-sm text-yellow-700">{filterWarning}</p>
            <button
              onClick={clearWarnings}
              className="ml-auto text-yellow-400 hover:text-yellow-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-l-4 border-blue-400">
          <div className="flex items-start space-x-2">
            <TrendingUp size={16} className="text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 mb-1">Insight Keuangan:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                {insights.map((insight, index) => (
                  <li key={index}>• {insight}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={clearWarnings}
              className="text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestedTopics.length > 0 && (
        <div className="px-4 py-2 bg-green-50 border-l-4 border-green-400">
          <div className="flex items-start space-x-2">
            <Lightbulb size={16} className="text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 mb-2">Saran Tindakan:</p>
              <div className="grid grid-cols-1 gap-1">
                {suggestedTopics.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-2 text-sm bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-green-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={clearWarnings}
              className="text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-600 mb-3">Pertanyaan populer:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Bagaimana cara membuat budget yang efektif?',
              'Tips menabung untuk pemula',
              'Investasi apa yang cocok untuk pemula?',
              'Cara melunasi utang dengan cepat'
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-2 text-sm bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tanyakan tentang keuangan Anda..."
            className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;