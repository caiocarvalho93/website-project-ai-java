// 🤖 KIRO STYLE CHAT - Exact replica of Kiro's chat interface
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './KiroStyleChat.css';

const CAI_API_BASE = import.meta.env.VITE_CAI_API_URL || 'http://localhost:3001';

export default function KiroStyleChat({ isOpen, onClose }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${CAI_API_BASE}/conversation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'dev-user-001',
          projectContext: {
            projectType: "AI Intelligence News Platform",
            features: ["Universal Translation", "News Feed", "AI Analysis"],
            techStack: ["React", "Node.js", "PostgreSQL", "OpenAI"]
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConversationId(data.conversationId);
        setMessages([{
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to initialize CAI conversation:', error);
      setMessages([{
        role: 'system',
        content: 'Failed to connect to CAI. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      setIsLoading(true);
      
      const response = await fetch(`${CAI_API_BASE}/conversation/${conversationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          projectFiles: [],
          context: {
            currentPage: window.location.pathname,
            userIntent: 'general_assistance'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add CAI response
        const caiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          actions: data.actions
        };
        setMessages(prev => [...prev, caiMessage]);

        // Update pending actions
        if (data.actions && data.actions.length > 0) {
          setPendingActions(prev => [...prev, ...data.actions]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleActionApproval = async (actionId, approved, reason = '') => {
    try {
      const response = await fetch(`${CAI_API_BASE}/action/${actionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, reason })
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingActions(prev => prev.filter(action => action.id !== actionId));
        
        const resultMessage = {
          role: 'system',
          content: approved 
            ? `✅ Action executed: ${data.result?.message || 'Success'}`
            : `❌ Action rejected: ${reason || 'User declined'}`,
          timestamp: new Date(),
          isActionResult: true
        };
        setMessages(prev => [...prev, resultMessage]);
      }
    } catch (error) {
      console.error('Failed to handle action approval:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="kiro-chat-overlay"
    >
      <div className="kiro-chat-container">
        {/* Header - Exactly like Kiro */}
        <div className="kiro-chat-header">
          <div className="kiro-header-left">
            <div className="kiro-avatar">🤖</div>
            <div className="kiro-header-info">
              <h3>CAI Assistant</h3>
              <span className="kiro-status">Ready to help</span>
            </div>
          </div>
          <button onClick={onClose} className="kiro-close-btn">×</button>
        </div>

        {/* Messages Area - Exactly like Kiro */}
        <div className="kiro-messages-area">
          <div className="kiro-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`kiro-message ${message.role} ${message.isError ? 'error' : ''}`}
              >
                <div className="kiro-message-content">
                  <div className="kiro-message-text">
                    {message.content}
                  </div>
                  <div className="kiro-message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Pending Actions */}
            {pendingActions.map(action => (
              <div key={action.id} className="kiro-action-approval">
                <div className="kiro-action-header">
                  <span className={`kiro-risk-badge ${action.riskLevel?.toLowerCase()}`}>
                    {action.riskLevel} RISK
                  </span>
                  <span className="kiro-action-type">{action.type}</span>
                </div>
                <div className="kiro-action-description">
                  {action.description}
                </div>
                <div className="kiro-action-buttons">
                  <button
                    onClick={() => handleActionApproval(action.id, false, 'User declined')}
                    className="kiro-btn kiro-btn-reject"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleActionApproval(action.id, true)}
                    className="kiro-btn kiro-btn-approve"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="kiro-message assistant">
                <div className="kiro-message-content">
                  <div className="kiro-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Exactly like Kiro */}
        <div className="kiro-input-area">
          <div className="kiro-input-container">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message CAI..."
              className="kiro-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="kiro-send-btn"
            >
              {isLoading ? '⏳' : '→'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}