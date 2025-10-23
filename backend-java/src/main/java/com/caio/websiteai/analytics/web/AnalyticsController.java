package com.caio.websiteai.analytics.web;

import com.caio.websiteai.ai.dto.AiIntelligenceReport;
import com.caio.websiteai.ai.service.AiIntelligenceService;
import com.caio.websiteai.analytics.dto.TrendingTopicDto;
import com.caio.websiteai.analytics.service.TrendingTopicService;
import com.caio.websiteai.game.service.GameLeaderboardService;
import com.caio.websiteai.news.dto.Article;
import com.caio.websiteai.news.dto.CountryNewsResponse;
import com.caio.websiteai.news.service.NewsService;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Validated
@RequiredArgsConstructor
public class AnalyticsController {

    private final TrendingTopicService trendingTopicService;
    private final AiIntelligenceService aiIntelligenceService;
    private final NewsService newsService;
    private final GameLeaderboardService gameLeaderboardService;

    @GetMapping("/trending-topics")
    public ResponseEntity<List<TrendingTopicDto>> trendingTopics() {
        return ResponseEntity.ok(trendingTopicService.getTrendingTopics());
    }

    @GetMapping("/intelligence/{countryCode}")
    public ResponseEntity<AiIntelligenceReport> intelligenceReport(
            @PathVariable("countryCode")
            @Pattern(regexp = "^[A-Za-z]{2}$", message = "Use 2-letter country code, e.g., US")
            String countryCode
    ) {
        CountryNewsResponse response = newsService.getCountryNews(countryCode.toLowerCase());
        List<String> headlines = response.getArticles().stream()
                .map(Article::getTitle)
                .filter(title -> title != null && !title.isBlank())
                .collect(Collectors.toList());
        AiIntelligenceReport report = aiIntelligenceService.generateReport(countryCode.toLowerCase(), headlines);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/ai-leaderboard")
    public ResponseEntity<List<GameLeaderboardService.LeaderboardEntry>> aiLeaderboard() {
        return ResponseEntity.ok(gameLeaderboardService.getEnhancedLeaderboard());
    }
}
