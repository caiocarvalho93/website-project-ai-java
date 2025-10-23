/**
 * Shared type definitions and constants
 * Used by both backend and frontend
 */

// Country codes and names
export const COUNTRIES = {
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  IN: { name: 'India', flag: '🇮🇳' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  ES: { name: 'Spain', flag: '🇪🇸' }
};

// API response status codes
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
};

// Article categories
export const CATEGORIES = {
  AI: 'ai',
  TECHNOLOGY: 'technology',
  BUSINESS: 'business',
  SCIENCE: 'science'
};

// News sources and their priorities
export const NEWS_SOURCES = {
  NEWSAPI_PRIMARY: 'newsapi-primary',
  NEWSAPI_SECONDARY: 'newsapi-secondary',
  NEWSDATA_FALLBACK: 'newsdata-fallback',
  MEDIASTACK: 'mediastack'
};

// Game scoring system
export const GAME_SCORING = {
  BASE_POINTS: 1,
  PREMIUM_POINTS: 3,
  QUALITY_POINTS: 2,
  MAX_POINTS_PER_ARTICLE: 5
};

// API endpoints
export const ENDPOINTS = {
  HEALTH: '/health',
  GLOBAL_NEWS: '/api/global-news',
  COUNTRY_NEWS: '/api/country-news',
  SIMPLE_REFRESH: '/api/simple-refresh',
  FANS_RACE_LEADERBOARD: '/api/fans-race/leaderboard',
  FANS_RACE_SUBMIT: '/api/fans-race/submit',
  DIAGNOSTICS: '/api/diagnostics'
};

/**
 * Article data structure
 * @typedef {Object} Article
 * @property {string} id - Unique article identifier
 * @property {string} title - Article title
 * @property {string} url - Article URL
 * @property {string} source - News source name
 * @property {string|null} author - Article author
 * @property {string} publishedAt - Publication date (ISO string)
 * @property {string} description - Article description
 * @property {string|null} content - Article content
 * @property {string} country - Country code (US, GB, etc.)
 * @property {string} category - Article category
 * @property {number} relScore - Relevance score (0-100)
 * @property {number} anaScore - Analysis score (0-100)
 * @property {string} provenance - Source of the article
 */

/**
 * API Response structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {*} data - Response data
 * @property {string|null} error - Error message if failed
 * @property {string} timestamp - Response timestamp
 */

/**
 * Game submission structure
 * @typedef {Object} GameSubmission
 * @property {string} url - Submitted article URL
 * @property {string} country - Country code
 * @property {string} userId - User identifier
 * @property {number} points - Points awarded
 * @property {string} timestamp - Submission timestamp
 */