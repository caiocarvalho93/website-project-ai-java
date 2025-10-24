import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function LanguageDebugger() {
  const { currentLanguage, availableLanguages, isTranslating } = useLanguage();
  const [savedLanguage, setSavedLanguage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage');
    setSavedLanguage(saved || 'none');
  }, [currentLanguage]);

  if (import.meta.env.PROD) return null; // Only show in development

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      background: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      fontSize: "12px",
      zIndex: 9999,
      fontFamily: "monospace",
      border: "1px solid #333"
    }}>
      <div><strong>🌍 Language Debug:</strong></div>
      <div>Current: <span style={{color: "#4CAF50"}}>{currentLanguage}</span></div>
      <div>Saved: <span style={{color: "#ff9800"}}>{savedLanguage}</span></div>
      <div>Translating: <span style={{color: isTranslating ? "#f44336" : "#4CAF50"}}>{isTranslating ? "YES" : "NO"}</span></div>
      <div>Available: {availableLanguages.length} languages</div>
    </div>
  );
}