import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import TranslatedText from "../components/TranslatedText";
import TranslatedArticleTitle from "../components/TranslatedArticleTitle";
import MillionDollarArticleButton from "../components/MillionDollarArticleButton";

// ---- API CLIENT HELPERS ----
const API_BASE =
  import.meta.env.VITE_API_URL?.trim() ||
  (typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app")
    ? "https://website-project-ai-production.up.railway.app"
    : "http://localhost:3000"); // LOCAL BACKEND

// Smart country keyword mapping for fallback filtering
function getCountryKeywords(countryCode) {
  const keywords = {
    DE: [
      "germany",
      "german",
      "berlin",
      "munich",
      "hamburg",
      "volkswagen",
      "bmw",
      "mercedes",
      "siemens",
      "sap",
    ],
    JP: [
      "japan",
      "japanese",
      "tokyo",
      "osaka",
      "sony",
      "toyota",
      "nintendo",
      "softbank",
      "honda",
      "panasonic",
    ],
    KR: [
      "korea",
      "korean",
      "seoul",
      "samsung",
      "lg",
      "hyundai",
      "kia",
      "sk hynix",
    ],
    IN: [
      "india",
      "indian",
      "mumbai",
      "delhi",
      "bangalore",
      "tata",
      "infosys",
      "wipro",
      "reliance",
    ],
    BR: [
      "brazil",
      "brazilian",
      "sao paulo",
      "rio",
      "petrobras",
      "vale",
      "itau",
    ],
    CN: [
      "china",
      "chinese",
      "beijing",
      "shanghai",
      "shenzhen",
      "guangzhou",
      "alibaba",
      "tencent",
      "baidu",
      "huawei",
      "xiaomi",
      "bytedance",
      "tiktok",
      "wechat",
      "ant group",
      "didi",
      "meituan",
      "jd.com",
      "pinduoduo",
      "nio",
      "byd",
      "xpeng",
      "li auto",
    ], // MYSTERIOUS CHINA - TONS OF KEYWORDS
    ES: [
      "spain",
      "spanish",
      "madrid",
      "barcelona",
      "santander",
      "telefonica",
      "iberdrola",
    ],
    IT: ["italy", "italian", "rome", "milan", "ferrari", "fiat", "eni"],
    AU: [
      "australia",
      "australian",
      "sydney",
      "melbourne",
      "commonwealth bank",
      "bhp",
    ],
    NL: ["netherlands", "dutch", "amsterdam", "philips", "shell", "asml"],
    CH: [
      "switzerland",
      "swiss",
      "zurich",
      "geneva",
      "nestle",
      "novartis",
      "roche",
    ],
    SE: [
      "sweden",
      "swedish",
      "stockholm",
      "volvo",
      "ericsson",
      "spotify",
      "ikea",
    ],
    NO: ["norway", "norwegian", "oslo", "equinor", "telenor"],
    DK: ["denmark", "danish", "copenhagen", "novo nordisk", "maersk"],
    FI: ["finland", "finnish", "helsinki", "nokia", "kone"],
    SG: ["singapore", "singaporean", "dbs", "singtel"],
    HK: ["hong kong", "hongkong"],
    TW: ["taiwan", "taiwanese", "taipei", "tsmc", "foxconn"],
    TH: ["thailand", "thai", "bangkok"],
    MY: ["malaysia", "malaysian", "kuala lumpur"],
    ID: ["indonesia", "indonesian", "jakarta"],
    PH: ["philippines", "filipino", "manila"],
    VN: ["vietnam", "vietnamese", "ho chi minh"],
    MX: ["mexico", "mexican", "mexico city", "pemex", "america movil"],
    AR: ["argentina", "argentinian", "buenos aires"],
    CL: ["chile", "chilean", "santiago"],
    CO: ["colombia", "colombian", "bogota"],
    PE: ["peru", "peruvian", "lima"],
    ZA: ["south africa", "african", "johannesburg", "cape town"],
    EG: ["egypt", "egyptian", "cairo"],
    NG: ["nigeria", "nigerian", "lagos"],
    KE: ["kenya", "kenyan", "nairobi"],
    IL: ["israel", "israeli", "tel aviv", "jerusalem"],
    AE: ["uae", "emirates", "dubai", "abu dhabi"],
    SA: ["saudi", "saudi arabia", "riyadh", "aramco"],
    TR: ["turkey", "turkish", "istanbul", "ankara"],
    RU: ["russia", "russian", "moscow", "gazprom", "lukoil"],
    PL: ["poland", "polish", "warsaw"],
    CZ: ["czech", "prague"],
    HU: ["hungary", "hungarian", "budapest"],
    RO: ["romania", "romanian", "bucharest"],
    GR: ["greece", "greek", "athens"],
    PT: ["portugal", "portuguese", "lisbon"],
    IE: ["ireland", "irish", "dublin"],
    AT: ["austria", "austrian", "vienna"],
    BE: ["belgium", "belgian", "brussels"],
    LU: ["luxembourg"],
  };

  return keywords[countryCode] || [countryCode.toLowerCase()];
}

// Robust retry so Railway wake-ups don't blank the UI
async function fetchWithRetry(url, options = {}, retries = 3, delayMs = 1500) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: options.method || "GET",
        headers: { Accept: "application/json", ...(options.headers || {}) },
        mode: "cors",
        cache: "no-cache",
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        console.warn(`🔄 Retry ${attempt}/${retries}: ${err.message}`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr || new Error("Network error");
}

const COUNTRY_NAMES = {
  US: "United States",
  DE: "Germany",
  ES: "Spain",
  GB: "United Kingdom",
  FR: "France",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  CA: "Canada",
  BR: "Brazil",
  CN: "China", // MYSTERIOUS CHINA
};

const COUNTRY_FLAGS = {
  US: "🇺🇸",
  DE: "🇩🇪",
  ES: "🇪🇸",
  GB: "🇬🇧",
  FR: "🇫🇷",
  JP: "🇯🇵",
  KR: "🇰🇷",
  IN: "🇮🇳",
  CA: "🇨🇦",
  BR: "🇧🇷",
  CN: "🇨🇳", // MYSTERIOUS CHINA
};

export default function Country() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]); // Store all articles
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' or 'ai'
  const [showStartupNews, setShowStartupNews] = useState(false);
  const [startupArticles, setStartupArticles] = useState([]);

  const countryCode = code?.toUpperCase() || "US";
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  const countryFlag = COUNTRY_FLAGS[countryCode] || "🌍";

  useEffect(() => {
    fetchCountryData();
  }, [countryCode]);

  const filterArticles = (filterType) => {
    setFilter(filterType);
    if (filterType === "ai") {
      const aiArticles = allArticles.filter(
        (a) =>
          a.category === "ai" ||
          a.title?.toLowerCase().includes("ai") ||
          a.title?.toLowerCase().includes("artificial intelligence")
      );
      setArticles(aiArticles);
    } else {
      setArticles(allArticles);
    }
  };

  const fetchCountryData = async () => {
    setLoading(true);
    try {
      const baseUrl = API_BASE;

      // Fetch country news - SPECIAL HANDLING FOR CHINA
      let apiEndpoint;
      if (countryCode === "CN") {
        apiEndpoint = `${baseUrl}/api/china-news`;
        console.log(`🇨🇳 FETCHING REAL CHINA DATA: ${apiEndpoint}`);
      } else {
        apiEndpoint = `${baseUrl}/api/country-news/${countryCode}`;
        console.log(`🔍 FETCHING COUNTRY DATA: ${apiEndpoint}`);
      }

      const newsData = await fetchWithRetry(apiEndpoint);
      console.log(`📊 DATA RECEIVED FOR ${countryCode}:`, newsData);

      // Normalize articles
      let fetchedArticles = [];
      if (Array.isArray(newsData)) {
        fetchedArticles = newsData;
      } else if (Array.isArray(newsData?.articles)) {
        fetchedArticles = newsData.articles;
      }
      console.log(
        `📋 EXTRACTED ${fetchedArticles.length} ARTICLES FOR ${countryCode}`
      );

      // SMART FALLBACK: If country has no articles, find relevant ones from global feed
      if (fetchedArticles.length === 0) {
        console.log(
          `🔍 NO ARTICLES FOR ${countryCode}, SEARCHING GLOBAL FEED...`
        );

        try {
          const globalData = await fetchWithRetry(`${baseUrl}/api/global-news`);
          let globalArticles = [];

          // Extract all articles from global feed
          if (globalData?.countries) {
            Object.values(globalData.countries).forEach((countryArticles) => {
              if (Array.isArray(countryArticles)) {
                globalArticles.push(...countryArticles);
              }
            });
          }
          if (Array.isArray(globalData?.global)) {
            globalArticles.push(...globalData.global);
          }

          // Smart filtering based on country
          const countryKeywords = getCountryKeywords(countryCode);
          let relevantArticles = globalArticles.filter((article) => {
            const title = article.title?.toLowerCase() || "";
            const description = article.description?.toLowerCase() || "";
            const content = title + " " + description;

            return countryKeywords.some((keyword) => content.includes(keyword));
          });

          // FALLBACK: If no country-specific articles, show general tech/AI articles
          if (relevantArticles.length === 0) {
            console.log(
              `🔄 NO COUNTRY-SPECIFIC ARTICLES, SHOWING GENERAL TECH/AI FOR ${countryCode}`
            );
            relevantArticles = globalArticles
              .filter(
                (article) =>
                  article.category === "ai" || article.category === "technology"
              )
              .slice(0, 15) // Show 15 general tech articles
              .map((article) => ({
                ...article,
                isGlobalFallback: true, // Mark as global fallback - REAL DATA ONLY
                country: "GLOBAL", // Show as global - NO FAKE NEWS
                originalCountry: article.country, // Keep original for reference
              }));
          }

          console.log(
            `🎯 FOUND ${relevantArticles.length} RELEVANT ARTICLES FOR ${countryCode}`
          );
          fetchedArticles = relevantArticles.slice(0, 20); // Limit to 20 most relevant
        } catch (error) {
          console.warn(
            `⚠️ Fallback search failed for ${countryCode}:`,
            error.message
          );
        }
      }

      setAllArticles(fetchedArticles);
      setArticles(fetchedArticles);

      // Fetch AI intelligence report (make non-blocking)
      try {
        const intel = await fetchWithRetry(
          `${baseUrl}/api/intelligence/${countryCode}`
        );
        setIntelligence(intel);
      } catch (e) {
        setIntelligence({
          success: false,
          message: "Intelligence data pending",
          country: countryCode,
        });
      }
    } catch (error) {
      console.warn("Country data pending:", error.message);
      // Set fallback data
      setArticles([]);
      setIntelligence({
        success: false,
        message: "Intelligence data pending",
        country: countryCode,
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ai: "🤖",
      technology: "💻",
      business: "💼",
      economy: "📈",
    };
    return icons[category] || "📰";
  };

  const getRelevanceBadge = (score) => {
    if (score >= 85) return "badge-success";
    if (score >= 75) return "badge-warning";
    return "badge-info";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <TranslatedText>Loading country intelligence...</TranslatedText>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex-between"
          style={{ marginBottom: "2rem" }}
        >
          <div className="flex">
            <span style={{ fontSize: "3rem", marginRight: "1rem" }}>
              {countryFlag}
            </span>
            <div>
              <div className="heading">
                <TranslatedText>Country Intelligence</TranslatedText> —{" "}
                <TranslatedText>{countryName}</TranslatedText>
              </div>
              <div className="text-muted">
                <TranslatedText>
                  Today's AI • Technology • Business • Economy
                </TranslatedText>
              </div>
            </div>
          </div>
          <div className="flex" style={{ gap: "1rem" }}>
            <button
              onClick={() => navigate(-1)}
              className="btn"
              style={{
                background:
                  "linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(255, 99, 132, 0.05))",
                border: "1px solid rgba(220, 53, 69, 0.3)",
                color: "#dc3545",
              }}
            >
              ← <TranslatedText>Back</TranslatedText>
            </button>
            <button
              onClick={async () => {
                setShowStartupNews(!showStartupNews);
                if (!showStartupNews && startupArticles.length === 0) {
                  try {
                    const response = await fetchWithRetry(
                      `${API_BASE}/api/startup-news`
                    );
                    setStartupArticles(response.articles || []);
                  } catch (error) {
                    console.error("Failed to fetch startup news:", error);
                  }
                }
              }}
              className="btn"
              style={{
                background:
                  "linear-gradient(135deg, #ff1493, #ff69b4, #da70d6)",
                border: "2px solid #ff1493",
                color: "#fff",
                fontWeight: "700",
              }}
            >
              🚀 <TranslatedText>AI NEWS</TranslatedText>
            </button>
          </div>
        </motion.div>

        {/* Intelligence Summary */}
        {intelligence && (
          <motion.div
            variants={itemVariants}
            className="card"
            style={{ marginBottom: "2rem" }}
          >
            <div className="flex-between" style={{ marginBottom: "1rem" }}>
              <div className="subheading">
                🧠 <TranslatedText>AI Intelligence Report</TranslatedText>
              </div>
              <div className="flex">
                <span
                  className={`badge ${getRelevanceBadge(
                    intelligence.relScore
                  )}`}
                >
                  REL {intelligence.relScore}
                </span>
                <span
                  className={`badge ${getRelevanceBadge(
                    intelligence.anaScore
                  )}`}
                >
                  ANA {intelligence.anaScore}
                </span>
                <span className="badge badge-info">
                  {intelligence.confidence}
                </span>
              </div>
            </div>

            <div
              className="text-secondary"
              style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
            >
              {intelligence.summary}
            </div>

            <div className="flex" style={{ marginTop: "1rem" }}>
              <span className="text-muted">
                <TranslatedText>Provider</TranslatedText>:{" "}
                {intelligence.provider}
              </span>
              <span className="text-muted">
                <TranslatedText>Status</TranslatedText>: {intelligence.status}
              </span>
              <span className="text-muted">
                <TranslatedText>Updated</TranslatedText>:{" "}
                {new Date(intelligence.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Statistics */}
        <motion.div
          variants={itemVariants}
          className="grid grid-3"
          style={{ marginBottom: "2rem" }}
        >
          <div
            className={`card ${filter === "all" ? "card-active" : ""}`}
            onClick={() => filterArticles("all")}
            style={{ cursor: "pointer" }}
            data-testid="filter-all"
          >
            <div className="subheading">
              <TranslatedText>Total Articles</TranslatedText>
            </div>
            <div className="badge badge-primary">{allArticles.length}</div>
          </div>
          <div
            className={`card ai-coverage-card ${
              filter === "ai" ? "card-active" : ""
            }`}
            onClick={() => filterArticles("ai")}
            style={{ cursor: "pointer" }}
            data-testid="filter-ai"
          >
            <div className="subheading">
              <TranslatedText>AI Coverage</TranslatedText>
            </div>
            <div className="badge badge-ai">
              {
                allArticles.filter(
                  (a) =>
                    a.category === "ai" ||
                    a.title?.toLowerCase().includes("ai") ||
                    a.title?.toLowerCase().includes("artificial intelligence")
                ).length
              }
            </div>
          </div>
          <div className="card">
            <div className="subheading">
              <TranslatedText>Avg Intelligence Score</TranslatedText>
            </div>
            <div className="badge badge-info">
              {articles.length > 0
                ? Math.round(
                    articles.reduce(
                      (sum, a) => sum + ((a.relScore || 0) + (a.anaScore || 0)),
                      0
                    ) / articles.length
                  )
                : 0}
              /200
            </div>
          </div>
        </motion.div>

        {/* Articles */}
        <motion.div variants={itemVariants}>
          <div className="subheading" style={{ marginBottom: "1.5rem" }}>
            📰 <TranslatedText>Strategic Intelligence Analysis</TranslatedText>
          </div>

          {/* Global Fallback Message */}
          {articles.length > 0 &&
            articles.some((article) => article.isGlobalFallback) && (
              <motion.div
                variants={itemVariants}
                className="card"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(255, 105, 180, 0.08))",
                  border: "2px solid rgba(255, 20, 147, 0.4)",
                  boxShadow: "0 6px 20px rgba(255, 20, 147, 0.2)",
                  marginBottom: "2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#ff1493",
                    marginBottom: "0.5rem",
                  }}
                >
                  🌍 OH NO! NOTHING NEW IN THIS BEAUTY!
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                  }}
                >
                  No local news found for <strong>{countryName}</strong> today,
                  but we've got some fantastic global tech & AI updates for you!
                  <br />
                  <span style={{ color: "#ff1493", fontWeight: "500" }}>
                    🚀 Enjoy these handpicked global stories!
                  </span>
                </div>
              </motion.div>
            )}

          {articles.length === 0 ? (
            <div className="card">
              <div className="text-center text-muted">
                <TranslatedText>
                  No intelligence reports found for
                </TranslatedText>{" "}
                <TranslatedText>{countryName}</TranslatedText>{" "}
                <TranslatedText>today</TranslatedText>.
                <br />
                {/* 🔒 DEVELOPER ONLY: Hidden refresh button */}
                <button
                  onClick={async () => {
                    try {
                      const baseUrl = import.meta.env.PROD
                        ? "https://website-project-ai-production.up.railway.app"
                        : "";
                      // FORTUNE 500 MODE: Use bulletproof refresh system
                      console.log(
                        `🏢 FORTUNE 500: Refreshing ${countryCode} with bulletproof system...`
                      );

                      // Use Fortune 500-level refresh endpoint
                      await fetchWithRetry(`${API_BASE}/api/simple-refresh`, {
                        method: "POST",
                      });

                      // Wait a moment for processing
                      await new Promise((resolve) => setTimeout(resolve, 2000));

                      await fetchCountryData(); // Refresh data after processing
                    } catch (error) {
                      console.error("Failed to process intelligence:", error);
                    }
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem", display: "none" }} // 🔒 HIDDEN FROM USERS
                >
                  🔒 Dev Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="grid" style={{ gap: "1.5rem" }}>
              {articles.map((article, index) => (
                <motion.div
                  key={article.id || index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`card article-card ${
                    article.isGlobalFallback
                      ? "global-fallback-card"
                      : article.category === "ai" ||
                        article.title?.toLowerCase().includes("ai") ||
                        article.title
                          ?.toLowerCase()
                          .includes("artificial intelligence")
                      ? "ai-article-card"
                      : ""
                  }`}
                  style={
                    article.isGlobalFallback
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(255, 20, 147, 0.1), rgba(255, 105, 180, 0.05))",
                          border: "1px solid rgba(255, 20, 147, 0.3)",
                          boxShadow: "0 4px 15px rgba(255, 20, 147, 0.1)",
                        }
                      : {}
                  }
                >
                  <div
                    className="flex-between"
                    style={{ marginBottom: "1rem" }}
                  >
                    <div className="flex">
                      <span
                        style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}
                      >
                        {getCategoryIcon(article.category)}
                      </span>
                      <div>
                        <div
                          className="subheading"
                          style={{ marginBottom: "0.25rem" }}
                        >
                          <TranslatedArticleTitle title={article.title} />
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {article.source}{" "}
                          {article.author && `• ${article.author}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      {article.relScore && (
                        <span
                          className={`badge ${getRelevanceBadge(
                            article.relScore
                          )}`}
                        >
                          REL {article.relScore}
                        </span>
                      )}
                      {article.anaScore && (
                        <span
                          className={`badge ${getRelevanceBadge(
                            article.anaScore
                          )}`}
                        >
                          ANA {article.anaScore}
                        </span>
                      )}
                      <span className="badge badge-info">
                        {article.category?.toUpperCase() || "INTEL"}
                      </span>
                    </div>
                  </div>

                  {article.description && (
                    <p
                      className="text-secondary"
                      style={{ marginBottom: "1rem", lineHeight: "1.5" }}
                    >
                      {article.description.length > 200
                        ? `${article.description.substring(0, 200)}...`
                        : article.description}
                    </p>
                  )}

                  {/* Country/Global Indicator */}
                  <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                    {article.isGlobalFallback ? (
                      <span
                        style={{
                          color: "#ff1493",
                          fontWeight: "600",
                          background: "rgba(255, 20, 147, 0.1)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(255, 20, 147, 0.3)",
                        }}
                      >
                        🌍 GLOBAL
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>
                        🌍 {article.country || countryCode}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap">
                    {article.url && (
                      <MillionDollarArticleButton article={article} />
                    )}
                    <button className="btn">
                      📊 <TranslatedText>Analysis</TranslatedText>
                    </button>
                  </div>

                  {/* User Rating System */}
                  <div
                    className="user-rating"
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: "rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        marginBottom: "0.5rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <TranslatedText>
                        Rate this article (affects 35% of final score)
                      </TranslatedText>
                      :
                    </div>
                    <div
                      className="flex"
                      style={{ gap: "0.5rem", alignItems: "center" }}
                    >
                      <span style={{ fontSize: "0.7rem" }}>REL:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={article.relScore || 50}
                        style={{ width: "80px" }}
                        onChange={(e) => {
                          // Store user rating
                          const userRel = parseInt(e.target.value);
                          article.userRelScore = userRel;
                        }}
                      />
                      <span style={{ fontSize: "0.7rem" }}>ANA:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={article.anaScore || 50}
                        style={{ width: "80px" }}
                        onChange={(e) => {
                          // Store user rating
                          const userAna = parseInt(e.target.value);
                          article.userAnaScore = userAna;
                        }}
                      />
                      <button
                        className="btn"
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.25rem 0.5rem",
                        }}
                        onClick={async () => {
                          try {
                            await fetchWithRetry(
                              `${API_BASE}/api/article/${article.id}/rate`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: {
                                  relScore:
                                    article.userRelScore ??
                                    article.relScore ??
                                    50,
                                  anaScore:
                                    article.userAnaScore ??
                                    article.anaScore ??
                                    50,
                                  userId: `user-${Date.now()}`,
                                },
                              }
                            );

                            alert("Rating submitted!"); // Note: This should use a proper translation system in production
                          } catch (error) {
                            console.error("Failed to submit rating:", error);
                          }
                        }}
                      >
                        <TranslatedText>Rate</TranslatedText>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap"
          style={{ marginTop: "2rem" }}
        >
          <button onClick={fetchCountryData} className="btn btn-primary">
            🔄 <TranslatedText>Refresh Intelligence</TranslatedText>
          </button>
          <Link to="/ai-leaderboard" className="btn">
            🌍 <TranslatedText>Global Rankings</TranslatedText>
          </Link>
          <Link to="/news" className="btn">
            📰 <TranslatedText>Global News Feed</TranslatedText>
          </Link>
        </motion.div>
      </motion.div>

      {/* STARTUP NEWS - PINK BEAM ANIMATION */}
      {showStartupNews && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "400px",
            height: "100vh",
            background:
              "linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(255, 105, 180, 0.1))",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            padding: "2rem",
            overflowY: "auto",
            boxShadow: "-10px 0 30px rgba(255, 20, 147, 0.3)",
          }}
        >
          {/* Pink Beam Effect */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 20, 147, 0.3), transparent)",
              animation: "pinkBeam 2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Close Button */}
          <button
            onClick={() => setShowStartupNews(false)}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ×
          </button>

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: "2rem", textAlign: "center" }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "1.8rem",
                fontWeight: "bold",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                marginBottom: "0.5rem",
              }}
            >
              <TranslatedText>BOOM! 💥</TranslatedText>
            </h2>
            <h3
              style={{
                color: "white",
                fontSize: "1.2rem",
                textShadow: "0 0 5px rgba(255, 255, 255, 0.3)",
              }}
            >
              <TranslatedText>WEEKLY STARTUP NEWS</TranslatedText>
            </h3>
          </motion.div>

          {/* Startup Articles */}
          {startupArticles.length > 0 ? (
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {startupArticles.map((article, index) => (
                <motion.div
                  key={article.id || index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="card article-card"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 20, 147, 0.3)",
                    backdropFilter: "blur(5px)",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    className="flex-between"
                    style={{ marginBottom: "1rem" }}
                  >
                    <div>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(255, 20, 147, 0.2)",
                          color: "#ff1493",
                          border: "1px solid rgba(255, 20, 147, 0.3)",
                        }}
                      >
                        🚀 STARTUP #{index + 1}
                      </span>
                    </div>
                    <div
                      className="text-muted"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {article.source}
                    </div>
                  </div>

                  <TranslatedArticleTitle
                    title={article.title}
                    className="article-title"
                    style={{
                      color: "white",
                      marginBottom: "1rem",
                      fontSize: "1rem",
                      lineHeight: "1.4",
                    }}
                  />

                  {article.description && (
                    <p
                      className="article-description"
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        marginBottom: "1rem",
                        lineHeight: "1.5",
                        fontSize: "0.9rem",
                      }}
                    >
                      {article.description.length > 150
                        ? article.description.substring(0, 150) + "..."
                        : article.description}
                    </p>
                  )}

                  <div className="flex" style={{ gap: "0.5rem" }}>
                    <MillionDollarArticleButton
                      article={article}
                      isStartup={true}
                      style={{
                        fontSize: "0.8rem",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "1rem",
              }}
            >
              <TranslatedText>Loading startup news...</TranslatedText>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
