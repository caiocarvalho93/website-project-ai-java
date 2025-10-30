package com.caio.websiteai.game.web;

import com.caio.websiteai.game.dto.GameSubmissionRequest;
import com.caio.websiteai.game.dto.GameSubmissionResponse;
import com.caio.websiteai.game.service.GameLeaderboardService;
import com.caio.websiteai.game.service.GameSubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
@RequiredArgsConstructor
public class GameController {

    private final GameLeaderboardService gameLeaderboardService;
    private final GameSubmissionService gameSubmissionService;

    @GetMapping({"/game/scores", "/game-scores"})
    public ResponseEntity<Map<String, Integer>> scores() {
        return ResponseEntity.ok(gameLeaderboardService.getGameScores());
    }

    @PostMapping({"/game-submit", "/fans-race/submit"})
    public ResponseEntity<GameSubmissionResponse> submit(@Valid @RequestBody GameSubmissionRequest request) {
        return ResponseEntity.ok(gameSubmissionService.submit(request));
    }

    @GetMapping("/fans-race/leaderboard")
    public ResponseEntity<Map<String, Object>> leaderboard() {
        List<GameLeaderboardService.LeaderboardEntry> leaderboard = gameLeaderboardService.getEnhancedLeaderboard();
        Map<String, Object> payload = new HashMap<>();
        payload.put("leaderboard", leaderboard);
        payload.put("totalSubmissions", gameSubmissionService.totalSubmissions());
        return ResponseEntity.ok(payload);
    }
}
