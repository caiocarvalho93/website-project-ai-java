#!/usr/bin/env node

/**
 * Production deployment script for CIA Intelligence Network
 * Handles database migration and data transfer from local files to cloud DB
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import pg from "pg";
import dotenv from "dotenv";

// Load production environment
dotenv.config({ path: ".env.production" });

const { Pool } = pg;

async function deployToProduction() {
  console.log("🚀 Starting production deployment...");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not configured in .env.production");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    // Test database connection
    console.log("📊 Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");

    // Create tables
    console.log("🏗️ Creating database schema...");
    await createTables(pool);

    // Migrate local data to cloud database
    console.log("📦 Migrating local data to cloud database...");
    await migrateLocalData(pool);

    console.log("🎉 Production deployment complete!");
    console.log("🌐 Your system is ready for cloud deployment");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createTables(pool) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS articles (
      id VARCHAR(255) PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      source VARCHAR(255),
      author VARCHAR(255),
      published_at TIMESTAMP,
      description TEXT,
      country VARCHAR(10),
      category VARCHAR(50),
      rel_score INTEGER,
      ana_score INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country);
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_scores ON articles(rel_score DESC, ana_score DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
  `;

  await pool.query(createTableSQL);
  console.log("✅ Database tables created");
}

async function migrateLocalData(pool) {
  try {
    const dataDir = "./data";
    const files = await readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith("-articles.json"));

    let totalMigrated = 0;

    for (const file of jsonFiles) {
      const filePath = join(dataDir, file);
      const data = await readFile(filePath, "utf8");
      const articles = JSON.parse(data);

      console.log(`📄 Migrating ${articles.length} articles from ${file}...`);

      for (const article of articles) {
        try {
          await pool.query(
            `
            INSERT INTO articles (
              id, title, url, source, author, published_at, 
              description, country, category, rel_score, ana_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (url) DO UPDATE SET
              title = EXCLUDED.title,
              rel_score = EXCLUDED.rel_score,
              ana_score = EXCLUDED.ana_score,
              updated_at = CURRENT_TIMESTAMP
          `,
            [
              article.id,
              article.title,
              article.url,
              article.source,
              article.author,
              article.publishedAt,
              article.description,
              article.country,
              article.category,
              article.relScore,
              article.anaScore,
            ]
          );
          totalMigrated++;
        } catch (error) {
          console.warn(`⚠️ Failed to migrate article: ${article.title}`);
        }
      }
    }

    console.log(`✅ Migrated ${totalMigrated} articles to cloud database`);
  } catch (error) {
    console.error("❌ Data migration failed:", error.message);
    throw error;
  }
}

// Run deployment
deployToProduction();
