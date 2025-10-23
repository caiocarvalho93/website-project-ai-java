package com.caio.websiteai.article.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "api_usage_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsageLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_provider", length = 50)
    private String apiProvider;

    @Column(name = "api_key_index")
    private Integer apiKeyIndex;

    @Column(name = "endpoint", length = 255)
    private String endpoint;

    @Column(name = "query_params", columnDefinition = "TEXT")
    private String queryParams;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "response_size")
    private Integer responseSize;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(name = "cost_estimate", precision = 10, scale = 4)
    private BigDecimal costEstimate;

    @Column(name = "articles_returned")
    private Integer articlesReturned;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "rate_limited")
    private Boolean rateLimited;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public static ApiUsageLogEntity forBatchStorage(String endpoint, int articles) {
        return ApiUsageLogEntity.builder()
                .apiProvider("batch_storage")
                .endpoint(endpoint)
                .articlesReturned(articles)
                .createdAt(OffsetDateTime.now())
                .build();
    }
}
