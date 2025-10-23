package com.caio.websiteai.ratings.repository;

import com.caio.websiteai.ratings.entity.ArticleRatingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArticleRatingRepository extends JpaRepository<ArticleRatingEntity, Long> {
    List<ArticleRatingEntity> findByArticleId(String articleId);
    long countByArticleId(String articleId);
}
