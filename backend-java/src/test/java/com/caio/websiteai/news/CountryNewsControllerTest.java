package com.caio.websiteai.news;

import com.caio.websiteai.news.dto.CountryNewsResponse;
import com.caio.websiteai.news.dto.NewsFeedResponse;
import com.caio.websiteai.news.service.NewsService;
import com.caio.websiteai.news.web.CountryNewsController;
import com.caio.websiteai.ratings.service.RatingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class CountryNewsControllerTest {

    @Test
    void ok() {
        NewsService mockNews = Mockito.mock(NewsService.class);
        RatingService mockRatings = Mockito.mock(RatingService.class);
        Mockito.when(mockNews.getCountryNews("US"))
                .thenReturn(CountryNewsResponse.builder().country("US").total(0).build());
        CountryNewsController ctrl = new CountryNewsController(mockNews, mockRatings);
        ResponseEntity<CountryNewsResponse> res = ctrl.countryNews("US");
        assertThat(res.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().getCountry()).isEqualTo("US");
    }

    @Test
    void newsEndpoint() {
        NewsService mockNews = Mockito.mock(NewsService.class);
        RatingService mockRatings = Mockito.mock(RatingService.class);
        Mockito.when(mockNews.getLatestNewsFeed(null))
                .thenReturn(NewsFeedResponse.builder().totalArticles(0).build());
        CountryNewsController ctrl = new CountryNewsController(mockNews, mockRatings);
        ResponseEntity<NewsFeedResponse> res = ctrl.news(null);
        assertThat(res.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().getTotalArticles()).isZero();
    }
}
