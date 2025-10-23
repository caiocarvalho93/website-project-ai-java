package com.caio.websiteai.article.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Value
@Builder
public class StoredArticleDto {
    String id;
    String title;
    String url;
    String source;
    String author;
    OffsetDateTime publishedAt;
    String description;
    String content;
    String country;
    String category;
    Integer relevanceScore;
    Integer analysisScore;
    BigDecimal einsteinScore;
    String topicCategory;
    String provenance;
    String searchQuery;
    String language;
    BigDecimal sentimentScore;
    Integer readabilityScore;
    Integer wordCount;
    String imageUrl;
    List<String> tags;
    boolean premium;
    boolean breaking;
}
