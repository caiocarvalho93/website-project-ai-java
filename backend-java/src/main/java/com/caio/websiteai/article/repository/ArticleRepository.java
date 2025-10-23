package com.caio.websiteai.article.repository;

import com.caio.websiteai.article.entity.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<ArticleEntity, String> {

    Optional<ArticleEntity> findByUrl(String url);

    @Query("SELECT a.topicCategory AS topic, COUNT(a) AS articleCount, AVG(COALESCE(a.relevanceScore,0) + COALESCE(a.analysisScore,0)) AS avgScore, MAX(a.publishedAt) AS latestArticle " +
            "FROM ArticleEntity a WHERE a.topicCategory IS NOT NULL AND a.publishedAt > :after GROUP BY a.topicCategory " +
            "ORDER BY COUNT(a) DESC, AVG(COALESCE(a.relevanceScore,0) + COALESCE(a.analysisScore,0)) DESC")
    List<TrendingTopicProjection> findTrendingTopics(@Param("after") OffsetDateTime after);

    interface TrendingTopicProjection {
        String getTopic();
        Long getArticleCount();
        Double getAvgScore();
        OffsetDateTime getLatestArticle();
    }
}
