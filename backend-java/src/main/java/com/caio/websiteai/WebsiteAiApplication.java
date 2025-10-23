package com.caio.websiteai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class WebsiteAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebsiteAiApplication.class, args);
    }
}
