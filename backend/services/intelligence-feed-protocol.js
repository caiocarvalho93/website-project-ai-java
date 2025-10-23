// Intelligence Feed Protocol - Handles intelligence-grade news processing
import { getArticles } from "../database.js";

export async function getCountryNews(country) {
  try {
    const articles = await getArticles(country, 20);
    return articles.map((article) => ({
      ...article,
      intelligence_grade: true,
      clearance_level: "ALPHA-7",
    }));
  } catch (error) {
    console.error(`Intelligence feed error for ${country}:`, error.message);
    return [];
  }
}

export async function getGlobalNews() {
  try {
    const articles = await getArticles(null, 50);
    return articles.map((article) => ({
      ...article,
      intelligence_grade: true,
      global_scope: true,
    }));
  } catch (error) {
    console.error("Global intelligence feed error:", error.message);
    return [];
  }
}

export function getIntelligenceMetrics() {
  try {
    return {
      success: true,
      clearance_level: "ALPHA-7",
      operational_status: "ACTIVE",
      intelligence_sources: ["NewsAPI", "Mediastack"],
      processing_level: "Enterprise",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getStartupAINews() {
  try {
    // Get AI-related articles from all countries
    const articles = await getArticles(null, 30);

    // Filter for startup/AI content
    const aiArticles = articles.filter((article) => {
      const content = (
        article.title +
        " " +
        (article.description || "")
      ).toLowerCase();
      return (
        content.includes("ai") ||
        content.includes("artificial intelligence") ||
        content.includes("startup") ||
        content.includes("technology")
      );
    });

    return aiArticles.map((article) => ({
      ...article,
      category: "startup-ai",
      intelligence_grade: true,
    }));
  } catch (error) {
    console.error("Startup AI news error:", error.message);
    return [];
  }
}
