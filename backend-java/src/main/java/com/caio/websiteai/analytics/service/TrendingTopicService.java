package com.caio.websiteai.analytics.service;

import com.caio.websiteai.analytics.dto.TrendingTopicDto;
import com.caio.websiteai.article.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrendingTopicService {

    private final ArticleRepository articleRepository;

    public List<TrendingTopicDto> getTrendingTopics() {
        OffsetDateTime sevenDaysAgo = OffsetDateTime.now().minusDays(7);
        return articleRepository.findTrendingTopics(sevenDaysAgo).stream()
                .map(projection -> TrendingTopicDto.builder()
                        .topic(projection.getTopic())
                        .articleCount(projection.getArticleCount() != null ? projection.getArticleCount() : 0L)
                        .averageScore(projection.getAvgScore() != null ? projection.getAvgScore() : 0.0)
                        .latestArticle(projection.getLatestArticle())
                        .build())
                .collect(Collectors.toList());
    }
}
