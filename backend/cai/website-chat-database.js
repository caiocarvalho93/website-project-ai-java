// 🧠 NEWS INTELLIGENCE DATABASE - AI/Tech News Analysis Only
// This database is ONLY for news intelligence analysis - NO GENERAL ASSISTANCE

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

class NewsIntelligenceDatabase {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'backend', 'cai', 'data', 'news-intelligence.db');
    this.db = null;
    this.isInitialized = false;
    this.initializeDatabase();
  }

  // Initialize website chat database (NO TRAINING DATA)
  async initializeDatabase() {
    try {
      // Create data directory
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Open SQLite database
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      console.log('🧠 News Intelligence Database: Initialized at', this.dbPath);
      console.log('📰 Purpose: AI/TECH NEWS ANALYSIS ONLY - No general assistance');
      
      await this.createTables();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Website Chat database:', error);
    }
  }

  // Create tables for website chat (minimal data)
  async createTables() {
    try {
      // Genius chat sessions - analytical conversations
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
          user_ip TEXT,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
          message_count INTEGER DEFAULT 0,
          analysis_depth TEXT DEFAULT 'genius-level',
          topics_discussed TEXT, -- JSON array of topics
          status TEXT DEFAULT 'active'
        )
      `);

      // Genius chat messages - analytical conversations
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL, -- 'user' or 'assistant'
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          analysis_type TEXT, -- 'economic', 'crypto', 'ai', 'news'
          referenced_articles TEXT, -- JSON array of article IDs referenced
          insight_level TEXT DEFAULT 'genius',
          FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
        )
      `);

      // Genius analytics - analytical insights tracking
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date DATE DEFAULT (date('now')),
          total_sessions INTEGER DEFAULT 0,
          total_messages INTEGER DEFAULT 0,
          avg_session_length REAL DEFAULT 0,
          economic_discussions INTEGER DEFAULT 0,
          crypto_discussions INTEGER DEFAULT 0,
          ai_discussions INTEGER DEFAULT 0,
          news_references INTEGER DEFAULT 0,
          genius_insights_generated INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Website Chat Database: Tables created (chat-only, no training)');
      
    } catch (error) {
      console.error('❌ Failed to create website chat tables:', error);
    }
  }

  // Start new chat session
  async startChatSession(sessionId, userIp = null) {
    try {
      await this.db.run(`
        INSERT OR REPLACE INTO chat_sessions (session_id, user_ip, last_activity)
        VALUES (?, ?, datetime('now'))
      `, [sessionId, userIp]);
      
      console.log(`💬 Website Chat: Started session ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to start chat session:', error);
    }
  }

  // Store genius chat message with analytical metadata
  async storeChatMessage(sessionId, role, content, metadata = {}) {
    try {
      // Determine analysis type from content
      const analysisType = this.determineAnalysisType(content);
      
      await this.db.run(`
        INSERT INTO chat_messages (session_id, role, content, analysis_type, referenced_articles, insight_level)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        sessionId, 
        role, 
        content, 
        analysisType,
        JSON.stringify(metadata.referencedArticles || []),
        metadata.insightLevel || 'genius'
      ]);

      // Update session activity with topic tracking
      const topics = this.extractTopics(content);
      await this.db.run(`
        UPDATE chat_sessions 
        SET message_count = message_count + 1, 
            last_activity = datetime('now'),
            topics_discussed = ?
        WHERE session_id = ?
      `, [JSON.stringify(topics), sessionId]);

      console.log(`🧠 Genius Chat: Stored ${analysisType} analysis in session ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to store genius chat message:', error);
    }
  }

  // Determine analysis type from message content
  determineAnalysisType(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('crypto') || lowerContent.includes('bitcoin') || lowerContent.includes('blockchain')) {
      return 'crypto';
    } else if (lowerContent.includes('economy') || lowerContent.includes('economic') || lowerContent.includes('market')) {
      return 'economic';
    } else if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence') || lowerContent.includes('machine learning')) {
      return 'ai';
    } else if (lowerContent.includes('news') || lowerContent.includes('article') || lowerContent.includes('report')) {
      return 'news';
    }
    
    return 'general';
  }

  // Extract discussion topics from content
  extractTopics(content) {
    const topics = [];
    const lowerContent = content.toLowerCase();
    
    const topicKeywords = {
      'cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi'],
      'economics': ['economy', 'economic', 'market', 'finance', 'gdp', 'inflation'],
      'artificial_intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm'],
      'technology': ['tech', 'innovation', 'startup', 'digital', 'software'],
      'geopolitics': ['china', 'usa', 'europe', 'trade', 'policy', 'regulation']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  // Get chat history for session continuity
  async getChatHistory(sessionId, limit = 10) {
    try {
      const messages = await this.db.all(`
        SELECT role, content, timestamp
        FROM chat_messages 
        WHERE session_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `, [sessionId, limit]);

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('❌ Failed to get chat history:', error);
      return [];
    }
  }

  // Clean up old sessions (privacy-focused)
  async cleanupOldSessions(hoursOld = 24) {
    try {
      const result = await this.db.run(`
        DELETE FROM chat_sessions 
        WHERE last_activity < datetime('now', '-${hoursOld} hours')
      `);

      // Also clean up orphaned messages
      await this.db.run(`
        DELETE FROM chat_messages 
        WHERE session_id NOT IN (SELECT session_id FROM chat_sessions)
      `);

      console.log(`🧹 Website Chat: Cleaned up ${result.changes} old sessions`);
      return result.changes;
    } catch (error) {
      console.error('❌ Failed to cleanup old sessions:', error);
      return 0;
    }
  }

  // Get basic analytics (no personal data)
  async getBasicAnalytics() {
    try {
      const today = await this.db.get(`
        SELECT 
          COUNT(DISTINCT session_id) as sessions_today,
          COUNT(*) as messages_today
        FROM chat_messages 
        WHERE date(timestamp) = date('now')
      `);

      const total = await this.db.get(`
        SELECT 
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(*) as total_messages
        FROM chat_messages
      `);

      return {
        today: today || { sessions_today: 0, messages_today: 0 },
        total: total || { total_sessions: 0, total_messages: 0 },
        database_type: 'Website Chat Only (No Training Data)'
      };
    } catch (error) {
      console.error('❌ Failed to get analytics:', error);
      return null;
    }
  }

  // Close database
  async close() {
    if (this.db) {
      await this.db.close();
      console.log('🔒 Website Chat Database: Connection closed');
    }
  }
}

export default new NewsIntelligenceDatabase();