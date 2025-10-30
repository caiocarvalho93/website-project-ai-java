package com.caio.websiteai.article.service;

import com.caio.websiteai.article.dto.ArticleStorageSummary;
import com.caio.websiteai.article.dto.StoredArticleDto;
import com.caio.websiteai.article.entity.ApiUsageLogEntity;
import com.caio.websiteai.article.entity.ArticleEntity;
import com.caio.websiteai.article.entity.NewsSourceEntity;
import com.caio.websiteai.article.repository.ApiUsageLogRepository;
import com.caio.websiteai.article.repository.ArticleRepository;
import com.caio.websiteai.article.repository.NewsSourceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleStorageService {

    private static final Logger log = LoggerFactory.getLogger(ArticleStorageService.class);

    private final ArticleRepository articleRepository;
    private final NewsSourceRepository newsSourceRepository;
    private final ApiUsageLogRepository apiUsageLogRepository;

    @Transactional
    public ArticleStorageSummary storeArticles(String country, List<StoredArticleDto> payload) {
        if (CollectionUtils.isEmpty(payload)) {
            log.info("No articles received for country {}", country);
            return ArticleStorageSummary.builder()
                    .country(country)
                    .requested(0)
                    .inserted(0)
                    .updated(0)
                    .duplicates(0)
                    .build();
        }

        int inserted = 0;
        int updated = 0;
        int duplicates = 0;

        for (StoredArticleDto dto : payload) {
            if (!StringUtils.hasText(dto.getUrl())) {
                continue;
            }

            ArticleEntity entity = articleRepository.findByUrl(dto.getUrl()).orElse(null);
            boolean isNew = entity == null;

            if (isNew) {
                entity = ArticleEntity.builder()
                        .id(generateIdentifier(dto))
                        .url(dto.getUrl())
                        .title(dto.getTitle())
                        .build();
            } else {
                entity.setTitle(dto.getTitle());
            }

            applyArticleData(country, dto, entity);

            try {
                articleRepository.save(entity);
                if (isNew) {
                    inserted++;
                } else {
                    updated++;
                }

                updateNewsSourceStats(dto, entity);
            } catch (DataIntegrityViolationException ex) {
                log.debug("Duplicate article detected for URL {}", dto.getUrl());
                duplicates++;
            } catch (Exception ex) {
                log.warn("Failed to persist article {}: {}", dto.getTitle(), ex.getMessage());
            }
        }

        apiUsageLogRepository.save(ApiUsageLogEntity.forBatchStorage("/store/" + country, payload.size()));

        return ArticleStorageSummary.builder()
                .country(country)
                .requested(payload.size())
                .inserted(inserted)
                .updated(updated)
                .duplicates(duplicates)
                .build();
    }

    private void applyArticleData(String country, StoredArticleDto dto, ArticleEntity entity) {
        entity.setSource(dto.getSource());
        entity.setAuthor(dto.getAuthor());
        entity.setPublishedAt(dto.getPublishedAt());
        entity.setDescription(dto.getDescription());
        entity.setContent(StringUtils.hasText(dto.getContent()) ? dto.getContent() : dto.getDescription());
        entity.setCountry(StringUtils.hasText(country) ? country.toUpperCase(Locale.ENGLISH) : null);
        entity.setCategory(dto.getCategory());
        entity.setRelevanceScore(normalizeScore(dto.getRelevanceScore()));
        entity.setAnalysisScore(normalizeScore(dto.getAnalysisScore()));
        entity.setEinsteinScore(dto.getEinsteinScore());
        entity.setTopicCategory(dto.getTopicCategory());
        entity.setProvenance(dto.getProvenance());
        entity.setSearchQuery(dto.getSearchQuery());
        entity.setLanguage(StringUtils.hasText(dto.getLanguage()) ? dto.getLanguage() : "en");
        entity.setSentimentScore(dto.getSentimentScore());
        entity.setReadabilityScore(dto.getReadabilityScore());
        entity.setWordCount(dto.getWordCount() != null ? dto.getWordCount() : estimateWordCount(dto));
        entity.setImageUrl(dto.getImageUrl());
        entity.setPremium(dto.isPremium());
        entity.setBreaking(dto.isBreaking());
        entity.setTags(new ArrayList<>(dto.getTags() != null ? dto.getTags() : List.of()));
        if (entity.getViewCount() == null) {
            entity.setViewCount(0);
        }
        if (entity.getShareCount() == null) {
            entity.setShareCount(0);
        }
    }

    private Integer normalizeScore(Integer score) {
        if (score == null) {
            return null;
        }
        return Math.max(0, Math.min(100, score));
    }

    private int estimateWordCount(StoredArticleDto dto) {
        if (dto.getContent() != null) {
            return dto.getContent().split("\\s+").length;
        }
        if (dto.getDescription() != null) {
            return dto.getDescription().split("\\s+").length;
        }
        return 0;
    }

    private void updateNewsSourceStats(StoredArticleDto dto, ArticleEntity entity) {
        if (!StringUtils.hasText(entity.getSource())) {
            return;
        }

        String sourceName = entity.getSource().trim();
        NewsSourceEntity source = newsSourceRepository.findByName(sourceName)
                .orElseGet(() -> NewsSourceEntity.builder()
                        .name(sourceName)
                        .domain(extractDomain(entity.getUrl()))
                        .apiSource(StringUtils.hasText(dto.getProvenance()) ? dto.getProvenance() : "newsapi")
                        .premium(dto.isPremium())
                        .build());

        int existingCount = source.getArticleCount() == null ? 0 : source.getArticleCount();
        int updatedCount = existingCount + 1;
        source.setArticleCount(updatedCount);
        if (dto.getRelevanceScore() != null && dto.getAnalysisScore() != null) {
            int totalScore = dto.getRelevanceScore() + dto.getAnalysisScore();
            BigDecimal previous = source.getAverageQualityScore();
            double accumulated = previous != null ? previous.doubleValue() * existingCount : 0.0;
            double newAverage = (accumulated + totalScore) / updatedCount;
            source.setAverageQualityScore(BigDecimal.valueOf(newAverage).setScale(2, RoundingMode.HALF_UP));
        }
        if (entity.getPublishedAt() != null) {
            if (source.getLastArticleDate() == null || entity.getPublishedAt().isAfter(source.getLastArticleDate())) {
                source.setLastArticleDate(entity.getPublishedAt());
            }
        }

        newsSourceRepository.save(source);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ArticleEntity> fetchLatestArticles(int limit) {
        int size = limit != null && limit > 0 ? limit : 50;
        return articleRepository.findAllByOrderByPublishedAtDesc(PageRequest.of(0, size));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ArticleEntity> fetchLatestArticlesForCountry(String country, int limit) {
        int size = limit > 0 ? limit : 20;
        return articleRepository.findByCountryIgnoreCaseOrderByPublishedAtDesc(country, PageRequest.of(0, size));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ArticleEntity> fetchRecentArticlesAcrossCountries(int limit) {
        int size = limit > 0 ? limit : 100;
        return articleRepository.findAllByOrderByPublishedAtDesc(PageRequest.of(0, size));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public OffsetDateTime findMostRecentUpdate() {
        return articleRepository.findFirstByOrderByUpdatedAtDesc()
                .map(ArticleEntity::getUpdatedAt)
                .or(() -> articleRepository.findFirstByOrderByPublishedAtDesc().map(ArticleEntity::getPublishedAt))
                .orElse(null);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public long countByCountry(String country) {
        return articleRepository.countByCountryIgnoreCase(country);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public long totalArticleCount() {
        return articleRepository.count();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public long distinctSourceCount() {
        return articleRepository.countDistinctSources();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Double averageRelevanceScore() {
        return articleRepository.averageRelevanceScore();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Double averageAnalysisScore() {
        return articleRepository.averageAnalysisScore();
    }

    private String generateIdentifier(StoredArticleDto dto) {
        if (StringUtils.hasText(dto.getId())) {
            return dto.getId();
        }
        return "article-" + UUID.randomUUID();
    }

    private String extractDomain(String url) {
        if (!StringUtils.hasText(url)) {
            return null;
        }
        try {
            java.net.URI uri = new java.net.URI(url);
            return uri.getHost();
        } catch (Exception ex) {
            return null;
        }
    }
}
