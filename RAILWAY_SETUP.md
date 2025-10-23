# Railway Deployment Setup Guide

## Required Environment Variables

To fix the database connection issues, you need to set these environment variables in your Railway dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://postgres:password@host:port/database
```
**How to get this:**
1. Go to Railway Dashboard → Your Project
2. Click on "PostgreSQL" service (or add one if missing)
3. Go to "Variables" tab
4. Copy the `DATABASE_URL` value
5. Add it to your backend service variables

### 2. News API Keys (Optional but recommended)
```
NEWS_API_KEY=your_newsapi_key_here
NEWSDATA_API_KEY=your_newsdata_key_here
```

### 3. Server Configuration
```
NODE_ENV=production
PORT=8080
```

## Steps to Fix Railway Deployment

1. **Add PostgreSQL Service** (if not already added):
   - Railway Dashboard → Add Service → PostgreSQL
   - Wait for it to deploy

2. **Configure Environment Variables**:
   - Go to your backend service
   - Click "Variables" tab
   - Add the variables listed above

3. **Redeploy**:
   - The service should automatically redeploy
   - Check logs for "✅ Database initialized"

## Troubleshooting

### If you see "Database not available":
- Check that DATABASE_URL is correctly set
- Ensure PostgreSQL service is running
- Verify the connection string format

### If you see "No API key specified":
- Add NEWS_API_KEY or NEWSDATA_API_KEY
- The system will work without API keys but with limited functionality

### Server Status Endpoints:
- `/health` - Basic health check
- `/api/deployment-test` - Full system test
- `/api/diagnostics` - API and database diagnostics

## Success Indicators

When properly configured, you should see:
```
✅ Database: Railway PostgreSQL connected successfully
✅ Database initialized
✅ DEPLOYMENT SUCCESS: System ready with fresh content
```

The system is designed to be resilient - it will start even without database connection but with limited functionality.