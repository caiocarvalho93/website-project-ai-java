package com.caio.websiteai.game.repository;

import com.caio.websiteai.game.entity.GameSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameSubmissionRepository extends JpaRepository<GameSubmissionEntity, Long> {
}
