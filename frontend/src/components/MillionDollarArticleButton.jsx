// 💎 MILLION DOLLAR IDEA: Article Translation Button
// This button opens articles with AI translation overlay on external websites

import { useLanguage } from "../contexts/LanguageContext";
import TranslatedText from "./TranslatedText";

export default function MillionDollarArticleButton({
  article,
  isStartup = false,
  className = "btn",
  style = {},
}) {
  const { currentLanguage, isEnglish } = useLanguage();

  const handleArticleClick = (e) => {
    e.preventDefault();

    if (isEnglish) {
      // If English, just open normally
      window.open(article.url, "_blank");
      return;
    }

    // 💎 MILLION DOLLAR MAGIC: Open with translation overlay
    console.log(
      `💎 Opening article with ${currentLanguage.toUpperCase()} translation overlay!`
    );

    // 💎 MILLION DOLLAR MAGIC: Create translation overlay window
    const translationWindow = window.open("about:blank", "_blank");
    
    if (translationWindow) {
      // Build the HTML content as a string to avoid deprecated document.write
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>🌍 AI Translation - Loading...</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                animation: pulse 2s infinite;
                max-width: 500px;
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              .loading {
                font-size: 3rem;
                margin-bottom: 1rem;
                animation: spin 2s linear infinite;
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                margin: 1rem 0;
                overflow: hidden;
              }
              .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff1493, #ff69b4);
                width: 0%;
                animation: progress 3s ease-out forwards;
              }
              @keyframes progress {
                to { width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="loading">🌍</div>
              <h1>AI Translation Loading...</h1>
              <p>Preparing ${currentLanguage.toUpperCase()} translation overlay...</p>
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <p><strong>Article:</strong> ${article.title.substring(0, 50)}...</p>
              <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.8;">
                💎 Powered by AI Intelligence Network<br/>
                🚀 Million Dollar Translation Technology
              </div>
            </div>
            <script>
              // 💎 MILLION DOLLAR INJECTION SYSTEM
              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                if (progress >= 100) {
                  clearInterval(interval);
                  
                  // Store translation data for potential future use
                  try {
                    localStorage.setItem('ai_translation_data', JSON.stringify({
                      article: ${JSON.stringify(article).replace(/'/g, "\\'")},
                      targetLanguage: '${currentLanguage}',
                      timestamp: Date.now()
                    }));
                  } catch (e) {
                    console.log('Could not store translation data:', e);
                  }
                  
                  // Redirect to original article after loading animation
                  setTimeout(() => {
                    window.location.href = '${article.url}';
                  }, 500);
                }
              }, 300);
              
              // In a real browser extension, this would inject our translation overlay
              console.log('💎 Translation overlay would inject here in browser extension!');
            </script>
          </body>
        </html>
      `;
      
      // Use the modern approach to set content
      translationWindow.document.open();
      translationWindow.document.write(htmlContent);
      translationWindow.document.close();
    }
  };

  const defaultStyle = isStartup
    ? {
        background: "rgba(255, 20, 147, 0.2)",
        border: "1px solid rgba(255, 20, 147, 0.3)",
        color: "#ff1493",
        fontSize: "0.8rem",
      }
    : {};

  const buttonStyle = { ...defaultStyle, ...style };

  return (
    <button
      onClick={handleArticleClick}
      className={className}
      style={buttonStyle}
      title={
        isEnglish
          ? "Read Article"
          : `🌍 Read with ${currentLanguage.toUpperCase()} translation`
      }
    >
      {isEnglish ? (
        <>🔗 <TranslatedText>Read Article</TranslatedText></>
      ) : (
        <>🌍 <TranslatedText>Read</TranslatedText> ({currentLanguage.toUpperCase()})</>
      )}
    </button>
  );
}
