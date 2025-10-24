import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/UniversalLanguageButton.css";

const UniversalLanguageButton = () => {
  try {
    const { currentLanguage, changeLanguage, availableLanguages } =
      useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isGlowing, setIsGlowing] = useState(false);

    // Crazy glow animation effect
    useEffect(() => {
      const glowInterval = setInterval(() => {
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 1000);
      }, 3000);

      return () => clearInterval(glowInterval);
    }, []);

    const buttonVariants = {
      idle: {
        scale: 1,
        rotate: 0,
        boxShadow: "0 0 20px rgba(255, 20, 147, 0.4)",
      },
      hover: {
        scale: 1.1,
        rotate: [0, -2, 2, 0],
        boxShadow: "0 0 40px rgba(255, 20, 147, 0.8)",
        transition: {
          rotate: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          },
        },
      },
      glow: {
        scale: [1, 1.15, 1],
        boxShadow: [
          "0 0 20px rgba(255, 20, 147, 0.4)",
          "0 0 60px rgba(255, 20, 147, 1)",
          "0 0 20px rgba(255, 20, 147, 0.4)",
        ],
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      },
    };

    const dropdownVariants = {
      hidden: {
        opacity: 0,
        scale: 0.8,
        y: -20,
        rotateX: -90,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          staggerChildren: 0.05,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    };

    const languageEmojis = {
      en: "🇺🇸",
      es: "🇪🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      it: "🇮🇹",
      pt: "🇵🇹",
      ru: "🇷🇺",
      ja: "🇯🇵",
      ko: "🇰🇷",
      zh: "🇨🇳",
      ar: "🇸🇦",
      hi: "🇮🇳",
      tr: "🇹🇷",
      pl: "🇵🇱",
      nl: "🇳🇱",
      sv: "🇸🇪",
      da: "🇩🇰",
      no: "🇳🇴",
      fi: "🇫🇮",
      cs: "🇨🇿",
      hu: "🇭🇺",
      ro: "🇷🇴",
      bg: "🇧🇬",
      hr: "🇭🇷",
      sk: "🇸🇰",
      sl: "🇸🇮",
      et: "🇪🇪",
      lv: "🇱🇻",
      lt: "🇱🇹",
      mt: "🇲🇹",
      el: "🇬🇷",
      cy: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
      ga: "🇮🇪",
      eu: "🏴󠁥󠁳󠁰󠁶󠁿",
      ca: "🏴󠁥󠁳󠁣󠁴󠁿",
      gl: "🏴󠁥󠁳󠁧󠁡󠁿",
    };

    const getLanguageName = (code) => {
      const names = {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ru: "Русский",
        ja: "日本語",
        ko: "한국어",
        zh: "中文",
        ar: "العربية",
        hi: "हिन्दी",
        tr: "Türkçe",
        pl: "Polski",
        nl: "Nederlands",
        sv: "Svenska",
        da: "Dansk",
        no: "Norsk",
        fi: "Suomi",
        cs: "Čeština",
        hu: "Magyar",
        ro: "Română",
        bg: "Български",
        hr: "Hrvatski",
        sk: "Slovenčina",
        sl: "Slovenščina",
        et: "Eesti",
        lv: "Latviešu",
        lt: "Lietuvių",
        mt: "Malti",
        el: "Ελληνικά",
        cy: "Cymraeg",
        ga: "Gaeilge",
        eu: "Euskera",
        ca: "Català",
        gl: "Galego",
      };
      return names[code] || code.toUpperCase();
    };

    // Safety checks
    if (!currentLanguage || !changeLanguage || !availableLanguages) {
      console.warn("UniversalLanguageButton: Context still loading...");
      return (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(255, 20, 147, 0.2), rgba(255, 105, 180, 0.3), rgba(218, 112, 214, 0.2))",
            backdropFilter: "blur(15px)",
            border: "2px solid rgba(255, 20, 147, 0.5)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            textAlign: "center",
            zIndex: 1000,
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          🌍
          <br />
          LOAD
        </div>
      );
    }

    return (
      <div style={{ position: "relative", zIndex: 1000 }}>
        {/* Main Button */}
        <motion.button
          variants={buttonVariants}
          initial="idle"
          animate={isGlowing ? "glow" : "idle"}
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
            background:
              "linear-gradient(135deg, rgba(255, 20, 147, 0.2), rgba(255, 105, 180, 0.3), rgba(218, 112, 214, 0.2))",
            backdropFilter: "blur(15px)",
            border: "2px solid rgba(255, 20, 147, 0.5)",
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
          {/* Animated Background Particles */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
              animation: "float 3s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Rotating Ring */}
          <div
            style={{
              position: "absolute",
              top: "-5px",
              left: "-5px",
              width: "90px",
              height: "90px",
              border: "2px solid transparent",
              borderTop: "2px solid rgba(255, 20, 147, 0.8)",
              borderRight: "2px solid rgba(255, 105, 180, 0.6)",
              borderRadius: "50%",
              animation: "spin 2s linear infinite",
              pointerEvents: "none",
            }}
          />

          {/* Button Content */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "20px", marginBottom: "2px" }}>
              {languageEmojis[currentLanguage] || "🌍"}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "900",
                letterSpacing: "0.5px",
              }}
            >
              LANG
            </div>
          </div>

          {/* Pulse Effect */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "rgba(255, 20, 147, 0.1)",
              animation: "pulse 2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Crazy Particle Effects */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "20%",
              width: "4px",
              height: "4px",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "50%",
              animation: "particle1 3s ease-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "30%",
              left: "15%",
              width: "3px",
              height: "3px",
              background: "rgba(255, 20, 147, 0.9)",
              borderRadius: "50%",
              animation: "particle2 2.5s ease-out infinite 0.5s",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "60%",
              right: "10%",
              width: "2px",
              height: "2px",
              background: "rgba(255, 105, 180, 0.7)",
              borderRadius: "50%",
              animation: "particle3 2s ease-out infinite 1s",
              pointerEvents: "none",
            }}
          />

          {/* Shimmer Effect */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background:
                "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
              animation: "shimmer 3s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        </motion.button>

        {/* Language Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
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

            {/* Dropdown */}
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                position: "fixed",
                top: "110px",
                right: "20px",
                width: "320px",
                maxHeight: "70vh",
                background:
                  "linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(255, 105, 180, 0.1), rgba(218, 112, 214, 0.15))",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(255, 20, 147, 0.3)",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 20px 60px rgba(255, 20, 147, 0.4)",
                overflowY: "auto",
                zIndex: 1001,
              }}
            >
              {/* Header */}
              <motion.div
                variants={itemVariants}
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  color: "white",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                  🌍 UNIVERSAL TRANSLATOR
                </h3>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  Not Apple, not Meta - just broke students coding for free 😅
                </p>
              </motion.div>

              {/* Language Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                {availableLanguages.map((lang) => (
                  <motion.button
                    key={lang}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255, 20, 147, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log(
                        "🌍 UniversalLanguageButton: Selecting language:",
                        lang
                      );

                      // Change language using your translation system
                      changeLanguage(lang);

                      // Close the dropdown immediately
                      setIsOpen(false);

                      console.log("🌍 Language changed to:", lang);
                    }}
                    style={{
                      background:
                        currentLanguage === lang
                          ? "rgba(255, 20, 147, 0.4)"
                          : "rgba(255, 255, 255, 0.1)",
                      border:
                        currentLanguage === lang
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
                        ✓ ACTIVE
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <motion.div
                variants={itemVariants}
                style={{
                  textAlign: "center",
                  marginTop: "15px",
                  padding: "10px",
                  background: "rgba(255, 20, 147, 0.1)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "10px",
                  opacity: 0.8,
                }}
              >
                🚀 Powered by AI Intelligence Network
              </motion.div>
            </motion.div>
          </>
        )}

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.3;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.3);
              opacity: 0.1;
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-15px) rotate(180deg);
              opacity: 0.6;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          @keyframes particle1 {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(100px, -100px) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes particle2 {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(-80px, -120px) rotate(-360deg);
              opacity: 0;
            }
          }

          @keyframes particle3 {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(60px, 90px) rotate(180deg);
              opacity: 0;
            }
          }

          @keyframes rainbow {
            0% {
              filter: hue-rotate(0deg);
            }
            25% {
              filter: hue-rotate(90deg);
            }
            50% {
              filter: hue-rotate(180deg);
            }
            75% {
              filter: hue-rotate(270deg);
            }
            100% {
              filter: hue-rotate(360deg);
            }
          }

          /* Custom scrollbar for dropdown */
          div::-webkit-scrollbar {
            width: 6px;
          }

          div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }

          div::-webkit-scrollbar-thumb {
            background: rgba(255, 20, 147, 0.5);
            border-radius: 3px;
          }

          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 20, 147, 0.8);
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error("UniversalLanguageButton error:", error);
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255, 20, 147, 0.2)",
          border: "2px solid rgba(255, 20, 147, 0.5)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        🌍
        <br />
        ERROR
      </div>
    );
  }
};

export default UniversalLanguageButton;
