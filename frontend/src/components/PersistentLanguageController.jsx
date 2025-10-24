import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/UniversalLanguageButton.css";

const PersistentLanguageController = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  // Crazy glow animation effect
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 1000);
    }, 3000);

    return () => clearInterval(glowInterval);
  }, []);

  // Global Chrome Language Control
  useEffect(() => {
    if (isPersistent && currentLanguage !== 'en') {
      // Apply language to entire page
      document.documentElement.lang = currentLanguage;
      document.body.setAttribute('data-translate-lang', currentLanguage);
      
      // Add Google Translate script if not exists
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
        
        // Initialize Google Translate
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: availableLanguages.join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
          
          // Auto-trigger translation
          setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement) {
              selectElement.value = currentLanguage;
              selectElement.dispatchEvent(new Event('change'));
            }
          }, 1000);
        };
      }
      
      console.log(`🌍 Persistent Language: Chrome language set to ${currentLanguage}`);
    } else {
      // Reset to default language
      document.documentElement.lang = 'en';
      document.body.removeAttribute('data-translate-lang');
      
      // Reset Google Translate
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = 'en';
        selectElement.dispatchEvent(new Event('change'));
      }
      
      console.log('🌍 Persistent Language: Chrome language reset to default');
    }
  }, [isPersistent, currentLanguage, availableLanguages]);

  const buttonVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      boxShadow: isPersistent 
        ? "0 0 40px rgba(255, 20, 147, 0.8), 0 0 80px rgba(255, 20, 147, 0.4)"
        : "0 0 20px rgba(255, 20, 147, 0.4)",
    },
    hover: {
      scale: 1.1,
      rotate: [0, -2, 2, 0],
      boxShadow: "0 0 60px rgba(255, 20, 147, 1), 0 0 120px rgba(255, 20, 147, 0.6)",
      transition: {
        rotate: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        },
      },
    },
    persistent: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 40px rgba(255, 20, 147, 0.8)",
        "0 0 80px rgba(255, 20, 147, 1)",
        "0 0 40px rgba(255, 20, 147, 0.8)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const persistentBoxVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const languageEmojis = {
    en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹", pt: "🇵🇹",
    ru: "🇷🇺", ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", ar: "🇸🇦", hi: "🇮🇳",
    tr: "🇹🇷", pl: "🇵🇱", nl: "🇳🇱", sv: "🇸🇪", da: "🇩🇰", no: "🇳🇴",
    fi: "🇫🇮", cs: "🇨🇿", hu: "🇭🇺", ro: "🇷🇴", bg: "🇧🇬", hr: "🇭🇷",
  };

  const getLanguageName = (code) => {
    const names = {
      en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano",
      pt: "Português", ru: "Русский", ja: "日本語", ko: "한국어", zh: "中文",
      ar: "العربية", hi: "हिन्दी", tr: "Türkçe", pl: "Polski", nl: "Nederlands",
      sv: "Svenska", da: "Dansk", no: "Norsk", fi: "Suomi", cs: "Čeština",
      hu: "Magyar", ro: "Română", bg: "Български", hr: "Hrvatski",
    };
    return names[code] || code.toUpperCase();
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    if (!isPersistent) {
      setIsOpen(false);
    }
  };

  const togglePersistent = () => {
    setIsPersistent(!isPersistent);
    if (!isPersistent) {
      setIsOpen(true); // Keep open when making persistent
    }
  };

  return (
    <div style={{ position: "relative", zIndex: 1000 }}>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      
      {/* Main Button */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        animate={isPersistent ? "persistent" : (isGlowing ? "glow" : "idle")}
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: isPersistent 
            ? "linear-gradient(135deg, rgba(255, 20, 147, 0.4), rgba(255, 105, 180, 0.5), rgba(218, 112, 214, 0.4))"
            : "linear-gradient(135deg, rgba(255, 20, 147, 0.2), rgba(255, 105, 180, 0.3), rgba(218, 112, 214, 0.2))",
          backdropFilter: "blur(15px)",
          border: isPersistent 
            ? "3px solid rgba(255, 20, 147, 0.8)"
            : "2px solid rgba(255, 20, 147, 0.5)",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontWeight: "bold",
          textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
          overflow: "hidden",
        }}
      >
        {/* Persistent Indicator Ring */}
        {isPersistent && (
          <div
            style={{
              position: "absolute",
              top: "-8px",
              left: "-8px",
              width: "96px",
              height: "96px",
              border: "3px solid transparent",
              borderTop: "3px solid rgba(255, 20, 147, 1)",
              borderRight: "3px solid rgba(255, 105, 180, 0.8)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Button Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: "20px", marginBottom: "2px" }}>
            {languageEmojis[currentLanguage] || "🌍"}
          </div>
          <div style={{ fontSize: isPersistent ? "8px" : "10px", fontWeight: "900", letterSpacing: "0.5px" }}>
            {isPersistent ? "LIVE" : "LANG"}
          </div>
        </div>

        {/* Enhanced Pulse Effect for Persistent Mode */}
        {isPersistent && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "120%",
              height: "120%",
              borderRadius: "50%",
              background: "rgba(255, 20, 147, 0.2)",
              animation: "pulse 1.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
      </motion.button>

      {/* Persistent Language Box */}
      <AnimatePresence>
        {(isOpen || isPersistent) && (
          <>
            {/* Backdrop (only if not persistent) */}
            {!isPersistent && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(2px)",
                  zIndex: 999,
                }}
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Language Control Box */}
            <motion.div
              variants={persistentBoxVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                position: "fixed",
                top: "110px",
                right: "20px",
                width: "350px",
                maxHeight: isPersistent ? "80vh" : "70vh",
                background: isPersistent
                  ? "linear-gradient(135deg, rgba(255, 20, 147, 0.25), rgba(255, 105, 180, 0.2), rgba(218, 112, 214, 0.25))"
                  : "linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(255, 105, 180, 0.1), rgba(218, 112, 214, 0.15))",
                backdropFilter: "blur(20px)",
                border: isPersistent 
                  ? "3px solid rgba(255, 20, 147, 0.6)"
                  : "2px solid rgba(255, 20, 147, 0.3)",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: isPersistent
                  ? "0 20px 80px rgba(255, 20, 147, 0.6), 0 0 40px rgba(255, 20, 147, 0.4)"
                  : "0 20px 60px rgba(255, 20, 147, 0.4)",
                overflowY: "auto",
                zIndex: 1001,
              }}
            >
              {/* Header with Persistent Toggle */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: "18px", 
                    fontWeight: "bold",
                    color: "white",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)"
                  }}>
                    🌍 UNIVERSAL TRANSLATOR
                  </h3>
                  
                  {/* Persistent Mode Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePersistent}
                    style={{
                      background: isPersistent 
                        ? "rgba(255, 20, 147, 0.6)" 
                        : "rgba(255, 255, 255, 0.2)",
                      border: isPersistent 
                        ? "2px solid rgba(255, 20, 147, 0.8)" 
                        : "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "20px",
                      padding: "8px 12px",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {isPersistent ? "📌 LIVE" : "📌 KEEP OPEN"}
                  </motion.button>
                </div>
                
                <p style={{ 
                  margin: "5px 0 0 0", 
                  fontSize: "12px", 
                  opacity: 0.8,
                  color: "white"
                }}>
                  {isPersistent 
                    ? "🔥 Chrome language is LIVE controlled!" 
                    : "Click 'KEEP OPEN' to control Chrome language globally"}
                </p>
              </div>

              {/* Current Language Status */}
              {isPersistent && (
                <div style={{
                  background: "rgba(255, 20, 147, 0.3)",
                  borderRadius: "15px",
                  padding: "15px",
                  marginBottom: "20px",
                  textAlign: "center",
                  color: "white",
                  border: "2px solid rgba(255, 20, 147, 0.5)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "5px" }}>
                    {languageEmojis[currentLanguage] || "🌍"}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Chrome Language: {getLanguageName(currentLanguage)}
                  </div>
                  <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "5px" }}>
                    ✨ All websites will show in this language
                  </div>
                </div>
              )}

              {/* Language Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}>
                {availableLanguages.map((lang) => (
                  <motion.button
                    key={lang}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255, 20, 147, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLanguageSelect(lang)}
                    style={{
                      background: currentLanguage === lang 
                        ? "rgba(255, 20, 147, 0.5)" 
                        : "rgba(255, 255, 255, 0.1)",
                      border: currentLanguage === lang 
                        ? "2px solid rgba(255, 20, 147, 0.8)" 
                        : "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      padding: "12px 8px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>
                      {languageEmojis[lang] || "🌍"}
                    </span>
                    <span>{getLanguageName(lang)}</span>
                    {currentLanguage === lang && (
                      <span style={{ fontSize: "10px", opacity: 0.8 }}>
                        {isPersistent ? "🔥 LIVE" : "✓ ACTIVE"}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                textAlign: "center",
                marginTop: "15px",
                padding: "10px",
                background: "rgba(255, 20, 147, 0.1)",
                borderRadius: "10px",
                color: "white",
                fontSize: "10px",
                opacity: 0.8,
              }}>
                {isPersistent 
                  ? "🚀 Global Chrome Language Control Active"
                  : "🚀 Powered by AI Intelligence Network"}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersistentLanguageController;