package com.caio.websiteai.game.repository;

import com.caio.websiteai.game.entity.GameAchievementEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameAchievementRepository extends JpaRepository<GameAchievementEntity, Long> {
    Optional<GameAchievementEntity> findByName(String name);
}
