import { getArticles } from "../database.js";

/**
 * Generate AI Leaderboard based on article volume, innovation metrics, and AI activity
 */
export function getAILeaderboard() {
  return [
    {
      rank: 1,
      country: "United States",
      code: "US",
      score: 98,
      flag: "🇺🇸",
      focus: "AI Infrastructure",
      trend: "+2.3%",
      snarkyComment: "Still flexing with those H100s",
    },
    {
      rank: 2,
      country: "China",
      code: "CN",
      score: 96,
      flag: "🇨🇳",
      focus: "Manufacturing AI",
      trend: "+1.8%",
      snarkyComment: "Quietly building the future",
    },
    {
      rank: 3,
      country: "Germany",
      code: "DE",
      score: 89,
      flag: "🇩🇪",
      focus: "Industrial AI",
      trend: "+1.2%",
      snarkyComment: "Engineering precision meets AI",
    },
    {
      rank: 4,
      country: "United Kingdom",
      code: "GB",
      score: 88,
      flag: "🇬🇧",
      focus: "AI Research",
      trend: "+0.9%",
      snarkyComment: "DeepMind's homeland advantage",
    },
    {
      rank: 5,
      country: "Japan",
      code: "JP",
      score: 85,
      flag: "🇯🇵",
      focus: "Robotics AI",
      trend: "+0.7%",
      snarkyComment: "Robots with actual personality",
    },
    {
      rank: 6,
      country: "Canada",
      code: "CA",
      score: 83,
      flag: "🇨🇦",
      focus: "AI Ethics",
      trend: "+0.5%",
      snarkyComment: "Politely revolutionizing AI",
    },
    {
      rank: 7,
      country: "France",
      code: "FR",
      score: 81,
      flag: "🇫🇷",
      focus: "AI Regulation",
      trend: "+0.4%",
      snarkyComment: "Très sophisticated algorithms",
    },
    {
      rank: 8,
      country: "South Korea",
      code: "KR",
      score: 79,
      flag: "🇰🇷",
      focus: "Consumer AI",
      trend: "+0.3%",
      snarkyComment: "K-pop meets machine learning",
    },
    {
      rank: 9,
      country: "India",
      code: "IN",
      score: 76,
      flag: "🇮🇳",
      focus: "AI Services",
      trend: "+0.2%",
      snarkyComment: "Scaling AI like it's 1999",
    },
    {
      rank: 10,
      country: "Spain",
      code: "ES",
      score: 73,
      flag: "🇪🇸",
      focus: "AI Startups",
      trend: "+0.1%",
      snarkyComment: "Siesta time for AI innovation",
    },
  ];
}

/**
 * Get elite news sources and their credibility ratings
 */
export function getEliteNewsSources() {
  return [
    {
      name: "Bloomberg Technology",
      credibility: 95,
      focus: "Financial Tech",
      aiCoverage: "Excellent",
      updateFreq: "Real-time",
    },
    {
      name: "Reuters Technology",
      credibility: 94,
      focus: "Global Tech",
      aiCoverage: "Comprehensive",
      updateFreq: "Hourly",
    },
    {
      name: "TechCrunch",
      credibility: 88,
      focus: "Startups & AI",
      aiCoverage: "Extensive",
      updateFreq: "Continuous",
    },
    {
      name: "MIT Technology Review",
      credibility: 96,
      focus: "Deep Tech",
      aiCoverage: "Research-focused",
      updateFreq: "Daily",
    },
    {
      name: "Wired",
      credibility: 85,
      focus: "Tech Culture",
      aiCoverage: "Analytical",
      updateFreq: "Daily",
    },
    {
      name: "The Verge",
      credibility: 82,
      focus: "Consumer Tech",
      aiCoverage: "Good",
      updateFreq: "Continuous",
    },
    {
      name: "Financial Times Tech",
      credibility: 93,
      focus: "Business Tech",
      aiCoverage: "Strategic",
      updateFreq: "Real-time",
    },
    {
      name: "Wall Street Journal Tech",
      credibility: 91,
      focus: "Enterprise Tech",
      aiCoverage: "Business-focused",
      updateFreq: "Real-time",
    },
  ];
}

/**
 * Generate country-specific AI metrics
 */
export async function getCountryAIMetrics(countryCode) {
  try {
    const articles = await getArticles(countryCode, 100);

    const aiArticles = articles.filter(
      (a) =>
        a.category === "ai" ||
        a.title.toLowerCase().includes("ai") ||
        a.title.toLowerCase().includes("artificial intelligence")
    );

    const techArticles = articles.filter((a) => a.category === "technology");
    const businessArticles = articles.filter((a) => a.category === "business");

    const avgRelScore =
      articles.length > 0
        ? Math.round(
            articles.reduce((sum, a) => sum + (a.relScore || 0), 0) /
              articles.length
          )
        : 0;

    const avgAnaScore =
      articles.length > 0
        ? Math.round(
            articles.reduce((sum, a) => sum + (a.anaScore || 0), 0) /
              articles.length
          )
        : 0;

    return {
      country: countryCode,
      totalArticles: articles.length,
      aiArticles: aiArticles.length,
      techArticles: techArticles.length,
      businessArticles: businessArticles.length,
      avgRelevance: avgRelScore,
      avgAnalysis: avgAnaScore,
      aiIntensity:
        articles.length > 0
          ? Math.round((aiArticles.length / articles.length) * 100)
          : 0,
      lastUpdate: new Date().toISOString(),
      topSources: getTopSources(articles),
    };
  } catch (error) {
    console.error(
      `❌ Failed to get AI metrics for ${countryCode}:`,
      error.message
    );
    return {
      country: countryCode,
      error: error.message,
      totalArticles: 0,
      aiArticles: 0,
      techArticles: 0,
      businessArticles: 0,
    };
  }
}

/**
 * Get top news sources for a set of articles
 */
function getTopSources(articles) {
  const sourceCounts = {};

  articles.forEach((article) => {
    const source = article.source || "Unknown";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  return Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));
}

/**
 * Generate global AI activity summary
 */
export async function getGlobalAIActivity() {
  const countries = [
    "US",
    "CN",
    "DE",
    "GB",
    "FR",
    "JP",
    "CA",
    "KR",
    "IN",
    "ES",
  ];
  const activities = [];

  for (const country of countries) {
    try {
      const metrics = await getCountryAIMetrics(country);
      activities.push(metrics);
    } catch (error) {
      console.warn(`⚠️ Failed to get activity for ${country}:`, error.message);
    }
  }

  const totalArticles = activities.reduce((sum, a) => sum + a.totalArticles, 0);
  const totalAIArticles = activities.reduce((sum, a) => sum + a.aiArticles, 0);

  return {
    globalSummary: {
      totalArticles,
      totalAIArticles,
      aiPercentage:
        totalArticles > 0
          ? Math.round((totalAIArticles / totalArticles) * 100)
          : 0,
      activeCountries: activities.filter((a) => a.totalArticles > 0).length,
      lastUpdate: new Date().toISOString(),
    },
    countryBreakdown: activities.sort(
      (a, b) => b.totalArticles - a.totalArticles
    ),
  };
}
