import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
};

export default function Country() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]); // Store all articles
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'ai'

  const countryCode = code?.toUpperCase() || "US";
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  const countryFlag = COUNTRY_FLAGS[countryCode] || "🌍";

  useEffect(() => {
    fetchCountryData();
  }, [countryCode]);

  const filterArticles = (filterType) => {
    setFilter(filterType);
    if (filterType === 'ai') {
      const aiArticles = allArticles.filter(a => 
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
      const baseUrl = import.meta.env.PROD
        ? "https://website-project-ai-production.up.railway.app"
        : "";

      // Fetch country news
      const newsResponse = await axios.get(
        `${baseUrl}/api/country-news/${countryCode}`
      );
      console.log(`Country ${countryCode} news response:`, newsResponse.data);
      const fetchedArticles = Array.isArray(newsResponse.data) ? newsResponse.data : [];
      setAllArticles(fetchedArticles);
      setArticles(fetchedArticles); // Initially show all

      // Fetch AI intelligence report
      const intelResponse = await axios.get(
        `${baseUrl}/api/intelligence/${countryCode}`
      );
      setIntelligence(intelResponse.data);
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
        <div className="loading">Loading country intelligence...</div>
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
                Country Intelligence — {countryName}
              </div>
              <div className="text-muted">
                Today's AI • Technology • Business • Economy
              </div>
            </div>
          </div>
          <div className="flex">
            <button onClick={() => navigate("/")} className="btn">
              ← Command Center
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
              <div className="subheading">🧠 AI Intelligence Report</div>
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
                Provider: {intelligence.provider}
              </span>
              <span className="text-muted">Status: {intelligence.status}</span>
              <span className="text-muted">
                Updated: {new Date(intelligence.timestamp).toLocaleTimeString()}
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
            className={`card ${filter === 'all' ? 'card-active' : ''}`}
            onClick={() => filterArticles('all')}
            style={{ cursor: 'pointer' }}
            data-testid="filter-all"
          >
            <div className="subheading">Total Articles</div>
            <div className="badge badge-primary">{allArticles.length}</div>
          </div>
          <div 
            className={`card ai-coverage-card ${filter === 'ai' ? 'card-active' : ''}`}
            onClick={() => filterArticles('ai')}
            style={{ cursor: 'pointer' }}
            data-testid="filter-ai"
          >
            <div className="subheading">AI Coverage</div>
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
            <div className="subheading">Avg Intelligence Score</div>
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
            📰 Strategic Intelligence Analysis
          </div>

          {articles.length === 0 ? (
            <div className="card">
              <div className="text-center text-muted">
                No intelligence reports found for {countryName} today.
                <br />
                {/* 🔒 DEVELOPER ONLY: Hidden refresh button */}
                <button
                  onClick={async () => {
                    try {
                      const baseUrl = import.meta.env.PROD
                        ? "https://website-project-ai-production.up.railway.app"
                        : "";
                      // FORTUNE 500 MODE: Use bulletproof refresh system
                      console.log(`🏢 FORTUNE 500: Refreshing ${countryCode} with bulletproof system...`);
                      
                      // Use Fortune 500-level refresh endpoint
                      await axios.post(`${baseUrl}/api/simple-refresh`);
                      
                      // Wait a moment for processing
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
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
                    article.category === "ai" || 
                    article.title?.toLowerCase().includes("ai") ||
                    article.title?.toLowerCase().includes("artificial intelligence")
                      ? "ai-article-card" 
                      : ""
                  }`}
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
                          {article.title}
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

                  <div className="flex flex-wrap">
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                      >
                        🔗 Read Article
                      </a>
                    )}
                    <button className="btn">📊 Analysis</button>
                  </div>

                  {/* User Rating System */}
                  <div className="user-rating" style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
                      Rate this article (affects 35% of final score):
                    </div>
                    <div className="flex" style={{ gap: "0.5rem", alignItems: "center" }}>
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
                        style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                        onClick={async () => {
                          try {
                            const baseUrl = import.meta.env.PROD ? 
                              "https://website-project-ai-production.up.railway.app" : "";
                            
                            await axios.post(`${baseUrl}/api/article/${article.id}/rate`, {
                              relScore: article.userRelScore || article.relScore,
                              anaScore: article.userAnaScore || article.anaScore,
                              userId: 'user-' + Date.now()
                            });
                            
                            alert('Rating submitted!');
                          } catch (error) {
                            console.error('Failed to submit rating:', error);
                          }
                        }}
                      >
                        Rate
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
            🔄 Refresh Intelligence
          </button>
          <Link to="/ai-leaderboard" className="btn">
            🌍 Global Rankings
          </Link>
          <Link to="/news" className="btn">
            📰 Global News Feed
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
