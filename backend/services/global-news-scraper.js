// Global News Scraper - Handles news scraping from various sources
import { getArticles } from '../database.js';

export class GlobalNewsScraper {
  constructor() {
    this.sources = ['NewsAPI', 'Mediastack'];
    this.countries = ['US', 'DE', 'GB', 'FR', 'CA', 'JP', 'IN', 'KR', 'ES'];
  }

  async fetchCountryArticles(country = null, limit = 20) {
    try {
      console.log(`🌐 Scraping articles for ${country || 'all countries'}...`);
      
      const articles = await getArticles(country, limit);
      
      return articles.map(article => ({
        ...article,
        scraped: true,
        scraper_version: '1.0.0',
        scrape_timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error(`Scraper error for ${country}:`, error.message);
      return [];
    }
  }

  async fetchAllCountries() {
    try {
      const results = {};
      
      for (const country of this.countries) {
        results[country] = await this.fetchCountryArticles(country, 10);
      }
      
      return results;
    } catch (error) {
      console.error('Global scraper error:', error.message);
      return {};
    }
  }

  async getScrapingStatus() {
    try {
      const totalArticles = await getArticles(null, 1000);
      
      return {
        status: 'operational',
        sources: this.sources,
        countries: this.countries,
        totalArticles: totalArticles.length,
        lastScrape: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}