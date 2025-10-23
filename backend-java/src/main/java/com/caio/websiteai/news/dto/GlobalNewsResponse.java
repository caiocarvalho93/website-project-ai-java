package com.caio.websiteai.news.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Value
@Builder
public class GlobalNewsResponse {
    Map<String, List<Article>> countries;
    List<Article> global;
    int totalArticles;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    OffsetDateTime lastUpdate;
}
