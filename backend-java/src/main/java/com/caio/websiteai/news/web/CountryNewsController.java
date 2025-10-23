package com.caio.websiteai.news.web;

import com.caio.websiteai.news.dto.CountryNewsResponse;
import com.caio.websiteai.news.service.NewsService;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Validated
@CrossOrigin(origins = "*")
public class CountryNewsController {

    private final NewsService newsService;

    public CountryNewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/country-news/{code}")
    public ResponseEntity<CountryNewsResponse> countryNews(
            @PathVariable("code")
            @Pattern(regexp = "^[A-Za-z]{2}$", message = "Use 2-letter country code, e.g., US")
            String code
    ) {
        return ResponseEntity.ok(newsService.getCountryNews(code.toLowerCase()));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
