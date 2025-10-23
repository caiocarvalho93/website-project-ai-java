package com.caio.websiteai.ai.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;

@Value
@Builder
public class AiIntelligenceReport {
    String country;
    String classification;
    String clearanceLevel;
    OffsetDateTime timestamp;
    String status;
    List<String> headlines;
    Analysis analysis;

    @Value
    @Builder
    public static class Analysis {
        List<Topic> keyTopics;
        int headlineCount;
    }

    @Value
    @Builder
    public static class Topic {
        String topic;
        long mentions;
    }
}
