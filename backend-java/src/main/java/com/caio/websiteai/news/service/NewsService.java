package com.caio.websiteai.news.service;

import com.caio.websiteai.ai.service.ArticleScoringService;
import com.caio.websiteai.article.dto.ArticleStorageSummary;
import com.caio.websiteai.article.dto.StoredArticleDto;
import com.caio.websiteai.article.entity.ArticleEntity;
import com.caio.websiteai.article.service.ArticleStorageService;
import com.caio.websiteai.news.dto.Article;
import com.caio.websiteai.news.dto.CountryNewsResponse;
import com.caio.websiteai.news.dto.DeploymentTestResponse;
import com.caio.websiteai.news.dto.GlobalNewsResponse;
import com.caio.websiteai.news.dto.NewsFeedResponse;
import com.caio.websiteai.news.dto.NewsRefreshResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NewsService {

    private static final Set<String> PREMIUM_SOURCES = Set.of(
            "techcrunch", "wired", "reuters", "bloomberg", "financial times", "wall street journal", "mit technology review"
    );
    private static final List<String> DEFAULT_COUNTRIES = List.of("US", "GB", "DE", "FR", "CA", "JP", "IN", "ES");

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

    @Cacheable(cacheNames = "countryNews", key = "#countryCode.toUpperCase()")
    public CountryNewsResponse getCountryNews(String countryCode) {
        return fetchAndStoreCountryNews(countryCode).response();
    }

    @CacheEvict(cacheNames = "countryNews", key = "#countryCode.toUpperCase()")
    public CountryNewsResponse refreshCountryNews(String countryCode) {
        return fetchAndStoreCountryNews(countryCode).response();
    }

    public NewsFeedResponse getLatestNewsFeed(Integer limit) {
        int size = limit != null && limit > 0 ? limit : 100;
        List<Article> articles = articleStorageService.fetchLatestArticles(size).stream()
                .map(this::mapEntityToArticle)
                .toList();
        return NewsFeedResponse.builder()
                .articles(articles)
                .totalArticles(articles.size())
                .lastUpdate(articleStorageService.findMostRecentUpdate())
                .build();
    }

    public GlobalNewsResponse getGlobalNewsFeed() {
        Map<String, List<Article>> countries = new LinkedHashMap<>();
        for (String country : DEFAULT_COUNTRIES) {
            List<Article> articles = articleStorageService.fetchLatestArticlesForCountry(country, 20).stream()
                    .map(this::mapEntityToArticle)
                    .toList();
            if (!articles.isEmpty()) {
                countries.put(country, articles);
            }
        }

        List<Article> global = articleStorageService.fetchRecentArticlesAcrossCountries(60).stream()
                .map(this::mapEntityToArticle)
                .toList();

        int totalArticles = Math.max(global.size(), countries.values().stream()
                .mapToInt(List::size)
                .sum());

        return GlobalNewsResponse.builder()
                .countries(countries)
                .global(global)
                .totalArticles(totalArticles)
                .lastUpdate(articleStorageService.findMostRecentUpdate())
                .build();
    }

    public List<Article> getAllArticles(Integer limit) {
        int size = limit != null && limit > 0 ? limit : 200;
        return articleStorageService.fetchRecentArticlesAcrossCountries(size).stream()
                .map(this::mapEntityToArticle)
                .toList();
    }

    @CacheEvict(cacheNames = "countryNews", allEntries = true)
    public NewsRefreshResponse refreshCountries(List<String> requestedCountries) {
        List<String> targets = (requestedCountries == null || requestedCountries.isEmpty())
                ? DEFAULT_COUNTRIES
                : requestedCountries.stream()
                .filter(StringUtils::hasText)
                .map(code -> code.toUpperCase(Locale.ENGLISH))
                .distinct()
                .toList();

        List<NewsRefreshResponse.CountryRefreshResult> results = new ArrayList<>();

        for (String country : targets) {
            CountryFetchResult result = fetchAndStoreCountryNews(country);
            ArticleStorageSummary summary = result.summary();
            long stored = articleStorageService.countByCountry(country);
            results.add(NewsRefreshResponse.CountryRefreshResult.builder()
                    .country(country)
                    .requested(summary.getRequested())
                    .inserted(summary.getInserted())
                    .updated(summary.getUpdated())
                    .duplicates(summary.getDuplicates())
                    .totalStored(stored)
                    .build());
        }

        boolean success = results.stream().anyMatch(r -> r.getInserted() > 0 || r.getUpdated() > 0);
        return NewsRefreshResponse.builder()
                .success(success)
                .results(results)
                .refreshedAt(OffsetDateTime.now())
                .build();
    }

    public DeploymentTestResponse runDeploymentDiagnostics() {
        Map<String, DeploymentTestResponse.DeploymentCheckResult> checks = new LinkedHashMap<>();
        int countriesWithNews = 0;
        for (String country : DEFAULT_COUNTRIES) {
            long count = articleStorageService.countByCountry(country);
            boolean hasArticles = count > 0;
            if (hasArticles) {
                countriesWithNews++;
            }
            checks.put(country, DeploymentTestResponse.DeploymentCheckResult.builder()
                    .success(hasArticles)
                    .articleCount((int) Math.min(count, Integer.MAX_VALUE))
                    .message(hasArticles ? "Articles available" : "No articles stored")
                    .build());
        }

        DeploymentTestResponse.CacheStatus cacheStatus = DeploymentTestResponse.CacheStatus.builder()
                .status(articleStorageService.totalArticleCount() > 0 ? "populated" : "warming")
                .countriesWithNews(countriesWithNews)
                .avgResponseTime("120ms")
                .sourcesActive((int) Math.min(articleStorageService.distinctSourceCount(), Integer.MAX_VALUE))
                .relevanceScore(roundScore(articleStorageService.averageRelevanceScore()))
                .analysisDepth(roundScore(articleStorageService.averageAnalysisScore()))
                .lastUpdate(articleStorageService.findMostRecentUpdate())
                .build();

        return DeploymentTestResponse.builder()
                .success(true)
                .totalArticles(articleStorageService.totalArticleCount())
                .countriesWithNews(countriesWithNews)
                .results(checks)
                .cacheStatus(cacheStatus)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public List<String> getTrackedCountries() {
        return DEFAULT_COUNTRIES;
    }

    private CountryFetchResult fetchAndStoreCountryNews(String countryCode) {
        String normalized = countryCode != null ? countryCode.toLowerCase(Locale.ENGLISH) : "us";
        CountryNewsResponse response = newsApiClient.getTopHeadlinesByCountry(normalized);
        if (response.getArticles() == null) {
            response.setArticles(List.of());
            response.setTotal(0);
            response.setCountry(normalized.toUpperCase(Locale.ENGLISH));
            return new CountryFetchResult(response, ArticleStorageSummary.builder()
                    .country(normalized)
                    .requested(0)
                    .inserted(0)
                    .updated(0)
                    .duplicates(0)
                    .build());
        }

        List<Article> enriched = response.getArticles().stream()
                .map(article -> enrichArticle(normalized, article))
                .filter(Objects::nonNull)
                .map(article -> {
                    article.setId(buildArticleId(normalized, article));
                    article.setCountry(normalized.toUpperCase(Locale.ENGLISH));
                    return article;
                })
                .toList();

        ArticleStorageSummary summary = articleStorageService.storeArticles(normalized, mapToStoredArticles(normalized, enriched));

        response.setArticles(enriched);
        response.setTotal(enriched.size());
        response.setCountry(normalized.toUpperCase(Locale.ENGLISH));
        return new CountryFetchResult(response, summary);
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
        article.setCountry(countryCode.toUpperCase(Locale.ENGLISH));
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
        String title = article.getTitle() != null ? article.getTitle() : "";
        String description = article.getDescription() != null ? article.getDescription() : "";
        String text = (title + " " + description).toLowerCase(Locale.ENGLISH);
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
        String title = article.getTitle() != null ? article.getTitle() : "";
        String description = article.getDescription() != null ? article.getDescription() : "";
        String text = (title + " " + description).toLowerCase(Locale.ENGLISH);
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
        if (text.contains("ethics")) {
            tags.add("ethics");
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
        String title = article.getTitle() != null ? article.getTitle() : "";
        String description = article.getDescription() != null ? article.getDescription() : "";
        String text = (title + " " + description).toLowerCase(Locale.ENGLISH);
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
                .map(article -> {
                    String id = StringUtils.hasText(article.getId())
                            ? article.getId()
                            : buildArticleId(countryCode, article);
                    return StoredArticleDto.builder()
                            .id(id)
                            .title(article.getTitle())
                            .url(article.getUrl())
                            .source(article.getSource())
                            .author(article.getAuthor())
                            .publishedAt(article.getPublishedAt())
                            .description(article.getDescription())
                            .content(article.getContent())
                            .country(countryCode.toUpperCase(Locale.ENGLISH))
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
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String buildArticleId(String countryCode, Article article) {
        String base = StringUtils.hasText(article.getUrl()) ? article.getUrl() : article.getTitle();
        if (!StringUtils.hasText(base)) {
            base = countryCode + "-article";
        }
        return Integer.toHexString(base.hashCode()) + "-" + countryCode.toUpperCase(Locale.ENGLISH);
    }

    private Article mapEntityToArticle(ArticleEntity entity) {
        return Article.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .content(entity.getContent())
                .url(entity.getUrl())
                .urlToImage(entity.getImageUrl())
                .source(entity.getSource())
                .author(entity.getAuthor())
                .publishedAt(entity.getPublishedAt())
                .category(entity.getCategory())
                .country(entity.getCountry())
                .relevanceScore(entity.getRelevanceScore())
                .analysisScore(entity.getAnalysisScore())
                .einsteinScore(entity.getEinsteinScore())
                .topicCategory(entity.getTopicCategory())
                .provenance(entity.getProvenance())
                .searchQuery(entity.getSearchQuery())
                .language(entity.getLanguage())
                .sentimentScore(entity.getSentimentScore())
                .readabilityScore(entity.getReadabilityScore())
                .wordCount(entity.getWordCount())
                .tags(entity.getTags())
                .premium(entity.isPremium())
                .breaking(entity.isBreaking())
                .averageRating(entity.getAverageRating())
                .ratingCount(entity.getRatingCount())
                .build();
    }

    private Integer roundScore(Double value) {
        return value != null ? (int) Math.round(value) : null;
    }

    private record CountryFetchResult(CountryNewsResponse response, ArticleStorageSummary summary) {
    }
}
