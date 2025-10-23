package com.caio.websiteai.ai.service;

import com.caio.websiteai.news.dto.Article;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ArticleScoringService {

    public int scoreAnalysisDepth(Article article) {
        if (article == null || !StringUtils.hasText(article.getTitle())) {
            return 0;
        }
        String text = (article.getTitle() + " " + defaultString(article.getDescription())).toLowerCase();
        int score = 20;

        String[] premiumKeywords = {"quantum", "algorithm", "breakthrough", "outperforms", "supercomputer", "outage", "aws", "openai", "chatgpt"};
        for (String keyword : premiumKeywords) {
            if (text.contains(keyword)) {
                score += 25;
            }
        }

        String[] depthKeywords = {"analysis", "report", "study", "research", "data", "market", "industry", "experts", "warning"};
        for (String keyword : depthKeywords) {
            if (text.contains(keyword)) {
                score += 15;
            }
        }

        String[] techKeywords = {"browser", "rival", "google", "technology", "cloud", "complexity", "scale"};
        for (String keyword : techKeywords) {
            if (text.contains(keyword)) {
                score += 10;
            }
        }

        if (StringUtils.hasText(article.getDescription()) && article.getDescription().length() > 150) {
            score += 15;
        }

        String[] premiumSources = {"ars", "wired", "bbc", "techcrunch", "reuters"};
        if (StringUtils.hasText(article.getSource())) {
            String sourceLower = article.getSource().toLowerCase();
            for (String premiumSource : premiumSources) {
                if (sourceLower.contains(premiumSource)) {
                    score += 20;
                    break;
                }
            }
        }

        return Math.min(score, 100);
    }

    public int scoreArticleRelevance(Article article) {
        if (article == null || !StringUtils.hasText(article.getTitle())) {
            return 0;
        }
        String text = (article.getTitle() + " " + defaultString(article.getDescription())).toLowerCase();
        int score = 5;

        String[] premiumAiKeywords = {
                "artificial intelligence breakthrough", "ai research", "machine learning innovation",
                "ai government", "ai policy", "ai regulation", "ai national security",
                "quantum computing", "neural network", "deep learning"
        };
        for (String keyword : premiumAiKeywords) {
            if (text.contains(keyword)) {
                score += 40;
            }
        }

        String[] aiKeywords = {"artificial intelligence", "ai ", "machine learning", "chatgpt", "openai", "algorithm"};
        boolean aiMatch = false;
        for (String keyword : aiKeywords) {
            if (text.contains(keyword)) {
                score += 30;
                aiMatch = true;
            }
        }

        if (aiMatch) {
            String[] techGiantsKeywords = {"google", "amazon", "aws", "microsoft", "apple", "meta", "nvidia"};
            for (String keyword : techGiantsKeywords) {
                if (text.contains(keyword)) {
                    score += 25;
                }
            }
        }

        String[] intelligenceKeywords = {"research", "breakthrough", "innovation", "policy", "regulation", "security"};
        for (String keyword : intelligenceKeywords) {
            if (text.contains(keyword)) {
                score += 20;
            }
        }

        String[] businessKeywords = {"startup funding", "ai investment", "venture capital", "billion", "valuation"};
        for (String keyword : businessKeywords) {
            if (text.contains(keyword)) {
                score += 15;
            }
        }

        String[] consumerKeywords = {"deal", "sale", "discount", "buy", "price", "review", "specs", "off right now",
                "camera", "speaker", "headphones", "ebike", "gadget", "$", "clip-on"};
        for (String keyword : consumerKeywords) {
            if (text.contains(keyword)) {
                score -= 60;
            }
        }

        String[] entertainmentKeywords = {"troll", "trailer", "movie", "netflix", "game"};
        for (String keyword : entertainmentKeywords) {
            if (text.contains(keyword)) {
                score -= 50;
            }
        }

        return Math.min(score, 100);
    }

    private String defaultString(String value) {
        return value != null ? value : "";
    }
}
