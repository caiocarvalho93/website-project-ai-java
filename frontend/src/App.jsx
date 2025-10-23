import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import NewsFeed from "./components/NewsFeed";
import AILeaderboard from "./components/AILeaderboard";
import CountryPage from "./pages/Country";
import AIFansRace from "./pages/AIFansRace";
import MatrixRain from "./components/MatrixRain";
import CursorGlow from "./components/CursorGlow";

export default function App() {
  return (
    <div className="app">
      <MatrixRain />
      <CursorGlow />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/news" element={<NewsFeed />} />
        <Route path="/ai-leaderboard" element={<AILeaderboard />} />
        <Route path="/ai-fans-race" element={<AIFansRace />} />
        <Route path="/country/:code" element={<CountryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
 
// redeploy trigger
