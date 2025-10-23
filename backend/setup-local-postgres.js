#!/usr/bin/env node

/**
 * 🚨 LOCAL POSTGRESQL SETUP + RAILWAY DEPLOYMENT
 * Sets up local PostgreSQL and ensures Railway compatibility
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';

console.log('🚨 SETTING UP LOCAL POSTGRESQL + RAILWAY DEPLOYMENT...\n');

async function checkPostgreSQLInstallation() {
    console.log('1️⃣ CHECKING POSTGRESQL INSTALLATION...');
    
    try {
        const version = execSync('psql --version', { encoding: 'utf8' });
        console.log(`✅ PostgreSQL installed: ${version.trim()}`);
        return true;
    } catch (error) {
        console.log('❌ PostgreSQL not installed');
        console.log('\n📋 INSTALLATION INSTRUCTIONS:');
        console.log('');
        console.log('🍺 macOS (Homebrew):');
        console.log('   brew install postgresql');
        console.log('   brew services start postgresql');
        console.log('');
        console.log('🐧 Ubuntu/Debian:');
        console.log('   sudo apt update');
        console.log('   sudo apt install postgresql postgresql-contrib');
        console.log('   sudo systemctl start postgresql');
        console.log('');
        console.log('🪟 Windows:');
        console.log('   Download from: https://www.postgresql.org/download/windows/');
        console.log('');
        console.log('🐳 Docker (All platforms):');
        console.log('   docker run --name postgres-local -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres');
        
        return false;
    }
}

async function createLocalDatabase() {
    console.log('\n2️⃣ CREATING LOCAL DATABASE...');
    
    try {
        // Create database
        console.log('📊 Creating database "ai_intelligence"...');
        execSync('createdb ai_intelligence', { encoding: 'utf8' });
        console.log('✅ Database "ai_intelligence" created');
        
        return true;
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Database "ai_intelligence" already exists');
            return true;
        } else {
            console.log(`❌ Failed to create database: ${error.message}`);
            console.log('\n🔧 TROUBLESHOOTING:');
            console.log('1. Make sure PostgreSQL is running:');
            console.log('   macOS: brew services start postgresql');
            console.log('   Linux: sudo systemctl start postgresql');
            console.log('');
            console.log('2. Create user if needed:');
            console.log('   createuser -s $USER');
            console.log('');
            console.log('3. Or use Docker:');
            console.log('   docker run --name postgres-local -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres');
            
            return false;
        }
    }
}

async function createEnvironmentFiles() {
    console.log('\n3️⃣ CREATING ENVIRONMENT FILES...');
    
    // Local development environment
    const localEnv = `# LOCAL DEVELOPMENT ENVIRONMENT
NODE_ENV=development
PORT=8080

# MEDIASTACK API KEY (100 daily requests)
NEWSDATA_API_KEY=80880b6ccb1859033d4d0df5064fb12e

# LOCAL POSTGRESQL DATABASE
DATABASE_URL=postgresql://localhost:5432/ai_intelligence

# CORS - Allow local frontend
ALLOWED_ORIGIN=http://localhost:5173

# AI KEYS (Optional)
DEEPSEEK_API_KEY=d3rg849r01qopgh8dim0d3rg849r01qopgh8dimg
ALT_AI_KEY=sk-a0405857475e4adbbb0e5ce622123dcc
`;

    // Production environment (Railway) - Using your actual PostgreSQL
    const productionEnv = `# PRODUCTION ENVIRONMENT (RAILWAY)
NODE_ENV=production
PORT=8080

# MEDIASTACK API KEY (100 daily requests)
NEWSDATA_API_KEY=80880b6ccb1859033d4d0df5064fb12e

# RAILWAY POSTGRESQL DATABASE (Internal - No egress fees)
DATABASE_URL=postgresql://postgres:ylQFKAOHIAJlNvOciiXAPbFuPThxzTxX@postgres.railway.internal:5432/railway

# CORS - Production frontend
ALLOWED_ORIGIN=https://website-project-ai.vercel.app

# AI KEYS (Optional)
DEEPSEEK_API_KEY=d3rg849r01qopgh8dim0d3rg849r01qopgh8dimg
ALT_AI_KEY=sk-a0405857475e4adbbb0e5ce622123dcc
`;

    try {
        await fs.writeFile('.env', localEnv);
        console.log('✅ Created .env (local development)');
        
        await fs.writeFile('.env.production', productionEnv);
        console.log('✅ Created .env.production (Railway deployment)');
        
        console.log('\n📋 ENVIRONMENT SETUP:');
        console.log('🏠 Local: Uses postgresql://localhost:5432/ai_intelligence');
        console.log('🚀 Railway: Uses ${{Postgres.DATABASE_URL}} (auto-injected)');
        
        return true;
    } catch (error) {
        console.log(`❌ Failed to create environment files: ${error.message}`);
        return false;
    }
}

async function testLocalConnection() {
    console.log('\n4️⃣ TESTING LOCAL DATABASE CONNECTION...');
    
    try {
        // Import database module
        const { initializeDatabase } = await import('./database.js');
        
        console.log('📊 Initializing database schema...');
        const initialized = await initializeDatabase();
        
        if (initialized) {
            console.log('✅ Local PostgreSQL connection successful!');
            console.log('✅ Database schema created');
            console.log('✅ Ready for development');
            return true;
        } else {
            console.log('❌ Database initialization failed');
            return false;
        }
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check if PostgreSQL is running');
        console.log('2. Verify database "ai_intelligence" exists');
        console.log('3. Check connection string in .env file');
        return false;
    }
}

async function createRailwayConfig() {
    console.log('\n5️⃣ CREATING RAILWAY DEPLOYMENT CONFIG...');
    
    const railwayConfig = {
        "$schema": "https://railway.app/railway.schema.json",
        "build": {
            "builder": "NIXPACKS"
        },
        "deploy": {
            "startCommand": "node server.js",
            "healthcheckPath": "/health",
            "healthcheckTimeout": 100,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 10
        }
    };
    
    try {
        await fs.writeFile('railway.json', JSON.stringify(railwayConfig, null, 2));
        console.log('✅ Created railway.json deployment config');
        
        console.log('\n📋 RAILWAY DEPLOYMENT INSTRUCTIONS:');
        console.log('1. Add PostgreSQL service in Railway dashboard');
        console.log('2. Set environment variables:');
        console.log('   NEWSDATA_API_KEY = 80880b6ccb1859033d4d0df5064fb12e');
        console.log('   DATABASE_URL = ${{Postgres.DATABASE_URL}}');
        console.log('   NODE_ENV = production');
        console.log('   PORT = 8080');
        console.log('   ALLOWED_ORIGIN = https://website-project-ai.vercel.app');
        console.log('3. Deploy your service');
        console.log('4. Railway will auto-inject PostgreSQL connection');
        
        return true;
    } catch (error) {
        console.log(`❌ Failed to create Railway config: ${error.message}`);
        return false;
    }
}

async function runSetup() {
    console.log('🚨 LOCAL POSTGRESQL + RAILWAY SETUP STARTING...\n');
    console.log('🎯 Goal: Local development + seamless Railway deployment');
    console.log('=' .repeat(60));
    
    const steps = [
        { name: 'PostgreSQL Installation', fn: checkPostgreSQLInstallation },
        { name: 'Local Database Creation', fn: createLocalDatabase },
        { name: 'Environment Files', fn: createEnvironmentFiles },
        { name: 'Database Connection Test', fn: testLocalConnection },
        { name: 'Railway Config', fn: createRailwayConfig }
    ];
    
    let completedSteps = 0;
    
    for (const step of steps) {
        const success = await step.fn();
        if (success) {
            completedSteps++;
        } else {
            console.log(`\n❌ Setup failed at: ${step.name}`);
            break;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SETUP RESULTS:');
    console.log(`📊 Completed: ${completedSteps}/${steps.length} steps`);
    
    if (completedSteps === steps.length) {
        console.log('\n✅ SETUP COMPLETE - READY FOR DEVELOPMENT & DEPLOYMENT!');
        console.log('');
        console.log('🏠 LOCAL DEVELOPMENT:');
        console.log('   npm start → Uses local PostgreSQL');
        console.log('   Database: postgresql://localhost:5432/ai_intelligence');
        console.log('   Frontend: http://localhost:5173');
        console.log('');
        console.log('🚀 RAILWAY DEPLOYMENT:');
        console.log('   git push → Automatic deployment');
        console.log('   Database: Railway PostgreSQL (auto-injected)');
        console.log('   Frontend: https://website-project-ai.vercel.app');
        console.log('');
        console.log('🎯 NEXT STEPS:');
        console.log('1. Run: npm start (test locally)');
        console.log('2. Test: node test-apis.js');
        console.log('3. Deploy: git push to Railway');
        console.log('4. Verify: Check Railway logs');
    } else {
        console.log('\n❌ SETUP INCOMPLETE - Fix issues above');
        console.log('💡 You can still use file system storage as fallback');
    }
}

runSetup().catch(error => {
    console.error('💥 SETUP FAILED:', error.message);
    process.exit(1);
});