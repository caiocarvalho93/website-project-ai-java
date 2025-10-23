# AI Intelligence Network

A full-stack application for AI news aggregation and intelligence analysis with country-specific filtering and real-time updates.

## 📜 Master Directive for Codex

For large-scale refactors or migrations, follow the workflow described in
[`backend-java/MASTER_DIRECTIVE_FOR_CODEX.md`](backend-java/MASTER_DIRECTIVE_FOR_CODEX.md)
before making changes. It outlines the unified Spring Boot migration plan,
required build commands, and post-migration verification checklist that Codex
must execute.

## 🏗️ Project Structure

```
ai-intelligence-network/
├── backend/              # Node.js API server
│   ├── services/         # Business logic & API integrations
│   ├── database.js       # PostgreSQL database layer
│   ├── server.js         # Express server
│   └── package.json      # Backend dependencies
├── backend-java/         # Spring Boot API server
│   ├── src/              # Java source & resources
│   └── pom.xml           # Maven build file
├── frontend/             # React dashboard
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── config/       # Configuration files
│   │   └── App.jsx       # Main app component
│   └── package.json      # Frontend dependencies
├── shared/               # Shared utilities & types
├── docs/                 # Documentation
├── scripts/              # Deployment & setup scripts
└── package.json          # Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL database
- NewsAPI & NewsData.io API keys

### Installation
```bash
# Install all dependencies
npm run setup

# Start development servers
npm run dev
```

### Environment Setup

#### Backend (.env)
```env
PORT=8080
NODE_ENV=development

# API Keys
NEWS_API_KEY=your_newsapi_key
NEWS_API_KEY_FALLBACK=your_newsdata_key

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
```

#### Frontend (.env)
```env
VITE_API_BASE=http://localhost:8080
```

## 📦 Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend
- `npm run build` - Build both applications
- `npm run deploy` - Deploy to production
- `npm run test` - Run all tests

### Backend Only
- `npm run dev:backend` - Start backend server
- `npm run build:backend` - Build backend
- `npm run test:backend` - Run backend tests

### Java Backend
- `cd backend-java && mvn spring-boot:run` - Start Spring Boot server
- `cd backend-java && mvn test` - Run Java backend tests

### Frontend Only
- `npm run dev:frontend` - Start frontend dev server
- `npm run build:frontend` - Build frontend
- `npm run test:frontend` - Run frontend tests

## 🔧 Features

### Backend
- **Dual API Key System**: NewsAPI + NewsData.io fallback
- **PostgreSQL Integration**: Persistent data storage
- **Country Filtering**: Smart country-specific news distribution
- **Rate Limit Handling**: Automatic fallback on API limits
- **Real-time Updates**: Scheduled news fetching

### Frontend
- **React Dashboard**: Modern, responsive UI
- **Country Pages**: Dedicated pages for each country
- **AI Leaderboard**: Gamified country rankings
- **Real-time Updates**: Auto-refreshing news feed
- **Error Boundaries**: Robust error handling

## 🌐 Deployment

### Backend (Railway)
```bash
cd backend
npm run deploy
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

## 🔑 API Endpoints

- `GET /api/global-news` - Get all news articles
- `GET /api/country-news/:country` - Get country-specific news
- `POST /api/simple-refresh` - Trigger news refresh
- `GET /api/fans-race/leaderboard` - Get game leaderboard

## 🛠️ Development

### Adding New Features
1. Backend changes go in `backend/`
2. Frontend changes go in `frontend/`
3. Shared utilities go in `shared/`

### Database Schema
The application uses PostgreSQL with 16+ tables for:
- Articles storage
- User interactions
- Game scores
- Analytics data

## 📊 Monitoring

- Health check: `GET /health`
- System status: `GET /api/fortune500/status`
- API diagnostics: `GET /api/diagnostics`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details