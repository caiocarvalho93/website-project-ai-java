package com.caio.websiteai.article.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ArticleStorageSummary {
    String country;
    int requested;
    int inserted;
    int updated;
    int duplicates;
}
