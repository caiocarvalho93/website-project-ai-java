package com.caio.websiteai.news.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;

@Value
@Builder
public class NewsRefreshResponse {
    boolean success;
    List<CountryRefreshResult> results;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    OffsetDateTime refreshedAt;

    @Value
    @Builder
    public static class CountryRefreshResult {
        String country;
        int requested;
        int inserted;
        int updated;
        int duplicates;
        long totalStored;
    }
}
