# Deployment Guide

## Overview

The AI Intelligence Network consists of two main components:
- **Backend**: Node.js API deployed on Railway
- **Frontend**: React app deployed on Vercel

## Prerequisites

### Required Accounts
- [Railway](https://railway.app) - Backend hosting
- [Vercel](https://vercel.com) - Frontend hosting
- [NewsAPI](https://newsapi.org) - Primary news source
- [NewsData.io](https://newsdata.io) - Fallback news source

### Required API Keys
- `NEWS_API_KEY` - NewsAPI key
- `NEWS_API_KEY_FALLBACK` - NewsData.io key
- `DATABASE_URL` - PostgreSQL connection string (provided by Railway)

## Backend Deployment (Railway)

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
```

### 2. Configure Environment Variables
In Railway dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=8080

# API Keys
NEWS_API_KEY=your_newsapi_key_here
NEWS_API_KEY_FALLBACK=your_newsdata_key_here

# Database (automatically provided by Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 3. Add PostgreSQL Service
1. Go to Railway dashboard
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### 4. Deploy Backend
```bash
cd backend
railway deploy
```

### 5. Verify Deployment
Check these endpoints:
- `https://your-app.up.railway.app/health`
- `https://your-app.up.railway.app/api/global-news`

## Frontend Deployment (Vercel)

### 1. Configure Environment Variables
Create `frontend/.env.production`:

```env
VITE_API_BASE=https://your-railway-app.up.railway.app
NODE_ENV=production
```

### 2. Deploy to Vercel
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 3. Configure Vercel Project
In Vercel dashboard:
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add environment variable: `VITE_API_BASE`

## Environment Configuration

### Backend (.env)
```env
PORT=8080
NODE_ENV=production

# API Keys
NEWS_API_KEY=your_newsapi_key_here
NEWS_API_KEY_FALLBACK=your_newsdata_key_here

# Database
DATABASE_URL=postgresql://user:pass@host:port/database

# AI Keys (optional)
DEEPSEEK_API_KEY=your_deepseek_key
ALT_AI_KEY=your_alt_ai_key
```

### Frontend (.env.production)
```env
VITE_API_BASE=https://your-backend-url.up.railway.app
NODE_ENV=production
```

## Database Setup

The backend automatically creates all necessary tables on first startup. The schema includes:

- **articles** - News articles storage
- **user_ratings** - Article ratings
- **game_submissions** - AI Fans Race submissions
- **user_interactions** - User activity tracking
- **api_usage_log** - API usage monitoring
- **news_sources** - Source metadata
- **game_achievements** - Achievement system
- And 9 more tables for comprehensive functionality

## Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/fortune500/status` - Comprehensive system status
- `GET /api/diagnostics` - API diagnostics

### Logs
- **Railway**: View logs in Railway dashboard
- **Vercel**: View logs in Vercel dashboard

## Troubleshooting

### Common Issues

#### Backend Not Starting
1. Check Railway logs
2. Verify environment variables
3. Ensure PostgreSQL service is running
4. Check API key validity

#### Frontend API Errors
1. Verify `VITE_API_BASE` is correct
2. Check CORS configuration in backend
3. Ensure backend is deployed and healthy

#### Database Connection Issues
1. Check `DATABASE_URL` format
2. Verify PostgreSQL service status
3. Check network connectivity

### Debug Commands

```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally
cd frontend
npm run dev

# Test API keys
cd backend
npm run test:api-keys

# Check database connection
cd backend
node -e "import('./database.js').then(db => db.initializeDatabase())"
```

## Scaling Considerations

### Backend Scaling
- Railway automatically scales based on usage
- Consider upgrading to paid plan for higher limits
- Monitor API usage to avoid rate limits

### Frontend Scaling
- Vercel automatically handles CDN and scaling
- Consider implementing caching strategies
- Monitor bundle size and performance

## Security

### API Keys
- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly

### Database
- Railway PostgreSQL includes SSL by default
- Regular backups are handled automatically
- Consider read replicas for high traffic

## Backup & Recovery

### Database Backups
- Railway provides automatic daily backups
- Export data manually: `pg_dump $DATABASE_URL > backup.sql`
- Restore: `psql $DATABASE_URL < backup.sql`

### Code Backups
- Use Git for version control
- Tag releases for easy rollback
- Keep deployment scripts in repository