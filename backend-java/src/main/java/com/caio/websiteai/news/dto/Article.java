package com.caio.websiteai.news.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Article {
    private String id;
    private String source;
    private String author;
    private String title;
    private String description;
    private String url;
    private String urlToImage;
    private OffsetDateTime publishedAt;
    private String content;
    private String category;
    private String country;
    @JsonProperty("relScore")
    private Integer relevanceScore;
    @JsonProperty("anaScore")
    private Integer analysisScore;
    @JsonProperty("intelligenceScore")
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
    private BigDecimal averageRating;
    private Integer ratingCount;
}
