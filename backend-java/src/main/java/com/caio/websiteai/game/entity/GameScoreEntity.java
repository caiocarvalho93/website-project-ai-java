package com.caio.websiteai.game.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "game_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameScoreEntity {

    @Id
    @Column(length = 10)
    private String country;

    @Column
    private Integer score;

    @Column(name = "total_submissions")
    private Integer totalSubmissions;

    @Column(name = "unique_contributors")
    private Integer uniqueContributors;

    @Column(name = "avg_points_per_submission")
    private Double averagePointsPerSubmission;

    @Column(name = "last_submission_at")
    private OffsetDateTime lastSubmissionAt;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "rank_change")
    private Integer rankChange;

    @Column(name = "daily_score")
    private Integer dailyScore;

    @Column(name = "weekly_score")
    private Integer weeklyScore;

    @Column(name = "monthly_score")
    private Integer monthlyScore;

    @Column(name = "streak_days")
    private Integer streakDays;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "game_score_achievements", joinColumns = @JoinColumn(name = "country"))
    @Column(name = "achievement")
    @Builder.Default
    private List<String> achievements = new ArrayList<>();

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
