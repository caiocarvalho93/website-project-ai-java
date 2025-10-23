import NewsAPI from 'newsapi';
import dotenv from "dotenv";

dotenv.config();

// Initialize NewsAPI instances - use fallback as primary if main key missing
const primaryKey = process.env.NEWS_API_KEY || process.env.NEWS_API_KEY_FALLBACK;
const primaryNewsAPI = primaryKey ? new NewsAPI(primaryKey) : null;
const fallbackNewsAPI = process.env.NEWS_API_KEY_FALLBACK ? new NewsAPI(process.env.NEWS_API_KEY_FALLBACK) : null;

// NewsData.io fallback function with smart country distribution
async function fetchFromNewsDataIO(query = "artificial intelligence", pageSize = 10) {
  if (!process.env.NEWS_API_KEY_FALLBACK) {
    throw new Error("NewsData.io API key not configured");
  }
  
  console.log("🔄 Trying NewsData.io with smart country distribution...");
  
  // Smart strategy: 5 countries × 2 articles each = 10 total (1 API call)
  const targetCountries = ['us', 'gb', 'de', 'fr', 'ca']; // Top 5 AI countries
  const articlesPerCountry = 2;
  const maxSize = Math.min(pageSize, 10); // NewsData.io free plan limit
  
  const url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY_FALLBACK}&q=${encodeURIComponent(query)}&language=en&category=technology&country=${targetCountries.join(',')}&size=${maxSize}`;
  
  console.log(`📡 NewsData.io URL (5 countries): ${url}`);
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log(`📊 NewsData.io response status: ${response.status}`);
  console.log(`📊 NewsData.io data status: ${data.status}`);
  
  if (data.status === "error") {
    throw new Error(`NewsData.io Error: ${data.message || 'API Error'}`);
  }
  
  if (!data.results || data.results.length === 0) {
    throw new Error("NewsData.io: No articles found for query");
  }
  
  console.log(`✅ NewsData.io success: ${data.results.length} articles from ${targetCountries.length} countries`);
  
  // Map country codes to your system's format
  const countryMapping = {
    'united states of america': 'US',
    'united kingdom': 'GB', 
    'germany': 'DE',
    'france': 'FR',
    'canada': 'CA'
  };
  
  return data.results.map((article, index) => {
    // Determine country from article data
    let articleCountry = 'GLOBAL';
    if (article.country && article.country.length > 0) {
      const countryName = article.country[0].toLowerCase();
      articleCountry = countryMapping[countryName] || 'GLOBAL';
    }
    
    return {
      id: `newsdata-${Date.now()}-${index}`,
      title: article.title,
      url: article.link,
      source: article.source_id || 'NewsData.io',
      author: article.creator ? (Array.isArray(article.creator) ? article.creator[0] : article.creator) : null,
      publishedAt: article.pubDate,
      description: article.description,
      content: article.content,
      country: articleCountry, // Now properly assigned!
      category: 'ai',
      relScore: 85,
      anaScore: 80,
      provenance: 'newsdata-fallback'
    };
  });
}

export async function fetchNewsAPIArticles(query = "artificial intelligence", pageSize = 10) {
  let lastError = null;
  
  // Try primary NewsAPI key first
  try {
    console.log("🔑 Trying primary NewsAPI key...");
    const response = await primaryNewsAPI.v2.everything({
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: pageSize
    });

    if (response.status === "error") {
      throw new Error(`Primary NewsAPI Error: ${response.message}`);
    }

    console.log(`✅ Primary key success: ${response.articles.length} articles`);
    return response.articles.map((article, index) => ({
      id: `newsapi-primary-${Date.now()}-${index}`,
      title: article.title,
      url: article.url,
      source: article.source.name,
      author: article.author,
      publishedAt: article.publishedAt,
      description: article.description,
      content: article.content,
      country: 'GLOBAL',
      category: 'ai',
      relScore: 85,
      anaScore: 80,
      provenance: 'newsapi-primary'
    }));

  } catch (primaryError) {
    console.warn("⚠️ Primary NewsAPI key failed:", primaryError.message);
    lastError = primaryError;
    
    // Try secondary NewsAPI key if available
    if (fallbackNewsAPI) {
      try {
        console.log("🔄 Trying secondary NewsAPI key...");
        const fallbackResponse = await fallbackNewsAPI.v2.everything({
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: pageSize
        });

        if (fallbackResponse.status === "error") {
          throw new Error(`Secondary NewsAPI Error: ${fallbackResponse.message}`);
        }

        console.log(`✅ Secondary NewsAPI key success: ${fallbackResponse.articles.length} articles`);
        return fallbackResponse.articles.map((article, index) => ({
          id: `newsapi-secondary-${Date.now()}-${index}`,
          title: article.title,
          url: article.url,
          source: article.source.name,
          author: article.author,
          publishedAt: article.publishedAt,
          description: article.description,
          content: article.content,
          country: 'GLOBAL',
          category: 'ai',
          relScore: 85,
          anaScore: 80,
          provenance: 'newsapi-secondary'
        }));

      } catch (secondaryError) {
        console.warn("⚠️ Secondary NewsAPI key also failed:", secondaryError.message);
        lastError = secondaryError;
      }
    }
    
    // Ultimate fallback: Try NewsData.io
    try {
      console.log("🆘 Both NewsAPI keys failed, trying NewsData.io as ultimate fallback...");
      return await fetchFromNewsDataIO(query, pageSize);
    } catch (newsDataError) {
      console.error("❌ All API sources failed:", newsDataError.message);
      throw new Error(`All API sources failed. NewsAPI Primary: ${primaryError.message}, Secondary: ${lastError.message}, NewsData.io: ${newsDataError.message}`);
    }
  }
}

export async function processNewsForAllCountries() {
  try {
    console.log("🚀 Starting news processing with dual API key system...");
    const articles = await fetchNewsAPIArticles("artificial intelligence", 20);
    
    if (articles.length > 0) {
      console.log(`✅ Fetched ${articles.length} AI articles from NewsAPI`);
      
      // CRITICAL: Save to PostgreSQL immediately
      try {
        const { saveArticlesToDatabase } = await import("../database.js");
        const saveResult = await saveArticlesToDatabase(articles);
        console.log(`💾 SAVED ${saveResult.saved} articles to PostgreSQL successfully!`);
      } catch (saveError) {
        console.error("❌ CRITICAL: Failed to save to PostgreSQL:", saveError.message);
        // Still return articles even if save fails, but log the error
      }
    }
    
    return articles;
  } catch (error) {
    console.warn(`⚠️ Failed to fetch articles:`, error.message);
    return [];
  }
}