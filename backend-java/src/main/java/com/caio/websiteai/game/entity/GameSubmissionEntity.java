package com.caio.websiteai.game.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "game_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameSubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false, unique = true)
    private String url;

    @Column(length = 10, nullable = false)
    private String country;

    @Column(name = "user_id", length = 255)
    private String userId;

    @Column(name = "user_ip", length = 255)
    private String userIp;

    @Column
    private Integer points;

    @Column(name = "point_breakdown", columnDefinition = "TEXT")
    private String pointBreakdown;

    @Column(name = "article_title", columnDefinition = "TEXT")
    private String articleTitle;

    @Column(name = "article_source", length = 255)
    private String articleSource;

    @Column(name = "quality_score")
    private Integer qualityScore;

    @Column(name = "is_duplicate")
    private boolean duplicate;

    @Column(name = "duplicate_of")
    private Long duplicateOf;

    @Column(name = "moderator_approved")
    private Boolean moderatorApproved;

    @Column(name = "moderator_notes", columnDefinition = "TEXT")
    private String moderatorNotes;

    @Column(name = "submission_method", length = 50)
    private String submissionMethod;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @ManyToOne
    @JoinColumn(name = "country", referencedColumnName = "country", insertable = false, updatable = false)
    private GameScoreEntity score;

    @PrePersist
    void onCreate() {
        submittedAt = OffsetDateTime.now();
    }
}
