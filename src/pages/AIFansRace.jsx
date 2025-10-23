import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  GAME_COUNTRIES,
  getRegions,
  getCountryByRegion,
} from "../config/gameCountries";

// Use the comprehensive game countries configuration

export default function AIFansRace() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitUrl, setSubmitUrl] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const baseUrl = import.meta.env.PROD
        ? "https://website-project-ai-production.up.railway.app"
        : "";

      const response = await axios.get(`${baseUrl}/api/fans-race/leaderboard`);
      setLeaderboard(response.data.leaderboard);
      setTotalSubmissions(response.data.totalSubmissions);
      setLoading(false);
    } catch (error) {
      console.warn("Fans race leaderboard pending:", error.message);
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

  const getRankEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getScoreColor = (score) => {
    if (score >= 50) return "#ffc107";
    if (score >= 20) return "#28a745";
    if (score >= 10) return "#17a2b8";
    return "#6c757d";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading AI Fans Race...</div>
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
            <div className="heading">🏁 AI FANS RACE 🏁</div>
            <div className="text-muted">
              Community-driven country competition • Real-time scoring
            </div>
          </div>
          <div className="flex">
            <button onClick={() => navigate("/ai-leaderboard")} className="btn">
              📊 Official Rankings
            </button>
            <button onClick={() => navigate("/")} className="btn">
              ← Command Center
            </button>
          </div>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-3"
          style={{ marginBottom: "2rem" }}
        >
          <div className="card">
            <div className="subheading">Total Submissions</div>
            <div className="badge badge-primary">{totalSubmissions}</div>
          </div>
          <div className="card">
            <div className="subheading">Active Countries</div>
            <div className="badge badge-success">
              {leaderboard.filter((c) => c.score > 0).length}
            </div>
          </div>
          <div className="card">
            <div className="subheading">Leading Country</div>
            <div className="badge badge-ai">
              {leaderboard.length > 0
                ? `${GAME_COUNTRIES[leaderboard[0].country]?.flag} ${
                    GAME_COUNTRIES[leaderboard[0].country]?.name
                  }`
                : "None"}
            </div>
          </div>
        </motion.div>

        {/* Submission Box */}
        <motion.div
          variants={itemVariants}
          className="card"
          style={{
            marginBottom: "2rem",
            background:
              "linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 235, 59, 0.1))",
            border: "2px solid rgba(255, 193, 7, 0.4)",
            boxShadow: "0 8px 25px rgba(255, 193, 7, 0.2)",
          }}
        >
          <div className="flex-between" style={{ marginBottom: "1rem" }}>
            <div>
              <div
                className="subheading"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                🚀 SUBMIT AI ARTICLE & WIN POINTS! 🚀
              </div>
              <div className="text-muted">
                Help your country dominate the AI race!
              </div>
            </div>
          </div>

          <div
            className="grid grid-2"
            style={{ gap: "1rem", marginBottom: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                📰 AI Article URL
              </label>
              <input
                type="url"
                placeholder="https://techcrunch.com/ai-breakthrough..."
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "2px solid var(--border)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                🏆 Choose Your Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "2px solid var(--border)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                {getRegions().map((region) => (
                  <optgroup key={region} label={`🌍 ${region}`}>
                    {Object.entries(getCountryByRegion(region)).map(
                      ([code, country]) => (
                        <option key={code} value={code}>
                          {country.flag} {country.name}
                        </option>
                      )
                    )}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-between">
            <button
              className="btn btn-primary"
              style={{
                fontSize: "1rem",
                padding: "0.75rem 2rem",
                background: "linear-gradient(135deg, #ffc107, #ff9800)",
                border: "none",
                fontWeight: "700",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                boxShadow: "0 6px 20px rgba(255, 193, 7, 0.4)",
              }}
              onClick={async () => {
                try {
                  const baseUrl = import.meta.env.PROD
                    ? "https://website-project-ai-production.up.railway.app"
                    : "";

                  const response = await axios.post(
                    `${baseUrl}/api/fans-race/submit`,
                    {
                      url: submitUrl,
                      country: selectedCountry,
                      userId: "user-" + Date.now(),
                    }
                  );

                  // Epic success message
                  const epicMessages = [
                    `🎆 LEGENDARY! +${response.data.pointsAwarded} points for ${COUNTRY_NAMES[selectedCountry]}! 🎆`,
                    `⚡ POWER SURGE! ${COUNTRY_NAMES[selectedCountry]} gains +${response.data.pointsAwarded} points! ⚡`,
                    `🚀 ROCKET BOOST! +${response.data.pointsAwarded} points to ${COUNTRY_NAMES[selectedCountry]}! 🚀`,
                    `🔥 UNSTOPPABLE! ${COUNTRY_NAMES[selectedCountry]} scores +${response.data.pointsAwarded} points! 🔥`,
                  ];

                  const randomMessage =
                    epicMessages[
                      Math.floor(Math.random() * epicMessages.length)
                    ];
                  alert(
                    randomMessage +
                      `\n\n🏆 ${GAME_COUNTRIES[selectedCountry]?.name} Total: ${response.data.newScore} points`
                  );
                  setSubmitUrl("");
                  fetchLeaderboard(); // Refresh leaderboard
                } catch (error) {
                  alert(
                    "🚫 " +
                      (error.response?.data?.error ||
                        "Submission failed. Try again!")
                  );
                }
              }}
              disabled={!submitUrl}
            >
              🏆 SUBMIT & DOMINATE! 🏆
            </button>

            {/* Scoring Guide */}
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "8px",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                🎮 POINT SYSTEM:
              </div>
              <div>🥉 Any AI article: +1 pt</div>
              <div>🥈 AI-focused URL: +2 pts</div>
              <div>🥇 Premium sources: +3 pts</div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants}>
          <div className="subheading" style={{ marginBottom: "1.5rem" }}>
            🏆 LIVE LEADERBOARD 🏆
          </div>

          {leaderboard.length === 0 ? (
            <div className="card">
              <div className="text-center text-muted">
                No submissions yet! Be the first to get your country on the
                board! 🚀
              </div>
            </div>
          ) : (
            <div className="grid" style={{ gap: "1rem" }}>
              {leaderboard.map((country, index) => (
                <motion.div
                  key={country.country}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="card"
                  style={{
                    background:
                      index < 3
                        ? `linear-gradient(135deg, ${getScoreColor(
                            country.score
                          )}15, ${getScoreColor(country.score)}05)`
                        : undefined,
                    border:
                      index < 3
                        ? `2px solid ${getScoreColor(country.score)}40`
                        : undefined,
                  }}
                >
                  <div className="flex-between">
                    <div className="flex">
                      <div style={{ fontSize: "2rem", marginRight: "1rem" }}>
                        {getRankEmoji(index + 1)}
                      </div>
                      <div>
                        <div
                          className="flex"
                          style={{
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <span style={{ fontSize: "1.5rem" }}>
                            {GAME_COUNTRIES[country.country]?.flag}
                          </span>
                          <div className="subheading">
                            {GAME_COUNTRIES[country.country]?.name}
                          </div>
                        </div>
                        <div className="text-muted">Rank #{index + 1}</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className="badge badge-ai"
                        style={{ fontSize: "1.2rem", padding: "0.5rem 1rem" }}
                      >
                        {country.score} pts
                      </div>
                      {index < 3 && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            marginTop: "0.25rem",
                            color: getScoreColor(country.score),
                          }}
                        >
                          {index === 0
                            ? "🔥 LEADING!"
                            : index === 1
                            ? "💪 STRONG!"
                            : "⚡ RISING!"}
                        </div>
                      )}
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
          {/* 🔒 DEVELOPER ONLY: Refresh Leaderboard (hidden from users)
          <button onClick={fetchLeaderboard} className="btn btn-primary">
            🔄 Refresh Leaderboard
          </button>
          */}
          <button onClick={() => navigate("/ai-leaderboard")} className="btn">
            📊 Official AI Rankings
          </button>
          <button onClick={() => navigate("/news")} className="btn">
            📰 Global News Feed
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
