/**
 * AI Intelligence Report Generator
 * Generates intelligence reports from news headlines
 */

// Export the missing functions that other modules expect
export function scoreAnalysisDepth(article) {
  if (!article || !article.title) return 0;
  
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  let score = 20; // Base score for any article
  
  // High-value depth indicators
  const premiumKeywords = ['quantum', 'algorithm', 'breakthrough', 'outperforms', 'supercomputer', 'outage', 'aws', 'openai', 'chatgpt'];
  const depthKeywords = ['analysis', 'report', 'study', 'research', 'data', 'market', 'industry', 'experts', 'warning'];
  const techKeywords = ['browser', 'rival', 'google', 'technology', 'cloud', 'complexity', 'scale'];
  
  // Premium content gets high scores
  premiumKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 25; // Premium keywords get 25 points each
    }
  });
  
  // Depth indicators
  depthKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 15; // Depth keywords get 15 points
    }
  });
  
  // Tech relevance
  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 10; // Tech keywords get 10 points
    }
  });
  
  // Bonus for detailed descriptions
  if (article.description && article.description.length > 150) {
    score += 15;
  }
  
  // Bonus for reputable sources
  const premiumSources = ['ars', 'wired', 'bbc', 'techcrunch', 'reuters'];
  if (article.source && premiumSources.some(source => article.source.toLowerCase().includes(source))) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

export function scoreArticleRelevance(article) {
  if (!article || !article.title) return 0;
  
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  let score = 5; // Lower base score - must earn relevance
  
  // PREMIUM AI/Intelligence keywords (highest value)
  const premiumAiKeywords = [
    'artificial intelligence breakthrough', 'ai research', 'machine learning innovation',
    'ai government', 'ai policy', 'ai regulation', 'ai national security',
    'quantum computing', 'neural network', 'deep learning'
  ];
  
  const aiKeywords = ['artificial intelligence', 'ai ', 'machine learning', 'chatgpt', 'openai', 'algorithm'];
  const techGiantsKeywords = ['google', 'amazon', 'aws', 'microsoft', 'apple', 'meta', 'nvidia'];
  const intelligenceKeywords = ['research', 'breakthrough', 'innovation', 'policy', 'regulation', 'security'];
  const businessKeywords = ['startup funding', 'ai investment', 'venture capital', 'billion', 'valuation'];
  
  // PREMIUM AI content gets massive scores
  premiumAiKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 40; // Premium AI content
    }
  });
  
  // Core AI keywords
  aiKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 30; // AI is highly relevant
    }
  });
  
  // Tech giants (but only if AI-related)
  if (aiKeywords.some(ai => text.includes(ai))) {
    techGiantsKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 25; // Tech giants + AI = very relevant
      }
    });
  }
  
  // Intelligence/research keywords
  intelligenceKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 20;
    }
  });
  
  // Business impact (AI-related)
  businessKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 15;
    }
  });
  
  // HEAVY PENALTIES for consumer/shopping content
  const consumerKeywords = [
    'deal', 'sale', 'discount', 'buy', 'price', 'review', 'specs', 'off right now',
    'camera', 'speaker', 'headphones', 'ebike', 'gadget', '$', 'clip-on'
  ];
  
  consumerKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 60; // Massive penalty for consumer content
    }
  });
  
  // REJECT entertainment/gaming content
  const entertainmentKeywords = ['troll', 'trailer', 'movie', 'netflix', 'game'];
  entertainmentKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 50;
    }
  });
  
  return Math.min(score, 100);
}

export async function generateAIIntelligenceReport(
  countryCode,
  headlines = []
) {
  try {
    // Only generate reports if we have real headlines
    if (!headlines || headlines.length === 0) {
      return {
        success: false,
        message: "No headlines available for analysis",
        data: {
          country: countryCode,
          status: "AWAITING_DATA",
          timestamp: new Date().toISOString(),
        },
      };
    }

    const report = {
      country: countryCode,
      classification: "ULTRA SECRET - EIN-7734",
      clearanceLevel: "ALPHA-7",
      timestamp: new Date().toISOString(),
      status: "OPERATIONAL",
      headlines: headlines.slice(0, 5),
      analysis: {
        keyTopics: extractKeyTopics(headlines),
        headlineCount: headlines.length,
      },
    };

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {
        country: countryCode,
        status: "ERROR",
        timestamp: new Date().toISOString(),
      },
    };
  }
}

function extractKeyTopics(headlines) {
  const topics = [];
  const keywords = [
    "AI",
    "technology",
    "economy",
    "politics",
    "security",
    "innovation",
  ];

  keywords.forEach((keyword) => {
    const count = headlines.filter((h) =>
      h.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (count > 0) {
      topics.push({ topic: keyword, mentions: count });
    }
  });

  return topics.sort((a, b) => b.mentions - a.mentions).slice(0, 3);
}
