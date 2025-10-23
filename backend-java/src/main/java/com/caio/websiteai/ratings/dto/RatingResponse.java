package com.caio.websiteai.ratings.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RatingResponse {
    String articleId;
    int rating;
    double averageRating;
    int ratingCount;
    String message;
}
