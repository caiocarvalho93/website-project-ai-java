// 🌍 UNIVERSAL LANGUAGES - Translation API Routes
import express from 'express';
import { getSupportedLanguages, translateText, batchTranslate, isValidLanguageCode } from '../services/translation-service.js';

const router = express.Router();

// Get all supported languages
router.get('/languages', async (req, res) => {
  try {
    const result = getSupportedLanguages();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Translate single text
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: "Text and target language are required"
      });
    }

    if (!isValidLanguageCode(targetLanguage)) {
      return res.status(400).json({
        success: false,
        error: "Invalid target language code"
      });
    }

    const result = await translateText(text, targetLanguage, sourceLanguage);
    res.json(result);

  } catch (error) {
    console.error("❌ Translation API failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch translate multiple texts
router.post('/translate/batch', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: "Texts array and target language are required"
      });
    }

    if (!isValidLanguageCode(targetLanguage)) {
      return res.status(400).json({
        success: false,
        error: "Invalid target language code"
      });
    }

    const results = await batchTranslate(texts, targetLanguage, sourceLanguage);
    
    res.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error("❌ Batch translation failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get translation statistics
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement translation statistics from database
    res.json({
      success: true,
      message: "Translation statistics coming soon",
      totalTranslations: 0,
      languagesUsed: 0,
      cacheHitRate: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;