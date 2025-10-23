package com.caio.websiteai.ratings.service;

import com.caio.websiteai.article.entity.ArticleEntity;
import com.caio.websiteai.article.repository.ArticleRepository;
import com.caio.websiteai.ratings.dto.RatingRequest;
import com.caio.websiteai.ratings.dto.RatingResponse;
import com.caio.websiteai.ratings.entity.ArticleRatingEntity;
import com.caio.websiteai.ratings.repository.ArticleRatingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final ArticleRepository articleRepository;
    private final ArticleRatingRepository ratingRepository;

    @Transactional
    public RatingResponse submitRating(RatingRequest request) {
        if (!StringUtils.hasText(request.getArticleId())) {
            throw new IllegalArgumentException("Article ID is required");
        }

        ArticleEntity article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));

        int normalizedRating = resolveRating(request);

        ArticleRatingEntity ratingEntity = ArticleRatingEntity.builder()
                .articleId(request.getArticleId())
                .rating(normalizedRating)
                .comment(request.getComment())
                .userId(request.getUserId())
                .relScore(request.getRelScore())
                .anaScore(request.getAnaScore())
                .build();
        ratingRepository.save(ratingEntity);

        int currentCount = article.getRatingCount() == null ? 0 : article.getRatingCount();
        int currentTotal = article.getRatingTotal() == null ? 0 : article.getRatingTotal();

        int newCount = currentCount + 1;
        int newTotal = currentTotal + normalizedRating;
        BigDecimal average = BigDecimal.valueOf((double) newTotal / newCount)
                .setScale(2, RoundingMode.HALF_UP);

        article.setRatingCount(newCount);
        article.setRatingTotal(newTotal);
        article.setAverageRating(average);
        articleRepository.save(article);

        return RatingResponse.builder()
                .articleId(request.getArticleId())
                .rating(normalizedRating)
                .averageRating(average.doubleValue())
                .ratingCount(newCount)
                .message("Rating submitted")
                .build();
    }

    private int resolveRating(RatingRequest request) {
        if (request.getRating() != null) {
            return Math.max(1, Math.min(5, request.getRating()));
        }

        int rel = request.getRelScore() != null ? request.getRelScore() : 50;
        int ana = request.getAnaScore() != null ? request.getAnaScore() : 50;
        int composite = Math.max(0, Math.min(100, (rel + ana) / 2));
        int scaled = Math.round(composite / 20.0f);
        return Math.max(1, Math.min(5, scaled == 0 ? 1 : scaled));
    }
}
