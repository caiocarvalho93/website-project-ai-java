// 🌍 TranslatedText Component - Auto-translating text component
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function TranslatedText({ 
  children, 
  text, 
  className = '', 
  style = {},
  fallback = null 
}) {
  const { translateText, currentLanguage, isEnglish } = useLanguage();
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const originalText = text || children;

  useEffect(() => {
    if (isEnglish || !originalText) {
      setTranslatedText(originalText);
      return;
    }

    const translate = async () => {
      setIsLoading(true);
      try {
        const translated = await translateText(originalText, currentLanguage);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(originalText); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [originalText, currentLanguage, isEnglish, translateText]);

  if (isLoading && fallback) {
    return fallback;
  }

  if (isLoading) {
    return (
      <span className={className} style={{ ...style, opacity: 0.7 }}>
        {originalText}
      </span>
    );
  }

  return (
    <span className={className} style={style}>
      {translatedText || originalText}
    </span>
  );
}