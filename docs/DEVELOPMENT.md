# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Quick Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-intelligence-network

# Run setup script
./scripts/setup.sh

# Or manual setup
npm run setup
```

## Project Structure

```
ai-intelligence-network/
├── backend/                 # Node.js Express API
│   ├── services/           # Business logic & integrations
│   │   ├── newsapi-processor.js    # Dual API key system
│   │   ├── elite-news-aggregator.js # Analytics & leaderboard
│   │   └── ...
│   ├── database.js         # PostgreSQL operations
│   ├── server.js          # Express server setup
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── config/        # Configuration
│   │   └── App.jsx        # Main application
│   ├── .env               # Frontend environment
│   └── package.json       # Frontend dependencies
├── shared/                 # Shared utilities
│   ├── types.js           # Type definitions
│   └── utils.js           # Utility functions
├── docs/                   # Documentation
├── scripts/                # Automation scripts
└── package.json           # Root workspace config
```

## Development Workflow

### Starting Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend    # Backend on :8080
npm run dev:frontend   # Frontend on :5173
```

### Environment Configuration

#### Backend (.env)
```env
PORT=8080
NODE_ENV=development

# API Keys
NEWS_API_KEY=your_newsapi_key
NEWS_API_KEY_FALLBACK=your_newsdata_key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_intelligence
```

#### Frontend (.env)
```env
VITE_API_BASE=http://localhost:8080
NODE_ENV=development
```

## Key Features

### Backend Features

#### Dual API Key System
- **Primary**: NewsAPI (100 requests/day)
- **Fallback**: NewsData.io (200 requests/day)
- **Auto-switching**: On rate limits or errors

#### Database Schema
- **16 tables** for comprehensive data storage
- **PostgreSQL** with performance indexes
- **Automatic migrations** on startup

#### Smart Country Distribution
- Fetches from 5 countries in 1 API call
- Proper country assignment for filtering
- Efficient API usage within free limits

### Frontend Features

#### React Components
- **Dashboard**: Main intelligence overview
- **Country Pages**: Country-specific news
- **AI Leaderboard**: Gamified rankings
- **News Feed**: Real-time article updates

#### Error Handling
- **Error Boundaries**: Graceful error recovery
- **Fallback UI**: When APIs are unavailable
- **Retry Logic**: Automatic retry on failures

## API Integration

### NewsAPI Integration
```javascript
// Primary news source
const response = await newsapi.v2.everything({
  q: 'artificial intelligence',
  language: 'en',
  sortBy: 'publishedAt',
  pageSize: 20
});
```

### NewsData.io Integration
```javascript
// Fallback with country filtering
const url = `https://newsdata.io/api/1/latest?apikey=${key}&q=ai&country=us,gb,de,fr,ca&size=10`;
```

## Database Operations

### Article Storage
```javascript
// Save articles with metadata
await saveArticlesToDatabase(articles);

// Retrieve by country
const articles = await getArticles('US', 20);
```

### Game System
```javascript
// Store game submission
await storeGameSubmission({
  url: 'https://example.com/ai-article',
  country: 'US',
  userId: 'user123',
  points: 3
});
```

## Testing

### Backend Testing
```bash
cd backend

# Test API keys
npm run test:api-keys

# Test database connection
node -e "import('./database.js').then(db => db.initializeDatabase())"

# Run all tests
npm test
```

### Frontend Testing
```bash
cd frontend

# Run tests (when configured)
npm test

# Type checking
npm run type-check
```

## Common Development Tasks

### Adding New API Endpoints
1. Add route in `backend/server.js`
2. Implement business logic in `backend/services/`
3. Update API documentation in `docs/API.md`

### Adding New React Components
1. Create component in `frontend/src/components/`
2. Add to routing if needed
3. Update imports in parent components

### Database Schema Changes
1. Modify `backend/database.js`
2. Update initialization function
3. Test with fresh database

## Debugging

### Backend Debugging
```bash
# Enable debug logs
DEBUG=* npm run dev

# Check API endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/global-news
```

### Frontend Debugging
- Use React DevTools browser extension
- Check browser console for errors
- Verify API calls in Network tab

### Database Debugging
```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Query articles
SELECT COUNT(*) FROM articles;
```

## Performance Optimization

### Backend Optimization
- Use database indexes for queries
- Implement caching for frequent requests
- Monitor API rate limits

### Frontend Optimization
- Lazy load components
- Implement virtual scrolling for large lists
- Optimize bundle size

## Code Style

### Backend (Node.js)
- Use ES6+ modules
- Async/await for promises
- Comprehensive error handling
- JSDoc comments for functions

### Frontend (React)
- Functional components with hooks
- Consistent naming conventions
- Component composition over inheritance
- PropTypes or TypeScript for type safety

## Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
npm run clean
npm run setup
```

#### Database connection errors
1. Check DATABASE_URL format
2. Verify PostgreSQL is running
3. Check network connectivity

#### API rate limit errors
1. Check API key validity
2. Monitor usage in logs
3. Verify fallback system is working

#### Frontend build errors
1. Check for TypeScript errors
2. Verify all imports are correct
3. Clear build cache: `rm -rf dist/`

### Getting Help
1. Check logs in terminal
2. Review error messages carefully
3. Check API documentation
4. Verify environment variables
5. Test with minimal reproduction case