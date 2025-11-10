import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { API_CONFIG } from '../config';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [userId] = useState(() => {
    // Generate or get userId from localStorage
    let id = localStorage.getItem('chatUserId');
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatUserId', id);
    }
    return id;
  });

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setIsBootstrapping(true);
      try {
        const response = await fetch(
          `${API_CONFIG.BACKEND_URL}/chatbot/history/${encodeURIComponent(userId)}`
        );
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        if (Array.isArray(data.history) && data.history.length) {
          const restored = data.history.map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            text: item.message,
            timestamp: new Date(item.timestamp || Date.now()),
          }));
          setMessages(restored);
        } else {
          setMessages([
            {
              role: 'assistant',
              text: '👋 Hi there! I am the Smart Bin Assistant. Ask me about bin status, operator assignments, or report issues — I answer using the latest system data.',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Unable to bootstrap chat history:', error);
        setMessages([
          {
            role: 'assistant',
            text: '👋 Hi! I am ready to help with bin status and assignments. (History unavailable right now.)',
            timestamp: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setIsBootstrapping(false);
      }
    };

    fetchHistory();
  }, [isOpen, userId]);

  // Send message to chatbot
  const sendMessage = async (overrideText) => {
    const content = (overrideText ?? input).trim();
    if (!content || loading) return;

    const userMessage = {
      role: 'user',
      text: content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage = {
        role: 'assistant',
        text: data.response,
        timestamp: new Date(data.timestamp || Date.now()),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please make sure the backend is running and try again! 🔧",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: '📊 Full bins', action: 'Which bins are almost full?' },
    { label: '🗑️ All status', action: 'Give me the status of all bins' },
    { label: '👷 Operator assignments', action: 'Who handles bin2?' },
    { label: '🛠️ Report', action: 'Report issue with bin2 lid stuck' },
    { label: '❓ Help', action: 'What can you do?' },
  ];

  // Handle quick action click
  const handleQuickAction = (action) => {
    setInput(action);
    sendMessage(action);
  };

  // Clear conversation
  const clearConversation = async () => {
    if (!window.confirm('Clear conversation history?')) return;
    setMessages([]);
    try {
      await fetch(`${API_CONFIG.BACKEND_URL}/chatbot/history/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to clear history on server:', error);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Smart Bin Assistant"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div>
              <h3>🤖 Smart Bin Assistant</h3>
              <span className="chatbot-status">{loading ? 'Typing…' : 'Online'}</span>
            </div>
            <div className="chatbot-header-actions">
              {messages.length > 0 && (
                <button onClick={clearConversation} title="Clear conversation" className="clear-btn">
                  🗑️
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="close-btn">
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {isBootstrapping ? (
              <div className="message assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-icon">👋</div>
                <h4>Hi! I'm your Smart Bin Assistant</h4>
                <p>Ask me about:</p>
                <ul>
                  <li>📊 Bin status and fill levels</li>
                  <li>📍 Bin locations</li>
                  <li>⚠️ Alert information</li>
                  <li>👷 Operator assignments</li>
                  <li>🚨 Reporting issues</li>
                </ul>
                <p className="welcome-hint">Try a quick action below or type your question!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                  <div className="message-content">{msg.text}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="message assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            {quickActions.map((action, idx) => (
              <button key={idx} onClick={() => handleQuickAction(action.action)} className="quick-action-btn">
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about bins, assignments, or report issues..."
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="send-btn">
              {loading ? '...' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;