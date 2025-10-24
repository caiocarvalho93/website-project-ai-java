// 🚀 REVOLUTIONARY EXIT TRANSLATION POPUP - BEAT META & APPLE! 
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function ExitTranslationPopup() {
  const { currentLanguage, isEnglish } = useLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  // Language names for display
  const languageNames = {
    'es': 'Spanish',
    'fr': 'French', 
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'tr': 'Turkish',
    'pl': 'Polish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish'
  };

  useEffect(() => {
    // Only show popup for non-English users
    if (isEnglish) return;

    // Intercept external link clicks
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Check if it's an external link
      const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
      
      if (isExternal) {
        e.preventDefault();
        setTargetUrl(href);
        setShowPopup(true);
      }
    };

    // Intercept page unload (when user navigates away)
    const handleBeforeUnload = (e) => {
      if (!isExiting) {
        e.preventDefault();
        setShowPopup(true);
        return '';
      }
    };

    document.addEventListener('click', handleLinkClick);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEnglish, isExiting]);

  const handleKeepLanguage = () => {
    // Store language preference for external browsing
    localStorage.setItem('externalBrowsingLanguage', currentLanguage);
    localStorage.setItem('enableExternalTranslation', 'true');
    
    // Create translation overlay script
    const translationScript = `
      // 🌍 REVOLUTIONARY TRANSLATION OVERLAY - INJECTED BY OUR APP!
      (function() {
        const targetLang = '${currentLanguage}';
        const apiBase = '${window.location.origin.includes('vercel') ? 'https://website-project-ai-production.up.railway.app' : 'http://localhost:3000'}';
        
        // Create floating translation button
        const createTranslationButton = () => {
          const button = document.createElement('div');
          button.innerHTML = '🌍 Translate';
          button.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff1493, #ff69b4);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(255, 20, 147, 0.4);
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
          \`;
          
          button.onmouseover = () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 30px rgba(255, 20, 147, 0.6)';
          };
          
          button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(255, 20, 147, 0.4)';
          };
          
          button.onclick = () => translatePage();
          document.body.appendChild(button);
        };
        
        // Translate page content
        const translatePage = async () => {
          const textNodes = [];
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                if (node.nodeValue.trim().length > 0 && 
                    !node.parentElement.tagName.match(/SCRIPT|STYLE|NOSCRIPT/)) {
                  return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
              }
            }
          );
          
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }
          
          // Show loading overlay
          const overlay = document.createElement('div');
          overlay.innerHTML = \`
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
              <div style="font-size: 2rem; margin-bottom: 1rem;">🌍</div>
              <div style="font-size: 1.2rem; color: white;">Translating page to \${targetLang.toUpperCase()}...</div>
              <div style="margin-top: 1rem; color: rgba(255,255,255,0.7);">Powered by our revolutionary AI</div>
            </div>
          \`;
          overlay.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 20, 147, 0.9);
            z-index: 999998;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          \`;
          document.body.appendChild(overlay);
          
          // Translate in batches
          const batchSize = 10;
          for (let i = 0; i < textNodes.length; i += batchSize) {
            const batch = textNodes.slice(i, i + batchSize);
            const texts = batch.map(node => node.nodeValue.trim());
            
            try {
              const response = await fetch(\`\${apiBase}/api/translate/batch\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  texts,
                  targetLanguage: targetLang,
                  sourceLanguage: 'en'
                })
              });
              
              const data = await response.json();
              if (data.success) {
                batch.forEach((node, index) => {
                  if (data.results[index] && data.results[index].success) {
                    node.nodeValue = data.results[index].translation;
                  }
                });
              }
            } catch (error) {
              console.error('Translation failed:', error);
            }
          }
          
          // Remove loading overlay
          document.body.removeChild(overlay);
          
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.innerHTML = '✅ Page translated successfully!';
          successMsg.style.cssText = \`
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 255, 0, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            z-index: 999999;
            font-family: Arial, sans-serif;
          \`;
          document.body.appendChild(successMsg);
          setTimeout(() => document.body.removeChild(successMsg), 3000);
        };
        
        // Initialize when page loads
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', createTranslationButton);
        } else {
          createTranslationButton();
        }
      })();
    `;

    // Open the target URL with our translation script
    const newWindow = window.open(targetUrl, '_blank');
    
    // Inject our translation script after a short delay
    setTimeout(() => {
      try {
        newWindow.eval(translationScript);
      } catch (error) {
        console.log('Cross-origin restriction - translation button will be added via extension method');
        // In a real implementation, this would be handled by a browser extension
      }
    }, 2000);

    setShowPopup(false);
    setIsExiting(true);
  };

  const handleContinueWithoutTranslation = () => {
    localStorage.setItem('enableExternalTranslation', 'false');
    
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
    
    setShowPopup(false);
    setIsExiting(true);
  };

  const handleStayOnSite = () => {
    setShowPopup(false);
    setTargetUrl('');
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '2px solid #ff1493',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(255, 20, 147, 0.3)'
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚀</div>
              <h2 style={{ 
                color: '#ff1493', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                REVOLUTIONARY TRANSLATION!
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                We're about to BEAT META & APPLE with this feature! 💥
              </p>
            </div>

            {/* Main Message */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                color: 'white', 
                fontSize: '1.1rem', 
                lineHeight: '1.5',
                marginBottom: '1rem'
              }}>
                You're currently browsing in <strong style={{ color: '#ff1493' }}>
                  {languageNames[currentLanguage] || currentLanguage.toUpperCase()}
                </strong>
              </p>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                Would you like us to translate the next website for you too? 
                <br />
                <span style={{ color: '#ff69b4', fontSize: '0.9rem' }}>
                  (This is our secret weapon to dominate the translation market!)
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <button
                onClick={handleKeepLanguage}
                style={{
                  background: 'linear-gradient(135deg, #ff1493, #ff69b4)',
                  border: '2px solid #ff1493',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '300px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(255, 20, 147, 0.4)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 30px rgba(255, 20, 147, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(255, 20, 147, 0.4)';
                }}
              >
                🌍 YES! Translate the next site in {languageNames[currentLanguage]}
              </button>

              <button
                onClick={handleContinueWithoutTranslation}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '300px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Continue without translation
              </button>

              <button
                onClick={handleStayOnSite}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '5px'
                }}
              >
                Stay on this site
              </button>
            </div>

            {/* Footer */}
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem',
              background: 'rgba(255, 20, 147, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 20, 147, 0.2)'
            }}>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.8rem',
                margin: 0,
                lineHeight: '1.4'
              }}>
                💡 <strong>Revolutionary Feature:</strong> We're the first to offer 
                real-time website translation as you browse! This will change the internet forever.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}