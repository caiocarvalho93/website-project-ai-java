#!/usr/bin/env node

/**
 * Quick test to verify NewsData.io API key format and functionality
 */

import dotenv from 'dotenv';
dotenv.config();

async function testNewsDataKey() {
  const apiKey = process.env.NEWS_API_KEY_FALLBACK;
  
  if (!apiKey) {
    console.log("❌ No fallback API key configured");
    return;
  }
  
  console.log(`🔑 Testing NewsData.io key: ${apiKey.substring(0, 8)}...`);
  
  try {
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=artificial%20intelligence&language=en&category=technology&size=5`;
    console.log("📡 Making request to NewsData.io...");
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("📊 Response status:", response.status);
    console.log("📊 Response data:", JSON.stringify(data, null, 2));
    
    if (data.status === "success" && data.results) {
      console.log(`✅ SUCCESS: Got ${data.results.length} articles from NewsData.io`);
      console.log("📰 Sample article:", data.results[0]?.title);
    } else {
      console.log("⚠️ No results or error:", data.message || "Unknown issue");
    }
    
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

testNewsDataKey();