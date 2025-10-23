package com.caio.websiteai.game.service;

import com.caio.websiteai.game.entity.GameScoreEntity;
import com.caio.websiteai.game.repository.GameScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameLeaderboardService {

    private final GameScoreRepository gameScoreRepository;

    @Transactional(readOnly = true)
    public Map<String, Integer> getGameScores() {
        return gameScoreRepository.findAllByOrderByScoreDesc().stream()
                .collect(Collectors.toMap(
                        GameScoreEntity::getCountry,
                        score -> score.getScore() != null ? score.getScore() : 0,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getEnhancedLeaderboard() {
        return gameScoreRepository.fetchLeaderboard().stream()
                .map(row -> new LeaderboardEntry(
                        row.getCountry(),
                        defaultInt(row.getScore()),
                        defaultInt(row.getTotalSubmissions()),
                        defaultInt(row.getUniqueContributors()),
                        row.getLastSubmissionAt() != null ? row.getLastSubmissionAt().toInstant().atOffset(ZoneOffset.UTC) : null,
                        defaultInt(row.getRankPosition()),
                        defaultInt(row.getDailyScore()),
                        defaultInt(row.getWeeklyScore()),
                        defaultInt(row.getMonthlyScore()),
                        row.getAchievementCount() != null ? row.getAchievementCount() : 0L
                ))
                .toList();
    }

    private int defaultInt(Integer value) {
        return value != null ? value : 0;
    }

    public record LeaderboardEntry(
            String country,
            int score,
            int totalSubmissions,
            int uniqueContributors,
            OffsetDateTime lastSubmissionAt,
            int rankPosition,
            int dailyScore,
            int weeklyScore,
            int monthlyScore,
            long achievementCount
    ) {
    }
}
