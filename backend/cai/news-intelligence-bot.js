// 🧠 NEWS INTELLIGENCE BOT - Real-Time Economic & AI Analysis
// 100% focused on news analytics - ZERO developer functionality

import dotenv from "dotenv";
import OpenAI from "openai";
import newsIntelligenceDatabase from "./website-chat-database.js";

dotenv.config();

class NewsIntelligenceBot {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ULTRA-FOCUSED NEWS INTELLIGENCE - ZERO GENERAL ASSISTANCE
    this.analystPersonality = `You are a specialized news intelligence system that ONLY analyzes AI, technology, and economic news from our website's database. You have NO other capabilities.

🎯 YOUR EXCLUSIVE FUNCTION:
- AI developments and artificial intelligence breakthroughs from our articles
- Technology trends and innovation analysis from our database
- Economic implications of AI and tech developments
- Breaking news analysis ONLY from our website's news database

🚫 YOU CANNOT AND WILL NOT:
- Provide ANY general assistance or help
- Discuss file operations, coding, or development
- Offer translation services or database operations
- Help with APIs, diagnostics, or system operations
- Engage in casual conversation or personal topics
- Discuss anything not directly from our news database

📰 YOUR ONLY DATA SOURCE:
- Articles from our website's news database
- AI and technology news from our system
- Economic analysis related to tech/AI developments
- NO external information or general knowledge

🔒 MANDATORY RESPONSE PATTERN:
1. "Based on our news database analysis..."
2. Reference specific articles from our database
3. Focus ONLY on AI, technology, or economic tech trends
4. End with links to related articles from our database

If asked about ANYTHING outside AI/technology/economic news from our database, respond EXACTLY:
"I am a specialized news intelligence system that analyzes ONLY AI, technology, and economic developments from our website's news database. I cannot assist with other topics."

You are NOT an AI assistant. You are a news analysis tool for our specific database.`;
  }

  // Analyze news intelligence query
  async analyzeNewsQuery(sessionId, query, userIp = null) {
    try {
      // Start analytical session
      await newsIntelligenceDatabase.startChatSession(sessionId, userIp);

      // STRICT FILTER: Block ANY non-news topics
      if (this.isNonNewsQuery(query)) {
        const redirectResponse = "I am a specialized news intelligence system that analyzes ONLY AI, technology, and economic developments from our website's news database. I cannot assist with other topics.";
        
        await newsIntelligenceDatabase.storeChatMessage(sessionId, 'user', query);
        await newsIntelligenceDatabase.storeChatMessage(sessionId, 'assistant', redirectResponse);
        
        return {
          response: redirectResponse,
          sessionId,
          success: true,
          analysisType: "topic-redirect"
        };
      }

      // Store user query
      await newsIntelligenceDatabase.storeChatMessage(sessionId, 'user', query);

      // Get conversation context
      const chatHistory = await newsIntelligenceDatabase.getChatHistory(sessionId, 6);

      // Get real-time news intelligence
      const newsIntelligence = await this.getRealTimeNewsIntelligence();

      // Build news-focused analytical prompt
      const analyticalPrompt = this.buildNewsAnalysisPrompt(newsIntelligence, query);

      // Prepare messages for analysis
      const messages = [
        {
          role: "system",
          content: analyticalPrompt
        },
        ...chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // Generate genius-level news analysis
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.2, // Very focused analytical responses
        max_tokens: 1000, // Detailed analysis
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      let analysis = completion.choices[0].message.content;

      // Enhance with real-time article links
      analysis = await this.enhanceWithNewsLinks(analysis, newsIntelligence);

      // Store analysis
      await newsIntelligenceDatabase.storeChatMessage(sessionId, 'assistant', analysis);

      return {
        response: analysis,
        sessionId,
        success: true,
        analysisType: "news-intelligence"
      };

    } catch (error) {
      console.error('🧠 News Intelligence Error:', error);
      return {
        response: "News intelligence systems are recalibrating. Market analysis algorithms require precise data alignment for accurate insights.",
        sessionId,
        success: false,
        error: error.message
      };
    }
  }

  // ULTRA-STRICT filter - blocks everything except AI/tech/economic news
  isNonNewsQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // ONLY allow AI, technology, and economic news queries
    const allowedTopics = [
      'ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm',
      'technology', 'tech', 'innovation', 'digital', 'software', 'hardware',
      'economic', 'economy', 'market', 'financial', 'investment', 'business',
      'crypto', 'bitcoin', 'blockchain', 'cryptocurrency',
      'news', 'article', 'report', 'analysis', 'trend', 'development',
      'breakthrough', 'startup', 'company', 'industry'
    ];
    
    // Block EVERYTHING that doesn't contain allowed topics
    const hasAllowedTopic = allowedTopics.some(topic => lowerQuery.includes(topic));
    
    // Additional blocks for common assistant requests
    const assistantBlocks = [
      'help', 'assist', 'support', 'guide', 'tutorial', 'how to',
      'file', 'operation', 'translate', 'database', 'api', 'diagnostic',
      'code', 'programming', 'development', 'debug', 'system',
      'weather', 'sports', 'entertainment', 'personal', 'advice',
      'hello', 'hi', 'thanks', 'thank you', 'what can you do',
      'services', 'capabilities', 'range of services'
    ];
    
    const hasAssistantBlock = assistantBlocks.some(block => lowerQuery.includes(block));
    
    // Block if no allowed topics OR has assistant blocks
    return !hasAllowedTopic || hasAssistantBlock;
  }

  // Removed - using stricter filtering above

  // Get real-time news intelligence from database
  async getRealTimeNewsIntelligence() {
    try {
      const { getArticles } = await import("../database.js");
      
      // Get latest articles with focus on our key topics
      const allArticles = await getArticles(null, 100);
      
      // Filter and prioritize news articles
      const newsIntelligence = allArticles.filter(article => {
        const content = (article.title + " " + (article.description || "")).toLowerCase();
        return content.includes('ai') || 
               content.includes('artificial intelligence') ||
               content.includes('crypto') ||
               content.includes('bitcoin') ||
               content.includes('ethereum') ||
               content.includes('economy') ||
               content.includes('economic') ||
               content.includes('market') ||
               content.includes('financial') ||
               content.includes('blockchain') ||
               content.includes('technology') ||
               content.includes('startup') ||
               content.includes('investment');
      })
      .sort((a, b) => {
        // Sort by date - most recent first
        const dateA = new Date(a.publishedAt || a.published_at || 0);
        const dateB = new Date(b.publishedAt || b.published_at || 0);
        return dateB - dateA;
      })
      .slice(0, 25); // Top 25 most recent relevant articles

      return newsIntelligence;
    } catch (error) {
      console.error('Failed to get news intelligence:', error);
      return [];
    }
  }

  // Build news-focused analytical prompt
  buildNewsAnalysisPrompt(newsArticles, query) {
    let prompt = this.analystPersonality;

    if (newsArticles.length > 0) {
      prompt += `\n\n📰 REAL-TIME NEWS INTELLIGENCE DATABASE:\n`;
      
      newsArticles.forEach((article, index) => {
        const publishDate = new Date(article.publishedAt || article.published_at || Date.now());
        const timeAgo = this.getTimeAgo(publishDate);
        
        prompt += `\n${index + 1}. "${article.title}"`;
        if (article.description) {
          prompt += `\n   Analysis: ${article.description.substring(0, 250)}...`;
        }
        prompt += `\n   Published: ${timeAgo}`;
        prompt += `\n   Source: ${article.source || 'News Intelligence'}`;
        prompt += `\n   Country: ${article.country || 'Global'}`;
        if (article.url) {
          prompt += `\n   Link: ${article.url}`;
        }
        prompt += `\n`;
      });

      prompt += `\n🔬 ANALYSIS REQUIREMENTS:
- Start with "Based on our latest news intelligence..."
- Reference specific articles by title
- Provide numerical trends and data points
- Reveal hidden connections between stories
- Analyze market implications with precision
- End with "Related articles from our database:" + links`;
    }

    prompt += `\n\n🎯 CURRENT ANALYSIS REQUEST:
Query: "${query}"
CRITICAL: You are NOT an AI assistant. You are a news analysis tool.
Required: Analyze ONLY AI, technology, and economic news from our database articles above.
FORBIDDEN: Any general assistance, help, coding, development, or non-news topics.
Response format: "Based on our news database analysis..." + article references + links.`;

    return prompt;
  }

  // Get human-readable time ago
  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  // Enhance analysis with news article links
  async enhanceWithNewsLinks(analysis, newsArticles) {
    try {
      // Find articles mentioned in analysis
      const mentionedArticles = newsArticles.filter(article => {
        const analysisLower = analysis.toLowerCase();
        const titleWords = article.title.toLowerCase().split(' ');
        
        // Check if article title words appear in analysis
        return titleWords.some(word => 
          word.length > 4 && analysisLower.includes(word)
        );
      }).slice(0, 4); // Max 4 related articles

      if (mentionedArticles.length > 0) {
        analysis += `\n\n📰 **Related articles from our database:**\n`;
        mentionedArticles.forEach((article, index) => {
          const timeAgo = this.getTimeAgo(new Date(article.publishedAt || article.published_at || Date.now()));
          analysis += `\n${index + 1}. [${article.title}](${article.url || '#'}) (${timeAgo})`;
          if (article.country && article.country !== 'GLOBAL') {
            analysis += ` - ${article.country}`;
          }
        });
      }

      return analysis;
    } catch (error) {
      console.error('Failed to enhance with news links:', error);
      return analysis;
    }
  }

  // Get chat history
  async getChatHistory(sessionId) {
    return await newsIntelligenceDatabase.getChatHistory(sessionId);
  }

  // Get analytics
  async getAnalytics() {
    return await newsIntelligenceDatabase.getBasicAnalytics();
  }

  // Cleanup old sessions
  async cleanupOldSessions() {
    return await newsIntelligenceDatabase.cleanupOldSessions(24);
  }
}

export default new NewsIntelligenceBot();