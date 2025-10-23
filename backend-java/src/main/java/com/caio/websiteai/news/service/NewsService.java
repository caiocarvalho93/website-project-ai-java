package com.caio.websiteai.news.service;

import com.caio.websiteai.ai.service.ArticleScoringService;
import com.caio.websiteai.article.dto.StoredArticleDto;
import com.caio.websiteai.article.service.ArticleStorageService;
import com.caio.websiteai.news.dto.Article;
import com.caio.websiteai.news.dto.CountryNewsResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
public class NewsService {

    private static final Set<String> PREMIUM_SOURCES = Set.of(
            "techcrunch", "wired", "reuters", "bloomberg", "financial times", "wall street journal", "mit technology review"
    );

    private final NewsApiClient newsApiClient;
    private final ArticleStorageService articleStorageService;
    private final ArticleScoringService articleScoringService;

    public NewsService(NewsApiClient newsApiClient,
                       ArticleStorageService articleStorageService,
                       ArticleScoringService articleScoringService) {
        this.newsApiClient = newsApiClient;
        this.articleStorageService = articleStorageService;
        this.articleScoringService = articleScoringService;
    }

    @Cacheable(cacheNames = "countryNews", key = "#countryCode")
    public CountryNewsResponse getCountryNews(String countryCode) {
        CountryNewsResponse response = newsApiClient.getTopHeadlinesByCountry(countryCode);
        if (response.getArticles() == null) {
            response.setArticles(List.of());
            response.setTotal(0);
            return response;
        }

        List<Article> enriched = response.getArticles().stream()
                .map(article -> enrichArticle(countryCode, article))
                .filter(Objects::nonNull)
                .toList();

        articleStorageService.storeArticles(countryCode, mapToStoredArticles(countryCode, enriched));

        response.setArticles(enriched);
        response.setTotal(enriched.size());
        return response;
    }

    private Article enrichArticle(String countryCode, Article article) {
        if (article == null) {
            return null;
        }

        article.setRelevanceScore(articleScoringService.scoreArticleRelevance(article));
        article.setAnalysisScore(articleScoringService.scoreAnalysisDepth(article));
        if (article.getRelevanceScore() != null && article.getAnalysisScore() != null) {
            double avg = (article.getRelevanceScore() + article.getAnalysisScore()) / 2.0;
            article.setEinsteinScore(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        }
        article.setTopicCategory(determineTopicCategory(article));
        article.setLanguage(StringUtils.hasText(article.getLanguage()) ? article.getLanguage() : "en");
        article.setWordCount(calculateWordCount(article));
        article.setReadabilityScore(calculateReadabilityScore(article));
        article.setSentimentScore(calculateSentimentScore(article));
        article.setProvenance("newsapi");
        article.setPremium(isPremiumSource(article));
        article.setBreaking(Boolean.FALSE);
        article.setTags(determineTags(article));
        if (!StringUtils.hasText(article.getCategory()) && article.getTopicCategory() != null) {
            article.setCategory(article.getTopicCategory());
        }
        if (!StringUtils.hasText(article.getSource())) {
            article.setSource("Unknown");
        }
        return article;
    }

    private int calculateWordCount(Article article) {
        String text = article.getContent();
        if (!StringUtils.hasText(text)) {
            text = article.getDescription();
        }
        if (!StringUtils.hasText(text)) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }

    private int calculateReadabilityScore(Article article) {
        String text = article.getContent();
        if (!StringUtils.hasText(text)) {
            text = article.getDescription();
        }
        if (!StringUtils.hasText(text)) {
            return 50;
        }
        int length = text.length();
        if (length > 1500) {
            return 70;
        }
        if (length > 800) {
            return 60;
        }
        if (length > 400) {
            return 55;
        }
        return 50;
    }

    private BigDecimal calculateSentimentScore(Article article) {
        String text = (article.getTitle() + " " + article.getDescription()).toLowerCase(Locale.ENGLISH);
        int score = 0;
        String[] positive = {"growth", "success", "breakthrough", "improve", "boost"};
        String[] negative = {"concern", "risk", "decline", "warning", "ban"};
        for (String word : positive) {
            if (text.contains(word)) {
                score += 1;
            }
        }
        for (String word : negative) {
            if (text.contains(word)) {
                score -= 1;
            }
        }
        return BigDecimal.valueOf(Math.max(-1, Math.min(1, score / 5.0))).setScale(2, RoundingMode.HALF_UP);
    }

    private List<String> determineTags(Article article) {
        List<String> tags = new ArrayList<>();
        String text = (article.getTitle() + " " + article.getDescription()).toLowerCase(Locale.ENGLISH);
        if (text.contains("policy") || text.contains("regulation")) {
            tags.add("policy");
        }
        if (text.contains("research") || text.contains("study")) {
            tags.add("research");
        }
        if (text.contains("investment") || text.contains("funding")) {
            tags.add("investment");
        }
        if (text.contains("security") || text.contains("defense")) {
            tags.add("security");
        }
        return tags;
    }

    private boolean isPremiumSource(Article article) {
        if (!StringUtils.hasText(article.getSource())) {
            return false;
        }
        String normalizedSource = article.getSource().toLowerCase(Locale.ENGLISH);
        return PREMIUM_SOURCES.stream().anyMatch(normalizedSource::contains);
    }

    private String determineTopicCategory(Article article) {
        String text = (article.getTitle() + " " + article.getDescription()).toLowerCase(Locale.ENGLISH);
        if (text.contains("policy") || text.contains("regulation")) {
            return "policy";
        }
        if (text.contains("research") || text.contains("study")) {
            return "research";
        }
        if (text.contains("startup") || text.contains("investment")) {
            return "business";
        }
        if (text.contains("security") || text.contains("defense")) {
            return "security";
        }
        if (text.contains("ethics")) {
            return "ethics";
        }
        return "general";
    }

    private List<StoredArticleDto> mapToStoredArticles(String countryCode, List<Article> articles) {
        if (CollectionUtils.isEmpty(articles)) {
            return List.of();
        }
        return articles.stream()
                .filter(article -> article != null && StringUtils.hasText(article.getUrl()))
                .map(article -> StoredArticleDto.builder()
                        .id(buildArticleId(countryCode, article))
                        .title(article.getTitle())
                        .url(article.getUrl())
                        .source(article.getSource())
                        .author(article.getAuthor())
                        .publishedAt(article.getPublishedAt())
                        .description(article.getDescription())
                        .content(article.getContent())
                        .country(countryCode)
                        .category(article.getCategory())
                        .relevanceScore(article.getRelevanceScore())
                        .analysisScore(article.getAnalysisScore())
                        .einsteinScore(article.getEinsteinScore())
                        .topicCategory(article.getTopicCategory())
                        .provenance(article.getProvenance())
                        .searchQuery(article.getSearchQuery())
                        .language(article.getLanguage())
                        .sentimentScore(article.getSentimentScore())
                        .readabilityScore(article.getReadabilityScore())
                        .wordCount(article.getWordCount())
                        .imageUrl(article.getUrlToImage())
                        .tags(article.getTags())
                        .premium(Boolean.TRUE.equals(article.getPremium()))
                        .breaking(Boolean.TRUE.equals(article.getBreaking()))
                        .build())
                .toList();
    }

    private String buildArticleId(String countryCode, Article article) {
        String base = StringUtils.hasText(article.getUrl()) ? article.getUrl() : article.getTitle();
        if (!StringUtils.hasText(base)) {
            base = countryCode + "-article";
        }
        return Integer.toHexString(base.hashCode()) + "-" + countryCode;
    }
}
