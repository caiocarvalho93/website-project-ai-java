// WORKING EXTERNAL TRANSLATOR - Paste this into browser console on external sites
// Or create as a bookmarklet

(function() {
    // Check if we're on an external website (not your domain)
    const yourDomains = ['localhost', '127.0.0.1', 'your-domain.com', 'caifitness.com'];
    const currentDomain = window.location.hostname;
    const isYourWebsite = yourDomains.some(domain => 
        currentDomain.includes(domain) || currentDomain === domain
    );
    
    if (isYourWebsite) {
        console.log('🌍 Skipping - on your own website');
        return;
    }
    
    // Get the target language from localStorage
    const targetLang = localStorage.getItem('universalTranslatorLang');
    const isActive = localStorage.getItem('universalTranslatorActive');
    
    if (!isActive || isActive !== 'true' || !targetLang || targetLang === 'en') {
        console.log('🌍 No active translation found');
        return;
    }
    
    console.log('🌍 Starting auto-translation to:', targetLang);
    
    // Check if already translated
    if (document.getElementById('universal-translator-element')) {
        return;
    }
    
    // Show "🌍 Translating..." indicator
    const indicator = document.createElement('div');
    indicator.id = 'universal-translator-element';
    indicator.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        background: linear-gradient(135deg, rgba(255, 20, 147, 0.9), rgba(0, 212, 255, 0.9)) !important;
        border: 2px solid rgba(255, 20, 147, 1) !important;
        border-radius: 15px !important;
        padding: 12px 18px !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 14px !important;
        animation: translatePulse 1s ease-in-out infinite !important;
        box-shadow: 0 5px 20px rgba(255, 20, 147, 0.4) !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;
    indicator.innerHTML = '🌍 Translating...';
    document.body.appendChild(indicator);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes translatePulse {
            0%, 100% { transform: scale(1) !important; opacity: 1 !important; }
            50% { transform: scale(1.05) !important; opacity: 0.8 !important; }
        }
    `;
    document.head.appendChild(style);
    
    // Create Google Translate element
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    translateDiv.style.cssText = 'position:fixed !important;top:60px !important;right:20px !important;z-index:2147483646 !important;background:rgba(255,20,147,0.1) !important;padding:10px !important;border-radius:10px !important;border:2px solid rgba(255,20,147,0.3) !important;';
    document.body.appendChild(translateDiv);
    
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'auto',
            includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,ar,hi,tr,pl,nl,sv,da,no,fi,cs,hu,ro,bg,hr,sk,sl,et,lv,lt,mt,el,cy,ga,eu,ca,gl',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
        
        // Auto-select the target language
        setTimeout(() => {
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = targetLang;
                select.dispatchEvent(new Event('change'));
                
                // Update indicator
                indicator.innerHTML = '✅ Translated!';
                indicator.style.animation = 'none';
                
                setTimeout(() => {
                    indicator.style.opacity = '0.7';
                    indicator.innerHTML = '🌍 Translated';
                }, 2000);
            } else {
                indicator.innerHTML = '⚠️ Translation failed';
                setTimeout(() => indicator.remove(), 3000);
            }
        }, 2000);
    };
    
    document.head.appendChild(script);
})();