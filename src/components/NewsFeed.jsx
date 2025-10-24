import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiCall, createApiUrl } from "../config/api.js";

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      // BULLETPROOF: Use cached global news endpoint
      console.log("🔄 Fetching cached global news...");
      const response = await apiCall('/api/global-news');
      
      // Handle cached global news response format
      let allArticles = [];
      
      if (response.countries) {
        // New cached format: { countries: { US: {...}, DE: {...}, ... } }
        Object.values(response.countries).forEach(countryData => {
          if (Array.isArray(countryData)) {
            // Handle array format
            allArticles.push(...countryData);
          } else if (countryData.articles && Array.isArray(countryData.articles)) {
            // Handle object format
            allArticles.push(...countryData.articles);
          }
        });
        
        // Also include global articles
        if (response.global && Array.isArray(response.global)) {
          allArticles.push(...response.global);
        }
        
        console.log(`✅ Loaded ${allArticles.length} articles from ${Object.keys(response.countries).length} countries`);
      } else if (response.articles && Array.isArray(response.articles)) {
        // Fallback format
        allArticles = response.articles;
      } else if (Array.isArray(response)) {
        // Direct array format
        allArticles = response;
      }
      
      // Sort by date (newest first) and limit to 300 most recent
      allArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0);
        const dateB = new Date(b.publishedAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setArticles(allArticles.slice(0, 300));
      setLastUpdate(response.lastUpdate || new Date().toISOString());
      setLoading(false);
      
      console.log(`📰 NewsFeed: Displaying ${allArticles.slice(0, 300).length} articles`);
      
    } catch (error) {
      console.warn("Failed to fetch cached news, trying fallback:", error.message);
      
      // FALLBACK: Try old endpoint if cached fails
      try {
        const fallbackUrl = import.meta.env.PROD ? 
          "https://website-project-ai-production.up.railway.app/api/live-news/latest" : 
          "/api/live-news/latest";
        
        const fallbackResponse = await axios.get(fallbackUrl);
        
        if (fallbackResponse.data.articles && Array.isArray(fallbackResponse.data.articles)) {
          setArticles(fallbackResponse.data.articles.slice(0, 20));
          setLastUpdate(new Date().toISOString());
        } else {
          setArticles([]);
        }
      } catch (fallbackError) {
        console.error("Both cached and fallback endpoints failed:", fallbackError.message);
        setArticles([]);
      }
      
      setLoading(false);
    }
  };

  const processNewArticles = async () => {
    try {
      setLoading(true);
      console.log("🚀 ADMIN: Force refreshing cache...");
      
      // Use cache force refresh endpoint (costs API calls)
      const forceRefreshUrl = import.meta.env.PROD ? 
        "https://website-project-ai-production.up.railway.app/api/cache/force-refresh" : 
        "/api/cache/force-refresh";
      
      const response = await axios.post(forceRefreshUrl);
      
      if (response.data.success) {
        console.log("✅ Cache force refresh successful");
        // Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchNews();
      } else {
        throw new Error(response.data.error || "Force refresh failed");
      }
    } catch (error) {
      console.error("Failed to force refresh cache:", error.message);
      
      // FALLBACK: Try legacy endpoint
      try {
        const legacyUrl = import.meta.env.PROD ? 
          "https://website-project-ai-production.up.railway.app/api/force-refresh-countries" : 
          "/api/force-refresh-countries";
        
        await axios.get(legacyUrl);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchNews();
      } catch (legacyError) {
        console.error("Legacy refresh also failed:", legacyError.message);
        alert("Failed to refresh news. Please try again later.");
      }
      
      setLoading(false);
    }
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getRelevanceBadge = (score) => {
    if (score >= 85) return "badge-success";
    if (score >= 75) return "badge-warning";
    return "badge-info";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ai: "🤖",
      technology: "💻",
      business: "💼",
      economy: "📈"
    };
    return icons[category] || "📰";
  };

  if (loading && articles.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading live intelligence feed...</div>
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
        <motion.div variants={itemVariants} className="flex-between" style={{ marginBottom: "2rem" }}>
          <div>
            <div className="heading">📰 Live AI • Tech • Finance News</div>
            <div className="text-muted">
              Real-time global intelligence feed • Last update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "Unknown"}
            </div>
          </div>
          <div className="flex">
            <button 
              onClick={processNewArticles}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Processing..." : "🚀 Process New Intel"}
            </button>
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  const response = await axios.post(createApiUrl('/api/simple-refresh'));
                  if (response.data.success) {
                    console.log("✅ Fortune 500 refresh successful");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await fetchNews();
                  }
                } catch (error) {
                  console.error("Fortune 500 refresh failed:", error);
                  alert("Refresh failed. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className="btn btn-success"
              disabled={loading}
              style={{ display: 'none' }} // 🔒 HIDDEN FROM USERS - Developer only
            >
              {loading ? "Processing..." : "🔒 Dev Refresh"}
            </button>
            <button 
              onClick={() => {
                // Filter AI articles from current database articles
                const aiArticles = articles.filter(article => 
                  article.category === "ai" || 
                  article.title?.toLowerCase().includes("ai") ||
                  article.title?.toLowerCase().includes("artificial intelligence") ||
                  article.description?.toLowerCase().includes("ai") ||
                  article.description?.toLowerCase().includes("artificial intelligence")
                );
                setArticles(aiArticles);
                setLastUpdate(new Date().toISOString());
                console.log(`🤖 Filtered to ${aiArticles.length} AI articles from database`);
              }}
              className="btn"
              disabled={loading}
            >
              🚀 Startup AI News
            </button>
            <button 
              onClick={() => navigate("/")}
              className="btn"
            >
              ← Command Center
            </button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div variants={itemVariants} className="grid grid-3" style={{ marginBottom: "2rem" }}>
          <div className="card">
            <div className="subheading">Total Articles</div>
            <div className="badge badge-primary">{articles.length}</div>
          </div>
          <div className="card">
            <div className="subheading">AI Articles</div>
            <div className="badge badge-success">
              {articles.filter(a => a.category === "ai" || a.title?.toLowerCase().includes("ai")).length}
            </div>
          </div>
          <div className="card">
            <div className="subheading">Avg Relevance</div>
            <div className="badge badge-info">
              {articles.length > 0 
                ? Math.round(articles.reduce((sum, a) => sum + (a.relScore || 0), 0) / articles.length)
                : 0
              }/100
            </div>
          </div>
        </motion.div>

        {/* Articles Feed */}
        {articles.length === 0 ? (
          <motion.div variants={itemVariants} className="card">
            <div className="text-center text-muted">
              No intelligence reports available. Click "Process New Intel" to gather fresh data.
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid" style={{ gap: "1.5rem" }}>
            {articles.map((article, index) => (
              <motion.div
                key={article.id || index}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="card article-card"
              >
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                  <div className="flex">
                    <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>
                      {getCategoryIcon(article.category)}
                    </span>
                    <div>
                      <div className="subheading" style={{ marginBottom: "0.25rem" }}>
                        {article.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {article.source} {article.author && `• ${article.author}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    {article.relScore && (
                      <span className={`badge ${getRelevanceBadge(article.relScore)}`}>
                        REL {article.relScore}
                      </span>
                    )}
                    {article.anaScore && (
                      <span className={`badge ${getRelevanceBadge(article.anaScore)}`}>
                        ANA {article.anaScore}
                      </span>
                    )}
                    <span className="badge badge-info">
                      {article.category?.toUpperCase() || "NEWS"}
                    </span>
                  </div>
                </div>

                {article.description && (
                  <p className="text-secondary" style={{ marginBottom: "1rem", lineHeight: "1.5" }}>
                    {article.description.length > 200 
                      ? `${article.description.substring(0, 200)}...` 
                      : article.description
                    }
                  </p>
                )}

                <div className="article-meta">
                  <span>🌍 {article.country || "Global"}</span>
                  <span>⏰ {article.publishedAt ? new Date(article.publishedAt).toLocaleTimeString() : "Recent"}</span>
                  {article.intelligenceScore && (
                    <span>🎯 Intelligence: {article.intelligenceScore}/200</span>
                  )}
                </div>

                <div className="flex flex-wrap" style={{ marginTop: "1rem" }}>
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
                  <button 
                    onClick={() => navigate(`/country/${article.country || "US"}`)}
                    className="btn"
                  >
                    📊 Country Analysis
                  </button>
                  <button className="btn">
                    📈 Deep Analysis
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More */}
        {articles.length > 0 && (
          <motion.div variants={itemVariants} className="text-center" style={{ marginTop: "2rem" }}>
            <button 
              onClick={() => fetchNews()}
              className="btn btn-primary"
            >
              🔄 Refresh Feed
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}