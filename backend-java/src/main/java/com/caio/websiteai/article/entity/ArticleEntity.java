package com.caio.websiteai.article.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleEntity {

    @Id
    @Column(length = 255, nullable = false)
    private String id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false, unique = true)
    private String url;

    @Column(length = 255)
    private String source;

    @Column(length = 255)
    private String author;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 10)
    private String country;

    @Column(length = 50)
    private String category;

    @Column(name = "rel_score")
    private Integer relevanceScore;

    @Column(name = "ana_score")
    private Integer analysisScore;

    @Column(name = "einstein_score", precision = 5, scale = 2)
    private BigDecimal einsteinScore;

    @Column(name = "topic_category", length = 100)
    private String topicCategory;

    @Column(length = 100)
    private String provenance;

    @Column(name = "search_query", columnDefinition = "TEXT")
    private String searchQuery;

    @Column(length = 10)
    private String language;

    @Column(name = "sentiment_score", precision = 3, scale = 2)
    private BigDecimal sentimentScore;

    @Column(name = "readability_score")
    private Integer readabilityScore;

    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "article_tags", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "is_premium")
    private boolean premium;

    @Column(name = "is_breaking")
    private boolean breaking;

    @Column(name = "view_count")
    private Integer viewCount;

    @Column(name = "share_count")
    private Integer shareCount;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "archived_at")
    private OffsetDateTime archivedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (language == null) {
            language = "en";
        }
        if (viewCount == null) {
            viewCount = 0;
        }
        if (shareCount == null) {
            shareCount = 0;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
