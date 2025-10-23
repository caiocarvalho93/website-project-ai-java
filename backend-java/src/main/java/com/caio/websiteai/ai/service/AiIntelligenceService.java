package com.caio.websiteai.ai.service;

import com.caio.websiteai.ai.dto.AiIntelligenceReport;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiIntelligenceService {

    public AiIntelligenceReport generateReport(String countryCode, List<String> headlines) {
        if (CollectionUtils.isEmpty(headlines)) {
            return AiIntelligenceReport.builder()
                    .country(countryCode)
                    .classification("ULTRA SECRET - EIN-7734")
                    .clearanceLevel("ALPHA-7")
                    .timestamp(OffsetDateTime.now())
                    .status("AWAITING_DATA")
                    .headlines(List.of())
                    .analysis(AiIntelligenceReport.Analysis.builder()
                            .keyTopics(List.of())
                            .headlineCount(0)
                            .build())
                    .build();
        }

        List<String> sanitizedHeadlines = headlines.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .toList();

        if (sanitizedHeadlines.isEmpty()) {
            return AiIntelligenceReport.builder()
                    .country(countryCode)
                    .classification("ULTRA SECRET - EIN-7734")
                    .clearanceLevel("ALPHA-7")
                    .timestamp(OffsetDateTime.now())
                    .status("AWAITING_DATA")
                    .headlines(List.of())
                    .analysis(AiIntelligenceReport.Analysis.builder()
                            .keyTopics(List.of())
                            .headlineCount(0)
                            .build())
                    .build();
        }

        Map<String, Long> topicMentions = extractKeyTopics(sanitizedHeadlines);
        List<AiIntelligenceReport.Topic> topics = topicMentions.entrySet().stream()
                .map(entry -> AiIntelligenceReport.Topic.builder()
                        .topic(entry.getKey())
                        .mentions(entry.getValue())
                        .build())
                .sorted(Comparator.comparingLong(AiIntelligenceReport.Topic::getMentions).reversed())
                .limit(3)
                .collect(Collectors.toList());

        return AiIntelligenceReport.builder()
                .country(countryCode)
                .classification("ULTRA SECRET - EIN-7734")
                .clearanceLevel("ALPHA-7")
                .timestamp(OffsetDateTime.now())
                .status("OPERATIONAL")
                .headlines(sanitizedHeadlines.stream().limit(5).toList())
                .analysis(AiIntelligenceReport.Analysis.builder()
                        .keyTopics(topics)
                        .headlineCount(sanitizedHeadlines.size())
                        .build())
                .build();
    }

    private Map<String, Long> extractKeyTopics(List<String> headlines) {
        String[] keywords = {"AI", "technology", "economy", "politics", "security", "innovation"};
        List<String> normalized = headlines.stream()
                .map(s -> s.toLowerCase(Locale.ENGLISH))
                .toList();

        return java.util.Arrays.stream(keywords)
                .collect(Collectors.toMap(
                        keyword -> keyword,
                        keyword -> normalized.stream()
                                .filter(headline -> headline.contains(keyword.toLowerCase(Locale.ENGLISH)))
                                .count()))
                .entrySet().stream()
                .filter(entry -> entry.getValue() > 0)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (left, right) -> left,
                        java.util.LinkedHashMap::new
                ));
    }
}
