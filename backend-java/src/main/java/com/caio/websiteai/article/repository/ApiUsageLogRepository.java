package com.caio.websiteai.article.repository;

import com.caio.websiteai.article.entity.ApiUsageLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLogEntity, Long> {
}
