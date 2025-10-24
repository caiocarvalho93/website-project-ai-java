// 💎 MILLION DOLLAR IDEA: Article Translation Injector
// This creates a browser extension-like system that injects translations into external websites

export function createArticleTranslationInjector(article, targetLanguage) {
  // Create the injection script that will run on the external website
  const injectionScript = `
    (function() {
      // 🌍 AI INTELLIGENCE NETWORK - UNIVERSAL TRANSLATOR
      console.log('🌍 AI Translation Injector Loading...');
      
      const article = ${JSON.stringify(article)};
      const targetLanguage = '${targetLanguage}';
      
      // Create the pink translation overlay
      function createTranslationOverlay() {
        // Remove existing overlay if present
        const existing = document.getElementById('ai-translation-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'ai-translation-overlay';
        overlay.style.cssText = \`
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          max-height: 80vh;
          background: linear-gradient(135deg, rgba(255, 20, 147, 0.95), rgba(255, 105, 180, 0.9));
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 20, 147, 0.4);
          border-radius: 20px;
          padding: 20px;
          z-index: 999999;
          box-shadow: 0 20px 60px rgba(255, 20, 147, 0.3);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: white;
          overflow-y: auto;
          animation: slideIn 0.5s ease-out;
        \`;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = \`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pinkPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 20, 147, 0.5); }
            50% { box-shadow: 0 0 40px rgba(255, 20, 147, 0.8); }
          }
        \`;
        document.head.appendChild(style);
        
        overlay.innerHTML = \`
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);">
              🌍 AI TRANSLATOR
            </div>
            <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">
              Powered by AI Intelligence Network
            </div>
          </div>
          
          <div id="translation-content" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 15px;
            backdrop-filter: blur(5px);
          ">
            <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 10px;">
              🤖 Translating to \${targetLanguage.toUpperCase()}...
            </div>
            <div id="translated-title" style="font-weight: bold; margin-bottom: 10px; line-height: 1.4;">
              Loading translation...
            </div>
            <div id="translated-description" style="font-size: 0.9rem; line-height: 1.5; opacity: 0.9;">
              Please wait while we translate this article for you...
            </div>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button id="close-translator" style="
              flex: 1;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 0.8rem;
            ">
              ✕ Close
            </button>
            <button id="visit-source" style="
              flex: 2;
              background: rgba(76, 175, 80, 0.8);
              border: 1px solid rgba(76, 175, 80, 0.5);
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 0.8rem;
              font-weight: bold;
            ">
              🚀 Visit AI Network
            </button>
          </div>
        \`;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('close-translator').onclick = () => overlay.remove();
        document.getElementById('visit-source').onclick = () => {
          window.open('http://localhost:5173', '_blank');
        };
        
        // Start translation
        translateArticle();
      }
      
      // Translate the article using our API
      async function translateArticle() {
        try {
          const titleResponse = await fetch('http://localhost:3000/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: article.title,
              targetLanguage: targetLanguage,
              sourceLanguage: 'en'
            })
          });
          
          const titleData = await titleResponse.json();
          
          const descResponse = await fetch('http://localhost:3000/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: article.description || 'Article content available in original language.',
              targetLanguage: targetLanguage,
              sourceLanguage: 'en'
            })
          });
          
          const descData = await descResponse.json();
          
          // Update the overlay with translations
          const titleEl = document.getElementById('translated-title');
          const descEl = document.getElementById('translated-description');
          
          if (titleEl && titleData.success) {
            titleEl.textContent = titleData.translation;
          }
          
          if (descEl && descData.success) {
            descEl.textContent = descData.translation;
          }
          
          console.log('🌍 Translation complete!');
          
        } catch (error) {
          console.error('Translation failed:', error);
          const titleEl = document.getElementById('translated-title');
          if (titleEl) {
            titleEl.textContent = 'Translation service temporarily unavailable';
          }
        }
      }
      
      // Create overlay after a short delay to ensure page is loaded
      setTimeout(createTranslationOverlay, 1000);
      
    })();
  `;

  return injectionScript;
}

// Create a special URL that includes the injection script
export function createTranslatedArticleURL(article, targetLanguage) {

  // Create a data URL that will inject our script
  const injectionURL = `data:text/html,
    <html>
      <head>
        <title>🌍 AI Translation Redirect</title>
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
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌍 AI Translation Loading...</h1>
          <p>Redirecting to article with AI translation overlay...</p>
          <p><strong>Target Language:</strong> ${targetLanguage.toUpperCase()}</p>
        </div>
        <script>
          // Inject our translation script into the target page
          setTimeout(() => {
            window.location.href = '${article.url}';
            // Note: In a real implementation, this would be a browser extension
            // that can inject scripts into any webpage
          }, 2000);
        </script>
      </body>
    </html>
  `;

  return injectionURL;
}
