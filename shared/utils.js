/**
 * Shared utility functions
 * Used by both backend and frontend
 */

import { COUNTRIES } from './types.js';

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'Unknown';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get country name from country code
 * @param {string} countryCode - Country code (US, GB, etc.)
 * @returns {string} Country name
 */
export function getCountryName(countryCode) {
  return COUNTRIES[countryCode]?.name || countryCode;
}

/**
 * Get country flag from country code
 * @param {string} countryCode - Country code (US, GB, etc.)
 * @returns {string} Country flag emoji
 */
export function getCountryFlag(countryCode) {
  return COUNTRIES[countryCode]?.flag || '🌍';
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Calculate article quality score
 * @param {Object} article - Article object
 * @returns {number} Quality score (0-100)
 */
export function calculateQualityScore(article) {
  if (!article) return 0;
  
  let score = 0;
  
  // Base score from relevance and analysis
  score += (article.relScore || 0) * 0.4;
  score += (article.anaScore || 0) * 0.4;
  
  // Bonus for having author
  if (article.author) score += 5;
  
  // Bonus for having content
  if (article.content && article.content.length > 100) score += 5;
  
  // Bonus for recent articles (within 24 hours)
  if (article.publishedAt) {
    const publishedDate = new Date(article.publishedAt);
    const now = new Date();
    const hoursDiff = (now - publishedDate) / (1000 * 60 * 60);
    if (hoursDiff <= 24) score += 10;
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === maxRetries) break;
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError;
}