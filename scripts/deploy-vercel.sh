#!/bin/bash

# Vercel Deployment Script for Frontend
# This script ensures clean deployment to Vercel

set -e

echo "🚀 Deploying frontend to Vercel..."

# Navigate to frontend directory
cd frontend

# Clean install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building frontend..."
npm run build

# Deploy to Vercel
echo "▲ Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️  Vercel CLI not found. Please install it:"
    echo "   npm install -g vercel"
    echo "   Then run: vercel --prod"
    exit 1
fi

echo "✅ Frontend deployed successfully!"
echo "🔗 Check your deployment at: https://your-app.vercel.app"