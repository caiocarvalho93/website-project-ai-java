import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TranslatedText from "./TranslatedText";

export default function AILeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitUrl, setSubmitUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const apiUrl = import.meta.env.PROD
          ? "https://website-project-ai-production.up.railway.app/api/ai-leaderboard"
          : "/api/ai-leaderboard";

        const response = await axios.get(apiUrl);
        setLeaderboard(response.data);
        setLoading(false);
      } catch (err) {
        console.warn("AI Leaderboard pending:", err.message);
        // Set fallback leaderboard data as direct array
        setLeaderboard([
          { 
            rank: 1, 
            code: "US", 
            country: "United States", 
            flag: "🇺🇸", 
            score: 95, 
            trend: "+2.1%",
            focus: "Language Models",
            snarkyComment: "Still leading the pack"
          },
          { 
            rank: 2, 
            code: "CN", 
            country: "China", 
            flag: "🇨🇳", 
            score: 92, 
            trend: "+3.2%",
            focus: "Computer Vision",
            snarkyComment: "Rising fast"
          },
          { 
            rank: 3, 
            code: "GB", 
            country: "United Kingdom", 
            flag: "🇬🇧", 
            score: 89, 
            trend: "+1.8%",
            focus: "AI Ethics",
            snarkyComment: "Steady progress"
          },
          { 
            rank: 4, 
            code: "DE", 
            country: "Germany", 
            flag: "🇩🇪", 
            score: 87, 
            trend: "+1.5%",
            focus: "Industrial AI",
            snarkyComment: "Engineering excellence"
          },
          { 
            rank: 5, 
            code: "JP", 
            country: "Japan", 
            flag: "🇯🇵", 
            score: 85, 
            trend: "+2.0%",
            focus: "Robotics",
            snarkyComment: "Innovation continues"
          },
          { 
            rank: 6, 
            code: "CA", 
            country: "Canada", 
            flag: "🇨🇦", 
            score: 83, 
            trend: "+1.7%",
            focus: "AI Research",
            snarkyComment: "Quietly advancing"
          },
          { 
            rank: 7, 
            code: "FR", 
            country: "France", 
            flag: "🇫🇷", 
            score: 81, 
            trend: "+1.3%",
            focus: "AI Governance",
            snarkyComment: "Regulatory leadership"
          },
          { 
            rank: 8, 
            code: "KR", 
            country: "South Korea", 
            flag: "🇰🇷", 
            score: 79, 
            trend: "+2.5%",
            focus: "5G + AI",
            snarkyComment: "Tech powerhouse"
          },
          { 
            rank: 9, 
            code: "IN", 
            country: "India", 
            flag: "🇮🇳", 
            score: 77, 
            trend: "+3.1%",
            focus: "AI Talent",
            snarkyComment: "Rapid growth"
          }
        ]);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const getRankBadgeClass = (rank) => {
    if (rank <= 3) return "badge-success";
    if (rank <= 6) return "badge-warning";
    return "badge-info";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading"><TranslatedText>Loading AI Leaderboard...</TranslatedText></div>
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
            <div className="heading">🌍 <TranslatedText>Global AI Leaderboard</TranslatedText></div>
            <div className="text-muted">
              <TranslatedText>Real-time artificial intelligence dominance rankings</TranslatedText>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="btn">
            ← <TranslatedText>Back to Command Center</TranslatedText>
          </button>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants} className="card">
          <div className="subheading" style={{ marginBottom: "1.5rem" }}>
            <TranslatedText>Intelligence Rankings</TranslatedText> • <TranslatedText>Updated Live</TranslatedText>
          </div>

          <div className="grid" style={{ gap: "1rem" }}>
            {Array.isArray(leaderboard) && leaderboard.map((country, index) => (
              <motion.div
                key={country.code}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.99 }}
                className="card"
                style={{
                  cursor: "pointer",
                  background:
                    index < 3
                      ? "linear-gradient(135deg, #1a2332, #0f1a2a)"
                      : undefined,
                }}
                onClick={() => navigate(`/country/${country.code}`)}
              >
                <div className="flex-between">
                  <div className="flex">
                    <span
                      className={`badge ${getRankBadgeClass(country.rank)}`}
                    >
                      #{country.rank}
                    </span>
                    <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>
                      {country.flag}
                    </span>
                    <div>
                      <div
                        className="subheading"
                        style={{ marginBottom: "0.25rem" }}
                      >
                        <TranslatedText>{country.country}</TranslatedText>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <TranslatedText>Focus</TranslatedText>: <TranslatedText>{country.focus}</TranslatedText>
                      </div>
                    </div>
                  </div>

                  <div className="flex-col" style={{ alignItems: "flex-end" }}>
                    <div className="flex">
                      <span className="badge badge-primary">
                        {country.score}/100
                      </span>
                      <span className="badge badge-success">
                        {country.trend}
                      </span>
                    </div>
                    <div
                      className="text-muted"
                      style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                    >
                      <TranslatedText>{country.snarkyComment}</TranslatedText>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analysis Summary */}
        <motion.div
          variants={itemVariants}
          className="grid grid-3"
          style={{ marginTop: "2rem" }}
        >
          <div className="card">
            <div className="subheading"><TranslatedText>Top Performer</TranslatedText></div>
            <div className="flex">
              <span style={{ fontSize: "2rem" }}>{leaderboard[0]?.flag}</span>
              <div>
                <div className="text-secondary"><TranslatedText>{leaderboard[0]?.country}</TranslatedText></div>
                <div className="badge badge-success">
                  {leaderboard[0]?.score}/100
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="subheading"><TranslatedText>Rising Star</TranslatedText></div>
            <div className="flex">
              <span style={{ fontSize: "2rem" }}>{leaderboard[8]?.flag}</span>
              <div>
                <div className="text-secondary"><TranslatedText>{leaderboard[8]?.country}</TranslatedText></div>
                <div className="badge badge-warning"><TranslatedText>Rapid Growth</TranslatedText></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="subheading"><TranslatedText>Global Average</TranslatedText></div>
            <div className="flex-col">
              <div className="badge badge-info">
                {Array.isArray(leaderboard) && leaderboard.length > 0 ? Math.round(
                  leaderboard.reduce((sum, c) => sum + c.score, 0) /
                    leaderboard.length
                ) : 0}
                /100
              </div>
              <div className="text-muted"><TranslatedText>AI Development Score</TranslatedText></div>
            </div>
            
            {/* AI Race Game Box */}
            <div style={{ marginTop: "1rem", padding: "1rem", background: "linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 235, 59, 0.1))", borderRadius: "12px", border: "2px solid rgba(255, 193, 7, 0.4)", boxShadow: "0 4px 15px rgba(255, 193, 7, 0.2)" }}>
              <div style={{ fontSize: "1rem", marginBottom: "0.5rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                🏁 <TranslatedText>AI RACE GAME</TranslatedText> 🏁
              </div>
              <div style={{ fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                🚀 <TranslatedText>Help your country win the AI race! Submit quality AI articles to earn points and climb the leaderboard!</TranslatedText>
              </div>
              <div className="flex-col" style={{ gap: "0.5rem" }}>
                <input 
                  type="url" 
                  placeholder="https://example.com/ai-article"
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  style={{ 
                    padding: "0.5rem", 
                    borderRadius: "4px", 
                    border: "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)"
                  }}
                />
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={{ 
                    padding: "0.5rem", 
                    borderRadius: "4px", 
                    border: "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)"
                  }}
                >
                  <optgroup label="🌟 Major Powers">
                    <option value="US">🇺🇸 United States</option>
                    <option value="CN">🇨🇳 China</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="IN">🇮🇳 India</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="IT">🇮🇹 Italy</option>
                    <option value="BR">🇧🇷 Brazil</option>
                    <option value="CA">🇨🇦 Canada</option>
                  </optgroup>
                  <optgroup label="💻 Tech Hubs">
                    <option value="KR">🇰🇷 South Korea</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="IL">🇮🇱 Israel</option>
                    <option value="SE">🇸🇪 Sweden</option>
                    <option value="CH">🇨🇭 Switzerland</option>
                    <option value="NL">🇳🇱 Netherlands</option>
                    <option value="FI">🇫🇮 Finland</option>
                    <option value="DK">🇩🇰 Denmark</option>
                    <option value="NO">🇳🇴 Norway</option>
                    <option value="IE">🇮🇪 Ireland</option>
                  </optgroup>
                  <optgroup label="🚀 Emerging Markets">
                    <option value="RU">🇷🇺 Russia</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="ES">🇪🇸 Spain</option>
                    <option value="MX">🇲🇽 Mexico</option>
                    <option value="AR">🇦🇷 Argentina</option>
                    <option value="ZA">🇿🇦 South Africa</option>
                    <option value="EG">🇪🇬 Egypt</option>
                    <option value="NG">🇳🇬 Nigeria</option>
                    <option value="KE">🇰🇪 Kenya</option>
                    <option value="TH">🇹🇭 Thailand</option>
                  </optgroup>
                  <optgroup label="🌏 Asia Pacific">
                    <option value="ID">🇮🇩 Indonesia</option>
                    <option value="MY">🇲🇾 Malaysia</option>
                    <option value="PH">🇵🇭 Philippines</option>
                    <option value="VN">🇻🇳 Vietnam</option>
                    <option value="BD">🇧🇩 Bangladesh</option>
                    <option value="PK">🇵🇰 Pakistan</option>
                    <option value="NZ">🇳🇿 New Zealand</option>
                  </optgroup>
                  <optgroup label="🇪🇺 Europe">
                    <option value="PL">🇵🇱 Poland</option>
                    <option value="TR">🇹🇷 Turkey</option>
                    <option value="UA">🇺🇦 Ukraine</option>
                    <option value="CZ">🇨🇿 Czech Republic</option>
                    <option value="AT">🇦🇹 Austria</option>
                    <option value="BE">🇧🇪 Belgium</option>
                    <option value="PT">🇵🇹 Portugal</option>
                    <option value="GR">🇬🇷 Greece</option>
                    <option value="HU">🇭🇺 Hungary</option>
                    <option value="RO">🇷🇴 Romania</option>
                  </optgroup>
                  <optgroup label="🕌 Middle East">
                    <option value="AE">🇦🇪 UAE</option>
                    <option value="SA">🇸🇦 Saudi Arabia</option>
                    <option value="QA">🇶🇦 Qatar</option>
                    <option value="KW">🇰🇼 Kuwait</option>
                    <option value="JO">🇯🇴 Jordan</option>
                    <option value="LB">🇱🇧 Lebanon</option>
                  </optgroup>
                  <optgroup label="🌎 Americas">
                    <option value="CL">🇨🇱 Chile</option>
                    <option value="CO">🇨🇴 Colombia</option>
                    <option value="PE">🇵🇪 Peru</option>
                    <option value="UY">🇺🇾 Uruguay</option>
                    <option value="CR">🇨🇷 Costa Rica</option>
                  </optgroup>
                  <optgroup label="🌍 Africa">
                    <option value="MA">🇲🇦 Morocco</option>
                    <option value="TN">🇹🇳 Tunisia</option>
                    <option value="GH">🇬🇭 Ghana</option>
                    <option value="ET">🇪🇹 Ethiopia</option>
                    <option value="RW">🇷🇼 Rwanda</option>
                  </optgroup>
                </select>
                <button 
                  className="btn btn-primary"
                  style={{ 
                    fontSize: "0.85rem", 
                    background: "linear-gradient(135deg, #ffc107, #ff9800)",
                    border: "none",
                    fontWeight: "700",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    boxShadow: "0 4px 12px rgba(255, 193, 7, 0.4)"
                  }}
                  onClick={async () => {
                    try {
                      const baseUrl = import.meta.env.PROD ? 
                        "https://website-project-ai-production.up.railway.app" : "";
                      
                      const response = await axios.post(`${baseUrl}/api/fans-race/submit`, {
                        url: submitUrl,
                        country: selectedCountry,
                        userId: 'user-' + Date.now()
                      });
                      
                      // Fun game-like success message
                      const messages = [
                        `🎉 BOOM! +${response.data.pointsAwarded} points for ${selectedCountry}!`,
                        `🚀 Nice shot! ${selectedCountry} gains +${response.data.pointsAwarded} points!`,
                        `⚡ Power move! +${response.data.pointsAwarded} points to ${selectedCountry}!`,
                        `🔥 On fire! ${selectedCountry} scores +${response.data.pointsAwarded} points!`
                      ];
                      
                      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                      alert(randomMessage + `\n\n${selectedCountry} total score: ${response.data.newScore} points`);
                      setSubmitUrl('');
                    } catch (error) {
                      const errorMessages = [
                        "🚫 Oops! " + (error.response?.data?.error || 'Submission failed'),
                        "❌ Not quite! " + (error.response?.data?.error || 'Try again'),
                        "⚠️ Hold up! " + (error.response?.data?.error || 'Something went wrong')
                      ];
                      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
                      alert(randomError);
                    }
                  }}
                  disabled={!submitUrl}
                >
                  🏆 <TranslatedText>SUBMIT & WIN! (+1-3 pts)</TranslatedText>
                </button>
                
                {/* Game Rules */}
                <div style={{ 
                  marginTop: "0.75rem", 
                  padding: "0.5rem", 
                  background: "rgba(0,0,0,0.1)", 
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)"
                }}>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>🎮 <TranslatedText>SCORING RULES</TranslatedText>:</div>
                  <div>🥉 <TranslatedText>Basic AI article: +1 point</TranslatedText></div>
                  <div>🥈 <TranslatedText>AI-focused URL: +2 points</TranslatedText></div>
                  <div>🥇 <TranslatedText>Premium source (TechCrunch, Wired, etc.): +3 points</TranslatedText></div>
                  <div style={{ marginTop: "0.25rem", fontStyle: "italic" }}>
                    💡 <TranslatedText>Tip: Quality sources = more points for your country!</TranslatedText>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap"
          style={{ marginTop: "2rem" }}
        >
          <button onClick={() => navigate("/ai-fans-race")} className="btn btn-primary">
            🏁 <TranslatedText>JOIN AI FANS RACE!</TranslatedText>
          </button>
          <button onClick={() => navigate("/news")} className="btn">
            📰 <TranslatedText>View Global News</TranslatedText>
          </button>
          {/* 🔒 DEVELOPER ONLY: Refresh Rankings (hidden from users)
          <button onClick={() => window.location.reload()} className="btn">
            🔄 Refresh Rankings
          </button>
          */}
          <button
            onClick={() => navigate("/country/US")}
            className="btn"
          >
            🇺🇸 <TranslatedText>US Intelligence</TranslatedText>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
