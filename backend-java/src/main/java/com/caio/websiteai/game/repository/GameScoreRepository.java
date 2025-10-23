package com.caio.websiteai.game.repository;

import com.caio.websiteai.game.entity.GameScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GameScoreRepository extends JpaRepository<GameScoreEntity, String> {

    List<GameScoreEntity> findAllByOrderByScoreDesc();

    @Query(value = """
            SELECT gs.country AS country,
                   gs.score AS score,
                   gs.total_submissions AS totalSubmissions,
                   gs.unique_contributors AS uniqueContributors,
                   gs.last_submission_at AS lastSubmissionAt,
                   gs.rank_position AS rankPosition,
                   gs.daily_score AS dailyScore,
                   gs.weekly_score AS weeklyScore,
                   gs.monthly_score AS monthlyScore,
                   COUNT(ua.id) AS achievementCount
            FROM game_scores gs
            LEFT JOIN game_submissions gsub ON gs.country = gsub.country
            LEFT JOIN user_achievements ua ON gsub.user_id = ua.user_id
            GROUP BY gs.country, gs.score, gs.total_submissions, gs.unique_contributors,
                     gs.last_submission_at, gs.rank_position, gs.daily_score, gs.weekly_score, gs.monthly_score
            ORDER BY gs.score DESC
            LIMIT 20
            """, nativeQuery = true)
    List<LeaderboardProjection> fetchLeaderboard();

    interface LeaderboardProjection {
        String getCountry();
        Integer getScore();
        Integer getTotalSubmissions();
        Integer getUniqueContributors();
        java.sql.Timestamp getLastSubmissionAt();
        Integer getRankPosition();
        Integer getDailyScore();
        Integer getWeeklyScore();
        Integer getMonthlyScore();
        Long getAchievementCount();
    }
}
