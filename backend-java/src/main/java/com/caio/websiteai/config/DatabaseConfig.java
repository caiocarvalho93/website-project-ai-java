package com.caio.websiteai.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(Environment environment) {
        DatabaseConnectionInfo connectionInfo = resolveConnection(environment);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(connectionInfo.jdbcUrl());
        config.setUsername(connectionInfo.username());
        config.setPassword(connectionInfo.password());
        config.setDriverClassName(connectionInfo.driverClassName());
        config.setMaximumPoolSize(environment.getProperty("SPRING_DATASOURCE_MAX_POOL_SIZE", Integer.class, 10));
        config.setMinimumIdle(environment.getProperty("SPRING_DATASOURCE_MIN_IDLE", Integer.class, 2));
        config.setConnectionTimeout(environment.getProperty("SPRING_DATASOURCE_CONNECTION_TIMEOUT", Long.class, 30_000L));
        config.setValidationTimeout(environment.getProperty("SPRING_DATASOURCE_VALIDATION_TIMEOUT", Long.class, 5_000L));
        config.setInitializationFailTimeout(-1L); // allow app to start even if DB is temporarily unavailable
        config.setPoolName("ai-intelligence-hikari");

        return new HikariDataSource(config);
    }

    private DatabaseConnectionInfo resolveConnection(Environment environment) {
        String explicitUrl = trimToNull(environment.getProperty("SPRING_DATASOURCE_URL"));
        String explicitUsername = trimToNull(environment.getProperty("SPRING_DATASOURCE_USERNAME"));
        String explicitPassword = Optional.ofNullable(environment.getProperty("SPRING_DATASOURCE_PASSWORD")).orElse("");

        if (StringUtils.hasText(explicitUrl)) {
            log.info("Using SPRING_DATASOURCE_URL for PostgreSQL connection");
            return new DatabaseConnectionInfo(explicitUrl, explicitUsername, explicitPassword, "org.postgresql.Driver");
        }

        String jdbcDatabaseUrl = trimToNull(environment.getProperty("JDBC_DATABASE_URL"));
        if (StringUtils.hasText(jdbcDatabaseUrl)) {
            log.info("Using JDBC_DATABASE_URL for PostgreSQL connection");
            return new DatabaseConnectionInfo(jdbcDatabaseUrl,
                    Optional.ofNullable(environment.getProperty("JDBC_DATABASE_USERNAME")).orElse("postgres"),
                    Optional.ofNullable(environment.getProperty("JDBC_DATABASE_PASSWORD")).orElse(""),
                    "org.postgresql.Driver");
        }

        String databaseUrl = trimToNull(environment.getProperty("DATABASE_URL"));
        if (StringUtils.hasText(databaseUrl)) {
            try {
                return fromDatabaseUrl(databaseUrl);
            } catch (URISyntaxException ex) {
                log.warn("DATABASE_URL is present but could not be parsed: {}", ex.getMessage());
            }
        }

        log.warn("No database URL provided. Falling back to localhost configuration");
        String localUrl = Optional.ofNullable(environment.getProperty("DATABASE_JDBC_URL"))
                .filter(StringUtils::hasText)
                .orElse("jdbc:postgresql://localhost:5432/postgres");
        String username = Optional.ofNullable(environment.getProperty("DATABASE_USERNAME"))
                .filter(StringUtils::hasText)
                .orElse("postgres");
        String password = Optional.ofNullable(environment.getProperty("DATABASE_PASSWORD"))
                .orElse("");
        return new DatabaseConnectionInfo(localUrl, username, password, "org.postgresql.Driver");
    }

    private DatabaseConnectionInfo fromDatabaseUrl(String databaseUrl) throws URISyntaxException {
        URI uri = new URI(databaseUrl);
        String scheme = uri.getScheme();
        if (scheme == null || !scheme.startsWith("postgres")) {
            throw new URISyntaxException(databaseUrl, "Unsupported DATABASE_URL scheme: " + scheme);
        }

        String jdbcUrl = String.format("jdbc:postgresql://%s%s",
                uri.getHost() + (uri.getPort() > 0 ? ":" + uri.getPort() : ""),
                Optional.ofNullable(uri.getPath()).orElse(""));

        if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
            jdbcUrl = jdbcUrl + "?" + uri.getQuery();
        }

        String userInfo = uri.getUserInfo();
        String username = "postgres";
        String password = "";
        if (StringUtils.hasText(userInfo)) {
            int separatorIndex = userInfo.indexOf(':');
            if (separatorIndex >= 0) {
                username = userInfo.substring(0, separatorIndex);
                password = userInfo.substring(separatorIndex + 1);
            } else {
                username = userInfo;
            }
        }

        log.info("Using DATABASE_URL for PostgreSQL connection");
        return new DatabaseConnectionInfo(jdbcUrl, username, password, "org.postgresql.Driver");
    }

    private String trimToNull(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }

    private record DatabaseConnectionInfo(String jdbcUrl, String username, String password, String driverClassName) {
    }
}
