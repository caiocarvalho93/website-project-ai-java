package com.caio.websiteai.news;

import com.caio.websiteai.news.dto.CountryNewsResponse;
import com.caio.websiteai.news.service.NewsService;
import com.caio.websiteai.news.web.CountryNewsController;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class CountryNewsControllerTest {

    @Test
    void ok() {
        NewsService mock = Mockito.mock(NewsService.class);
        Mockito.when(mock.getCountryNews("us"))
                .thenReturn(CountryNewsResponse.builder().country("us").total(0).build());
        CountryNewsController ctrl = new CountryNewsController(mock);
        ResponseEntity<CountryNewsResponse> res = ctrl.countryNews("US");
        assertThat(res.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().getCountry()).isEqualTo("us");
    }
}
