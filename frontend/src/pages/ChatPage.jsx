import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import NotificationService from '../utils/notifications';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const [activeBot, setActiveBot] = useState('neha'); // 'neha' or 'gemini'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const botConfig = {
    neha: {
      name: 'Neha',
      description: 'Empathetic listener for immediate support',
      color: 'bg-pink-500',
      icon: '😊'
    },
    gemini: {
      name: 'Gemini',
      description: 'Informative assistant for questions',
      color: 'bg-blue-500',
      icon: '🤖'
    }
  };

  const { isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // When the bot switches, reset the session and load its history
    setSessionId(null);
    setMessages([]);
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [activeBot, isAuthenticated]);

  const loadChatHistory = async () => {
    setLoading(true);
    try {
      // Fetch the most recent conversation for the active bot
      const response = await api.get(`/ai/conversations?botType=${activeBot}`);
      if (response.data && response.data.length > 0) {
        const lastSession = response.data[0];
        setSessionId(lastSession.sessionId);
        const formattedMessages = lastSession.conversation.map(msg => ({
          id: msg.timestamp, // Or a more unique ID if available
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot',
          timestamp: msg.timestamp,
        }));
        setMessages(formattedMessages);
      } else {
        // If no history, start with a welcome message
        setMessages([{ id: 1, text: `Hello! I'm ${botConfig[activeBot].name}. How can I help you today?`, sender: 'bot', timestamp: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      NotificationService.error('Could not load chat history.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: new Date().toISOString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      botType: activeBot
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: inputMessage,
        botType: activeBot,
        sessionId: sessionId,
      });

      const { response: aiResponse, sessionId: newSessionId } = response.data;
      setSessionId(newSessionId);

      const botMessage = { id: new Date().toISOString() + '_bot', text: aiResponse, sender: 'bot', timestamp: new Date().toISOString(), botType: activeBot };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      NotificationService.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">AI Support Chat</h1>
          
          {/* Bot Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveBot('neha')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                activeBot === 'neha'
                  ? 'bg-pink-100 text-pink-800 border border-pink-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">😊</span>
              Neha (Empathetic)
            </button>
            <button
              onClick={() => setActiveBot('gemini')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                activeBot === 'gemini'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">🤖</span>
              Gemini (Informative)
            </button>
          </div>
        </div>
      </header>

      {/* Bot Info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{botConfig[activeBot].icon}</span>
            <div>
              <h3 className="font-medium text-gray-900">{botConfig[activeBot].name}</h3>
              <p className="text-sm text-gray-600">{botConfig[activeBot].description}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${botConfig[activeBot].name}...`}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This is an AI assistant. For emergencies, please contact a mental health professional or emergency services.
            </p>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Topics</h3>
          <div className="flex flex-wrap gap-2">
            {activeBot === 'neha' ? (
              <>
                <button
                  onClick={() => setInputMessage("I'm feeling anxious today")}
                  className="bg-pink-100 hover:bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm transition duration-300"
                >
                  Feeling anxious
                </button>
                <button
                  onClick={() => setInputMessage("I need someone to talk to")}
                  className="bg-pink-100 hover:bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm transition duration-300"
                >
                  Need to talk
                </button>
                <button
                  onClick={() => setInputMessage("I'm struggling with stress")}
                  className="bg-pink-100 hover:bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm transition duration-300"
                >
                  Managing stress
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setInputMessage("What are signs of depression?")}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm transition duration-300"
                >
                  Depression signs
                </button>
                <button
                  onClick={() => setInputMessage("How to manage anxiety?")}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm transition duration-300"
                >
                  Anxiety management
                </button>
                <button
                  onClick={() => setInputMessage("What's my next appointment?")}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm transition duration-300"
                >
                  My appointments
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;