-- PostgreSQL Database Schema for AI Intelligence Network
-- Run this if you want to use PostgreSQL instead of file storage

CREATE DATABASE intelligence_db;

\c intelligence_db;

-- Articles table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_scores ON articles(rel_score DESC, ana_score DESC);

-- Countries table (optional)
CREATE TABLE IF NOT EXISTS countries (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    ai_rank INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default countries
INSERT INTO countries (code, name, region, ai_rank) VALUES
('US', 'United States', 'North America', 1),
('DE', 'Germany', 'Europe', 3),
('ES', 'Spain', 'Europe', 10),
('GB', 'United Kingdom', 'Europe', 4),
('FR', 'France', 'Europe', 7),
('JP', 'Japan', 'Asia', 5),
('KR', 'South Korea', 'Asia', 8),
('IN', 'India', 'Asia', 9),
('CA', 'Canada', 'North America', 6),
('BR', 'Brazil', 'South America', 11)
ON CONFLICT (code) DO NOTHING;

-- Intelligence reports table (optional)
CREATE TABLE IF NOT EXISTS intelligence_reports (
    id SERIAL PRIMARY KEY,
    country VARCHAR(10) REFERENCES countries(code),
    summary TEXT,
    rel_score INTEGER,
    ana_score INTEGER,
    confidence VARCHAR(20),
    provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_intelligence_country ON intelligence_reports(country);
CREATE INDEX IF NOT EXISTS idx_intelligence_created ON intelligence_reports(created_at DESC);