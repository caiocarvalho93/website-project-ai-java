// 🚀 LANGUAGE INJECTOR - Auto-inject on any page
// Tesla-level engineering for bulletproof language control

class LanguageInjector {
  constructor() {
    this.injected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    
    console.log('🚀 LanguageInjector: Tesla-level auto-injection system ready');
    this.autoInject();
  }

  // Auto-inject the language controller
  autoInject() {
    // Check if already injected
    if (window.globalLangController || this.injected) {
      console.log('✅ LanguageInjector: Already injected, skipping');
      return;
    }

    // Check if we're on the right domain (optional)
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      'website-project-ai.vercel.app',
      'your-domain.com' // Add your domain here
    ];

    const currentDomain = window.location.hostname;
    const isDomainAllowed = allowedDomains.some(domain => 
      currentDomain.includes(domain)
    );

    if (!isDomainAllowed && window.location.protocol !== 'file:') {
      console.log('🚫 LanguageInjector: Domain not allowed, skipping injection');
      return;
    }

    try {
      // Inject the controller script
      this.injectControllerScript();
      
      // Set up auto-activation for Irish if needed
      this.setupAutoActivation();
      
      this.injected = true;
      console.log('✅ LanguageInjector: Successfully injected language controller');
      
    } catch (error) {
      console.error('❌ LanguageInjector: Injection failed:', error);
      this.retryInjection();
    }
  }

  // Inject the controller script
  injectControllerScript() {
    // Create and inject the GlobalLanguageController
    const script = document.createElement('script');
    script.id = 'global-language-controller-script';
    
    // Inline the controller code for reliability
    script.textContent = this.getControllerCode();
    
    document.head.appendChild(script);
    console.log('📦 LanguageInjector: Controller script injected');
  }

  // Get the controller code (inline for reliability)
  getControllerCode() {
    return `
      // 🌍 GLOBAL LANGUAGE CONTROLLER - Inline Tesla Engineering
      class GlobalLanguageController {
        constructor() {
          this.isActive = false;
          this.currentLanguage = 'en';
          this.persistentBox = null;
          this.translationScript = null;
          this.observer = null;
          
          console.log('🚀 GlobalLanguageController: Tesla-level engineering initialized');
          this.initialize();
        }

        initialize() {
          this.createPersistentStorage();
          this.injectGlobalCSS();
          this.createPersistentBox();
          this.setupPageObserver();
          this.setupStorageListener();
          this.restoreState();
          console.log('🔧 GlobalLanguageController: All systems initialized');
        }

        createPersistentStorage() {
          this.storage = {
            set: (key, value) => {
              try {
                localStorage.setItem('globalLang_' + key, JSON.stringify(value));
                sessionStorage.setItem('globalLang_' + key, JSON.stringify(value));
                window['globalLang_' + key] = value;
              } catch (e) {
                console.warn('Storage failed:', e);
              }
            },
            
            get: (key) => {
              try {
                let value = localStorage.getItem('globalLang_' + key);
                if (!value) value = sessionStorage.getItem('globalLang_' + key);
                if (!value) value = window['globalLang_' + key];
                
                return value ? JSON.parse(value) : null;
              } catch (e) {
                return window['globalLang_' + key] || null;
              }
            }
          };
        }

        injectGlobalCSS() {
          const cssId = 'global-language-controller-css';
          if (document.getElementById(cssId)) return;

          const css = '#global-language-box{position:fixed!important;top:20px!important;right:20px!important;width:350px!important;max-height:80vh!important;background:linear-gradient(135deg,rgba(255,20,147,0.25),rgba(255,105,180,0.2),rgba(218,112,214,0.25))!important;backdrop-filter:blur(20px)!important;border:3px solid rgba(255,20,147,0.6)!important;border-radius:20px!important;padding:20px!important;box-shadow:0 20px 80px rgba(255,20,147,0.6),0 0 40px rgba(255,20,147,0.4),inset 0 0 20px rgba(255,255,255,0.1)!important;z-index:2147483647!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;color:white!important;overflow-y:auto!important;display:none!important}#global-language-box.active{display:block!important;animation:globalBoxGlow 2s ease-in-out infinite!important}@keyframes globalBoxGlow{0%,100%{box-shadow:0 20px 80px rgba(255,20,147,0.6),0 0 40px rgba(255,20,147,0.4),inset 0 0 20px rgba(255,255,255,0.1)}50%{box-shadow:0 20px 100px rgba(255,20,147,0.8),0 0 60px rgba(255,20,147,0.6),inset 0 0 30px rgba(255,255,255,0.2)}}#global-language-button{position:fixed!important;top:20px!important;right:380px!important;width:60px!important;height:60px!important;background:linear-gradient(135deg,rgba(255,20,147,0.4),rgba(255,105,180,0.5))!important;border:3px solid rgba(255,20,147,0.8)!important;border-radius:50%!important;color:white!important;font-weight:bold!important;cursor:pointer!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;font-size:10px!important;animation:globalButtonPulse 2s ease-in-out infinite!important}@keyframes globalButtonPulse{0%,100%{box-shadow:0 0 40px rgba(255,20,147,0.8);transform:scale(1)}50%{box-shadow:0 0 80px rgba(255,20,147,1);transform:scale(1.05)}}.global-lang-item{background:rgba(255,255,255,0.1)!important;border:1px solid rgba(255,255,255,0.2)!important;border-radius:12px!important;padding:12px 8px!important;margin:5px!important;color:white!important;cursor:pointer!important;text-align:center!important;transition:all 0.3s ease!important;display:inline-block!important;width:calc(50% - 10px)!important}.global-lang-item:hover{background:rgba(255,20,147,0.4)!important;transform:translateY(-2px)!important}.global-lang-item.active{background:rgba(255,20,147,0.5)!important;border:2px solid rgba(255,20,147,0.8)!important}#global-chrome-indicator{position:fixed!important;bottom:20px!important;right:20px!important;background:rgba(255,20,147,0.3)!important;backdrop-filter:blur(10px)!important;border:2px solid rgba(255,20,147,0.5)!important;border-radius:15px!important;padding:10px 15px!important;color:white!important;font-size:12px!important;font-weight:bold!important;z-index:2147483647!important;display:none!important}#global-chrome-indicator.active{display:block!important;animation:globalIndicatorPulse 3s ease-in-out infinite!important}@keyframes globalIndicatorPulse{0%,100%{background:rgba(255,20,147,0.3);transform:scale(1)}50%{background:rgba(255,20,147,0.5);transform:scale(1.02)}}';

          const style = document.createElement('style');
          style.id = cssId;
          style.textContent = css;
          document.head.appendChild(style);
          
          console.log('🎨 GlobalLanguageController: Global CSS injected');
        }

        createPersistentBox() {
          const existingBox = document.getElementById('global-language-box');
          if (existingBox) existingBox.remove();

          const existingButton = document.getElementById('global-language-button');
          if (existingButton) existingButton.remove();

          const existingIndicator = document.getElementById('global-chrome-indicator');
          if (existingIndicator) existingIndicator.remove();

          const box = document.createElement('div');
          box.id = 'global-language-box';
          box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;"><h3 style="margin:0;color:white;font-size:16px;">🌍 GLOBAL TRANSLATOR</h3><button id="close-global-box" style="background:rgba(255,20,147,0.6);border:2px solid rgba(255,20,147,0.8);border-radius:15px;padding:5px 10px;color:white;font-size:10px;font-weight:bold;cursor:pointer;">✕ CLOSE</button></div><div id="current-language-status" style="background:rgba(255,20,147,0.3);border-radius:15px;padding:15px;text-align:center;color:white;border:2px solid rgba(255,20,147,0.5);margin-bottom:15px;"><div style="font-size:24px;margin-bottom:5px;" id="current-flag">🇺🇸</div><div style="font-size:14px;font-weight:bold;" id="current-lang-name">Chrome Language: English</div><div style="font-size:10px;opacity:0.8;margin-top:5px;">🔥 Controlling ALL websites globally</div></div><div id="language-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div><div style="text-align:center;margin-top:15px;padding:10px;background:rgba(255,20,147,0.1);border-radius:10px;color:white;font-size:10px;opacity:0.8;">🚀 Tesla-Level Engineering - Global Chrome Control</div>';

          const button = document.createElement('div');
          button.id = 'global-language-button';
          button.innerHTML = '<div style="font-size:16px;">🌍</div><div>LANG</div>';

          const indicator = document.createElement('div');
          indicator.id = 'global-chrome-indicator';
          indicator.textContent = '🌍 Chrome Language: Controlled Globally';

          document.body.appendChild(box);
          document.body.appendChild(button);
          document.body.appendChild(indicator);

          this.setupEventListeners();
          this.populateLanguages();

          console.log('📦 GlobalLanguageController: Persistent box created');
        }

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

        populateLanguages() {
          const grid = document.getElementById('language-grid');
          if (!grid) return;

          const languages = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
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
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
            { code: 'pl', name: 'Polski', flag: '🇵🇱' },
            { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
          ];

          grid.innerHTML = languages.map(lang => 
            '<div class="global-lang-item ' + (lang.code === this.currentLanguage ? 'active' : '') + '" data-lang="' + lang.code + '" onclick="window.globalLangController.selectLanguage(\'' + lang.code + '\',\'' + lang.name + '\',\'' + lang.flag + '\')"><div style="font-size:16px;margin-bottom:4px;">' + lang.flag + '</div><div style="font-size:11px;font-weight:600;">' + lang.name + '</div></div>'
          ).join('');
        }

        toggleBox() {
          const box = document.getElementById('global-language-box');
          if (!box) return;

          if (box.classList.contains('active')) {
            this.deactivate();
          } else {
            this.activate();
          }
        }

        activate() {
          this.isActive = true;
          
          const box = document.getElementById('global-language-box');
          const indicator = document.getElementById('global-chrome-indicator');
          
          if (box) box.classList.add('active');
          if (indicator) indicator.classList.add('active');
          
          this.applyGlobalLanguage();
          
          this.storage.set('isActive', true);
          this.storage.set('currentLanguage', this.currentLanguage);
          
          console.log('🔥 GlobalLanguageController: ACTIVATED - Global Chrome control enabled');
        }

        deactivate() {
          this.isActive = false;
          
          const box = document.getElementById('global-language-box');
          const indicator = document.getElementById('global-chrome-indicator');
          
          if (box) box.classList.remove('active');
          if (indicator) indicator.classList.remove('active');
          
          this.resetToEnglish();
          
          this.storage.set('isActive', false);
          
          console.log('🔄 GlobalLanguageController: DEACTIVATED - Chrome reset to default');
        }

        selectLanguage(code, name, flag) {
          this.currentLanguage = code;
          
          const currentFlag = document.getElementById('current-flag');
          const currentName = document.getElementById('current-lang-name');
          
          if (currentFlag) currentFlag.textContent = flag;
          if (currentName) currentName.textContent = 'Chrome Language: ' + name;
          
          document.querySelectorAll('.global-lang-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.lang === code) {
              item.classList.add('active');
            }
          });
          
          if (this.isActive) {
            this.applyGlobalLanguage();
          }
          
          this.storage.set('currentLanguage', code);
          
          console.log('🌍 GlobalLanguageController: Language selected - ' + name + ' (' + code + ')');
        }

        applyGlobalLanguage() {
          if (this.currentLanguage === 'en') return;

          document.documentElement.lang = this.currentLanguage;
          document.body.setAttribute('data-translate-lang', this.currentLanguage);
          
          this.injectGoogleTranslate();
          this.updateMetaTags();
          
          if (!document.title.includes('🌍')) {
            document.title = '🌍 ' + document.title;
          }
          
          console.log('🔧 GlobalLanguageController: Applied ' + this.currentLanguage + ' globally');
        }

        injectGoogleTranslate() {
          if (this.translationScript) {
            this.translationScript.remove();
          }

          let translateElement = document.getElementById('google_translate_element');
          if (!translateElement) {
            translateElement = document.createElement('div');
            translateElement.id = 'google_translate_element';
            translateElement.style.display = 'none';
            document.body.appendChild(translateElement);
          }

          this.translationScript = document.createElement('script');
          this.translationScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          
          const self = this;
          window.googleTranslateElementInit = function() {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,ar,hi,ga,tr,pl,nl',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            }, 'google_translate_element');
            
            setTimeout(function() {
              const selectElement = document.querySelector('.goog-te-combo');
              if (selectElement && self.currentLanguage !== 'en') {
                selectElement.value = self.currentLanguage;
                selectElement.dispatchEvent(new Event('change'));
                console.log('🔄 Google Translate: Triggered for ' + self.currentLanguage);
              }
            }, 2000);
          };
          
          document.head.appendChild(this.translationScript);
        }

        updateMetaTags() {
          let langMeta = document.querySelector('meta[http-equiv="content-language"]');
          if (!langMeta) {
            langMeta = document.createElement('meta');
            langMeta.setAttribute('http-equiv', 'content-language');
            document.head.appendChild(langMeta);
          }
          langMeta.setAttribute('content', this.currentLanguage);
        }

        resetToEnglish() {
          document.documentElement.lang = 'en';
          document.body.removeAttribute('data-translate-lang');
          
          const selectElement = document.querySelector('.goog-te-combo');
          if (selectElement) {
            selectElement.value = 'en';
            selectElement.dispatchEvent(new Event('change'));
          }
          
          document.title = document.title.replace('🌍 ', '');
          
          const langMeta = document.querySelector('meta[http-equiv="content-language"]');
          if (langMeta) {
            langMeta.setAttribute('content', 'en');
          }
          
          console.log('🔄 GlobalLanguageController: Reset to English');
        }

        setupPageObserver() {
          const self = this;
          this.observer = new MutationObserver(function(mutations) {
            const box = document.getElementById('global-language-box');
            const button = document.getElementById('global-language-button');
            
            if (!box || !button) {
              console.log('🔧 GlobalLanguageController: Elements missing, recreating...');
              setTimeout(function() {
                self.createPersistentBox();
                if (self.isActive) {
                  self.activate();
                }
              }, 1000);
            }
          });

          this.observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }

        setupStorageListener() {
          const self = this;
          window.addEventListener('storage', function(e) {
            if (e.key && e.key.startsWith('globalLang_')) {
              console.log('🔄 GlobalLanguageController: Storage change detected, syncing...');
              self.restoreState();
            }
          });
        }

        restoreState() {
          const savedActive = this.storage.get('isActive');
          const savedLanguage = this.storage.get('currentLanguage');
          
          if (savedLanguage) {
            this.currentLanguage = savedLanguage;
          }
          
          if (savedActive) {
            const self = this;
            setTimeout(function() {
              self.activate();
            }, 1000);
          }
          
          console.log('🔄 GlobalLanguageController: State restored - Active: ' + savedActive + ', Language: ' + savedLanguage);
        }

        forceActivate(languageCode) {
          languageCode = languageCode || 'ga';
          const languages = {
            'ga': { name: 'Gaeilge', flag: '🇮🇪' },
            'es': { name: 'Español', flag: '🇪🇸' },
            'fr': { name: 'Français', flag: '🇫🇷' },
            'de': { name: 'Deutsch', flag: '🇩🇪' }
          };
          
          const lang = languages[languageCode] || languages['ga'];
          this.selectLanguage(languageCode, lang.name, lang.flag);
          this.activate();
          
          console.log('🚀 GlobalLanguageController: Force activated with ' + lang.name);
        }
      }

      // Initialize global controller
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          window.globalLangController = new GlobalLanguageController();
        });
      } else {
        window.globalLangController = new GlobalLanguageController();
      }

      console.log('🌍 GlobalLanguageController: Inline module loaded - Tesla-level engineering ready');
    `;
  }

  // Set up auto-activation for Irish
  setupAutoActivation() {
    // Check if user was using Irish before
    const savedLanguage = this.getSavedLanguage();
    
    if (savedLanguage === 'ga' || savedLanguage === 'irish') {
      setTimeout(() => {
        if (window.globalLangController) {
          window.globalLangController.forceActivate('ga');
          console.log('🇮🇪 LanguageInjector: Auto-activated Irish language');
        }
      }, 2000);
    }
  }

  // Get saved language from storage
  getSavedLanguage() {
    try {
      return localStorage.getItem('globalLang_currentLanguage') || 
             sessionStorage.getItem('globalLang_currentLanguage') ||
             window.globalLang_currentLanguage;
    } catch (e) {
      return null;
    }
  }

  // Retry injection if failed
  retryInjection() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 LanguageInjector: Retrying injection (${this.retryCount}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.injected = false;
        this.autoInject();
      }, 1000 * this.retryCount);
    } else {
      console.error('❌ LanguageInjector: Max retries reached, injection failed');
    }
  }

  // Public method to force inject
  forceInject() {
    this.injected = false;
    this.retryCount = 0;
    this.autoInject();
  }
}

// Auto-initialize the injector
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.languageInjector = new LanguageInjector();
  });
} else {
  window.languageInjector = new LanguageInjector();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageInjector;
}

console.log('🚀 LanguageInjector: Auto-injection system loaded and ready');