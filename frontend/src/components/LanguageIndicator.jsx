// 🌍 Language Indicator - Shows current language and allows quick switching
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageIndicator() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);

  const quickLanguages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
  ];

  const currentLang =
    quickLanguages.find((lang) => lang.code === currentLanguage) ||
    quickLanguages[0];

  if (currentLanguage === "en") return null;

  return (
    <div
      style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 1000 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(69, 160, 73, 0.8))",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(76, 175, 80, 0.3)",
          borderRadius: "15px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          color: "white",
          fontWeight: "bold",
          textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
        }}
        onClick={() => setShowQuickSwitch(!showQuickSwitch)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>
          {currentLang.flag}
        </span>
        <span>{currentLang.name}</span>
      </motion.div>

      {showQuickSwitch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            borderRadius: "10px",
            padding: "0.5rem",
            minWidth: "150px",
          }}
        >
          {quickLanguages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setShowQuickSwitch(false);
              }}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                borderRadius: "5px",
                color: currentLanguage === lang.code ? "#4CAF50" : "white",
                background:
                  currentLanguage === lang.code
                    ? "rgba(76, 175, 80, 0.2)"
                    : "transparent",
              }}
            >
              <span style={{ marginRight: "0.5rem" }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
