// 🌍 Language Context - Global translation state management
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translation cache to avoid repeated API calls
const translationCache = new Map();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Get API base URL
  const getApiBase = () => {
    if (import.meta.env.PROD || window.location.hostname.includes("vercel.app")) {
      return "https://website-project-ai-production.up.railway.app";
    }
    return "http://localhost:3000";
  };

  // Translate text with caching
  const translateText = async (text, targetLanguage = currentLanguage) => {
    if (!text || targetLanguage === 'en') return text;
    
    const cacheKey = `${text}-${targetLanguage}`;
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      setIsTranslating(true);
      
      const response = await fetch(`${getApiBase()}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: 'en'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Cache the translation
        translationCache.set(cacheKey, data.translation);
        return data.translation;
      } else {
        console.error('Translation failed:', data.error);
        return text; // Return original text on failure
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  };

  // Batch translate multiple texts
  const batchTranslate = async (texts, targetLanguage = currentLanguage) => {
    if (targetLanguage === 'en') return texts;

    try {
      setIsTranslating(true);
      
      const response = await fetch(`${getApiBase()}/api/translate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts,
          targetLanguage,
          sourceLanguage: 'en'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const translatedTexts = data.results.map(result => 
          result.success ? result.translation : result.originalText
        );
        
        // Cache all translations
        texts.forEach((text, index) => {
          const cacheKey = `${text}-${targetLanguage}`;
          translationCache.set(cacheKey, translatedTexts[index]);
        });
        
        return translatedTexts;
      } else {
        console.error('Batch translation failed:', data.error);
        return texts;
      }
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  };

  // Change language and clear cache if needed
  const changeLanguage = (languageCode) => {
    console.log('🌍 Changing language from', currentLanguage, 'to', languageCode);
    
    if (!availableLanguages.includes(languageCode)) {
      console.error('🌍 Invalid language code:', languageCode);
      return;
    }
    
    setCurrentLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    
    console.log('🌍 Language saved to localStorage:', languageCode);
    
    // Clear cache when changing languages to force fresh translations
    if (languageCode !== 'en') {
      translationCache.clear();
      console.log('🌍 Translation cache cleared for fresh translations');
    }
    
    // Force a small delay to ensure state updates
    setTimeout(() => {
      console.log('🌍 Current language after change:', languageCode);
    }, 100);
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    console.log('🌍 Loading saved language:', savedLanguage);
    
    if (savedLanguage && savedLanguage !== 'en' && availableLanguages.includes(savedLanguage)) {
      console.log('🌍 Setting language to:', savedLanguage);
      setCurrentLanguage(savedLanguage);
    } else {
      console.log('🌍 Using default language: en');
      setCurrentLanguage('en');
    }
  }, []);

  // Available languages list
  const availableLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 
    'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 
    'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 
    'el', 'cy', 'ga', 'eu', 'ca', 'gl'
  ];

  const value = {
    currentLanguage,
    translations,
    isTranslating,
    translateText,
    batchTranslate,
    changeLanguage,
    setLanguage: changeLanguage, // Alias for compatibility
    availableLanguages,
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation Hook for components
export function useTranslation() {
  const { translateText, currentLanguage, isTranslating } = useLanguage();
  
  const t = async (text) => {
    if (currentLanguage === 'en') return text;
    return await translateText(text, currentLanguage);
  };

  return { t, isTranslating, currentLanguage };
}