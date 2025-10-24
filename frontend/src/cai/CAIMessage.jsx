// 🤖 CAI MESSAGE COMPONENT - Individual message display
import { motion } from 'framer-motion';

export default function CAIMessage({ message, onActionApproval }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderContent = () => {
    // Handle code blocks
    if (message.content.includes('```')) {
      const parts = message.content.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is a code block
          const lines = part.split('\n');
          const language = lines[0] || 'text';
          const code = lines.slice(1).join('\n');
          
          return (
            <pre key={index} className="cai-code-block">
              <code className={`language-${language}`}>{code}</code>
            </pre>
          );
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      });
    }

    return message.content;
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`cai-message ${isUser ? 'user' : 'assistant'} ${isSystem ? 'system' : ''} ${message.isError ? 'error' : ''}`}
    >
      <div className="cai-message-content">
        <div className="cai-message-avatar">
          {isUser ? '👤' : isSystem ? '⚙️' : '🤖'}
        </div>
        
        <div className="cai-message-body">
          <div className="cai-message-text">
            {renderContent()}
          </div>
          
          {message.actions && message.actions.length > 0 && (
            <div className="cai-message-actions">
              <div className="cai-actions-header">
                🔒 This response includes actions that require your approval
              </div>
              {message.actions.map(action => (
                <div key={action.id} className="cai-action-preview">
                  <strong>{action.type}:</strong> {action.description}
                </div>
              ))}
            </div>
          )}
          
          <div className="cai-message-timestamp">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}