/**
 * 🚨 API Configuration - Railway Best Practices
 * Centralized API base URL configuration
 */

// EINSTEIN-LEVEL: Bulletproof environment detection
const API_BASE = (() => {
  // 1. Check for explicit environment variable
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // 2. Detect Vercel production environment
  if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
    return "https://website-project-ai-production.up.railway.app";
  }
  
  // 3. Local development (aligns with Vite proxy -> Spring Boot on 8080)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 4. Fallback for non-browser environments
  return "http://localhost:8080";
})();

console.log("🔗 API Base URL:", API_BASE);

/**
 * Create full API URL
 * @param {string} endpoint - API endpoint (e.g., '/api/global-news')
 * @returns {string} Full API URL
 */
export function createApiUrl(endpoint) {
  return `${API_BASE}${endpoint}`;
}

/**
 * Fetch wrapper with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const url = createApiUrl(endpoint);
    console.log(`📡 API Call: ${url}`);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    throw error;
  }
}

export default API_BASE;
