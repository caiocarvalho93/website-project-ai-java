package com.caio.websiteai.game.repository;

import com.caio.websiteai.game.entity.GameSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GameSubmissionRepository extends JpaRepository<GameSubmissionEntity, Long> {

    boolean existsByUrl(String url);

    @Query("select count(distinct lower(s.userId)) from GameSubmissionEntity s where lower(s.country) = lower(:country)")
    long countDistinctUserIds(@Param("country") String country);
}
