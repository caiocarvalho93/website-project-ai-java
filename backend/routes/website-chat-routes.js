// 🧠 NEWS INTELLIGENCE API ROUTES
// Real-time news analysis endpoints

import express from 'express';
import newsIntelligenceBot from '../cai/news-intelligence-bot.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for news analysis endpoints
const newsAnalysisRateLimit = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 8, // 8 analysis requests per 2 minutes per IP
  message: { error: 'Too many analysis requests. Please wait before requesting more news intelligence.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/website-chat/message - News Intelligence Analysis
router.post('/message', newsAnalysisRateLimit, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'Analysis query and sessionId are required'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Analysis query too long (max 1000 characters)'
      });
    }

    const result = await newsIntelligenceBot.analyzeNewsQuery(
      sessionId, 
      message, 
      userIp
    );

    res.json(result);

  } catch (error) {
    console.error('News intelligence error:', error);
    res.status(500).json({
      error: 'News intelligence system error',
      response: "News intelligence systems are recalibrating. Market analysis algorithms require precise data alignment."
    });
  }
});

// GET /api/website-chat/history/:sessionId - Get analysis history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await newsIntelligenceBot.getChatHistory(sessionId);
    
    res.json({
      sessionId,
      messages: history,
      analysisType: 'news-intelligence',
      success: true
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      error: 'Failed to get analysis history'
    });
  }
});

// GET /api/website-chat/analytics - News intelligence analytics (admin only)
router.get('/analytics', async (req, res) => {
  try {
    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analytics = await newsIntelligenceBot.getAnalytics();
    res.json({
      ...analytics,
      systemType: 'News Intelligence Bot',
      analysisCapabilities: ['Economic Trends', 'Crypto Markets', 'AI Developments', 'Breaking News']
    });

  } catch (error) {
    console.error('Get news analytics error:', error);
    res.status(500).json({
      error: 'Failed to get news intelligence analytics'
    });
  }
});

// POST /api/website-chat/cleanup - Cleanup old analysis sessions (admin only)
router.post('/cleanup', async (req, res) => {
  try {
    // Simple auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cleaned = await newsIntelligenceBot.cleanupOldSessions();
    res.json({
      message: `Cleaned up ${cleaned} old analysis sessions`,
      cleaned,
      systemType: 'News Intelligence Bot'
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Failed to cleanup analysis sessions'
    });
  }
});

export default router;