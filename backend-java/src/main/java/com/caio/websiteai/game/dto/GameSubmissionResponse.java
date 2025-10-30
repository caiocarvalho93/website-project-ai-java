package com.caio.websiteai.game.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GameSubmissionResponse {
    String country;
    int pointsAwarded;
    int newScore;
    int totalSubmissions;
    boolean duplicate;
    String message;
}
