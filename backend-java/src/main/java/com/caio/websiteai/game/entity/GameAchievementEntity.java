package com.caio.websiteai.game.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "game_achievements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameAchievementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255, nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String icon;

    @Column(name = "points_required")
    private Integer pointsRequired;

    @Column(name = "submissions_required")
    private Integer submissionsRequired;

    @Column(name = "streak_required")
    private Integer streakRequired;

    @Column(name = "country_specific")
    private Boolean countrySpecific;

    @Column(name = "is_active")
    private Boolean active;

    @Column(length = 20)
    private String rarity;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
