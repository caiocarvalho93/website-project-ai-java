package com.caio.websiteai.game.web;

import com.caio.websiteai.game.service.GameLeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
@RequiredArgsConstructor
public class GameController {

    private final GameLeaderboardService gameLeaderboardService;

    @GetMapping("/game/scores")
    public ResponseEntity<Map<String, Integer>> scores() {
        return ResponseEntity.ok(gameLeaderboardService.getGameScores());
    }

    @GetMapping("/fans-race/leaderboard")
    public ResponseEntity<List<GameLeaderboardService.LeaderboardEntry>> leaderboard() {
        return ResponseEntity.ok(gameLeaderboardService.getEnhancedLeaderboard());
    }
}
