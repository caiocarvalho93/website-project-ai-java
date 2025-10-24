// 🤖 CAI BUTTON - Floating AI Assistant Button
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import KiroStyleChat from './KiroStyleChat';

export default function CAIButton({ userId = 'user-001', projectContext = {} }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Check CAI service health
  useEffect(() => {
    checkCAIHealth();
    const interval = setInterval(checkCAIHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Glow animation effect
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 1500);
    }, 4000);

    return () => clearInterval(glowInterval);
  }, []);

  const checkCAIHealth = async () => {
    try {
      const CAI_API_BASE = import.meta.env.VITE_CAI_API_URL || 'http://localhost:3001';
      const response = await fetch(`${CAI_API_BASE}/health`);
      const data = await response.json();
      setIsOnline(data.success);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const buttonVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      boxShadow: isOnline 
        ? "0 0 20px rgba(76, 175, 80, 0.4)" 
        : "0 0 20px rgba(244, 67, 54, 0.4)",
    },
    hover: {
      scale: 1.1,
      rotate: [0, -3, 3, 0],
      boxShadow: isOnline 
        ? "0 0 40px rgba(76, 175, 80, 0.8)" 
        : "0 0 40px rgba(244, 67, 54, 0.8)",
      transition: {
        rotate: {
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
        },
      },
    },
    glow: {
      scale: [1, 1.2, 1],
      boxShadow: isOnline ? [
        "0 0 20px rgba(76, 175, 80, 0.4)",
        "0 0 60px rgba(76, 175, 80, 1)",
        "0 0 20px rgba(76, 175, 80, 0.4)",
      ] : [
        "0 0 20px rgba(244, 67, 54, 0.4)",
        "0 0 60px rgba(244, 67, 54, 1)",
        "0 0 20px rgba(244, 67, 54, 0.4)",
      ],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <motion.button
        variants={buttonVariants}
        initial="idle"
        animate={isGlowing ? "glow" : "idle"}
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          background: isOnline 
            ? "linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.3), rgba(76, 175, 80, 0.2))"
            : "linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(255, 87, 34, 0.3), rgba(244, 67, 54, 0.2))",
          backdropFilter: "blur(15px)",
          border: isOnline 
            ? "2px solid rgba(76, 175, 80, 0.5)" 
            : "2px solid rgba(244, 67, 54, 0.5)",
          color: "white",
          fontSize: "28px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontWeight: "bold",
          textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
          overflow: "hidden",
          zIndex: 9999,
        }}
        title={isOnline ? "Chat with CAI Assistant" : "CAI Assistant (Offline)"}
      >
        {/* Animated Background Particles */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isOnline 
              ? "radial-gradient(circle at 30% 30%, rgba(76, 175, 80, 0.3) 0%, transparent 50%)"
              : "radial-gradient(circle at 30% 30%, rgba(244, 67, 54, 0.3) 0%, transparent 50%)",
            animation: "caiFloat 3s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        
        {/* Rotating Ring */}
        <div
          style={{
            position: "absolute",
            top: "-5px",
            left: "-5px",
            width: "80px",
            height: "80px",
            border: "2px solid transparent",
            borderTop: isOnline 
              ? "2px solid rgba(76, 175, 80, 0.8)" 
              : "2px solid rgba(244, 67, 54, 0.8)",
            borderRight: isOnline 
              ? "2px solid rgba(139, 195, 74, 0.6)" 
              : "2px solid rgba(255, 87, 34, 0.6)",
            borderRadius: "50%",
            animation: "caiSpin 2s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Button Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: "24px", marginBottom: "2px" }}>
            🤖
          </div>
          <div style={{ fontSize: "8px", fontWeight: "900", letterSpacing: "0.5px" }}>
            CAI
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: isOnline ? "#4CAF50" : "#f44336",
            border: "2px solid white",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        />

        {/* Pulse Effect */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: isOnline 
              ? "rgba(76, 175, 80, 0.1)" 
              : "rgba(244, 67, 54, 0.1)",
            animation: "caiPulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </motion.button>

      {/* CAI Chat Interface - Kiro Style */}
      {isChatOpen && (
        <KiroStyleChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes caiSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes caiPulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.1;
          }
        }

        @keyframes caiFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-10px) rotate(180deg);
            opacity: 0.6;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .cai-button {
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </>
  );
}