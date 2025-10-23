package com.caio.websiteai.game.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GameSubmissionRequest {
    @NotBlank(message = "Article URL is required")
    @Size(max = 2048, message = "URL is too long")
    private String url;

    @NotBlank(message = "Country code is required")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Country must be a 2-letter code")
    private String country;

    @Size(max = 255, message = "User identifier must be 255 characters or fewer")
    private String userId;

    @Size(max = 255, message = "Article title must be 255 characters or fewer")
    private String articleTitle;

    @Size(max = 255, message = "Article source must be 255 characters or fewer")
    private String articleSource;

    @Min(value = 0, message = "Points cannot be negative")
    @Max(value = 100, message = "Points must be realistic")
    private Integer points;
}
