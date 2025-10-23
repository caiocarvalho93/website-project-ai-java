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

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

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

    @GetMapping("/global-news")
    public ResponseEntity<Map<String, Object>> globalNews() {
        try {
            // Get news from multiple countries
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> countries = new HashMap<>();
            
            // Get news from major countries
            String[] countryCodes = {"us", "gb", "de", "fr", "jp", "ca"};
            List<Object> allArticles = new ArrayList<>();
            
            for (String code : countryCodes) {
                try {
                    CountryNewsResponse countryNews = newsService.getCountryNews(code);
                    countries.put(code.toUpperCase(), countryNews.getArticles());
                    allArticles.addAll(countryNews.getArticles());
                } catch (Exception e) {
                    // Continue with other countries if one fails
                    System.err.println("Failed to get news for " + code + ": " + e.getMessage());
                }
            }
            
            response.put("countries", countries);
            response.put("global", allArticles);
            response.put("lastUpdate", java.time.Instant.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Return empty response if everything fails
            Map<String, Object> emptyResponse = new HashMap<>();
            emptyResponse.put("countries", new HashMap<>());
            emptyResponse.put("global", new ArrayList<>());
            emptyResponse.put("lastUpdate", java.time.Instant.now().toString());
            emptyResponse.put("error", e.getMessage());
            return ResponseEntity.ok(emptyResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
