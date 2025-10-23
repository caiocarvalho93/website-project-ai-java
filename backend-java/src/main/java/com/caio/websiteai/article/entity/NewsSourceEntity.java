package com.caio.websiteai.article.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
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
@Table(name = "news_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsSourceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255, nullable = false, unique = true)
    private String name;

    @Column(length = 255)
    private String domain;

    @Column(name = "credibility_score")
    private Integer credibilityScore;

    @Column(name = "bias_score", precision = 3, scale = 2)
    private BigDecimal biasScore;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "news_source_focus_areas", joinColumns = @JoinColumn(name = "news_source_id"))
    @Column(name = "focus_area")
    @Builder.Default
    private List<String> focusAreas = new ArrayList<>();

    @Column(name = "api_source", length = 50)
    private String apiSource;

    @Column(name = "is_premium")
    private boolean premium;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "article_count")
    private Integer articleCount;

    @Column(name = "avg_quality_score", precision = 5, scale = 2)
    private BigDecimal averageQualityScore;

    @Column(name = "last_article_date")
    private OffsetDateTime lastArticleDate;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
        if (articleCount == null) {
            articleCount = 0;
        }
    }
}
