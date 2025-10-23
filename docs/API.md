# API Documentation

## Base URL
- **Development**: `http://localhost:8080`
- **Production**: `https://website-project-ai-production.up.railway.app`

## Authentication
No authentication required for public endpoints.

## Endpoints

### Health & Status

#### GET /health
Returns server health status.

**Response:**
```json
{
  "ok": true,
  "service": "AI Intelligence Network",
  "ts": "2025-10-23T00:00:00.000Z",
  "status": "OPERATIONAL",
  "port": "8080",
  "env": "production",
  "database": "PostgreSQL"
}
```

#### GET /api/fortune500/status
Returns comprehensive system status.

### News Endpoints

#### GET /api/global-news
Returns all news articles grouped by country.

**Response:**
```json
{
  "success": true,
  "countries": {
    "US": [...articles],
    "GB": [...articles],
    "DE": [...articles]
  },
  "global": [...articles],
  "totalArticles": 50,
  "lastUpdate": "2025-10-23T00:00:00.000Z",
  "source": "postgresql-database"
}
```

#### GET /api/country-news/:country
Returns news articles for a specific country.

**Parameters:**
- `country` (string): Country code (US, GB, DE, FR, CA, etc.)

**Response:**
```json
{
  "success": true,
  "country": "US",
  "articles": [...],
  "count": 20,
  "source": "database-with-fresh-check",
  "lastUpdate": "2025-10-23T00:00:00.000Z"
}
```

#### POST /api/simple-refresh
Triggers a manual news refresh using the dual API key system.

**Response:**
```json
{
  "success": true,
  "message": "NEWS REFRESH COMPLETED",
  "duration": 3,
  "articlesProcessed": 10,
  "timestamp": "2025-10-23T00:00:00.000Z"
}
```

### Game Endpoints

#### GET /api/fans-race/leaderboard
Returns the AI Fans Race leaderboard.

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "country": "US",
      "score": 150
    }
  ],
  "totalSubmissions": 25,
  "lastUpdate": "2025-10-23T00:00:00.000Z",
  "persistent": true
}
```

#### POST /api/fans-race/submit
Submit a new AI article for the game.

**Request Body:**
```json
{
  "url": "https://example.com/ai-article",
  "country": "US",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "url": "https://example.com/ai-article",
    "country": "US",
    "userId": "user123",
    "points": 3,
    "timestamp": "2025-10-23T00:00:00.000Z"
  },
  "newScore": 153,
  "pointsAwarded": 3,
  "persistent": true
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Returns Fortune 500-level analytics dashboard data.

#### GET /api/diagnostics
Returns API diagnostics and system health information.

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2025-10-23T00:00:00.000Z"
}
```

## Rate Limits

- **NewsAPI**: 100 requests per 24 hours (free plan)
- **NewsData.io**: 200 requests per day (free plan)
- **Internal APIs**: No rate limits

## Data Models

### Article
```json
{
  "id": "unique-article-id",
  "title": "Article Title",
  "url": "https://example.com/article",
  "source": "Source Name",
  "author": "Author Name",
  "publishedAt": "2025-10-23T00:00:00.000Z",
  "description": "Article description",
  "content": "Article content",
  "country": "US",
  "category": "ai",
  "relScore": 85,
  "anaScore": 80,
  "provenance": "newsapi-primary"
}
```