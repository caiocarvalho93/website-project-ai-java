import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ---- API CLIENT HELPERS ----
const API_BASE =
  import.meta.env.VITE_API_URL?.trim() ||
  (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
    ? "https://website-project-ai-production.up.railway.app"
    : (typeof window !== "undefined" ? window.location.origin : ""));

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
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr || new Error("Network error");
}

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // FIXED: Safe API base URL
  const getApiBase = () => {
    // Always use Railway backend in production
    if (
      import.meta.env.PROD ||
      window.location.hostname.includes("vercel.app")
    ) {
      return "https://website-project-ai-production.up.railway.app";
    }
    return window.location.origin;
  };

  const filterArticles = (filterType) => {
    setFilter(filterType);
    if (filterType === "ai") {
      const aiArticles = allArticles.filter(
        (a) =>
          a?.category === "ai" ||
          a?.title?.toLowerCase().includes("ai") ||
          a?.title?.toLowerCase().includes("artificial intelligence") ||
          a?.description?.toLowerCase().includes("ai") ||
          a?.description?.toLowerCase().includes("artificial intelligence")
      );
      setArticles(aiArticles);
    } else {
      setArticles(allArticles);
    }
  };

  useEffect(() => {
    // EINSTEIN-LEVEL: Health check on mount
    const initializeConnection = async () => {
      try {
        const healthCheck = await fetchWithRetry(`${API_BASE}/health`, 1, 500);
        console.log("✅ Initial backend health:", healthCheck);
        
        // Log when backend resumes after idle sleep
        if (healthCheck.uptime < 60) {
          console.log("🔄 Backend recently restarted (Railway wake-up detected)");
        }
      } catch (healthErr) {
        console.warn("⚠️ Initial health check failed:", healthErr.message);
      }
      
      // Fetch news after health check
      fetchNews();
    };
    
    initializeConnection();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // EINSTEIN-LEVEL: Resilient fetch with exponential backoff
  const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
        cache: "no-cache",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: HTTP ${response.status}`);
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (retries > 0 && (err.name === 'AbortError' || err.message.includes('HTTP 5') || err.message.includes('fetch'))) {
        const attempt = 4 - retries;
        console.warn(`🔄 Retry ${attempt}/3: ${err.message}`);
        console.log(`⏳ Exponential backoff: ${delay}ms (Railway wake-up)`);
        
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(url, retries - 1, delay * 2); // Exponential backoff
      }
      throw err;
    }
  };

const fetchNews = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await fetchWithRetry(`${API_BASE}/api/global-news`);

    // Extract articles safely from both buckets
    let extracted = [];
    if (data?.countries && typeof data.countries === "object") {
      for (const list of Object.values(data.countries)) {
        if (Array.isArray(list)) extracted.push(...list);
      }
    }
    if (Array.isArray(data?.global)) extracted.push(...data.global);

    // Sort & render
    const sorted = extracted
      .filter(a => a && a.title)
      .sort((a, b) => {
        const A = new Date(a.publishedAt || a.published_at || 0).getTime();
        const B = new Date(b.publishedAt || b.published_at || 0).getTime();
        return B - A;
      });

    setAllArticles(sorted);
    setArticles(sorted);
    setLastUpdate(data?.lastUpdate || new Date().toISOString());
  } catch (err) {
    setError(err.message || "Failed to load news");
    // do NOT clear lists – keep last good render
    // setAllArticles([]); setArticles([]);
  } finally {
    setLoading(false);
  }
};

  // FIXED: Simplified process function without axios
  const processNewArticles = async () => {
    try {
      setLoading(true);
      console.log("🚀 Processing new articles...");

      const forceRefreshUrl = `${API_BASE}/api/cache/force-refresh`;
      const response = await fetch(forceRefreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Cache refresh successful");
        // Wait for cache to update
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await fetchNews();
      } else {
        throw new Error(result.error || "Refresh failed");
      }
    } catch (error) {
      console.error("❌ Cache refresh failed:", error);
      setError(`Refresh failed: ${error.message}`);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getRelevanceBadge = (score) => {
    if (!score) return "badge-info";
    if (score >= 85) return "badge-success";
    if (score >= 75) return "badge-warning";
    return "badge-info";
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

  // FIXED: Safe calculations
  const aiArticlesCount = allArticles.filter(
    (a) =>
      a?.category === "ai" ||
      a?.title?.toLowerCase().includes("ai") ||
      a?.title?.toLowerCase().includes("artificial intelligence") ||
      a?.description?.toLowerCase().includes("ai") ||
      a?.description?.toLowerCase().includes("artificial intelligence")
  ).length;

  const avgRelevance =
    articles.length > 0
      ? Math.round(
          articles.reduce(
            (sum, a) => sum + (a.relScore || a.rel_score || 0),
            0
          ) / articles.length
        )
      : 0;

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
        <motion.div
          variants={itemVariants}
          className="flex-between"
          style={{ marginBottom: "2rem" }}
        >
          <div>
            <div className="heading">📰 Live AI • Tech • Finance News</div>
            <div className="text-muted">
              Real-time global intelligence feed • Last update:{" "}
              {lastUpdate
                ? new Date(lastUpdate).toLocaleTimeString()
                : "Unknown"}
            </div>
            {error && (
              <div style={{ color: "#ff6b6b", marginTop: "0.5rem" }}>
                ⚠️ {error}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={processNewArticles}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Processing..." : "🚀 Process New Intel"}
            </button>

            <button
              onClick={() => filterArticles("ai")}
              className={`btn ${filter === "ai" ? "btn-active" : ""}`}
              disabled={loading}
              style={{
                background:
                  filter === "ai"
                    ? "linear-gradient(135deg, #ff1493, #ff69b4, #da70d6)"
                    : "var(--btn-bg)",
                border:
                  filter === "ai"
                    ? "2px solid #ff1493"
                    : "2px solid var(--border)",
                color: filter === "ai" ? "#fff" : "var(--text)",
                fontWeight: "700",
              }}
            >
              🚀 AI NEWS
            </button>

            <button onClick={() => navigate("/")} className="btn">
              ← Command Center
            </button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          variants={itemVariants}
          className="grid grid-3"
          style={{ marginBottom: "2rem" }}
        >
          <div
            className={`card ${filter === "all" ? "card-active" : ""}`}
            onClick={() => filterArticles("all")}
            style={{ cursor: "pointer" }}
          >
            <div className="subheading">Total Articles</div>
            <div className="badge badge-primary">{allArticles.length}</div>
          </div>
          <div
            className={`card ai-coverage-card ${
              filter === "ai" ? "card-active" : ""
            }`}
            onClick={() => filterArticles("ai")}
            style={{ cursor: "pointer" }}
          >
            <div className="subheading">AI Articles</div>
            <div className="badge badge-ai">{aiArticlesCount}</div>
          </div>
          <div className="card">
            <div className="subheading">Avg Relevance</div>
            <div className="badge badge-info">{avgRelevance}/100</div>
          </div>
        </motion.div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <motion.div
            variants={itemVariants}
            className="card"
            style={{
              background: "#1a1a2e",
              border: "1px solid #ff6b6b",
              marginBottom: "1rem",
            }}
          >
            <div style={{ color: "#ff6b6b", fontSize: "0.9rem" }}>
              🔍 DEBUG: articles={articles.length} | allArticles=
              {allArticles.length} | loading={loading.toString()}
              <br />
              🌍 API: {API_BASE}
              <br />
              <button
                onClick={() => {
                  console.log("🧪 Manual API Test");
                  fetch(API_BASE + "/api/global-news")
                    .then((res) => res.json())
                    .then((data) => console.log("✅ Manual test result:", data))
                    .catch((err) =>
                      console.error("❌ Manual test failed:", err)
                    );
                }}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                🧪 Test API in Console
              </button>
            </div>
          </motion.div>
        )}

        {/* Articles Feed */}
        {articles.length === 0 ? (
          <motion.div variants={itemVariants} className="card">
            <div className="text-center text-muted">
              {loading ? "Loading articles..." : "No articles available"}
              {error && (
                <div style={{ marginTop: "1rem", color: "#ff6b6b" }}>
                  Error: {error}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid"
            style={{ gap: "1.5rem" }}
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id || `article-${index}`}
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
                      <div
                        className="subheading"
                        style={{ marginBottom: "0.25rem" }}
                      >
                        {article.title || "Untitled Article"}
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

                  <div className="flex gap-1">
                    {(article.relScore || article.rel_score) && (
                      <span
                        className={`badge ${getRelevanceBadge(
                          article.relScore || article.rel_score
                        )}`}
                      >
                        REL {article.relScore || article.rel_score}
                      </span>
                    )}
                    <span className="badge badge-info">
                      {(article.category || "news").toUpperCase()}
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

                <div className="article-meta">
                  <span>🌍 {article.country || "Global"}</span>
                  <span>
                    ⏰{" "}
                    {article.publishedAt || article.published_at
                      ? new Date(
                          article.publishedAt || article.published_at
                        ).toLocaleTimeString()
                      : "Recent"}
                  </span>
                </div>

                <div
                  className="flex flex-wrap gap-1"
                  style={{ marginTop: "1rem" }}
                >
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
                    onClick={() =>
                      navigate(`/country/${article.country || "global"}`)
                    }
                    className="btn"
                  >
                    📊 Analysis
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Refresh Button */}
        {articles.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center"
            style={{ marginTop: "2rem" }}
          >
            <button onClick={fetchNews} className="btn btn-primary">
              🔄 Refresh Feed
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
