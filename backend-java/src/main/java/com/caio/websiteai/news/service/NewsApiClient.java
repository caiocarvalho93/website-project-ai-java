package com.caio.websiteai.news.service;

import com.caio.websiteai.news.dto.Article;
import com.caio.websiteai.news.dto.CountryNewsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NewsApiClient {

    private final RestClient restClient;

    @Value("${news.api.base-url}")
    private String baseUrl;

    @Value("${news.api.key:}")
    private String apiKey;

    public CountryNewsResponse getTopHeadlinesByCountry(String countryCode) {
        record Source(String id, String name) {}
        record RawArticle(Source source, String author, String title, String description,
                          String url, String urlToImage, String publishedAt, String content) {}
        record RawResponse(String status, int totalResults, List<RawArticle> articles) {}

        String requestUrl = baseUrl.endsWith("/") ? baseUrl + "top-headlines" : baseUrl + "/top-headlines";

        RawResponse raw = restClient.get()
                .uri(requestUrl + "?country=" + countryCode + "&pageSize=50")
                .accept(MediaType.APPLICATION_JSON)
                .header("X-Api-Key", apiKey)
                .retrieve()
                .body(RawResponse.class);
        if (raw == null || raw.articles() == null) {
            return CountryNewsResponse.builder()
                    .country(countryCode)
                    .total(0)
                    .articles(List.of())
                    .build();
        }

        List<Article> mapped = raw.articles().stream().map(a ->
                Article.builder()
                        .source(a.source() != null ? a.source().name() : null)
                        .author(a.author())
                        .title(a.title())
                        .description(a.description())
                        .url(a.url())
                        .urlToImage(a.urlToImage())
                        .publishedAt(parseDate(a.publishedAt()))
                        .content(a.content())
                        .language("en")
                        .provenance("newsapi")
                        .premium(Boolean.FALSE)
                        .breaking(Boolean.FALSE)
                        .build()
        ).toList();

        return CountryNewsResponse.builder()
                .country(countryCode)
                .total(mapped.size())
                .articles(mapped)
                .build();
    }

    private static OffsetDateTime parseDate(String s) {
        try { return s == null ? null : OffsetDateTime.parse(s); }
        catch (Exception e) { return null; }
    }
}
