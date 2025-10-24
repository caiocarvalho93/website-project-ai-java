/**
 * Auto Translation Injector
 * This script automatically translates any webpage when users navigate to it
 * after selecting a language in the Universal Language Button
 */

class AutoTranslationInjector {
  constructor() {
    this.targetLanguage = null;
    this.isActive = false;
    this.yourWebsiteDomains = [
      'localhost',
      '127.0.0.1',
      'your-domain.com', // Add your actual domain here
      'caifitness.com', // Add any other domains you own
    ];
    this.init();
  }

  init() {
    // Check if translation is active
    this.targetLanguage = localStorage.getItem('universalTranslatorLang');
    this.isActive = localStorage.getItem('universalTranslatorActive') === 'true';

    // IMPORTANT: Only activate on external websites, NOT on your own website
    if (this.isActive && this.targetLanguage && this.targetLanguage !== 'en' && this.isExternalWebsite()) {
      console.log('🌍 AutoTranslationInjector: Active for', this.targetLanguage, 'on external website');
      this.injectTranslation();
    } else if (!this.isExternalWebsite()) {
      console.log('🌍 AutoTranslationInjector: Skipping - on your own website');
    }
  }

  isExternalWebsite() {
    const currentDomain = window.location.hostname;
    const isYourWebsite = this.yourWebsiteDomains.some(domain => 
      currentDomain.includes(domain) || currentDomain === domain
    );
    return !isYourWebsite;
  }

  injectTranslation() {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.translatePage());
    } else {
      this.translatePage();
    }
  }

  translatePage() {
    console.log('🌍 Auto-translating page to:', this.targetLanguage);

    // Show translation indicator
    this.showTranslationIndicator();

    // Method 1: Try Google Translate Widget
    this.injectGoogleTranslate();
  }

  showTranslationIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'auto-translation-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(255, 20, 147, 0.9), rgba(0, 212, 255, 0.9));
      border: 2px solid rgba(255, 20, 147, 1);
      border-radius: 15px;
      padding: 12px 18px;
      color: white;
      font-weight: bold;
      font-size: 14px;
      z-index: 999999;
      animation: translatePulse 1s ease-in-out infinite;
      box-shadow: 0 5px 20px rgba(255, 20, 147, 0.4);
    `;
    indicator.innerHTML = '🌍 Auto-translating...';
    document.body.appendChild(indicator);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes translatePulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);

    return indicator;
  }

  injectGoogleTranslate() {
    // Clean up any existing translate elements
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();

    // Create Google Translate element
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    translateDiv.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      z-index: 999998;
      background: rgba(255, 20, 147, 0.1);
      padding: 10px;
      border-radius: 10px;
      border: 2px solid rgba(255, 20, 147, 0.3);
    `;
    document.body.appendChild(translateDiv);

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

    const targetLang = this.targetLanguage;
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
          const indicator = document.getElementById('auto-translation-indicator');
          if (indicator) {
            indicator.innerHTML = '✅ Translated!';
            indicator.style.animation = 'none';
            setTimeout(() => {
              indicator.style.opacity = '0.7';
              indicator.innerHTML = '🌍 Translated';
            }, 2000);
          }
        }
      }, 2000);
    };

    document.head.appendChild(script);
  }

  // Method to disable auto-translation
  static disable() {
    localStorage.setItem('universalTranslatorActive', 'false');
    console.log('🌍 Auto-translation disabled');
  }

  // Method to enable auto-translation
  static enable(language) {
    localStorage.setItem('universalTranslatorLang', language);
    localStorage.setItem('universalTranslatorActive', 'true');
    console.log('🌍 Auto-translation enabled for:', language);
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  new AutoTranslationInjector();
}

export default AutoTranslationInjector;