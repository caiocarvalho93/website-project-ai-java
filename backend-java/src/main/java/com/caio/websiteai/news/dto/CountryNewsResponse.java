package com.caio.websiteai.news.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CountryNewsResponse {
    private String country;
    private int total;
    private List<Article> articles;
}
