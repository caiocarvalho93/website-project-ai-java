// 🌍 TranslatedArticleTitle - Real-time article title translation
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function TranslatedArticleTitle({
  title,
  className = "",
  style = {},
}) {
  const { translateText, currentLanguage, isEnglish } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEnglish || !title) {
      setTranslatedTitle(title);
      return;
    }

    const translateTitle = async () => {
      setIsLoading(true);
      try {
        const translated = await translateText(title, currentLanguage);
        setTranslatedTitle(translated);
      } catch (error) {
        console.error("Title translation failed:", error);
        setTranslatedTitle(title); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    translateTitle();
  }, [title, currentLanguage, isEnglish, translateText]);

  return (
    <h3
      className={className}
      style={{
        ...style,
        opacity: isLoading ? 0.8 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {translatedTitle}
    </h3>
  );
}
