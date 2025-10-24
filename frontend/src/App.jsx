import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import NewsFeed from "./components/NewsFeed";
import AILeaderboard from "./components/AILeaderboard";
import CountryPage from "./pages/Country";
import AIFansRace from "./pages/AIFansRace";
import MatrixRain from "./components/MatrixRain";
import CursorGlow from "./components/CursorGlow";
import { LanguageProvider } from "./contexts/LanguageContext";
import LanguageIndicator from "./components/LanguageIndicator";
import ExitTranslationPopup from "./components/ExitTranslationPopup";
import UniversalLanguageButton from "./components/UniversalLanguageButton";
import LanguageDebugger from "./components/LanguageDebugger";
import CAIButton from "./cai/CAIButton";

export default function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <MatrixRain />
        <CursorGlow />
        <ExitTranslationPopup />
        <UniversalLanguageButton />
        <LanguageDebugger />
        <CAIButton 
          userId="dev-user-001" 
          projectContext={{
            projectType: "AI Intelligence News Platform",
            features: ["Universal Translation", "News Feed", "AI Analysis", "Startup News"],
            techStack: ["React", "Node.js", "PostgreSQL", "OpenAI"],
            currentPage: window.location.pathname
          }}
        />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/ai-leaderboard" element={<AILeaderboard />} />
          <Route path="/ai-fans-race" element={<AIFansRace />} />
          <Route path="/country/:code" element={<CountryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}
 
// redeploy trigger
