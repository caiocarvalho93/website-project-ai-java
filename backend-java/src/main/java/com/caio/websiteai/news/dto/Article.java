package com.caio.websiteai.news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private String source;
    private String author;
    private String title;
    private String description;
    private String url;
    private String urlToImage;
    private OffsetDateTime publishedAt;
    private String content;
    private String category;
    private Integer relevanceScore;
    private Integer analysisScore;
    private BigDecimal einsteinScore;
    private String topicCategory;
    private String provenance;
    private String searchQuery;
    private String language;
    private BigDecimal sentimentScore;
    private Integer readabilityScore;
    private Integer wordCount;
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    private Boolean premium;
    private Boolean breaking;
}
