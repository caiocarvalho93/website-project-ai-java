package com.caio.websiteai.news.web;

import com.caio.websiteai.news.dto.Article;
import com.caio.websiteai.news.dto.CountryNewsResponse;
import com.caio.websiteai.news.dto.GlobalNewsResponse;
import com.caio.websiteai.news.dto.NewsFeedResponse;
import com.caio.websiteai.news.dto.NewsRefreshRequest;
import com.caio.websiteai.news.dto.NewsRefreshResponse;
import com.caio.websiteai.news.service.NewsService;
import com.caio.websiteai.ratings.dto.RatingRequest;
import com.caio.websiteai.ratings.dto.RatingResponse;
import com.caio.websiteai.ratings.service.RatingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CountryNewsController {

    private final NewsService newsService;
    private final RatingService ratingService;

    @GetMapping("/news")
    public ResponseEntity<NewsFeedResponse> news(@RequestParam(value = "limit", required = false) Integer limit) {
        return ResponseEntity.ok(newsService.getLatestNewsFeed(limit));
    }

    @GetMapping("/global-news")
    public ResponseEntity<GlobalNewsResponse> globalNews() {
        return ResponseEntity.ok(newsService.getGlobalNewsFeed());
    }

    @PostMapping("/refresh-news")
    public ResponseEntity<NewsRefreshResponse> refreshNews(@Valid @RequestBody(required = false) NewsRefreshRequest request) {
        return ResponseEntity.ok(newsService.refreshCountries(request != null ? request.getCountries() : null));
    }

    @PostMapping({"/cache/force-refresh", "/simple-refresh"})
    public ResponseEntity<NewsRefreshResponse> forceRefresh(@Valid @RequestBody(required = false) NewsRefreshRequest request) {
        return ResponseEntity.ok(newsService.refreshCountries(request != null ? request.getCountries() : null));
    }

    @GetMapping("/articles")
    public ResponseEntity<List<Article>> articles(@RequestParam(value = "limit", required = false) Integer limit) {
        return ResponseEntity.ok(newsService.getAllArticles(limit));
    }

    @GetMapping("/country-news/{code}")
    public ResponseEntity<CountryNewsResponse> countryNews(
            @PathVariable("code")
            @Pattern(regexp = "^[A-Za-z]{2}$", message = "Use 2-letter country code, e.g., US")
            String code
    ) {
        return ResponseEntity.ok(newsService.getCountryNews(code.toUpperCase()));
    }

    @PostMapping("/ratings")
    public ResponseEntity<RatingResponse> submitRating(@Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.submitRating(request));
    }

    @PostMapping("/article/{articleId}/rate")
    public ResponseEntity<RatingResponse> rateArticle(
            @PathVariable("articleId") String articleId,
            @Valid @RequestBody RatingRequest request
    ) {
        request.setArticleId(articleId);
        return ResponseEntity.ok(ratingService.submitRating(request));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("ok", true);
        payload.put("status", "OPERATIONAL");
        payload.put("timestamp", OffsetDateTime.now());
        payload.put("trackedCountries", newsService.getTrackedCountries());
        return ResponseEntity.ok(payload);
    }
}
