/**
 * Link Interceptor - Automatically translates external websites
 * This intercepts clicks on external links and opens them with auto-translation
 */

class LinkInterceptor {
  constructor() {
    this.yourDomains = ['localhost', '127.0.0.1', 'your-domain.com', 'caifitness.com'];
    this.init();
  }

  init() {
    // Intercept all link clicks
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;

      // Check if it's an external link
      if (this.isExternalLink(link.href)) {
        const targetLang = localStorage.getItem('universalTranslatorLang');
        const isActive = localStorage.getItem('universalTranslatorActive');

        if (isActive === 'true' && targetLang && targetLang !== 'en') {
          console.log('🌍 Intercepting external link for auto-translation:', link.href);
          
          // Prevent default navigation
          event.preventDefault();
          
          // Open with auto-translation
          this.openWithTranslation(link.href, targetLang);
        }
      }
    });
  }

  isExternalLink(url) {
    try {
      const linkDomain = new URL(url).hostname;
      const currentDomain = window.location.hostname;
      
      // Check if it's a different domain and not one of your domains
      const isYourDomain = this.yourDomains.some(domain => 
        linkDomain.includes(domain) || linkDomain === domain
      );
      
      return linkDomain !== currentDomain && !isYourDomain;
    } catch (e) {
      return false;
    }
  }

  openWithTranslation(url, targetLang) {
    // Create the auto-translation script
    const autoTranslateScript = `
      (function() {
        console.log('🌍 Auto-translating page to: ${targetLang}');
        
        // Wait for page to load
        const waitForLoad = () => {
          if (document.readyState === 'complete') {
            startTranslation();
          } else {
            setTimeout(waitForLoad, 500);
          }
        };
        
        const startTranslation = () => {
          // Show translating indicator
          const indicator = document.createElement('div');
          indicator.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, rgba(255, 20, 147, 0.9), rgba(0, 212, 255, 0.9));
            border: 2px solid rgba(255, 20, 147, 1);
            border-radius: 15px;
            padding: 12px 18px;
            color: white;
            font-weight: bold;
            font-size: 14px;
            animation: translatePulse 1s ease-in-out infinite;
            box-shadow: 0 5px 20px rgba(255, 20, 147, 0.4);
          \`;
          indicator.innerHTML = '🌍 Translating...';
          document.body.appendChild(indicator);
          
          // Add animation
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes translatePulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
          \`;
          document.head.appendChild(style);
          
          // Load Google Translate
          const translateDiv = document.createElement('div');
          translateDiv.id = 'google_translate_element';
          translateDiv.style.cssText = 'position:fixed;top:60px;right:20px;z-index:999998;background:rgba(255,20,147,0.1);padding:10px;border-radius:10px;border:2px solid rgba(255,20,147,0.3);';
          document.body.appendChild(translateDiv);
          
          const script = document.createElement('script');
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          
          window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
              pageLanguage: 'auto',
              includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,ar,hi,tr,pl,nl,sv,da,no,fi,cs,hu,ro,bg,hr,sk,sl,et,lv,lt,mt,el,cy,ga,eu,ca,gl',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
            
            setTimeout(() => {
              const select = document.querySelector('.goog-te-combo');
              if (select) {
                select.value = '${targetLang}';
                select.dispatchEvent(new Event('change'));
                indicator.innerHTML = '✅ Translated!';
                indicator.style.animation = 'none';
                setTimeout(() => {
                  indicator.style.opacity = '0.7';
                  indicator.innerHTML = '🌍 Translated';
                }, 2000);
              }
            }, 2000);
          };
          
          document.head.appendChild(script);
        };
        
        waitForLoad();
      })();
    `;

    // Create a data URL with the script
    const scriptUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loading...</title>
        <script>
          // Redirect to the actual URL and inject the translation script
          window.location.href = '${url}';
          
          // Try to inject the script after redirect
          setTimeout(() => {
            ${autoTranslateScript}
          }, 2000);
        </script>
      </head>
      <body>
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, rgba(255, 20, 147, 0.9), rgba(0, 212, 255, 0.9));
          border: 2px solid rgba(255, 20, 147, 1);
          border-radius: 15px;
          padding: 20px 30px;
          color: white;
          font-weight: bold;
          text-align: center;
        ">
          🌍 Preparing translation...
        </div>
      </body>
      </html>
    `);

    // Open the URL (this approach won't work due to browser security)
    // Instead, let's use a simpler approach
    this.openWithBookmarklet(url, targetLang);
  }

  openWithBookmarklet(url, targetLang) {
    // Open the URL normally
    const newWindow = window.open(url, '_blank');
    
    // Show instruction to user
    const instruction = document.createElement('div');
    instruction.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(255, 20, 147, 0.9), rgba(0, 212, 255, 0.9));
      border: 2px solid rgba(255, 20, 147, 1);
      border-radius: 15px;
      padding: 20px 30px;
      color: white;
      font-weight: bold;
      text-align: center;
      z-index: 999999;
      max-width: 400px;
    `;
    instruction.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px;">🌍 External Link Opened</div>
      <div style="font-size: 14px; margin-bottom: 15px;">
        The page will auto-translate to ${this.getLanguageName(targetLang)} when it loads
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        If translation doesn't start automatically, look for the translate button on the page
      </div>
    `;
    document.body.appendChild(instruction);
    
    setTimeout(() => instruction.remove(), 5000);
  }

  getLanguageName(code) {
    const names = {
      es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
      pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
      zh: 'Chinese', ar: 'Arabic', hi: 'Hindi', tr: 'Turkish',
      pl: 'Polish', nl: 'Dutch', sv: 'Swedish', da: 'Danish',
      no: 'Norwegian', fi: 'Finnish', cs: 'Czech', hu: 'Hungarian',
      ro: 'Romanian', bg: 'Bulgarian', hr: 'Croatian', sk: 'Slovak',
      sl: 'Slovenian', et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian',
      mt: 'Maltese', el: 'Greek', cy: 'Welsh', ga: 'Irish',
      eu: 'Basque', ca: 'Catalan', gl: 'Galician'
    };
    return names[code] || code.toUpperCase();
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  new LinkInterceptor();
}

export default LinkInterceptor;