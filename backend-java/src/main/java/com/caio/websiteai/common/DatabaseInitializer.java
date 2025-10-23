package com.caio.websiteai.common;

import com.caio.websiteai.game.repository.GameAchievementRepository;
import com.caio.websiteai.article.repository.NewsSourceRepository;
import com.caio.websiteai.game.entity.GameAchievementEntity;
import com.caio.websiteai.article.entity.NewsSourceEntity;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final GameAchievementRepository gameAchievementRepository;
    private final NewsSourceRepository newsSourceRepository;

    @PostConstruct
    @Transactional
    public void initialize() {
        seedAchievements();
        seedNewsSources();
    }

    private void seedAchievements() {
        if (gameAchievementRepository.count() > 0) {
            return;
        }
        log.info("Seeding default game achievements");
        List<GameAchievementEntity> achievements = List.of(
                achievement("First Submission", "Submit your first AI article", "🎯", 0, 1, "common"),
                achievement("AI Enthusiast", "Submit 5 AI articles", "🤖", 0, 5, "common"),
                achievement("Country Champion", "Submit 10 articles for your country", "🏆", 0, 10, "rare"),
                achievement("Quality Contributor", "Achieve 50+ total points", "⭐", 50, 0, "rare"),
                achievement("AI Expert", "Submit 25 high-quality AI articles", "🧠", 0, 25, "epic"),
                achievement("Global Leader", "Achieve 100+ total points", "👑", 100, 0, "epic"),
                achievement("AI Pioneer", "Submit 50 AI articles", "🚀", 0, 50, "legendary"),
                achievement("Point Master", "Achieve 200+ total points", "💎", 200, 0, "legendary")
        );
        gameAchievementRepository.saveAll(achievements);
    }

    private GameAchievementEntity achievement(String name, String description, String icon, int points, int submissions, String rarity) {
        return GameAchievementEntity.builder()
                .name(name)
                .description(description)
                .icon(icon)
                .pointsRequired(points)
                .submissionsRequired(submissions)
                .rarity(rarity)
                .active(true)
                .countrySpecific(false)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    private void seedNewsSources() {
        if (newsSourceRepository.count() > 0) {
            return;
        }
        log.info("Seeding default news sources");
        List<NewsSourceEntity> sources = List.of(
                newsSource("TechCrunch", "techcrunch.com", 88, true),
                newsSource("MIT Technology Review", "technologyreview.com", 96, true),
                newsSource("Wired", "wired.com", 85, true),
                newsSource("Reuters Technology", "reuters.com", 94, true),
                newsSource("Bloomberg Technology", "bloomberg.com", 95, true),
                newsSource("The Verge", "theverge.com", 82, false),
                newsSource("Financial Times", "ft.com", 93, true),
                newsSource("Wall Street Journal", "wsj.com", 91, true)
        );
        newsSourceRepository.saveAll(sources);
    }

    private NewsSourceEntity newsSource(String name, String domain, int credibility, boolean premium) {
        return NewsSourceEntity.builder()
                .name(name)
                .domain(domain)
                .credibilityScore(credibility)
                .premium(premium)
                .active(true)
                .averageQualityScore(BigDecimal.valueOf(credibility))
                .createdAt(OffsetDateTime.now())
                .articleCount(0)
                .build();
    }
}
