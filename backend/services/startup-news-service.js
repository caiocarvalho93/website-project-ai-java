// 🚀 STARTUP NEWS - Weekly Startup Article Service
// Handles startup news filtering and FIFO management

const STARTUP_KEYWORDS = [
  "startup",
  "startups", 
  "entrepreneur",
  "entrepreneurship",
  "venture capital",
  "vc funding",
  "seed funding",
  "series a",
  "series b", 
  "funding round",
  "investment",
  "unicorn",
  "tech startup",
  "new company",
  "founded",
  "co-founder",
  "ceo",
  "launch",
  "launched",
  "raises",
  "raised",
  "million",
  "billion",
  "valuation",
  "ipo",
  "acquisition",
  "acquired",
  "merger",
  "innovation",
  "disrupt",
  "disruption",
  "scale",
  "scaling",
  "growth",
  "accelerator",
  "incubator"
];

// Filter articles for startup content
export function filterStartupArticles(articles) {
  return articles.filter((article) => {
    const title = article.title?.toLowerCase() || "";
    const description = article.description?.toLowerCase() || "";
    const content = title + " " + description;

    return STARTUP_KEYWORDS.some((keyword) => content.includes(keyword));
  });
}

// Get startup articles with FIFO ordering (First In, First Out)
export async function getStartupNews() {
  try {
    console.log("🚀 Fetching WEEKLY STARTUP NEWS...");

    // Get all articles from database
    const { getArticles } = await import("../database.js");
    const allArticles = await getArticles(null, 1000);

    // Filter for startup articles
    const startupArticles = filterStartupArticles(allArticles);

    // Get up to 10 startup articles in FIFO order (oldest first, newest last)
    // This ensures first in, first out - when 11th article comes, 1st goes out
    const sortedStartupArticles = startupArticles
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.published_at || 0);
        const dateB = new Date(b.publishedAt || b.published_at || 0);
        return dateA - dateB; // Ascending order (oldest first)
      })
      .slice(-10) // Take the last 10 (most recent 10, but in FIFO order)
      .map(article => ({
        ...article,
        category: "startup",
        isStartupNews: true
      }));

    console.log(`🚀 Found ${startupArticles.length} startup articles, serving ${sortedStartupArticles.length} in FIFO order`);

    return {
      success: true,
      articles: sortedStartupArticles,
      totalStartupArticles: startupArticles.length,
      source: "startup-filter",
      lastUpdate: new Date().toISOString(),
      message: "BOOM! WEEKLY STARTUP NEWS"
    };

  } catch (error) {
    console.error("❌ Startup news failed:", error.message);
    throw error;
  }
}

// Check if article is startup-related
export function isStartupArticle(article) {
  const title = article.title?.toLowerCase() || "";
  const description = article.description?.toLowerCase() || "";
  const content = title + " " + description;

  return STARTUP_KEYWORDS.some((keyword) => content.includes(keyword));
}

// Get startup keywords for filtering
export function getStartupKeywords() {
  return STARTUP_KEYWORDS;
}