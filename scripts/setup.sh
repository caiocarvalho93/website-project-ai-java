#!/bin/bash

# AI Intelligence Network - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up AI Intelligence Network..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment files if they don't exist
echo "⚙️ Setting up environment files..."

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env template..."
    cat > backend/.env << EOF
PORT=8080
NODE_ENV=development

# API Keys (replace with your actual keys)
NEWS_API_KEY=your_newsapi_key_here
NEWS_API_KEY_FALLBACK=your_newsdata_key_here

# Database (replace with your actual database URL)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_intelligence

# AI Keys (optional)
DEEPSEEK_API_KEY=your_deepseek_key
ALT_AI_KEY=your_alt_ai_key
EOF
    echo "⚠️  Please update backend/.env with your actual API keys"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env template..."
    cat > frontend/.env << EOF
VITE_API_BASE=http://localhost:8080
NODE_ENV=development
EOF
fi

if [ ! -f frontend/.env.production ]; then
    echo "📝 Creating frontend/.env.production template..."
    cat > frontend/.env.production << EOF
VITE_API_BASE=https://your-backend-url.up.railway.app
NODE_ENV=production
EOF
    echo "⚠️  Please update frontend/.env.production with your actual backend URL"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your API keys"
echo "2. Set up PostgreSQL database"
echo "3. Update frontend/.env.production with your backend URL"
echo "4. Run 'npm run dev' to start development servers"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start both backend and frontend"
echo "  npm run dev:backend  - Start only backend"
echo "  npm run dev:frontend - Start only frontend"
echo "  npm run build        - Build both applications"
echo "  npm run deploy       - Deploy to production"
echo ""