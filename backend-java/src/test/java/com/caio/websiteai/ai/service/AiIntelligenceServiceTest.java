package com.caio.websiteai.ai.service;

import com.caio.websiteai.ai.dto.AiIntelligenceReport;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AiIntelligenceServiceTest {

    private final AiIntelligenceService service = new AiIntelligenceService();

    @Test
    void returnsAwaitingDataWhenNoHeadlines() {
        AiIntelligenceReport report = service.generateReport("us", List.of());
        assertThat(report.getStatus()).isEqualTo("AWAITING_DATA");
        assertThat(report.getAnalysis().getHeadlineCount()).isZero();
    }

    @Test
    void extractsTopTopics() {
        List<String> headlines = List.of(
                "AI policy breakthrough in Europe",
                "Technology companies invest in AI security",
                "AI innovation drives economy forward"
        );

        AiIntelligenceReport report = service.generateReport("us", headlines);

        assertThat(report.getStatus()).isEqualTo("OPERATIONAL");
        assertThat(report.getAnalysis().getHeadlineCount()).isEqualTo(3);
        assertThat(report.getAnalysis().getKeyTopics())
                .extracting(AiIntelligenceReport.Topic::getTopic)
                .contains("AI", "technology", "economy");
    }
}
