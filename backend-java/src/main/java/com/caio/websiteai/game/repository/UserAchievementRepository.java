package com.caio.websiteai.game.repository;

import com.caio.websiteai.game.entity.UserAchievementEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAchievementRepository extends JpaRepository<UserAchievementEntity, Long> {
}
