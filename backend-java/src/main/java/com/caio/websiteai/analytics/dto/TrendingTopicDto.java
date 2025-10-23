package com.caio.websiteai.analytics.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;

@Value
@Builder
public class TrendingTopicDto {
    String topic;
    long articleCount;
    double averageScore;
    OffsetDateTime latestArticle;
}
