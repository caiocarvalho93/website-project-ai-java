package com.caio.websiteai.news.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class NewsRefreshRequest {
    private List<@Pattern(regexp = "^[A-Za-z]{2}$", message = "Use 2-letter country code") String> countries;
}
