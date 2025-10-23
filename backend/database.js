import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection - Railway best practices
let pool = null;

async function initializePool() {
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log(`🔍 DATABASE_URL check: ${databaseUrl ? 'CONFIGURED' : 'MISSING'}`);
  
  if (!databaseUrl || databaseUrl.includes("${{") || databaseUrl === "your_db_url_here") {
    console.error("❌ Database: No DATABASE_URL configured - PostgreSQL is required!");
    console.log("💡 To fix: Add DATABASE_URL in Railway Dashboard → Variables");
    console.log("💡 Example: postgresql://postgres:password@host:port/database");
    
    // Don't throw error immediately - allow server to start in degraded mode
    console.log("🚨 Starting in DEGRADED MODE - database features disabled");
    return false;
  }
  
  try {
    console.log("🔗 Connecting to Railway PostgreSQL...");
    
    // Railway PostgreSQL connection - following Railway best practices
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }, // Required for Railway SSL
      max: 20, // Increased pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000, // Increased timeout
      acquireTimeoutMillis: 60000 // Add acquire timeout
    });
    
    // Test connection with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        client.release();
        
        console.log("✅ Database: Railway PostgreSQL connected successfully");
        console.log(`📊 Server Time: ${result.rows[0].current_time}`);
        
        return true;
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(`⚠️ Database connection failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("❌ Database: PostgreSQL connection failed:", error.message);
    console.error("🚨 Starting in DEGRADED MODE - database features disabled");
    pool = null;
    return false; // Don't throw, allow server to start
  }
}

// Initialize connection asynchronously
initializePool().catch(error => {
  console.warn("⚠️ Database initialization failed:", error.message);
});



/**
 * ENTERPRISE-GRADE ARTICLE STORAGE
 * Store articles with comprehensive metadata, deduplication, and analytics
 */
export async function storeArticles(country, articles) {
  if (pool) {
    try {
      const client = await pool.connect();
      let storedCount = 0;
      let updatedCount = 0;
      let duplicateCount = 0;
      
      console.log(`📊 Storing ${articles.length} articles for ${country} in PostgreSQL...`);
      
      for (const article of articles) {
        try {
          // Enhanced article storage with full metadata
          const result = await client.query(
            `INSERT INTO articles (
              id, title, url, source, author, published_at, description, content,
              country, category, rel_score, ana_score, einstein_score, topic_category,
              provenance, search_query, sentiment_score, word_count, tags, is_premium
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            ON CONFLICT (url) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              rel_score = EXCLUDED.rel_score,
              ana_score = EXCLUDED.ana_score,
              einstein_score = EXCLUDED.einstein_score,
              topic_category = EXCLUDED.topic_category,
              updated_at = CURRENT_TIMESTAMP
            RETURNING (xmax = 0) AS inserted`,
            [
              article.id || `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              article.title,
              article.url,
              article.source,
              article.author,
              article.publishedAt,
              article.description,
              article.content || article.description, // Use description as content fallback
              country,
              article.category,
              article.relScore || 0,
              article.anaScore || 0,
              article.__einsteinScore || null,
              article.__topicCategory?.category || null,
              article.provenance || 'api',
              article.searchQuery || null,
              article.sentimentScore || null,
              article.wordCount || (article.description ? article.description.split(' ').length : 0),
              article.tags || [],
              article.isPremium || false
            ]
          );
          
          if (result.rows[0].inserted) {
            storedCount++;
          } else {
            updatedCount++;
          }
          
          // Update news source statistics
          await client.query(
            `INSERT INTO news_sources (name, domain, article_count, last_article_date)
             VALUES ($1, $2, 1, $3)
             ON CONFLICT (name) DO UPDATE SET
               article_count = news_sources.article_count + 1,
               last_article_date = GREATEST(news_sources.last_article_date, EXCLUDED.last_article_date)`,
            [
              article.source,
              article.url ? new URL(article.url).hostname : null,
              article.publishedAt
            ]
          );
          
        } catch (articleError) {
          if (articleError.code === '23505') { // Unique constraint violation
            duplicateCount++;
          } else {
            console.warn(`⚠️ Failed to store article "${article.title}":`, articleError.message);
          }
        }
      }
      
      // Log API usage for cost tracking
      await client.query(
        `INSERT INTO api_usage_log (api_provider, endpoint, articles_returned, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        ['batch_storage', `/store/${country}`, articles.length]
      );
      
      client.release();
      
      console.log(`✅ PostgreSQL Storage Complete for ${country}:`);
      console.log(`   📝 New articles: ${storedCount}`);
      console.log(`   🔄 Updated articles: ${updatedCount}`);
      console.log(`   🔁 Duplicates skipped: ${duplicateCount}`);
      
      return true;
    } catch (error) {
      console.error("❌ PostgreSQL storage failed:", error.message);
      throw error;
    }
  } else {
    throw new Error("Database not available - PostgreSQL connection required");
  }
}

/**
 * Retrieve articles with automatic fallback
 */
export async function getArticles(country = null, limit = 50) {
  if (pool) {
    try {
      const client = await pool.connect();
      const query = country 
        ? "SELECT * FROM articles WHERE country = $1 ORDER BY published_at DESC LIMIT $2"
        : "SELECT * FROM articles ORDER BY published_at DESC LIMIT $1";
      
      const params = country ? [country, limit] : [limit];
      const result = await client.query(query, params);
      client.release();
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        url: row.url,
        source: row.source,
        author: row.author,
        publishedAt: row.published_at,
        description: row.description,
        country: row.country,
        category: row.category,
        relScore: row.rel_score,
        anaScore: row.ana_score
      }));
    } catch (error) {
      console.error("❌ PostgreSQL read failed:", error.message);
      return []; // Return empty array instead of throwing
    }
  } else {
    console.warn("⚠️ Database not available, returning empty articles array");
    return [];
  }
}

/**
 * FORTUNE 500 DATABASE SCHEMA - PRODUCTION READY
 * Complete enterprise-grade database architecture for AI Intelligence Platform
 */
export async function initializeDatabase() {
  if (!pool) return false;
  
  try {
    const client = await pool.connect();
    
    console.log("🏗️ Creating Fortune 500-level database schema...");
    
    // ==================== CORE NEWS & INTELLIGENCE TABLES ====================
    
    // 1. ARTICLES - Core news storage with full metadata
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        source VARCHAR(255),
        author VARCHAR(255),
        published_at TIMESTAMP,
        description TEXT,
        content TEXT, -- Full article content for analysis
        country VARCHAR(10),
        category VARCHAR(50),
        rel_score INTEGER CHECK (rel_score >= 0 AND rel_score <= 100),
        ana_score INTEGER CHECK (ana_score >= 0 AND ana_score <= 100),
        einstein_score DECIMAL(5,2), -- Einstein filter score
        topic_category VARCHAR(100), -- AI subcategory (models, hardware, policy, etc.)
        provenance VARCHAR(100), -- Source tracking (newsdata-api, newsapi, manual, etc.)
        search_query TEXT, -- Original search query that found this article
        language VARCHAR(10) DEFAULT 'en',
        sentiment_score DECIMAL(3,2), -- -1.0 to 1.0 sentiment analysis
        readability_score INTEGER, -- 0-100 readability score
        word_count INTEGER,
        image_url TEXT,
        tags TEXT[], -- Array of tags for categorization
        is_premium BOOLEAN DEFAULT FALSE, -- Premium/high-quality content flag
        is_breaking BOOLEAN DEFAULT FALSE, -- Breaking news flag
        view_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        archived_at TIMESTAMP, -- For soft deletion
        
        -- Full-text search
        search_vector tsvector
      )
    `);
    
    // 2. ARTICLE_VERSIONS - Track article updates and changes
    await client.query(`
      CREATE TABLE IF NOT EXISTS article_versions (
        id SERIAL PRIMARY KEY,
        article_id VARCHAR(255) REFERENCES articles(id),
        version_number INTEGER NOT NULL,
        title TEXT,
        description TEXT,
        content TEXT,
        rel_score INTEGER,
        ana_score INTEGER,
        changed_fields TEXT[],
        change_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255)
      )
    `);
    
    // 3. NEWS_SOURCES - Track and rate news sources
    await client.query(`
      CREATE TABLE IF NOT EXISTS news_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        domain VARCHAR(255),
        credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
        bias_score DECIMAL(3,2), -- -1.0 (left) to 1.0 (right)
        focus_areas TEXT[], -- AI, tech, business, etc.
        api_source VARCHAR(50), -- newsapi, newsdata, manual
        is_premium BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        article_count INTEGER DEFAULT 0,
        avg_quality_score DECIMAL(5,2),
        last_article_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ==================== USER ENGAGEMENT & ANALYTICS ====================
    
    // 4. USER_RATINGS - User feedback on articles
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id SERIAL PRIMARY KEY,
        article_id VARCHAR(255) REFERENCES articles(id),
        user_id VARCHAR(255) NOT NULL,
        user_ip INET,
        rel_score INTEGER CHECK (rel_score >= 0 AND rel_score <= 100),
        ana_score INTEGER CHECK (ana_score >= 0 AND ana_score <= 100),
        overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
        feedback_text TEXT,
        is_helpful BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(article_id, user_id) -- One rating per user per article
      )
    `);
    
    // 5. USER_INTERACTIONS - Track all user interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        user_ip INET,
        user_agent TEXT,
        interaction_type VARCHAR(50), -- view, click, share, rate, search, etc.
        target_type VARCHAR(50), -- article, country, leaderboard, etc.
        target_id VARCHAR(255),
        metadata JSONB, -- Flexible data storage
        country_context VARCHAR(10),
        referrer TEXT,
        duration_seconds INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 6. SEARCH_QUERIES - Track user searches for analytics
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_queries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        query_text TEXT NOT NULL,
        query_type VARCHAR(50), -- article_search, country_search, etc.
        results_count INTEGER,
        clicked_result_id VARCHAR(255),
        country_filter VARCHAR(10),
        category_filter VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ==================== AI FANS RACE GAME SYSTEM ====================
    
    // 7. GAME_SCORES - Country leaderboard (enhanced)
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_scores (
        country VARCHAR(10) PRIMARY KEY,
        score INTEGER DEFAULT 0,
        total_submissions INTEGER DEFAULT 0,
        unique_contributors INTEGER DEFAULT 0,
        avg_points_per_submission DECIMAL(5,2),
        last_submission_at TIMESTAMP,
        rank_position INTEGER,
        rank_change INTEGER DEFAULT 0, -- Change from previous day
        daily_score INTEGER DEFAULT 0, -- Today's score
        weekly_score INTEGER DEFAULT 0,
        monthly_score INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0, -- Consecutive days with submissions
        achievements TEXT[], -- Array of earned achievements
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 8. GAME_SUBMISSIONS - Enhanced submission tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_submissions (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        country VARCHAR(10) NOT NULL,
        user_id VARCHAR(255),
        user_ip INET,
        points INTEGER DEFAULT 1,
        point_breakdown JSONB, -- Detailed scoring breakdown
        article_title TEXT,
        article_source VARCHAR(255),
        quality_score INTEGER, -- Automated quality assessment
        is_duplicate BOOLEAN DEFAULT FALSE,
        duplicate_of INTEGER REFERENCES game_submissions(id),
        moderator_approved BOOLEAN,
        moderator_notes TEXT,
        submission_method VARCHAR(50), -- web, api, mobile
        user_agent TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        
        UNIQUE(url) -- Prevent exact URL duplicates
      )
    `);
    
    // 9. GAME_ACHIEVEMENTS - Achievement system
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_achievements (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        points_required INTEGER,
        submissions_required INTEGER,
        streak_required INTEGER,
        country_specific BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        rarity VARCHAR(20), -- common, rare, epic, legendary
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 10. USER_ACHIEVEMENTS - Track user achievements
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        achievement_id INTEGER REFERENCES game_achievements(id),
        country VARCHAR(10),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(user_id, achievement_id)
      )
    `);
    
    // ==================== SYSTEM MONITORING & ANALYTICS ====================
    
    // 11. API_USAGE_LOG - Track API calls and costs
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_usage_log (
        id SERIAL PRIMARY KEY,
        api_provider VARCHAR(50), -- newsapi, newsdata, openai, etc.
        api_key_index INTEGER, -- Which key was used
        endpoint VARCHAR(255),
        query_params JSONB,
        response_status INTEGER,
        response_size INTEGER,
        response_time_ms INTEGER,
        cost_estimate DECIMAL(10,4), -- Estimated cost in USD
        articles_returned INTEGER,
        error_message TEXT,
        rate_limited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 12. SYSTEM_METRICS - Daily system performance metrics
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id SERIAL PRIMARY KEY,
        metric_date DATE UNIQUE NOT NULL,
        total_articles_processed INTEGER DEFAULT 0,
        total_api_calls INTEGER DEFAULT 0,
        total_api_cost DECIMAL(10,4) DEFAULT 0,
        unique_users INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        game_submissions INTEGER DEFAULT 0,
        avg_response_time_ms INTEGER,
        error_count INTEGER DEFAULT 0,
        uptime_percentage DECIMAL(5,2),
        database_size_mb INTEGER,
        cache_hit_rate DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 13. ERROR_LOG - Comprehensive error tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS error_log (
        id SERIAL PRIMARY KEY,
        error_type VARCHAR(100),
        error_message TEXT,
        stack_trace TEXT,
        request_url TEXT,
        request_method VARCHAR(10),
        request_body TEXT,
        user_id VARCHAR(255),
        user_ip INET,
        user_agent TEXT,
        severity VARCHAR(20), -- low, medium, high, critical
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 14. CACHE_STATUS - Track cache performance
    await client.query(`
      CREATE TABLE IF NOT EXISTS cache_status (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        cache_type VARCHAR(50), -- news, leaderboard, country, etc.
        last_updated TIMESTAMP,
        update_frequency_hours INTEGER,
        size_bytes INTEGER,
        hit_count INTEGER DEFAULT 0,
        miss_count INTEGER DEFAULT 0,
        is_stale BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ==================== CONTENT MANAGEMENT ====================
    
    // 15. CONTENT_MODERATION - Track moderated content
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_moderation (
        id SERIAL PRIMARY KEY,
        content_type VARCHAR(50), -- article, submission, comment
        content_id VARCHAR(255),
        moderator_id VARCHAR(255),
        action VARCHAR(50), -- approved, rejected, flagged, edited
        reason VARCHAR(255),
        notes TEXT,
        automated BOOLEAN DEFAULT FALSE, -- AI vs human moderation
        confidence_score DECIMAL(5,2), -- AI confidence if automated
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 16. FEATURE_FLAGS - A/B testing and feature rollouts
    await client.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id SERIAL PRIMARY KEY,
        flag_name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT FALSE,
        rollout_percentage INTEGER DEFAULT 0,
        target_countries TEXT[],
        target_user_types TEXT[],
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ==================== COMPREHENSIVE INDEXES ====================
    
    console.log("📊 Creating performance indexes...");
    
    // Articles indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country);
      CREATE INDEX IF NOT EXISTS idx_articles_published_desc ON articles(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
      CREATE INDEX IF NOT EXISTS idx_articles_scores ON articles(rel_score DESC, ana_score DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_einstein ON articles(einstein_score DESC) WHERE einstein_score IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_articles_premium ON articles(is_premium) WHERE is_premium = TRUE;
      CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(is_breaking) WHERE is_breaking = TRUE;
      CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(search_vector);
      CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
      CREATE INDEX IF NOT EXISTS idx_articles_country_published ON articles(country, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
    `);
    
    // User engagement indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_ratings_article ON user_ratings(article_id);
      CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
      CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_search_queries_user ON search_queries(user_id);
      CREATE INDEX IF NOT EXISTS idx_search_queries_created ON search_queries(created_at DESC);
    `);
    
    // Game system indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_game_scores_score_desc ON game_scores(score DESC);
      CREATE INDEX IF NOT EXISTS idx_game_scores_daily ON game_scores(daily_score DESC);
      CREATE INDEX IF NOT EXISTS idx_game_submissions_country ON game_submissions(country);
      CREATE INDEX IF NOT EXISTS idx_game_submissions_user ON game_submissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_submissions_submitted ON game_submissions(submitted_at DESC);
      CREATE INDEX IF NOT EXISTS idx_game_submissions_points ON game_submissions(points DESC);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
    `);
    
    // System monitoring indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_log(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage_log(api_provider);
      CREATE INDEX IF NOT EXISTS idx_system_metrics_date ON system_metrics(metric_date DESC);
      CREATE INDEX IF NOT EXISTS idx_error_log_created ON error_log(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_error_log_severity ON error_log(severity);
      CREATE INDEX IF NOT EXISTS idx_error_log_resolved ON error_log(resolved);
    `);
    
    // ==================== TRIGGERS & FUNCTIONS ====================
    
    console.log("⚙️ Creating database triggers and functions...");
    
    // Update search vector trigger for articles
    await client.query(`
      CREATE OR REPLACE FUNCTION update_article_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := to_tsvector('english', 
          COALESCE(NEW.title, '') || ' ' || 
          COALESCE(NEW.description, '') || ' ' || 
          COALESCE(NEW.content, '') || ' ' ||
          COALESCE(array_to_string(NEW.tags, ' '), '')
        );
        NEW.updated_at := CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS trigger_update_article_search_vector ON articles;
      CREATE TRIGGER trigger_update_article_search_vector
        BEFORE INSERT OR UPDATE ON articles
        FOR EACH ROW EXECUTE FUNCTION update_article_search_vector();
    `);
    
    // Auto-update game scores trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION update_game_scores() RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO game_scores (country, score, total_submissions, last_submission_at, updated_at)
        VALUES (NEW.country, NEW.points, 1, NEW.submitted_at, CURRENT_TIMESTAMP)
        ON CONFLICT (country) DO UPDATE SET
          score = game_scores.score + NEW.points,
          total_submissions = game_scores.total_submissions + 1,
          last_submission_at = NEW.submitted_at,
          updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS trigger_update_game_scores ON game_submissions;
      CREATE TRIGGER trigger_update_game_scores
        AFTER INSERT ON game_submissions
        FOR EACH ROW EXECUTE FUNCTION update_game_scores();
    `);
    
    // ==================== INITIAL DATA ====================
    
    console.log("🎮 Inserting initial game achievements...");
    
    await client.query(`
      INSERT INTO game_achievements (name, description, icon, points_required, submissions_required, rarity) VALUES
      ('First Submission', 'Submit your first AI article', '🎯', 0, 1, 'common'),
      ('AI Enthusiast', 'Submit 5 AI articles', '🤖', 0, 5, 'common'),
      ('Country Champion', 'Submit 10 articles for your country', '🏆', 0, 10, 'rare'),
      ('Quality Contributor', 'Achieve 50+ total points', '⭐', 50, 0, 'rare'),
      ('AI Expert', 'Submit 25 high-quality AI articles', '🧠', 0, 25, 'epic'),
      ('Global Leader', 'Achieve 100+ total points', '👑', 100, 0, 'epic'),
      ('AI Pioneer', 'Submit 50 AI articles', '🚀', 0, 50, 'legendary'),
      ('Point Master', 'Achieve 200+ total points', '💎', 200, 0, 'legendary')
      ON CONFLICT (name) DO NOTHING;
    `);
    
    console.log("📊 Inserting initial news sources...");
    
    await client.query(`
      INSERT INTO news_sources (name, domain, credibility_score, focus_areas, api_source, is_premium) VALUES
      ('TechCrunch', 'techcrunch.com', 88, ARRAY['AI', 'startups', 'technology'], 'newsapi', true),
      ('MIT Technology Review', 'technologyreview.com', 96, ARRAY['AI', 'research', 'deep tech'], 'newsapi', true),
      ('Wired', 'wired.com', 85, ARRAY['AI', 'tech culture', 'innovation'], 'newsapi', true),
      ('Reuters Technology', 'reuters.com', 94, ARRAY['global tech', 'business', 'AI'], 'newsapi', true),
      ('Bloomberg Technology', 'bloomberg.com', 95, ARRAY['fintech', 'AI', 'business'], 'newsapi', true),
      ('The Verge', 'theverge.com', 82, ARRAY['consumer tech', 'AI', 'reviews'], 'newsapi', false),
      ('Financial Times', 'ft.com', 93, ARRAY['business tech', 'AI policy', 'economics'], 'newsapi', true),
      ('Wall Street Journal', 'wsj.com', 91, ARRAY['enterprise tech', 'AI business', 'markets'], 'newsapi', true)
      ON CONFLICT (name) DO NOTHING;
    `);
    
    client.release();
    console.log("✅ Fortune 500-level database schema created successfully!");
    console.log("📊 Total tables created: 16");
    console.log("🔍 Total indexes created: 25+");
    console.log("⚙️ Triggers and functions: Active");
    console.log("🎮 Initial data: Loaded");
    
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    return false;
  }
}

/**
 * GAME DATA PERSISTENCE - Never lose scores on deployment!
 */

/**
 * ENTERPRISE GAME SUBMISSION SYSTEM
 * Store game submissions with comprehensive analytics and fraud detection
 */
export async function storeGameSubmission(submission) {
  if (pool) {
    try {
      const client = await pool.connect();
      
      // Enhanced fraud detection and validation
      const userIp = submission.userIp || '0.0.0.0';
      const userAgent = submission.userAgent || 'Unknown';
      
      // Check for recent submissions from same IP (rate limiting)
      const recentSubmissions = await client.query(
        `SELECT COUNT(*) as count FROM game_submissions 
         WHERE user_ip = $1 AND submitted_at > NOW() - INTERVAL '1 hour'`,
        [userIp]
      );
      
      if (parseInt(recentSubmissions.rows[0].count) > 10) {
        throw new Error('Rate limit exceeded: Too many submissions from this IP');
      }
      
      // Analyze URL for quality scoring
      const qualityScore = calculateUrlQualityScore(submission.url, submission.articleTitle);
      const pointBreakdown = {
        basePoints: 1,
        qualityBonus: qualityScore > 80 ? 2 : qualityScore > 60 ? 1 : 0,
        sourceBonus: isPremiumSource(submission.url) ? 1 : 0,
        total: submission.points
      };
      
      // Store enhanced submission
      const submissionResult = await client.query(
        `INSERT INTO game_submissions (
          url, country, user_id, user_ip, points, point_breakdown,
          article_title, article_source, quality_score, user_agent, submission_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          submission.url,
          submission.country,
          submission.userId,
          userIp,
          submission.points,
          JSON.stringify(pointBreakdown),
          submission.articleTitle || extractTitleFromUrl(submission.url),
          extractSourceFromUrl(submission.url),
          qualityScore,
          userAgent,
          submission.submissionMethod || 'web'
        ]
      );
      
      const submissionId = submissionResult.rows[0].id;
      
      // The trigger will automatically update game_scores, but we can also track daily scores
      await client.query(
        `UPDATE game_scores SET 
           daily_score = daily_score + $2,
           unique_contributors = (
             SELECT COUNT(DISTINCT user_id) 
             FROM game_submissions 
             WHERE country = $1 AND user_id IS NOT NULL
           )
         WHERE country = $1`,
        [submission.country, submission.points]
      );
      
      // Check for achievements
      await checkAndAwardAchievements(client, submission.userId, submission.country);
      
      // Log user interaction
      await client.query(
        `INSERT INTO user_interactions (
          user_id, user_ip, user_agent, interaction_type, target_type, target_id,
          metadata, country_context
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          submission.userId,
          userIp,
          userAgent,
          'game_submission',
          'article_url',
          submissionId.toString(),
          JSON.stringify({ points: submission.points, quality_score: qualityScore }),
          submission.country
        ]
      );
      
      client.release();
      
      console.log(`🎮 Enhanced game submission stored:`);
      console.log(`   🏆 ${submission.country}: +${submission.points} points`);
      console.log(`   📊 Quality Score: ${qualityScore}/100`);
      console.log(`   🎯 Submission ID: ${submissionId}`);
      
      return {
        success: true,
        submissionId,
        qualityScore,
        pointBreakdown,
        achievements: [] // Will be populated by achievement check
      };
    } catch (error) {
      console.warn("⚠️ PostgreSQL game storage failed:", error.message);
      
      throw error;
    }
  } else {
    throw new Error("Database not available - PostgreSQL connection required");
  }
}

/**
 * Get all game scores
 */
export async function getGameScores() {
  if (pool) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT country, score FROM game_scores ORDER BY score DESC"
      );
      client.release();
      
      const scores = {};
      result.rows.forEach(row => {
        scores[row.country] = row.score;
      });
      
      return scores;
    } catch (error) {
      console.error("❌ PostgreSQL game read failed:", error.message);
      throw error;
    }
  } else {
    throw new Error("Database not available - PostgreSQL connection required");
  }
}

/**
 * Get game submissions
 */
export async function getGameSubmissions(limit = 100) {
  if (pool) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT * FROM game_submissions ORDER BY submitted_at DESC LIMIT $1",
        [limit]
      );
      client.release();
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        url: row.url,
        country: row.country,
        userId: row.user_id,
        points: row.points,
        timestamp: row.submitted_at
      }));
    } catch (error) {
      console.error("❌ PostgreSQL submissions read failed:", error.message);
      throw error;
    }
  } else {
    throw new Error("Database not available - PostgreSQL connection required");
  }
}

/**
 * HELPER FUNCTIONS FOR ENTERPRISE FEATURES
 */

// Calculate URL quality score based on domain and content indicators
function calculateUrlQualityScore(url, title = '') {
  let score = 50; // Base score
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // Premium domains get higher scores
    const premiumDomains = {
      'techcrunch.com': 25,
      'wired.com': 25,
      'technologyreview.com': 30,
      'reuters.com': 30,
      'bloomberg.com': 30,
      'ft.com': 25,
      'wsj.com': 25,
      'theverge.com': 20,
      'arstechnica.com': 25,
      'ieee.org': 30
    };
    
    // Check for premium domains
    for (const [premiumDomain, bonus] of Object.entries(premiumDomains)) {
      if (domain.includes(premiumDomain)) {
        score += bonus;
        break;
      }
    }
    
    // AI/Tech keywords in title boost score
    const aiKeywords = ['artificial intelligence', 'ai ', 'machine learning', 'neural network', 'deep learning'];
    const techKeywords = ['breakthrough', 'innovation', 'research', 'development', 'technology'];
    
    aiKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 10;
    });
    
    techKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 5;
    });
    
    // Penalize low-quality indicators
    const lowQualityKeywords = ['deal', 'sale', 'discount', 'review', 'unboxing', 'specs'];
    lowQualityKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score -= 15;
    });
    
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    return 50; // Default score if URL parsing fails
  }
}

// Check if URL is from a premium source
function isPremiumSource(url) {
  const premiumDomains = [
    'techcrunch.com', 'wired.com', 'technologyreview.com', 'reuters.com',
    'bloomberg.com', 'ft.com', 'wsj.com', 'arstechnica.com', 'ieee.org'
  ];
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return premiumDomains.some(premium => domain.includes(premium));
  } catch (error) {
    return false;
  }
}

// Extract title from URL (basic implementation)
function extractTitleFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').pop().replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
  } catch (error) {
    return 'Unknown Article';
  }
}

// Extract source from URL
function extractSourceFromUrl(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (error) {
    return 'Unknown Source';
  }
}

// Check and award achievements to users
async function checkAndAwardAchievements(client, userId, country) {
  if (!userId) return [];
  
  try {
    // Get user's submission stats
    const userStats = await client.query(
      `SELECT 
         COUNT(*) as total_submissions,
         SUM(points) as total_points,
         COUNT(DISTINCT country) as countries_submitted
       FROM game_submissions 
       WHERE user_id = $1`,
      [userId]
    );
    
    const stats = userStats.rows[0];
    const achievements = [];
    
    // Check for achievements based on stats
    const achievementChecks = [
      { name: 'First Submission', condition: stats.total_submissions >= 1 },
      { name: 'AI Enthusiast', condition: stats.total_submissions >= 5 },
      { name: 'Country Champion', condition: stats.total_submissions >= 10 },
      { name: 'Quality Contributor', condition: stats.total_points >= 50 },
      { name: 'AI Expert', condition: stats.total_submissions >= 25 },
      { name: 'Global Leader', condition: stats.total_points >= 100 },
      { name: 'AI Pioneer', condition: stats.total_submissions >= 50 },
      { name: 'Point Master', condition: stats.total_points >= 200 }
    ];
    
    for (const check of achievementChecks) {
      if (check.condition) {
        // Try to award achievement (will be ignored if already earned)
        try {
          await client.query(
            `INSERT INTO user_achievements (user_id, achievement_id, country)
             SELECT $1, id, $2 FROM game_achievements WHERE name = $3
             ON CONFLICT (user_id, achievement_id) DO NOTHING`,
            [userId, country, check.name]
          );
          achievements.push(check.name);
        } catch (error) {
          // Achievement already exists or other error
        }
      }
    }
    
    return achievements;
  } catch (error) {
    console.warn('⚠️ Achievement check failed:', error.message);
    return [];
  }
}

/**
 * ANALYTICS AND REPORTING FUNCTIONS
 */

// Log API usage for cost tracking
export async function logApiUsage(provider, endpoint, params, response, cost = 0) {
  if (!pool) return;
  
  try {
    const client = await pool.connect();
    
    await client.query(
      `INSERT INTO api_usage_log (
        api_provider, endpoint, query_params, response_status, response_size,
        response_time_ms, cost_estimate, articles_returned, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        provider,
        endpoint,
        JSON.stringify(params),
        response.status || 200,
        response.size || 0,
        response.responseTime || 0,
        cost,
        response.articlesReturned || 0,
        response.error || null
      ]
    );
    
    client.release();
  } catch (error) {
    console.warn('⚠️ Failed to log API usage:', error.message);
  }
}

// Track user interactions for analytics
export async function trackUserInteraction(interaction) {
  if (!pool) return;
  
  try {
    const client = await pool.connect();
    
    await client.query(
      `INSERT INTO user_interactions (
        user_id, session_id, user_ip, user_agent, interaction_type,
        target_type, target_id, metadata, country_context, referrer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        interaction.userId,
        interaction.sessionId,
        interaction.userIp,
        interaction.userAgent,
        interaction.type,
        interaction.targetType,
        interaction.targetId,
        JSON.stringify(interaction.metadata || {}),
        interaction.countryContext,
        interaction.referrer
      ]
    );
    
    client.release();
  } catch (error) {
    console.warn('⚠️ Failed to track user interaction:', error.message);
  }
}

// Get comprehensive analytics dashboard data
export async function getAnalyticsDashboard() {
  if (!pool) return { error: 'Database not available' };
  
  try {
    const client = await pool.connect();
    
    // Get key metrics
    const metrics = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM articles) as total_articles,
        (SELECT COUNT(*) FROM articles WHERE created_at > NOW() - INTERVAL '24 hours') as articles_today,
        (SELECT COUNT(*) FROM game_submissions) as total_submissions,
        (SELECT COUNT(*) FROM game_submissions WHERE submitted_at > NOW() - INTERVAL '24 hours') as submissions_today,
        (SELECT COUNT(DISTINCT user_id) FROM user_interactions WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_today,
        (SELECT SUM(cost_estimate) FROM api_usage_log WHERE created_at > NOW() - INTERVAL '30 days') as monthly_api_cost
    `);
    
    // Get top countries by score
    const topCountries = await client.query(`
      SELECT country, score, total_submissions, unique_contributors
      FROM game_scores 
      ORDER BY score DESC 
      LIMIT 10
    `);
    
    // Get recent errors
    const recentErrors = await client.query(`
      SELECT error_type, error_message, created_at, severity
      FROM error_log 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    client.release();
    
    return {
      metrics: metrics.rows[0],
      topCountries: topCountries.rows,
      recentErrors: recentErrors.rows,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to get analytics dashboard:', error.message);
    return { error: error.message };
  }
}

// Store user rating in PostgreSQL
export async function storeUserRating(rating) {
  if (!pool) throw new Error('Database not available');
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO user_ratings (article_id, user_id, user_ip, rel_score, ana_score, overall_rating, feedback_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (article_id, user_id) DO UPDATE SET
         rel_score = EXCLUDED.rel_score,
         ana_score = EXCLUDED.ana_score,
         overall_rating = EXCLUDED.overall_rating,
         feedback_text = EXCLUDED.feedback_text,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [rating.articleId, rating.userId, rating.userIp, rating.relScore, rating.anaScore, rating.overallRating, rating.feedbackText]
    );
    
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('❌ Failed to store user rating:', error.message);
    throw error;
  }
}

// Get user ratings for an article
export async function getUserRatings(articleId) {
  if (!pool) return { avgRelScore: 0, avgAnaScore: 0, totalRatings: 0 };
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
         AVG(rel_score) as avg_rel_score,
         AVG(ana_score) as avg_ana_score,
         AVG(overall_rating) as avg_overall_rating,
         COUNT(*) as total_ratings
       FROM user_ratings 
       WHERE article_id = $1`,
      [articleId]
    );
    
    client.release();
    
    const stats = result.rows[0];
    return {
      avgRelScore: Math.round(parseFloat(stats.avg_rel_score) || 0),
      avgAnaScore: Math.round(parseFloat(stats.avg_ana_score) || 0),
      avgOverallRating: Math.round(parseFloat(stats.avg_overall_rating) || 0),
      totalRatings: parseInt(stats.total_ratings) || 0
    };
  } catch (error) {
    console.error('❌ Failed to get user ratings:', error.message);
    return { avgRelScore: 0, avgAnaScore: 0, totalRatings: 0 };
  }
}

// Initialize schema asynchronously after pool is ready
setTimeout(async () => {
  if (pool) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.warn("⚠️ Database schema initialization failed:", error.message);
    }
  }
}, 2000);
/**
 
* ENTERPRISE SEARCH FUNCTIONS
 */

// Advanced full-text search with filters
export async function searchArticles(searchParams) {
  if (!pool) return [];
  
  try {
    const client = await pool.connect();
    
    let query = `
      SELECT a.*, ts_rank(a.search_vector, plainto_tsquery('english', $1)) as rank
      FROM articles a
      WHERE a.search_vector @@ plainto_tsquery('english', $1)
    `;
    
    const params = [searchParams.query];
    let paramIndex = 2;
    
    // Add filters
    if (searchParams.country) {
      query += ` AND a.country = $${paramIndex}`;
      params.push(searchParams.country);
      paramIndex++;
    }
    
    if (searchParams.category) {
      query += ` AND a.category = $${paramIndex}`;
      params.push(searchParams.category);
      paramIndex++;
    }
    
    if (searchParams.source) {
      query += ` AND a.source ILIKE $${paramIndex}`;
      params.push(`%${searchParams.source}%`);
      paramIndex++;
    }
    
    if (searchParams.minScore > 0) {
      query += ` AND (a.rel_score + a.ana_score) >= $${paramIndex}`;
      params.push(searchParams.minScore * 2); // Combined score
      paramIndex++;
    }
    
    query += ` ORDER BY rank DESC, a.published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(searchParams.limit, searchParams.offset);
    
    const result = await client.query(query, params);
    client.release();
    
    return result.rows;
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    return [];
  }
}

// Get enhanced leaderboard with achievements
export async function getEnhancedLeaderboard() {
  if (!pool) return [];
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        gs.*,
        COUNT(ua.id) as achievement_count,
        ARRAY_AGG(ga.name) FILTER (WHERE ga.name IS NOT NULL) as recent_achievements
      FROM game_scores gs
      LEFT JOIN game_submissions gsub ON gs.country = gsub.country
      LEFT JOIN user_achievements ua ON gsub.user_id = ua.user_id
      LEFT JOIN game_achievements ga ON ua.achievement_id = ga.id
      GROUP BY gs.country, gs.score, gs.total_submissions, gs.unique_contributors, 
               gs.last_submission_at, gs.rank_position, gs.daily_score, gs.weekly_score
      ORDER BY gs.score DESC
      LIMIT 20
    `);
    
    client.release();
    return result.rows;
  } catch (error) {
    console.error('❌ Enhanced leaderboard failed:', error.message);
    return [];
  }
}

// Get user profile with achievements and stats
export async function getUserProfile(userId) {
  if (!pool) return null;
  
  try {
    const client = await pool.connect();
    
    // Get user stats
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_submissions,
        SUM(points) as total_points,
        AVG(points) as avg_points,
        COUNT(DISTINCT country) as countries_contributed,
        MAX(submitted_at) as last_submission
      FROM game_submissions 
      WHERE user_id = $1
    `, [userId]);
    
    // Get user achievements
    const achievementsResult = await client.query(`
      SELECT ga.name, ga.description, ga.icon, ga.rarity, ua.earned_at
      FROM user_achievements ua
      JOIN game_achievements ga ON ua.achievement_id = ga.id
      WHERE ua.user_id = $1
      ORDER BY ua.earned_at DESC
    `, [userId]);
    
    // Get user ratings
    const ratingsResult = await client.query(`
      SELECT COUNT(*) as total_ratings, AVG(overall_rating) as avg_rating
      FROM user_ratings 
      WHERE user_id = $1
    `, [userId]);
    
    client.release();
    
    return {
      userId,
      stats: statsResult.rows[0],
      achievements: achievementsResult.rows,
      ratings: ratingsResult.rows[0]
    };
  } catch (error) {
    console.error('❌ User profile failed:', error.message);
    return null;
  }
}

// Get trending topics analysis
export async function getTrendingTopics() {
  if (!pool) return [];
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        topic_category,
        COUNT(*) as article_count,
        AVG(rel_score + ana_score) as avg_score,
        MAX(published_at) as latest_article
      FROM articles 
      WHERE published_at > NOW() - INTERVAL '7 days'
        AND topic_category IS NOT NULL
      GROUP BY topic_category
      ORDER BY article_count DESC, avg_score DESC
      LIMIT 10
    `);
    
    client.release();
    return result.rows;
  } catch (error) {
    console.error('❌ Trending topics failed:', error.message);
    return [];
  }
}

// Get API cost analysis
export async function getApiCostAnalysis() {
  if (!pool) return {};
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        api_provider,
        COUNT(*) as total_calls,
        SUM(cost_estimate) as total_cost,
        AVG(response_time_ms) as avg_response_time,
        SUM(articles_returned) as total_articles
      FROM api_usage_log 
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY api_provider
      ORDER BY total_cost DESC
    `);
    
    client.release();
    return {
      providers: result.rows,
      period: '30 days',
      totalCost: result.rows.reduce((sum, p) => sum + parseFloat(p.total_cost || 0), 0)
    };
  } catch (error) {
    console.error('❌ API cost analysis failed:', error.message);
    return {};
  }
}

// Get comprehensive system health
export async function getSystemHealth() {
  if (!pool) return { status: 'Database unavailable' };
  
  try {
    const client = await pool.connect();
    
    // Database size and performance
    const dbStats = await client.query(`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as db_size,
        (SELECT COUNT(*) FROM articles) as total_articles,
        (SELECT COUNT(*) FROM game_submissions) as total_submissions,
        (SELECT COUNT(*) FROM user_interactions) as total_interactions
    `);
    
    // Recent errors
    const errorStats = await client.query(`
      SELECT severity, COUNT(*) as count
      FROM error_log 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY severity
    `);
    
    // API performance
    const apiStats = await client.query(`
      SELECT 
        AVG(response_time_ms) as avg_response_time,
        COUNT(*) as total_calls_today
      FROM api_usage_log 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    
    client.release();
    
    return {
      status: 'Healthy',
      database: dbStats.rows[0],
      errors: errorStats.rows,
      api: apiStats.rows[0],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ System health check failed:', error.message);
    return { status: 'Unhealthy', error: error.message };
  }
}

// Content moderation function
export async function moderateContent(moderation) {
  if (!pool) throw new Error('Database not available');
  
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO content_moderation (
        content_type, content_id, moderator_id, action, reason, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      moderation.contentType,
      moderation.contentId,
      moderation.moderatorId,
      moderation.action,
      moderation.reason,
      moderation.notes
    ]);
    
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('❌ Content moderation failed:', error.message);
    throw error;
  }
}

// Execute bulk operations for admin efficiency
export async function executeBulkOperation(operation, data) {
  if (!pool) throw new Error('Database not available');
  
  try {
    const client = await pool.connect();
    let result = {};
    
    switch (operation) {
      case 'delete_old_articles':
        const deleteResult = await client.query(`
          DELETE FROM articles 
          WHERE published_at < NOW() - INTERVAL '${data.days || 30} days'
        `);
        result = { deleted: deleteResult.rowCount };
        break;
        
      case 'update_scores':
        // Bulk update article scores
        for (const update of data.updates || []) {
          await client.query(`
            UPDATE articles 
            SET rel_score = $1, ana_score = $2 
            WHERE id = $3
          `, [update.relScore, update.anaScore, update.id]);
        }
        result = { updated: data.updates?.length || 0 };
        break;
        
      case 'reset_daily_scores':
        await client.query(`UPDATE game_scores SET daily_score = 0`);
        result = { message: 'Daily scores reset' };
        break;
        
      default:
        throw new Error(`Unknown bulk operation: ${operation}`);
    }
    
    client.release();
    return result;
  } catch (error) {
    console.error('❌ Bulk operation failed:', error.message);
    throw error;
  }
}
/**

 * 🚨 SAVE ARTICLES TO DATABASE - MEDIASTACK INTEGRATION
 * Saves fetched articles directly to PostgreSQL with full metadata
 */
export async function saveArticlesToDatabase(articles) {
  if (!articles || articles.length === 0) {
    throw new Error('No articles provided to save');
  }

  console.log(`💾 Saving ${articles.length} articles to database...`);

  if (pool) {
    try {
      const client = await pool.connect();
      let savedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const article of articles) {
        try {
          // Enhanced article storage with full Mediastack metadata
          const result = await client.query(
            `INSERT INTO articles (
              id, title, url, source, author, published_at, description,
              country, category, rel_score, ana_score, provenance, language, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (url) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              rel_score = EXCLUDED.rel_score,
              ana_score = EXCLUDED.ana_score,
              updated_at = CURRENT_TIMESTAMP
            RETURNING (xmax = 0) AS inserted`,
            [
              article.id,
              article.title,
              article.url,
              article.source,
              article.author,
              article.publishedAt,
              article.description,
              article.country,
              article.category || 'ai',
              article.relScore || 75,
              article.anaScore || 70,
              article.provenance || 'mediastack-api',
              article.language || 'en',
              article.image
            ]
          );

          if (result.rows[0].inserted) {
            savedCount++;
          } else {
            updatedCount++;
          }

        } catch (articleError) {
          console.warn(`⚠️ Failed to save article "${article.title}":`, articleError.message);
          errorCount++;
        }
      }

      // Log the operation
      await client.query(
        `INSERT INTO api_usage_log (api_provider, endpoint, articles_returned, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        ['mediastack', '/batch_save', articles.length]
      );

      client.release();

      console.log(`✅ Database save complete:`);
      console.log(`   📝 New articles saved: ${savedCount}`);
      console.log(`   🔄 Articles updated: ${updatedCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);

      return {
        success: true,
        saved: savedCount,
        updated: updatedCount,
        errors: errorCount,
        total: articles.length
      };

    } catch (error) {
      console.error("❌ PostgreSQL save failed:", error.message);
      return {
        success: false,
        saved: 0,
        updated: 0,
        errors: articles.length,
        total: articles.length,
        error: error.message
      };
    }
  } else {
    console.warn("⚠️ Database not available, cannot save articles");
    return {
      success: false,
      saved: 0,
      updated: 0,
      errors: articles.length,
      total: articles.length,
      error: "Database not available"
    };
  }
}

export { initializePool };