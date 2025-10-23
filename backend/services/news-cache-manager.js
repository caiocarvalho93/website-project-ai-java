// News Cache Manager - Handles caching and retrieval of news articles
import { getArticles, saveArticlesToDatabase } from '../database.js';

// Cache status tracking
let cacheStatus = {
  lastUpdate: null,
  totalArticles: 0,
  countriesWithNews: 0,
  isRefreshing: false
};

export async function getCachedNewsByCountry(country) {
  try {
    const articles = await getArticles(country, 20);
    return {
      articles,
      count: articles.length,
      source: 'postgresql-cache',
      country
    };
  } catch (error) {
    console.error(`Failed to get cached news for ${country}:`, error.message);
    return {
      articles: [],
      count: 0,
      error: error.message,
      country
    };
  }
}

export async function getAllCachedNews() {
  try {
    const countries = ['US', 'DE', 'GB', 'FR', 'CA', 'JP', 'IN', 'KR', 'ES'];
    const result = { countries: {} };
    
    for (const country of countries) {
      const countryNews = await getCachedNewsByCountry(country);
      result.countries[country] = countryNews;
    }
    
    return result;
  } catch (error) {
    return {
      countries: {},
      error: error.message
    };
  }
}

export async function forceRefreshCache() {
  if (cacheStatus.isRefreshing) {
    return {
      success: false,
      error: 'Cache refresh already in progress'
    };
  }

  try {
    cacheStatus.isRefreshing = true;
    console.log('🔄 Force refreshing cache...');
    
    // Import news processor
    const { processNewsForAllCountries } = await import('./newsapi-processor.js');
    
    // Fetch fresh articles
    const articles = await processNewsForAllCountries();
    
    if (articles.length > 0) {
      await saveArticlesToDatabase(articles);
      cacheStatus.lastUpdate = new Date().toISOString();
      cacheStatus.totalArticles = articles.length;
      
      console.log(`✅ Cache refreshed with ${articles.length} articles`);
      
      return {
        success: true,
        articlesProcessed: articles.length,
        timestamp: cacheStatus.lastUpdate
      };
    } else {
      return {
        success: false,
        error: 'No articles fetched'
      };
    }
  } catch (error) {
    console.error('Cache refresh failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    cacheStatus.isRefreshing = false;
  }
}

export async function getCacheStatus() {
  try {
    const articles = await getArticles(null, 100);
    const countries = ['US', 'DE', 'GB', 'FR', 'CA', 'JP', 'IN', 'KR', 'ES'];
    
    let countriesWithNews = 0;
    for (const country of countries) {
      const countryArticles = await getArticles(country, 1);
      if (countryArticles.length > 0) countriesWithNews++;
    }
    
    return {
      lastUpdate: cacheStatus.lastUpdate,
      totalArticles: articles.length,
      countriesWithNews,
      isRefreshing: cacheStatus.isRefreshing,
      status: articles.length > 0 ? 'populated' : 'empty'
    };
  } catch (error) {
    return {
      error: error.message,
      status: 'error'
    };
  }
}

export async function initializeCache() {
  console.log('📦 Initializing news cache...');
  cacheStatus.lastUpdate = new Date().toISOString();
}

export function shouldRefreshCache() {
  // Check if cache is older than 6 hours
  if (!cacheStatus.lastUpdate) return true;
  
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const lastUpdate = new Date(cacheStatus.lastUpdate);
  
  return lastUpdate < sixHoursAgo;
}

export async function refreshCacheInBackground() {
  try {
    console.log('🔄 Background cache refresh starting...');
    const result = await forceRefreshCache();
    
    if (result.success) {
      console.log(`✅ Background refresh completed: ${result.articlesProcessed} articles`);
      return {
        success: true,
        articlesSaved: result.articlesProcessed
      };
    } else {
      console.log(`⚠️ Background refresh failed: ${result.error}`);
      return {
        success: false,
        reason: result.error
      };
    }
  } catch (error) {
    console.error('❌ Background refresh error:', error.message);
    return {
      success: false,
      reason: error.message
    };
  }
}