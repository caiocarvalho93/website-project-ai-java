// 🌍 GLOBAL LANGUAGE CONTROLLER - Tesla Engineering Level
// Bulletproof persistent language control that survives page navigation

class GlobalLanguageController {
  constructor() {
    this.isActive = false;
    this.currentLanguage = 'en';
    this.persistentBox = null;
    this.originalTitle = document.title;
    this.translationScript = null;
    this.observer = null;
    
    console.log('🚀 GlobalLanguageController: Tesla-level engineering initialized');
    this.initialize();
  }

  // Initialize the global controller
  initialize() {
    // Create persistent storage
    this.createPersistentStorage();
    
    // Inject global CSS
    this.injectGlobalCSS();
    
    // Create the persistent box
    this.createPersistentBox();
    
    // Set up mutation observer for page changes
    this.setupPageObserver();
    
    // Set up storage listener for cross-tab sync
    this.setupStorageListener();
    
    // Restore previous state
    this.restoreState();
    
    console.log('🔧 GlobalLanguageController: All systems initialized');
  }

  // Create persistent storage system
  createPersistentStorage() {
    // Use multiple storage methods for reliability
    this.storage = {
      set: (key, value) => {
        try {
          localStorage.setItem(`globalLang_${key}`, JSON.stringify(value));
          sessionStorage.setItem(`globalLang_${key}`, JSON.stringify(value));
          // Also store in window for immediate access
          window[`globalLang_${key}`] = value;
        } catch (e) {
          console.warn('Storage failed:', e);
        }
      },
      
      get: (key) => {
        try {
          // Try localStorage first, then sessionStorage, then window
          let value = localStorage.getItem(`globalLang_${key}`);
          if (!value) value = sessionStorage.getItem(`globalLang_${key}`);
          if (!value) value = window[`globalLang_${key}`];
          
          return value ? JSON.parse(value) : null;
        } catch (e) {
          return window[`globalLang_${key}`] || null;
        }
      }
    };
  }

  // Inject global CSS that persists across pages
  injectGlobalCSS() {
    const cssId = 'global-language-controller-css';
    if (document.getElementById(cssId)) return;

    const css = `
      /* 🌍 GLOBAL LANGUAGE CONTROLLER - PERSISTENT STYLES */
      #global-language-box {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 350px !important;
        max-height: 80vh !important;
        background: linear-gradient(135deg, 
          rgba(255, 20, 147, 0.25), 
          rgba(255, 105, 180, 0.2), 
          rgba(218, 112, 214, 0.25)
        ) !important;
        backdrop-filter: blur(20px) !important;
        border: 3px solid rgba(255, 20, 147, 0.6) !important;
        border-radius: 20px !important;
        padding: 20px !important;
        box-shadow: 
          0 20px 80px rgba(255, 20, 147, 0.6),
          0 0 40px rgba(255, 20, 147, 0.4),
          inset 0 0 20px rgba(255, 255, 255, 0.1) !important;
        z-index: 2147483647 !important; /* Maximum z-index */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: white !important;
        overflow-y: auto !important;
        display: none !important;
      }

      #global-language-box.active {
        display: block !important;
        animation: globalBoxGlow 2s ease-in-out infinite !important;
      }

      @keyframes globalBoxGlow {
        0%, 100% {
          box-shadow: 
            0 20px 80px rgba(255, 20, 147, 0.6),
            0 0 40px rgba(255, 20, 147, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
        }
        50% {
          box-shadow: 
            0 20px 100px rgba(255, 20, 147, 0.8),
            0 0 60px rgba(255, 20, 147, 0.6),
            inset 0 0 30px rgba(255, 255, 255, 0.2);
        }
      }

      #global-language-button {
        position: fixed !important;
        top: 20px !important;
        right: 380px !important;
        width: 60px !important;
        height: 60px !important;
        background: linear-gradient(135deg, 
          rgba(255, 20, 147, 0.4), 
          rgba(255, 105, 180, 0.5)
        ) !important;
        border: 3px solid rgba(255, 20, 147, 0.8) !important;
        border-radius: 50% !important;
        color: white !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-direction: column !important;
        font-size: 10px !important;
        animation: globalButtonPulse 2s ease-in-out infinite !important;
      }

      @keyframes globalButtonPulse {
        0%, 100% {
          box-shadow: 0 0 40px rgba(255, 20, 147, 0.8);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 80px rgba(255, 20, 147, 1);
          transform: scale(1.05);
        }
      }

      .global-lang-item {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 12px !important;
        padding: 12px 8px !important;
        margin: 5px !important;
        color: white !important;
        cursor: pointer !important;
        text-align: center !important;
        transition: all 0.3s ease !important;
        display: inline-block !important;
        width: calc(50% - 10px) !important;
      }

      .global-lang-item:hover {
        background: rgba(255, 20, 147, 0.4) !important;
        transform: translateY(-2px) !important;
      }

      .global-lang-item.active {
        background: rgba(255, 20, 147, 0.5) !important;
        border: 2px solid rgba(255, 20, 147, 0.8) !important;
      }

      #global-chrome-indicator {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        background: rgba(255, 20, 147, 0.3) !important;
        backdrop-filter: blur(10px) !important;
        border: 2px solid rgba(255, 20, 147, 0.5) !important;
        border-radius: 15px !important;
        padding: 10px 15px !important;
        color: white !important;
        font-size: 12px !important;
        font-weight: bold !important;
        z-index: 2147483647 !important;
        display: none !important;
      }

      #global-chrome-indicator.active {
        display: block !important;
        animation: globalIndicatorPulse 3s ease-in-out infinite !important;
      }

      @keyframes globalIndicatorPulse {
        0%, 100% {
          background: rgba(255, 20, 147, 0.3);
          transform: scale(1);
        }
        50% {
          background: rgba(255, 20, 147, 0.5);
          transform: scale(1.02);
        }
      }

      /* Override any website styles */
      #global-language-box * {
        box-sizing: border-box !important;
      }
    `;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = css;
    document.head.appendChild(style);
    
    console.log('🎨 GlobalLanguageController: Global CSS injected');
  }

  // Create the persistent box that survives page navigation
  createPersistentBox() {
    // Remove existing box if any
    const existingBox = document.getElementById('global-language-box');
    if (existingBox) existingBox.remove();

    const existingButton = document.getElementById('global-language-button');
    if (existingButton) existingButton.remove();

    const existingIndicator = document.getElementById('global-chrome-indicator');
    if (existingIndicator) existingIndicator.remove();

    // Create the persistent box
    const box = document.createElement('div');
    box.id = 'global-language-box';
    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: white; font-size: 16px;">🌍 GLOBAL TRANSLATOR</h3>
        <button id="close-global-box" style="
          background: rgba(255, 20, 147, 0.6);
          border: 2px solid rgba(255, 20, 147, 0.8);
          border-radius: 15px;
          padding: 5px 10px;
          color: white;
          font-size: 10px;
          font-weight: bold;
          cursor: pointer;
        ">✕ CLOSE</button>
      </div>
      
      <div id="current-language-status" style="
        background: rgba(255, 20, 147, 0.3);
        border-radius: 15px;
        padding: 15px;
        text-align: center;
        color: white;
        border: 2px solid rgba(255, 20, 147, 0.5);
        margin-bottom: 15px;
      ">
        <div style="font-size: 24px; margin-bottom: 5px;" id="current-flag">🇺🇸</div>
        <div style="font-size: 14px; font-weight: bold;" id="current-lang-name">Chrome Language: English</div>
        <div style="font-size: 10px; opacity: 0.8; margin-top: 5px;">🔥 Controlling ALL websites globally</div>
      </div>
      
      <div id="language-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        <!-- Languages will be populated here -->
      </div>
      
      <div style="
        text-align: center;
        margin-top: 15px;
        padding: 10px;
        background: rgba(255, 20, 147, 0.1);
        border-radius: 10px;
        color: white;
        font-size: 10px;
        opacity: 0.8;
      ">
        🚀 Tesla-Level Engineering - Global Chrome Control
      </div>
    `;

    // Create the toggle button
    const button = document.createElement('div');
    button.id = 'global-language-button';
    button.innerHTML = `
      <div style="font-size: 16px;">🌍</div>
      <div>LANG</div>
    `;

    // Create the Chrome indicator
    const indicator = document.createElement('div');
    indicator.id = 'global-chrome-indicator';
    indicator.textContent = '🌍 Chrome Language: Controlled Globally';

    // Append to body
    document.body.appendChild(box);
    document.body.appendChild(button);
    document.body.appendChild(indicator);

    // Set up event listeners
    this.setupEventListeners();

    // Populate languages
    this.populateLanguages();

    console.log('📦 GlobalLanguageController: Persistent box created');
  }

  // Set up event listeners
  setupEventListeners() {
    const button = document.getElementById('global-language-button');
    const closeBtn = document.getElementById('close-global-box');

    if (button) {
      button.addEventListener('click', () => this.toggleBox());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.deactivate());
    }
  }

  // Populate language options
  populateLanguages() {
    const grid = document.getElementById('language-grid');
    if (!grid) return;

    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
      { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' }, // Irish
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
      { code: 'pl', name: 'Polski', flag: '🇵🇱' },
      { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    ];

    grid.innerHTML = languages.map(lang => `
      <div class="global-lang-item ${lang.code === this.currentLanguage ? 'active' : ''}" 
           data-lang="${lang.code}" 
           onclick="window.globalLangController.selectLanguage('${lang.code}', '${lang.name}', '${lang.flag}')">
        <div style="font-size: 16px; margin-bottom: 4px;">${lang.flag}</div>
        <div style="font-size: 11px; font-weight: 600;">${lang.name}</div>
      </div>
    `).join('');
  }

  // Toggle the box visibility
  toggleBox() {
    const box = document.getElementById('global-language-box');
    if (!box) return;

    if (box.classList.contains('active')) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  // Activate global language control
  activate() {
    this.isActive = true;
    
    const box = document.getElementById('global-language-box');
    const indicator = document.getElementById('global-chrome-indicator');
    
    if (box) box.classList.add('active');
    if (indicator) indicator.classList.add('active');
    
    // Apply current language globally
    this.applyGlobalLanguage();
    
    // Save state
    this.storage.set('isActive', true);
    this.storage.set('currentLanguage', this.currentLanguage);
    
    console.log('🔥 GlobalLanguageController: ACTIVATED - Global Chrome control enabled');
  }

  // Deactivate global language control
  deactivate() {
    this.isActive = false;
    
    const box = document.getElementById('global-language-box');
    const indicator = document.getElementById('global-chrome-indicator');
    
    if (box) box.classList.remove('active');
    if (indicator) indicator.classList.remove('active');
    
    // Reset to English
    this.resetToEnglish();
    
    // Save state
    this.storage.set('isActive', false);
    
    console.log('🔄 GlobalLanguageController: DEACTIVATED - Chrome reset to default');
  }

  // Select a language
  selectLanguage(code, name, flag) {
    this.currentLanguage = code;
    
    // Update UI
    const currentFlag = document.getElementById('current-flag');
    const currentName = document.getElementById('current-lang-name');
    
    if (currentFlag) currentFlag.textContent = flag;
    if (currentName) currentName.textContent = `Chrome Language: ${name}`;
    
    // Update active state in grid
    document.querySelectorAll('.global-lang-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.lang === code) {
        item.classList.add('active');
      }
    });
    
    // Apply globally if active
    if (this.isActive) {
      this.applyGlobalLanguage();
    }
    
    // Save state
    this.storage.set('currentLanguage', code);
    
    console.log(`🌍 GlobalLanguageController: Language selected - ${name} (${code})`);
  }

  // Apply language globally using multiple methods
  applyGlobalLanguage() {
    if (this.currentLanguage === 'en') return;

    // Method 1: Document language attributes
    document.documentElement.lang = this.currentLanguage;
    document.body.setAttribute('data-translate-lang', this.currentLanguage);
    
    // Method 2: Google Translate integration
    this.injectGoogleTranslate();
    
    // Method 3: Meta tags
    this.updateMetaTags();
    
    // Method 4: Page title indication
    if (!document.title.includes('🌍')) {
      document.title = `🌍 ${document.title}`;
    }
    
    console.log(`🔧 GlobalLanguageController: Applied ${this.currentLanguage} globally`);
  }

  // Inject Google Translate
  injectGoogleTranslate() {
    // Remove existing script
    if (this.translationScript) {
      this.translationScript.remove();
    }

    // Create hidden translate element
    let translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
      translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.style.display = 'none';
      document.body.appendChild(translateElement);
    }

    // Load Google Translate script
    this.translationScript = document.createElement('script');
    this.translationScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,ar,hi,ga,tr,pl,nl',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
      
      // Auto-trigger translation after a delay
      setTimeout(() => {
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement && this.currentLanguage !== 'en') {
          selectElement.value = this.currentLanguage;
          selectElement.dispatchEvent(new Event('change'));
          console.log(`🔄 Google Translate: Triggered for ${this.currentLanguage}`);
        }
      }, 2000);
    };
    
    document.head.appendChild(this.translationScript);
  }

  // Update meta tags
  updateMetaTags() {
    // Update or create language meta tag
    let langMeta = document.querySelector('meta[http-equiv="content-language"]');
    if (!langMeta) {
      langMeta = document.createElement('meta');
      langMeta.setAttribute('http-equiv', 'content-language');
      document.head.appendChild(langMeta);
    }
    langMeta.setAttribute('content', this.currentLanguage);
  }

  // Reset to English
  resetToEnglish() {
    document.documentElement.lang = 'en';
    document.body.removeAttribute('data-translate-lang');
    
    // Reset Google Translate
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = 'en';
      selectElement.dispatchEvent(new Event('change'));
    }
    
    // Reset title
    document.title = document.title.replace('🌍 ', '');
    
    // Reset meta tags
    const langMeta = document.querySelector('meta[http-equiv="content-language"]');
    if (langMeta) {
      langMeta.setAttribute('content', 'en');
    }
    
    console.log('🔄 GlobalLanguageController: Reset to English');
  }

  // Set up page observer to maintain state across navigation
  setupPageObserver() {
    this.observer = new MutationObserver((mutations) => {
      // Check if our elements still exist
      const box = document.getElementById('global-language-box');
      const button = document.getElementById('global-language-button');
      
      if (!box || !button) {
        console.log('🔧 GlobalLanguageController: Elements missing, recreating...');
        setTimeout(() => {
          this.createPersistentBox();
          if (this.isActive) {
            this.activate();
          }
        }, 1000);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Set up storage listener for cross-tab sync
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('globalLang_')) {
        console.log('🔄 GlobalLanguageController: Storage change detected, syncing...');
        this.restoreState();
      }
    });
  }

  // Restore previous state
  restoreState() {
    const savedActive = this.storage.get('isActive');
    const savedLanguage = this.storage.get('currentLanguage');
    
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
    
    if (savedActive) {
      setTimeout(() => {
        this.activate();
      }, 1000);
    }
    
    console.log(`🔄 GlobalLanguageController: State restored - Active: ${savedActive}, Language: ${savedLanguage}`);
  }

  // Public method to force activation with language
  forceActivate(languageCode = 'ga') {
    const languages = {
      'ga': { name: 'Gaeilge', flag: '🇮🇪' },
      'es': { name: 'Español', flag: '🇪🇸' },
      'fr': { name: 'Français', flag: '🇫🇷' },
      'de': { name: 'Deutsch', flag: '🇩🇪' }
    };
    
    const lang = languages[languageCode] || languages['ga'];
    this.selectLanguage(languageCode, lang.name, lang.flag);
    this.activate();
    
    console.log(`🚀 GlobalLanguageController: Force activated with ${lang.name}`);
  }
}

// Initialize global controller when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.globalLangController = new GlobalLanguageController();
  });
} else {
  window.globalLangController = new GlobalLanguageController();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlobalLanguageController;
}

console.log('🌍 GlobalLanguageController: Module loaded - Tesla-level engineering ready');