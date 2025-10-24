// 🤖 CAI ACTION APPROVAL COMPONENT - Approval interface for CAI actions
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CAIActionApproval({ action, onApprove }) {
  const [showDetails, setShowDetails] = useState(false);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (approved) => {
    setIsProcessing(true);
    try {
      await onApprove(approved, reason);
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionIcon = (type) => {
    const icons = {
      file_write: '📝',
      file_read: '📖',
      file_modify: '✏️',
      run_command: '⚡',
      api_call: '🌐',
      default: '🔧'
    };
    return icons[type] || icons.default;
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      LOW: '#4CAF50',
      MEDIUM: '#FF9800', 
      HIGH: '#FF5722',
      CRITICAL: '#F44336'
    };
    return colors[riskLevel] || '#607D8B';
  };

  const getRiskIcon = (riskLevel) => {
    const icons = {
      LOW: '✅',
      MEDIUM: '⚠️',
      HIGH: '🚨',
      CRITICAL: '💀'
    };
    return icons[riskLevel] || '❓';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cai-action-approval"
      style={{ borderLeft: `4px solid ${getRiskColor(action.riskLevel)}` }}
    >
      <div className="cai-action-header">
        <div className="cai-action-info">
          <span className="cai-action-icon">{getActionIcon(action.type)}</span>
          <div>
            <h4>{action.type.replace('_', ' ').toUpperCase()}</h4>
            <p>{action.description}</p>
            
            {/* Risk Level Display */}
            <div className="cai-risk-indicator" style={{ 
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              background: `${getRiskColor(action.riskLevel)}20`,
              border: `1px solid ${getRiskColor(action.riskLevel)}40`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              <span>{getRiskIcon(action.riskLevel)}</span>
              <span style={{ color: getRiskColor(action.riskLevel) }}>
                {action.riskLevel} RISK
              </span>
              {!action.isReversible && (
                <span style={{ color: '#F44336', marginLeft: '0.5rem' }}>
                  ⚠️ IRREVERSIBLE
                </span>
              )}
            </div>
            
            {action.riskReason && (
              <div style={{ 
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic'
              }}>
                {action.riskReason}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="cai-details-toggle"
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="cai-action-details"
        >
          <h5>Action Details:</h5>
          <pre className="cai-action-data">
            {JSON.stringify(action.data, null, 2)}
          </pre>
        </motion.div>
      )}

      <div className="cai-action-controls">
        <div className="cai-reason-input">
          <input
            type="text"
            placeholder="Optional: Add a reason for your decision"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="cai-reason-field"
          />
        </div>
        
        <div className="cai-action-buttons">
          <button
            onClick={() => handleApprove(false)}
            disabled={isProcessing}
            className="cai-btn cai-btn-reject"
          >
            {isProcessing ? '⏳' : '❌'} Reject
          </button>
          
          {/* Special warning for critical actions */}
          {action.riskLevel === 'CRITICAL' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                padding: '0.5rem',
                color: '#F44336',
                fontSize: '0.8rem',
                textAlign: 'center'
              }}>
                💀 CRITICAL: This action cannot be undone!
              </div>
              <button
                onClick={() => handleApprove(true)}
                disabled={isProcessing}
                className="cai-btn cai-btn-critical"
                style={{
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  border: '2px solid #f44336'
                }}
              >
                {isProcessing ? '⏳' : '💀'} I Understand - Approve
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleApprove(true)}
              disabled={isProcessing}
              className="cai-btn cai-btn-approve"
              style={{
                background: action.riskLevel === 'HIGH' 
                  ? 'linear-gradient(135deg, #FF5722, #E64A19)'
                  : 'linear-gradient(135deg, #4CAF50, #45a049)'
              }}
            >
              {isProcessing ? '⏳' : '✅'} 
              {action.riskLevel === 'HIGH' ? ' Approve (High Risk)' : ' Approve'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}