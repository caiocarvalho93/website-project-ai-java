package com.caio.websiteai.news.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.Map;

@Value
@Builder
public class DeploymentTestResponse {
    boolean success;
    long totalArticles;
    int countriesWithNews;
    Map<String, DeploymentCheckResult> results;
    CacheStatus cacheStatus;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    OffsetDateTime timestamp;

    @Value
    @Builder
    public static class DeploymentCheckResult {
        boolean success;
        int articleCount;
        String message;
    }

    @Value
    @Builder
    public static class CacheStatus {
        String status;
        int countriesWithNews;
        String avgResponseTime;
        int sourcesActive;
        Integer relevanceScore;
        Integer analysisDepth;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime lastUpdate;
    }
}
