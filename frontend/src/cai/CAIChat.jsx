// 🤖 CAI CHAT COMPONENT - Custom AI Assistant Interface
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CAIMessage from './CAIMessage';
import CAIActionApproval from './CAIActionApproval';
import './CAIChat.css';

const CAI_API_BASE = import.meta.env.VITE_CAI_API_URL || 'http://localhost:3001';

export default function CAIChat({ userId, projectContext = {}, isOpen, onClose }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize conversation when component mounts
  useEffect(() => {
    if (isOpen && userId && !conversationId) {
      initializeConversation();
    }
  }, [isOpen, userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${CAI_API_BASE}/conversation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectContext })
      });

      const data = await response.json();
      
      if (data.success) {
        setConversationId(data.conversationId);
        setMessages([{
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
        setIsConnected(true);
      } else {
        throw new Error(data.error);
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
    
    // Add user message to UI immediately
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
          projectFiles: [], // TODO: Add current project files
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
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to send message to CAI:', error);
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
        // Remove from pending actions
        setPendingActions(prev => prev.filter(action => action.id !== actionId));
        
        // Add result message
        const resultMessage = {
          role: 'system',
          content: approved 
            ? `✅ Action executed: ${data.result?.message || 'Success'}`
            : `❌ Action rejected: ${reason || 'User declined'}`,
          timestamp: new Date(),
          isActionResult: true
        };
        setMessages(prev => [...prev, resultMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to handle action approval:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="cai-chat-container"
    >
      {/* Header */}
      <div className="cai-chat-header">
        <div className="cai-header-info">
          <div className="cai-avatar">🤖</div>
          <div>
            <h3>CAI Assistant</h3>
            <span className={`cai-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="cai-close-btn">×</button>
      </div>

      {/* Messages */}
      <div className="cai-messages">
        <AnimatePresence>
          {messages.map((message, index) => (
            <CAIMessage
              key={index}
              message={message}
              onActionApproval={handleActionApproval}
            />
          ))}
        </AnimatePresence>
        
        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <div className="cai-pending-actions">
            <h4>🔒 Actions Requiring Approval</h4>
            {pendingActions.map(action => (
              <CAIActionApproval
                key={action.id}
                action={action}
                onApprove={(approved, reason) => handleActionApproval(action.id, approved, reason)}
              />
            ))}
          </div>
        )}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cai-loading"
          >
            <div className="cai-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>CAI is thinking...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="cai-input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask CAI anything about your project..."
          className="cai-input"
          rows={1}
          disabled={isLoading || !isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading || !isConnected}
          className="cai-send-btn"
        >
          {isLoading ? '⏳' : '🚀'}
        </button>
      </div>
    </motion.div>
  );
}