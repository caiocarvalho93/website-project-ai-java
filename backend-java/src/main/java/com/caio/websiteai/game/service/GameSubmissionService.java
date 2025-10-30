package com.caio.websiteai.game.service;

import com.caio.websiteai.game.dto.GameSubmissionRequest;
import com.caio.websiteai.game.dto.GameSubmissionResponse;
import com.caio.websiteai.game.entity.GameScoreEntity;
import com.caio.websiteai.game.entity.GameSubmissionEntity;
import com.caio.websiteai.game.repository.GameScoreRepository;
import com.caio.websiteai.game.repository.GameSubmissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class GameSubmissionService {

    private final GameSubmissionRepository gameSubmissionRepository;
    private final GameScoreRepository gameScoreRepository;

    @Transactional
    public GameSubmissionResponse submit(GameSubmissionRequest request) {
        String country = request.getCountry().toUpperCase(Locale.ENGLISH);
        boolean duplicate = gameSubmissionRepository.existsByUrl(request.getUrl());

        GameSubmissionEntity entity = GameSubmissionEntity.builder()
                .url(request.getUrl())
                .country(country)
                .userId(request.getUserId())
                .articleTitle(request.getArticleTitle())
                .articleSource(request.getArticleSource())
                .points(resolvePoints(request))
                .duplicate(duplicate)
                .submissionMethod("web")
                .build();

        gameSubmissionRepository.save(entity);

        GameScoreEntity score = gameScoreRepository.findById(country)
                .orElseGet(() -> GameScoreEntity.builder()
                        .country(country)
                        .score(0)
                        .totalSubmissions(0)
                        .uniqueContributors(0)
                        .dailyScore(0)
                        .weeklyScore(0)
                        .monthlyScore(0)
                        .build());

        int awarded = 0;
        if (!duplicate) {
            awarded = entity.getPoints() != null ? entity.getPoints() : 1;
            score.setScore(defaultInt(score.getScore()) + awarded);
            score.setDailyScore(defaultInt(score.getDailyScore()) + awarded);
            score.setWeeklyScore(defaultInt(score.getWeeklyScore()) + awarded);
            score.setMonthlyScore(defaultInt(score.getMonthlyScore()) + awarded);
        }

        score.setTotalSubmissions(defaultInt(score.getTotalSubmissions()) + 1);
        score.setLastSubmissionAt(OffsetDateTime.now());
        score.setUniqueContributors((int) gameSubmissionRepository.countDistinctUserIds(country));
        score.setAveragePointsPerSubmission(calculateAverage(score));

        gameScoreRepository.save(score);

        return GameSubmissionResponse.builder()
                .country(country)
                .pointsAwarded(awarded)
                .newScore(defaultInt(score.getScore()))
                .totalSubmissions(defaultInt(score.getTotalSubmissions()))
                .duplicate(duplicate)
                .message(duplicate ? "Submission already recorded" : "Submission accepted")
                .build();
    }

    private Integer resolvePoints(GameSubmissionRequest request) {
        if (request.getPoints() != null) {
            return Math.max(0, Math.min(100, request.getPoints()));
        }
        int base = 1;
        if (StringUtils.hasText(request.getArticleSource())) {
            String source = request.getArticleSource().toLowerCase(Locale.ENGLISH);
            if (source.contains("techcrunch") || source.contains("wired") || source.contains("reuters")) {
                base = 3;
            } else if (source.contains("ai") || source.contains("intelligence")) {
                base = 2;
            }
        }
        if (request.getUrl() != null && request.getUrl().toLowerCase(Locale.ENGLISH).contains("ai")) {
            base = Math.max(base, 2);
        }
        return base;
    }

    private int defaultInt(Integer value) {
        return value != null ? value : 0;
    }

    private Double calculateAverage(GameScoreEntity score) {
        int submissions = defaultInt(score.getTotalSubmissions());
        if (submissions == 0) {
            return 0.0;
        }
        return (double) defaultInt(score.getScore()) / submissions;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public long totalSubmissions() {
        return gameSubmissionRepository.count();
    }
}
