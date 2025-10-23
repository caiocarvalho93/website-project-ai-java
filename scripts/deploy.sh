#!/bin/bash

# AI Intelligence Network - Deployment Script
# This script deploys both backend and frontend to production

set -e

echo "🚀 Deploying AI Intelligence Network to production..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build applications
echo "🔨 Building applications..."
npm run build

# Deploy backend to Railway
echo "🚂 Deploying backend to Railway..."
cd backend

if command -v railway &> /dev/null; then
    echo "📡 Using Railway CLI..."
    railway deploy
else
    echo "⚠️  Railway CLI not found. Please deploy manually:"
    echo "   1. Install Railway CLI: npm install -g @railway/cli"
    echo "   2. Login: railway login"
    echo "   3. Deploy: railway deploy"
fi

cd ..

# Deploy frontend to Vercel
echo "▲ Deploying frontend to Vercel..."
cd frontend

if command -v vercel &> /dev/null; then
    echo "📡 Using Vercel CLI..."
    vercel --prod
else
    echo "⚠️  Vercel CLI not found. Please deploy manually:"
    echo "   1. Install Vercel CLI: npm install -g vercel"
    echo "   2. Deploy: vercel --prod"
fi

cd ..

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🔗 Check your deployments:"
echo "  Backend:  https://your-app.up.railway.app/health"
echo "  Frontend: https://your-app.vercel.app"
echo ""
echo "📊 Monitor your applications:"
echo "  Railway:  https://railway.app/dashboard"
echo "  Vercel:   https://vercel.com/dashboard"
echo ""