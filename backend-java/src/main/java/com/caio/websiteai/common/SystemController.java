package com.caio.websiteai.common;

import com.caio.websiteai.news.dto.DeploymentTestResponse;
import com.caio.websiteai.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemController {

    private final NewsService newsService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> rootHealth() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("ok", true);
        payload.put("status", "OPERATIONAL");
        payload.put("timestamp", OffsetDateTime.now());
        payload.put("trackedCountries", newsService.getTrackedCountries());
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/api/deployment-test")
    public ResponseEntity<DeploymentTestResponse> deploymentTest() {
        return ResponseEntity.ok(newsService.runDeploymentDiagnostics());
    }
}
