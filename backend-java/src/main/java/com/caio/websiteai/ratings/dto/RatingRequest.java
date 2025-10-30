package com.caio.websiteai.ratings.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RatingRequest {
    @NotBlank(message = "Article ID is required")
    private String articleId;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Min(value = 0, message = "Relevance score must be 0-100")
    @Max(value = 100, message = "Relevance score must be 0-100")
    private Integer relScore;

    @Min(value = 0, message = "Analysis score must be 0-100")
    @Max(value = 100, message = "Analysis score must be 0-100")
    private Integer anaScore;

    @Size(max = 1000, message = "Comments must be 1000 characters or fewer")
    private String comment;

    @Size(max = 255, message = "User identifier must be 255 characters or fewer")
    private String userId;
}
